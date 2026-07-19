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

export type MatchEntry = {
  matchPercent: number | null;
  matchReason?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  fieldRelated?: boolean | null;
};

type RawMatch = {
  jobId: number;
  matchPercent: number | null;
  matchReason?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  fieldRelated?: boolean | null;
};

type MatchesResponse = { hasAnalysis: boolean; matches: RawMatch[] };

export type MatchKind = "internal" | "external";

type CacheBucket = {
  hasAnalysis: boolean;
  entries: Record<number, MatchEntry>;
};

const STORAGE_PREFIX = "jobmatch_matchscores_";

function storageKey(email: string, kind: MatchKind) {
  return `${STORAGE_PREFIX}${kind}_${email}`;
}

function readBucket(email: string, kind: MatchKind): CacheBucket | null {
  try {
    const raw = sessionStorage.getItem(storageKey(email, kind));
    return raw ? (JSON.parse(raw) as CacheBucket) : null;
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

// Per (email, kind, job-id-set) in-flight promise so concurrent callers within the same tab
// (a component mounting twice under React StrictMode, or navigating back to a page before its
// first request resolved) join the SAME network call instead of each starting their own. This is
// the frontend half of "concurrent requests cannot start the same calculation more than once" -
// the backend's own per-job singleflight guard (JobMatchService.inFlightComputations) is the
// other half, covering requests that land at the same time from different tabs/sessions.
const inFlight = new Map<string, Promise<CacheBucket>>();

function requestKey(email: string, kind: MatchKind, jobIds: number[]) {
  return `${email}|${kind}|${[...jobIds].sort((a, b) => a - b).join(",")}`;
}

async function fetchAndMerge(
  email: string,
  kind: MatchKind,
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

  const existing = readBucket(email, kind);
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
      fieldRelated: match.fieldRelated === undefined ? true : match.fieldRelated,
    };
    resultEntries[match.jobId] = entry;
    if (match.fieldRelated !== null) {
      persisted[match.jobId] = entry;
    }
  });

  writeBucket(email, kind, { hasAnalysis: data.hasAnalysis, entries: persisted });
  return { hasAnalysis: data.hasAnalysis, entries: resultEntries };
}

// Returns match results for the given job ids, computing them (once) only if they aren't
// already known for this session. Safe to call from multiple pages/mounts concurrently.
export async function getSessionMatches(
  email: string,
  kind: MatchKind,
  jobIds: number[],
  language: string
): Promise<CacheBucket> {
  if (!email || jobIds.length === 0) {
    return { hasAnalysis: false, entries: {} };
  }

  const cached = readBucket(email, kind);
  // No CVAnalysis means there will never be anything to compute - trust that terminal state
  // for the rest of the session rather than re-asking on every page visit. Otherwise, only
  // trust the cache once every requested job id is already present in it.
  if (cached && (!cached.hasAnalysis || jobIds.every((id) => cached.entries[id] !== undefined))) {
    return cached;
  }

  const key = requestKey(email, kind, jobIds);
  const existingRequest = inFlight.get(key);
  if (existingRequest) {
    return existingRequest;
  }

  const promise = fetchAndMerge(email, kind, jobIds, language).finally(() => {
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
// top of that.
export function streamSessionMatches(
  email: string,
  kind: MatchKind,
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

  const cached = readBucket(email, kind);
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
        const bucket = readBucket(email, kind);
        writeBucket(email, kind, { hasAnalysis: false, entries: bucket ? bucket.entries : {} });
        return;
      }

      if (evt.event === "score") {
        const match = evt.data as RawMatch;
        const entry: MatchEntry = {
          matchPercent: match.matchPercent,
          matchReason: match.matchReason,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          fieldRelated: match.fieldRelated === undefined ? true : match.fieldRelated,
        };
        sawAnalysis = true;

        // Same "don't freeze a transient failure into the session cache" rule as
        // fetchAndMerge above - only a real verdict (fieldRelated !== null) gets persisted,
        // so a job the AI genuinely couldn't score naturally retries on the next visit.
        if (entry.fieldRelated !== null) {
          const bucket = readBucket(email, kind) || { hasAnalysis: true, entries: {} };
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

// Called on logout so a different account logging in on the same tab never reuses another
// candidate's session-cached match scores (defense in depth - the cache is already keyed per
// email, so this is about not letting stale entries accumulate, not a correctness fix).
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
