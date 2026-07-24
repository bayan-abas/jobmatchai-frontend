import { apiFetch, apiFetchStream } from "./api";

// Session-scoped cache for AI job-match scores, shared by CandidateDashboard and JobMatches so
// the expensive first computation (one OpenAI call per unscored job) runs at most once per
// browser tab session, not once per page visit. Backed by sessionStorage - the same storage
// AuthContext already uses for the auth token - so it naturally resets exactly when a "new
// session" should start (new tab, or the token being cleared on logout/expiry) and survives
// page navigation/reloads within the same tab.
//
// This is deliberately NOT a "cache-only, never call the backend" cache: the first call for a
// given set of job ids always goes through the real /api/jobs/match-scores (or external
// counterpart), which computes and persists real scores. Only once those results are known are
// they kept here and reused - so the dashboard/job-matches pages always show real counts, never
// a false "0 matches" just because nothing was cached yet.
//
// Every cached bucket is stamped with the `cvIdentity` (the candidate's current cv_text_hash,
// from GET /api/cv/analysis - the exact same value JobMatchService's own fingerprint check is
// keyed on; "none" when there's no CVAnalysis at all) it was computed against. A bucket whose
// stamp doesn't match the caller's current cvIdentity is treated as if it didn't exist -
// every job in it is re-requested from the backend rather than trusted. This is what makes
// deleting/replacing a CV self-correct automatically the next time either page loads, instead of
// depending on every CV-mutating code path remembering to explicitly clear this cache (uploading,
// deleting, and analyzing a CV in ResumeManager.tsx also call clearMatchScoreSession() directly,
// for an immediate effect rather than waiting on the next mount - but this identity check is the
// actual root-cause fix: it holds even if some future code path forgets to).

export type MatchEntry = {
  matchPercent: number | null;
  matchReason?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  // matchedSkills/missingSkills split by required vs preferred, mirroring JobMatchScore's own
  // split - lets the UI badge a skill as "required" vs "preferred" instead of showing every
  // matched/missing skill identically.
  matchedRequiredSkills?: string[];
  matchedPreferredSkills?: string[];
  missingRequiredSkills?: string[];
  missingPreferredSkills?: string[];
  fieldRelated?: boolean | null;
  // True when the job posting itself was too thin (title-only, or a one-line description with
  // no real requirements/skills) to support a reliable comparison at all - a deterministic,
  // backend-computed verdict, never an AI judgment call. See JobMatchService#isInsufficientJobData.
  insufficientData?: boolean;
  // A title-only, candidate-independent classification (see backend's VocationalRoleClassifier) -
  // true for generalist/vocational roles (Cashier, Delivery Driver, etc.) that are never excluded
  // outright but also shouldn't be mixed into profession-based match results, since a numeric
  // match score against them isn't a meaningful "professional fit" signal.
  generalVocationalRole?: boolean;
  // True only for a NON-vocational job the candidate's resolved profession is genuinely unrelated
  // to (taxonomy hard-block or a real AI "unrelated" verdict, never the transient fieldRelated
  // === null retry sentinel) - the UI must hide this job from every listing entirely, not just
  // downweight it, per the "don't show completely unrelated jobs, even at a low percentage"
  // product requirement.
  excludedFromListing?: boolean;
};

type RawMatch = {
  jobId: number;
  matchPercent: number | null;
  matchReason?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  matchedRequiredSkills?: string[];
  matchedPreferredSkills?: string[];
  missingRequiredSkills?: string[];
  missingPreferredSkills?: string[];
  fieldRelated?: boolean | null;
  insufficientData?: boolean;
  generalVocationalRole?: boolean;
  excludedFromListing?: boolean;
};

type MatchesResponse = { hasAnalysis: boolean; matches: RawMatch[] };

export type MatchKind = "internal" | "external";

// Sentinel for "no CVAnalysis exists yet" - distinct from any real cv_text_hash, so a candidate
// with no CV at all still gets a stable, matchable identity instead of undefined/null needing
// special-casing at every call site.
export const NO_CV_IDENTITY = "none";

type CacheBucket = {
  cvIdentity: string;
  hasAnalysis: boolean;
  entries: Record<number, MatchEntry>;
};

// The single place every match-score caller gets its cvIdentity from, so there is exactly one
// definition of "what counts as the candidate's current CV" across the whole frontend. Mirrors
// GET /api/cv/analysis's own "no analysis" shape ({ hasAnalysis: false }, no cvTextHash field)
// rather than guessing - any other unexpected shape (row exists but somehow has no hash) also
// falls back to NO_CV_IDENTITY, which just means more cache misses, never a wrong match returned.
export async function fetchCurrentCvIdentity(): Promise<string> {
  try {
    const data = await apiFetch("/api/cv/analysis");
    if (data && typeof data.cvTextHash === "string" && data.cvTextHash.length > 0) {
      return data.cvTextHash as string;
    }
    return NO_CV_IDENTITY;
  } catch {
    return NO_CV_IDENTITY;
  }
}

const STORAGE_PREFIX = "jobmatch_matchscores_";

function storageKey(email: string, kind: MatchKind) {
  return `${STORAGE_PREFIX}${kind}_${email}`;
}

// Returns the cached bucket only if it was computed against the SAME cv identity the caller
// currently has - a bucket left over from a since-deleted/replaced CV is treated as absent
// rather than served, which is the actual fix for stale scores surviving a CV change.
function readBucket(email: string, kind: MatchKind, cvIdentity: string): CacheBucket | null {
  try {
    const raw = sessionStorage.getItem(storageKey(email, kind));
    if (!raw) return null;
    const bucket = JSON.parse(raw) as CacheBucket;
    return bucket.cvIdentity === cvIdentity ? bucket : null;
  } catch {
    return null;
  }
}

function writeBucket(email: string, kind: MatchKind, bucket: CacheBucket) {
  try {
    sessionStorage.setItem(storageKey(email, kind), JSON.stringify(bucket));
  } catch {
    // sessionStorage can throw (quota, private-browsing restrictions) - losing the session
    // cache just means the next page load re-fetches, which the backend answers instantly for
    // anything already computed (see JobMatchService's cv/job fingerprint cache), so this is
    // never a correctness problem, only a missed optimization.
  }
}

// Per (email, kind, cvIdentity, job-id-set) in-flight promise so concurrent callers within the
// same tab (a component mounting twice under React StrictMode, or navigating back to a page
// before its first request resolved) join the SAME network call instead of each starting their
// own. Keyed on cvIdentity too, so a request started against the old CV can never be joined by -
// or itself resolve into the cache for - a request that started after the CV changed. This is
// the frontend half of "concurrent requests cannot start the same calculation more than once" -
// the backend's own per-job singleflight guard (JobMatchService.inFlightComputations) is the
// other half, covering requests that land at the same time from different tabs/sessions.
const inFlight = new Map<string, Promise<CacheBucket>>();

function requestKey(email: string, kind: MatchKind, cvIdentity: string, jobIds: number[]) {
  return `${email}|${kind}|${cvIdentity}|${[...jobIds].sort((a, b) => a - b).join(",")}`;
}

async function fetchAndMerge(
  email: string,
  kind: MatchKind,
  cvIdentity: string,
  jobIds: number[],
  language: string
): Promise<CacheBucket> {
  const path = kind === "internal" ? "/api/jobs/match-scores" : "/api/external-jobs/match-scores";
  const body =
    kind === "internal"
      ? { email, jobIds, language }
      : { email, externalJobIds: jobIds, language };

  const data: MatchesResponse = await apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const existing = readBucket(email, kind, cvIdentity);
  // Two views of the result: `persisted` is what gets written to sessionStorage and reused by
  // future calls, `resultEntries` is what THIS call returns to its caller for immediate
  // rendering. They differ for a transient AI failure (fieldRelated === null, the backend's
  // honest "the AI call failed, please retry" sentinel, itself never persisted to the database
  // either - see JobMatchService.ensureCoreScores): the caller still needs to see it (to render
  // an error/retry state instead of a misleading "no analysis yet"), but it must not freeze into
  // the session cache, or a transient failure would look like a permanent error for the rest of
  // the tab. Leaving it out of `persisted` means the next call for this job naturally retries.
  const persisted: Record<number, MatchEntry> = existing ? { ...existing.entries } : {};
  const resultEntries: Record<number, MatchEntry> = { ...persisted };

  (data.matches || []).forEach((match) => {
    const entry: MatchEntry = {
      matchPercent: match.matchPercent,
      matchReason: match.matchReason,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      matchedRequiredSkills: match.matchedRequiredSkills,
      matchedPreferredSkills: match.matchedPreferredSkills,
      missingRequiredSkills: match.missingRequiredSkills,
      missingPreferredSkills: match.missingPreferredSkills,
      fieldRelated: match.fieldRelated === undefined ? true : match.fieldRelated,
      insufficientData: match.insufficientData === true,
      generalVocationalRole: match.generalVocationalRole === true,
      excludedFromListing: match.excludedFromListing === true,
    };
    resultEntries[match.jobId] = entry;
    if (match.fieldRelated !== null || entry.insufficientData) {
      persisted[match.jobId] = entry;
    }
  });

  writeBucket(email, kind, { cvIdentity, hasAnalysis: data.hasAnalysis, entries: persisted });
  return { cvIdentity, hasAnalysis: data.hasAnalysis, entries: resultEntries };
}

// Returns match results for the given job ids, computing them (once per cv identity) only if
// they aren't already known for this session. Safe to call from multiple pages/mounts
// concurrently. `cvIdentity` should be the candidate's current cv_text_hash from GET
// /api/cv/analysis (or NO_CV_IDENTITY if they have none) - see this module's top-of-file comment
// for why.
export async function getSessionMatches(
  email: string,
  kind: MatchKind,
  cvIdentity: string,
  jobIds: number[],
  language: string
): Promise<CacheBucket> {
  if (!email || jobIds.length === 0) {
    return { cvIdentity, hasAnalysis: false, entries: {} };
  }

  // No CV means there is nothing to compute - the caller already knows this from
  // fetchCurrentCvIdentity(), so resolve immediately without ever touching sessionStorage or the
  // network. No AI request, no queue job, no "Calculating..." flash while this state settles.
  if (cvIdentity === NO_CV_IDENTITY) {
    return { cvIdentity, hasAnalysis: false, entries: {} };
  }

  const cached = readBucket(email, kind, cvIdentity);
  // No CVAnalysis means there will never be anything to compute - trust that terminal state
  // for the rest of the session rather than re-asking on every page visit. Otherwise, only
  // trust the cache once every requested job id is already present in it.
  if (cached && (!cached.hasAnalysis || jobIds.every((id) => cached.entries[id] !== undefined))) {
    return cached;
  }

  const key = requestKey(email, kind, cvIdentity, jobIds);
  const existingRequest = inFlight.get(key);
  if (existingRequest) {
    return existingRequest;
  }

  const promise = fetchAndMerge(email, kind, cvIdentity, jobIds, language).finally(() => {
    inFlight.delete(key);
  });
  inFlight.set(key, promise);
  return promise;
}

// Progressive counterpart of getSessionMatches: cached job ids resolve immediately (no network
// call at all), anything not yet cached streams in one at a time over
// /api/jobs/match-scores/stream (or the external equivalent) instead of blocking the caller
// until every requested job is done - callers should prefer this over getSessionMatches for any
// job list that isn't tiny, and always pass only the jobs actually visible right now rather than
// an entire unpaginated list, so a large job board never fires one giant, slow batch computation.
// The backend's own per-(candidate, job) singleflight guard (JobMatchService.
// inFlightComputations) is what actually prevents duplicate OpenAI calls when two callers ask
// about the same job around the same time - this function does not need its own dedup logic on
// top of that. `cvIdentity` - see this module's top-of-file comment and getSessionMatches above.
export function streamSessionMatches(
  email: string,
  kind: MatchKind,
  cvIdentity: string,
  jobIds: number[],
  language: string,
  onScore: (jobId: number, entry: MatchEntry) => void,
  onDone: (hasAnalysis: boolean) => void,
  signal?: AbortSignal
): void {
  if (!email || jobIds.length === 0) {
    onDone(false);
    return;
  }

  // Same short-circuit as getSessionMatches above - the caller already knows there's no CV
  // (fetchCurrentCvIdentity resolved to NO_CV_IDENTITY), so resolve immediately without ever
  // opening the SSE connection. This is what stops "Calculating match score..." from ever
  // appearing when there's no CV to compute against.
  if (cvIdentity === NO_CV_IDENTITY) {
    onDone(false);
    return;
  }

  const cached = readBucket(email, kind, cvIdentity);
  if (cached && !cached.hasAnalysis) {
    onDone(false);
    return;
  }

  if (cached) {
    jobIds.forEach((id) => {
      const entry = cached.entries[id];
      if (entry) {
        onScore(id, entry);
      }
    });
  }

  const uncachedIds = cached ? jobIds.filter((id) => cached.entries[id] === undefined) : jobIds;
  if (uncachedIds.length === 0) {
    onDone(cached ? cached.hasAnalysis : true);
    return;
  }

  const path = kind === "internal" ? "/api/jobs/match-scores/stream" : "/api/external-jobs/match-scores/stream";
  const body =
    kind === "internal"
      ? { email, jobIds: uncachedIds, language }
      : { email, externalJobIds: uncachedIds, language };

  let sawAnalysis = cached ? cached.hasAnalysis : true;

  apiFetchStream(
    path,
    { method: "POST", body: JSON.stringify(body) },
    (evt) => {
      if (evt.event === "no-analysis") {
        sawAnalysis = false;
        const bucket = readBucket(email, kind, cvIdentity);
        writeBucket(email, kind, { cvIdentity, hasAnalysis: false, entries: bucket ? bucket.entries : {} });
        return;
      }

      if (evt.event === "score") {
        const match = evt.data as RawMatch;
        const entry: MatchEntry = {
          matchPercent: match.matchPercent,
          matchReason: match.matchReason,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          matchedRequiredSkills: match.matchedRequiredSkills,
          matchedPreferredSkills: match.matchedPreferredSkills,
          missingRequiredSkills: match.missingRequiredSkills,
          missingPreferredSkills: match.missingPreferredSkills,
          fieldRelated: match.fieldRelated === undefined ? true : match.fieldRelated,
          insufficientData: match.insufficientData === true,
          generalVocationalRole: match.generalVocationalRole === true,
          excludedFromListing: match.excludedFromListing === true,
        };
        sawAnalysis = true;

        // Same "don't freeze a transient failure into the session cache" rule as
        // fetchAndMerge above - only a real verdict (fieldRelated !== null) OR the deterministic
        // insufficient-data verdict gets persisted, so a job the AI genuinely couldn't score
        // naturally retries on the next visit.
        if (entry.fieldRelated !== null || entry.insufficientData) {
          const bucket = readBucket(email, kind, cvIdentity) || { cvIdentity, hasAnalysis: true, entries: {} };
          bucket.entries[match.jobId] = entry;
          bucket.hasAnalysis = true;
          writeBucket(email, kind, bucket);
        }

        onScore(match.jobId, entry);
        return;
      }

      if (evt.event === "done") {
        onDone(sawAnalysis);
      }
    },
    signal
  ).catch((error) => {
    if (signal?.aborted) return;
    console.error(error);
    onDone(sawAnalysis);
  });
}

// Writes a single job's freshly-known result directly into the session cache, keyed by the
// caller's current cvIdentity - used by JobDetailsPage after its own independent
// /api/jobs/match-detail (or external counterpart) call, which never goes through
// getSessionMatches/streamSessionMatches above and so would otherwise leave the list/dashboard
// pages' cached bucket pointing at whatever percentage was cached before the candidate opened
// this job's details. Without this, the details page could compute (and the backend persist) a
// genuinely different score - e.g. because the job's own content changed, or a backend scoring-
// logic fix reprocessed it - while the list page kept showing the stale cached number for the
// rest of the tab session, since nothing ever told its cache a newer value existed.
//
// Only call this for a real, scored verdict (fieldRelated === true with a real matchPercent) -
// the match-detail endpoint's response shape doesn't carry insufficientData/generalVocationalRole/
// excludedFromListing (those are list-only concerns), so writing an entry for any other status
// would default those flags incorrectly instead of leaving them as the list's own fetch already
// determined them.
export function updateSessionMatchEntry(
  email: string,
  kind: MatchKind,
  cvIdentity: string,
  jobId: number,
  entry: MatchEntry
) {
  if (!email || cvIdentity === NO_CV_IDENTITY) return;
  const existing = readBucket(email, kind, cvIdentity);
  const bucket: CacheBucket = existing ?? { cvIdentity, hasAnalysis: true, entries: {} };
  bucket.hasAnalysis = true;
  bucket.entries = { ...bucket.entries, [jobId]: entry };
  writeBucket(email, kind, bucket);
}

// Called on logout, and on CV upload/delete/analyze (see ResumeManager.tsx) so a different
// account - or a replaced CV - on the same tab never reuses stale session-cached match scores.
// Defense in depth: the cvIdentity check baked into readBucket above is what actually makes a
// stale bucket unusable even if some future caller forgets to invoke this, but clearing
// immediately here means the very next read doesn't even find a stale (if inert) entry.
export function clearMatchScoreSession() {
  inFlight.clear();
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // ignore - best-effort cleanup
  }
}
