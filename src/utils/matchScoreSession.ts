import { apiFetch, apiFetchStream } from "./api";

export type MatchEntry = {
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

  stale?: boolean;
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
  stale?: boolean;
};

type MatchesResponse = { hasAnalysis: boolean; matches: RawMatch[] };

export type MatchKind = "internal" | "external";

export const NO_CV_IDENTITY = "none";

type CacheBucket = {
  cvIdentity: string;
  hasAnalysis: boolean;
  entries: Record<number, MatchEntry>;
};

// מזהה ייחודי של קורות החיים הנוכחיים (hash) - משמש כמפתח לקאש כדי לדעת מתי לפסול אותו
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

// קורא את חבילת הציונים השמורה מה-sessionStorage, רק אם היא שייכת לאותן קורות חיים
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

// שומר את חבילת הציונים ב-sessionStorage לפי המייל וסוג המשרות
function writeBucket(email: string, kind: MatchKind, bucket: CacheBucket) {
  try {
    sessionStorage.setItem(storageKey(email, kind), JSON.stringify(bucket));
  } catch {

  }
}

// מונע כמה קריאות רשת זהות במקביל (למשל שני קומפוננטות שמבקשות אותם jobIds באותו רגע)
const inFlight = new Map<string, Promise<CacheBucket>>();

function requestKey(email: string, kind: MatchKind, cvIdentity: string, jobIds: number[]) {
  return `${email}|${kind}|${cvIdentity}|${[...jobIds].sort((a, b) => a - b).join(",")}`;
}

// מביא ציוני התאמה חדשים מהשרת וממזג אותם עם מה שכבר שמור בקאש של אותן קורות חיים
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
      stale: match.stale === true,
    };
    resultEntries[match.jobId] = entry;

    // stale/null זה עדיין באמצע עיבוד בצד השרת - לא שומרים בקאש כדי שהקריאה הבאה תנסה שוב
    if ((match.fieldRelated !== null && !entry.stale) || entry.insufficientData) {
      persisted[match.jobId] = entry;
    }
  });

  writeBucket(email, kind, { cvIdentity, hasAnalysis: data.hasAnalysis, entries: persisted });
  return { cvIdentity, hasAnalysis: data.hasAnalysis, entries: resultEntries };
}

// נקודת הכניסה הראשית לקבלת ציוני התאמה - מחזיר מהקאש אם אפשר, אחרת פונה לשרת (ומונע בקשות כפולות במקביל)
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

  if (cvIdentity === NO_CV_IDENTITY) {
    return { cvIdentity, hasAnalysis: false, entries: {} };
  }

  const cached = readBucket(email, kind, cvIdentity);

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

// מזרים ציוני התאמה בהדרגה (SSE) - קודם מחזיר מה שכבר בקאש, ואז ממשיך לחשב את השאר אחד-אחד
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
          stale: match.stale === true,
        };
        sawAnalysis = true;

        // אותה הגבלה כמו ב-fetchAndMerge - לא לשמור ציון שעדיין stale
        if ((entry.fieldRelated !== null && !entry.stale) || entry.insufficientData) {
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

// מעדכן ציון בודד בקאש בלי לפנות מחדש לשרת (למשל אחרי ניתוח מחדש של משרה ספציפית)
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
  const previous = bucket.entries[jobId];
  // ממזג עם הערך הקיים בקאש כדי לא לאבד שדות (כמו generalVocationalRole) שהקריאה הנוכחית לא סיפקה
  bucket.entries = { ...bucket.entries, [jobId]: previous ? { ...previous, ...entry } : entry };
  writeBucket(email, kind, bucket);
}

// מנקה את כל קאש ציוני ההתאמה מה-sessionStorage (למשל בהתנתקות מהמערכת)
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

  }
}
