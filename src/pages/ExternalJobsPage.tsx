import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Globe2, Search, DollarSign, SlidersHorizontal, Loader2, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import ExternalJobCard, { type ExternalJobData, type MatchInfo } from "../components/ExternalJobCard";
import AiDisclaimer from "../components/AiDisclaimer";
import { inferIndustry, extractSalaryNumber, INDUSTRY_KEYS } from "../utils/jobInference";
import { apiFetch, apiFetchStream, apiFetchWithRetry } from "../utils/api";
import { fetchCurrentCvIdentity, NO_CV_IDENTITY } from "../utils/matchScoreSession";
import { ISRAELI_CITIES } from "../utils/israeliCities";
import { ISRAELI_REGIONS, getRegionForLocation, type IsraeliRegion } from "../utils/israeliRegions";
import { EmptyState, ListSkeleton, Reveal } from "../components/ui";

type SortOrder = "match" | "newest" | "oldest";

type MatchScoreEntry = {
  matchPercent: number | null;
  matchReason: string;
  // true = real "field match" verdict; false = real "not a field match" verdict (matchReason
  // explains why); null = the AI couldn't compute this job at all - a transient failure, not
  // a verdict, and never cached by the backend, so it's worth retrying.
  fieldRelated: boolean | null;
  // See JobMatches.tsx's identically-named fields for the full rationale - same backend
  // VocationalRoleClassifier-driven categorization applies to external jobs too.
  generalVocationalRole: boolean;
  excludedFromListing: boolean;
  // True when this is a last-known-good fallback served because a fresh recompute just failed -
  // see backend JobMatchScore#stale. Real number, possibly a little behind; the retry-scheduling
  // effect below (not the user) is responsible for eventually replacing it with a fresh one.
  stale: boolean;
};

function ExternalJobsPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language] || translations.en;
  const p = t.externalJobsPage;
  const isRTL = language === "ar" || language === "he";

  const readCandidateIdentity = () => ({
    email: user?.email || "",
  });

  const [jobs, setJobs] = useState<ExternalJobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  // See JobMatches.tsx's identically-named state for the full rationale (a sleeping backend
  // waking back up after inactivity, retried automatically instead of a dead-end error).
  const [reconnecting, setReconnecting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState<IsraeliRegion | "">("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [minSalary, setMinSalary] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>("match");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [matchScores, setMatchScores] = useState<Map<number, MatchScoreEntry>>(new Map());
  const [hasAnalysis, setHasAnalysis] = useState<boolean | null>(null);
  const [matchScoresLoading, setMatchScoresLoading] = useState(false);
  // Bumped by a failed card's "Retry" action to force the match-score streaming effect below to
  // run again. The backend's own per-(candidate,job) score cache means re-requesting an
  // already-scored job just returns the cached result instantly - only the genuinely failed
  // one(s) actually trigger new AI work.
  const [matchRetryNonce, setMatchRetryNonce] = useState(0);
  // Caps how many times the effect below will auto-schedule its own retry for a stale fallback
  // score before giving up and just leaving the (still real, just possibly outdated) last-known
  // percentage on screen - a persistently-failing job must never retry forever in the background.
  const staleRetryCountRef = useRef(0);
  const MAX_STALE_RETRIES = 5;
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  // See JobMatches.tsx's identically-named state for the full rationale.
  const [jobCategory, setJobCategory] = useState<"profession" | "vocational">("profession");
  // See JobMatches.tsx's identically-named state for the full rationale.
  const [matchYouFilter, setMatchYouFilter] = useState(true);

  const loadExternalJobs = () => {
    setLoading(true);
    setFetchError("");
    apiFetchWithRetry(`/api/external-jobs/all`, {}, { onRetry: () => setReconnecting(true) })
      .then((data: ExternalJobData[]) => {
        setJobs(Array.isArray(data) ? data : []);
        setFetchError("");
        setReconnecting(false);
      })
      .catch((error) => {
        console.error(error);
        setJobs([]);
        setReconnecting(false);
        setFetchError(p.loadError);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadExternalJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const identity = readCandidateIdentity();
    setIsLoggedIn(Boolean(identity.email));

    if (!identity.email || jobs.length === 0) {
      return;
    }

    const externalJobIds = jobs.map((job) => job.id);
    const controller = new AbortController();

    // Fresh job list / language change -> start clean instead of carrying over stale entries
    // from a previous stream (e.g. a job that's no longer in the current filtered set).
    setHasAnalysis(null);
    setMatchScores(new Map());
    setMatchScoresLoading(true);

    // Tracked locally (not via React state, which wouldn't be readable synchronously inside the
    // "done" handler below) - true the moment any job in THIS pass came back as a stale fallback
    // (see backend JobMatchScore#stale) OR a hard error with no fallback available (fieldRelated
    // === null - e.g. a brand-new job with no prior score at all). Drives the auto-retry
    // scheduling once the batch settles - this is the secondary safety net, not the primary fix
    // (see backend matching.queue.await-timeout-ms's own comment for the actual root-cause fix),
    // so it must also cover the no-fallback case, not just the stale one.
    let needsRetry = false;

    // Checked before ever opening the SSE connection - a candidate with no CV has nothing to
    // compute (the backend would immediately reply with its own "no-analysis" event anyway, no
    // AI/queue work triggered), but skipping the request entirely here is what stops the
    // "Calculating match score..." flash from ever appearing in that case.
    fetchCurrentCvIdentity().then((cvIdentity) => {
      if (controller.signal.aborted) return;

      if (cvIdentity === NO_CV_IDENTITY) {
        setHasAnalysis(false);
        setMatchScoresLoading(false);
        return;
      }

      apiFetchStream(
        "/api/external-jobs/match-scores/stream",
        { method: "POST", body: JSON.stringify({ email: identity.email, externalJobIds, language }) },
        (evt) => {
          if (evt.event === "no-analysis") {
            setHasAnalysis(false);
            setMatchScoresLoading(false);
            return;
          }

          if (evt.event === "score") {
            const match = evt.data as {
              jobId: number;
              matchPercent: number | null;
              matchReason?: string;
              fieldRelated?: boolean | null;
              generalVocationalRole?: boolean;
              excludedFromListing?: boolean;
              stale?: boolean;
            };
            setHasAnalysis(true);
            if (match.stale || match.fieldRelated === null) {
              needsRetry = true;
            }
            // Per-card progressive update: each "score" event updates just that one job's entry,
            // so a job that's already resolved shows its real percentage immediately instead of
            // waiting for every other job in the batch to finish too.
            setMatchScores((prev) => {
              const next = new Map(prev);
              next.set(match.jobId, {
                matchPercent: match.matchPercent,
                matchReason: match.matchReason || "",
                fieldRelated: match.fieldRelated === undefined ? true : match.fieldRelated,
                generalVocationalRole: match.generalVocationalRole === true,
                excludedFromListing: match.excludedFromListing === true,
                stale: match.stale === true,
              });
              return next;
            });
            return;
          }

          if (evt.event === "done") {
            setMatchScoresLoading(false);

            // Auto-retry, silently in the background, for whatever came back stale OR hard-
            // errored this pass - bumping matchRetryNonce is exactly what the existing manual
            // "Retry" button already does, just triggered automatically instead of waiting for a
            // click. The backend's own per-(candidate,job) cache means anything already fresh
            // resolves instantly; only the genuinely-unresolved job(s) trigger new AI work.
            // Secondary safety net only - the actual fix is the backend's queue-await-timeout
            // increase, which should make this rarely fire at all.
            if (needsRetry && !controller.signal.aborted && staleRetryCountRef.current < MAX_STALE_RETRIES) {
              staleRetryCountRef.current += 1;
              const delayMs = 8000 + staleRetryCountRef.current * 4000;
              window.setTimeout(() => {
                if (!controller.signal.aborted) {
                  setMatchRetryNonce((n) => n + 1);
                }
              }, delayMs);
            } else if (!needsRetry) {
              staleRetryCountRef.current = 0;
            }
          }
        },
        controller.signal
      ).catch((error) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setHasAnalysis(false);
        setMatchScoresLoading(false);
      });
    });

    return () => {
      controller.abort();
    };
  }, [jobs, language, matchRetryNonce]);

  useEffect(() => {
    const identity = readCandidateIdentity();
    if (!identity.email) return;

    apiFetch(`/api/saved-jobs/candidate/${encodeURIComponent(identity.email)}`)
      .then((rows: { jobId: number; jobType: string }[]) => {
        const ids = Array.isArray(rows)
          ? rows.filter((row) => row.jobType === "external").map((row) => row.jobId)
          : [];
        setSavedJobIds(new Set(ids));
      })
      .catch(() => {});
  }, []);

  const handleToggleSave = (job: ExternalJobData) => {
    const identity = readCandidateIdentity();
    if (!identity.email) return;

    const isSaved = savedJobIds.has(job.id);

    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(job.id);
      } else {
        next.add(job.id);
      }
      return next;
    });

    if (isSaved) {
      apiFetch(
        `/api/saved-jobs/candidate/${encodeURIComponent(identity.email)}/external/${job.id}`,
        { method: "DELETE" }
      ).catch(() => {
        setSavedJobIds((prev) => new Set(prev).add(job.id));
      });
    } else {
      apiFetch(`/api/saved-jobs/save`, {
        method: "POST",
        body: JSON.stringify({
          candidateEmail: identity.email,
          jobId: job.id,
          jobType: "external",
          jobTitle: job.title,
          companyName: job.companyName,
          location: job.location,
          salary: job.salary,
        }),
      }).catch(() => {
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(job.id);
          return next;
        });
      });
    }
  };

  const cities = useMemo(() => {
    const regionCities = regionFilter
      ? ISRAELI_CITIES.filter((city) => getRegionForLocation(city) === regionFilter)
      : ISRAELI_CITIES;

    const jobCities = Array.from(
      new Set(
        jobs
          .filter((job) => !regionFilter || getRegionForLocation(job.city, job.location) === regionFilter)
          .map((job) => job.city)
          .filter(Boolean)
      )
    ) as string[];

    return Array.from(new Set([...regionCities, ...jobCities])).sort((a, b) => a.localeCompare(b));
  }, [jobs, regionFilter]);

  const types = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.type).filter(Boolean))) as string[],
    [jobs]
  );

  const hasActiveFilters =
    Boolean(regionFilter) ||
    Boolean(cityFilter) ||
    Boolean(typeFilter) ||
    Boolean(industryFilter) ||
    minSalary > 0 ||
    sortOrder !== "match";

  const getMatchInfo = (job: ExternalJobData): MatchInfo => {
    if (!isLoggedIn) return { status: "loggedOut", percent: 0 };
    if (hasAnalysis === null) return { status: "loading", percent: 0 };
    if (!hasAnalysis) return { status: "noAnalysis", percent: 0 };

    // Checked before matchScoresLoading (unlike the old all-or-nothing version) - this job's
    // own entry may already have arrived over the stream even while other jobs in the batch
    // are still being scored, and it should show its real result immediately rather than
    // waiting for the whole batch.
    const entry = matchScores.get(job.id);
    if (!entry) {
      return matchScoresLoading
        ? { status: "loading", percent: 0 }
        : { status: "error", percent: 0, reason: p.matchScoreUnavailable || "Couldn't compute a match for this job. Please refresh." };
    }

    if (entry.fieldRelated === null) {
      return { status: "error", percent: 0, reason: entry.matchReason };
    }

    if (!entry.fieldRelated || entry.matchPercent === null) {
      return { status: "noScore", percent: 0, reason: entry.matchReason };
    }

    return { status: "scored", percent: entry.matchPercent };
  };

  const filteredJobs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const filtered = jobs.filter((job) => {
      const matchesSearch =
        !search ||
        (job.title || "").toLowerCase().includes(search) ||
        (job.companyName || "").toLowerCase().includes(search) ||
        (job.skills || "").toLowerCase().includes(search);

      const matchesRegion = !regionFilter || getRegionForLocation(job.city, job.location) === regionFilter;
      const matchesCity = !cityFilter || job.city === cityFilter;
      const matchesType = !typeFilter || job.type === typeFilter;
      const matchesIndustry = !industryFilter || inferIndustry(job) === industryFilter;

      const jobSalary = extractSalaryNumber(job.salary);
      // minSalary is the slider value in thousands (label reads "Xk"), while
      // extractSalaryNumber returns the raw shekel figure - comparing them directly
      // made this filter pass almost everything regardless of slider position.
      const matchesSalary = jobSalary === 0 ? true : jobSalary >= minSalary * 1000;

      // See JobMatches.tsx's categorizedJobs for the full rationale - when matchYouFilter is on
      // (the default), a genuinely-unrelated, non-vocational job is hidden entirely and a
      // vocational one is routed to its own tab instead of being mixed into profession-based
      // results. When matchYouFilter is off, every job matches regardless of profession - no
      // split, nothing hidden. A job with no match entry yet (not logged in, still loading, no
      // CV) always counts as "profession" so nothing vanishes before it's even been classified.
      const entry = matchScores.get(job.id);
      const matchesCategory = !matchYouFilter
        ? true
        : !entry
          ? jobCategory === "profession"
          : entry.excludedFromListing
            ? false
            : jobCategory === "vocational"
              ? entry.generalVocationalRole
              : !entry.generalVocationalRole;

      return matchesSearch && matchesRegion && matchesCity && matchesType && matchesIndustry && matchesSalary && matchesCategory;
    });

    if (sortOrder === "newest" || sortOrder === "oldest") {
      return [...filtered].sort((a, b) => {
        const timeA = a.importedAt ? new Date(a.importedAt).getTime() : 0;
        const timeB = b.importedAt ? new Date(b.importedAt).getTime() : 0;
        return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
      });
    }

    return [...filtered].sort((a, b) => {
      const infoA = getMatchInfo(a);
      const infoB = getMatchInfo(b);
      const scoreA = infoA.status === "scored" ? infoA.percent : -1;
      const scoreB = infoB.status === "scored" ? infoB.percent : -1;
      return scoreB - scoreA;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    jobs,
    searchTerm,
    regionFilter,
    cityFilter,
    typeFilter,
    industryFilter,
    minSalary,
    sortOrder,
    matchScores,
    hasAnalysis,
    matchScoresLoading,
    isLoggedIn,
    jobCategory,
    matchYouFilter,
  ]);

  // Whether the "General & Vocational Jobs" tab is worth showing at all - independent of
  // jobCategory (unlike filteredJobs above) so switching tabs doesn't make the OTHER tab's button
  // disappear from under the candidate.
  const vocationalJobsCount = useMemo(() => {
    return jobs.filter((job) => {
      const entry = matchScores.get(job.id);
      return entry ? entry.generalVocationalRole && !entry.excludedFromListing : false;
    }).length;
  }, [jobs, matchScores]);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-7 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1080px]">
        <section className="mb-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
              <Globe2 size={26} />
            </div>
            <div className={`min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
              <h1 className="text-[42px] font-extrabold leading-tight text-white max-[640px]:text-[28px]">{p.title}</h1>
              <p className="mt-2 text-[17px] text-[#aeb4d6]">{p.subtitle}</p>
            </div>
          </div>

          {reconnecting && !fetchError && (
            <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-amber-200">
              {t.common.reconnecting}
            </div>
          )}

          {fetchError && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-5 py-4 text-rose-200">
              <span>{fetchError}</span>
              <button
                type="button"
                onClick={() => {
                  setReconnecting(false);
                  loadExternalJobs();
                }}
                className="rounded-full border border-rose-300/40 px-4 py-1.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
              >
                {t.common.retry}
              </button>
            </div>
          )}

          <div className="mb-5 rounded-[28px] border border-white/10 bg-white/[0.05] px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
            <div className={`mb-4 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5e66ff1f] text-[#7c88ff]">
                <SlidersHorizontal size={20} />
              </div>
              <h3 className="text-[18px] font-extrabold text-white">{t.jobMatches.smartFilters}</h3>
            </div>

            {/* See JobMatches.tsx's identically-purposed toggle for the full rationale. Only
                meaningful once logged in with match data to personalize against. */}
            {isLoggedIn && (
              <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="text-[15px] font-semibold text-white">{t.jobMatches.matchYouFilterLabel}</p>
                  <p className="mt-0.5 text-xs text-[#aeb4d6]">{t.jobMatches.matchYouFilterHint}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={matchYouFilter}
                  onClick={() => setMatchYouFilter((prev) => !prev)}
                  className={`relative h-[26px] w-[46px] shrink-0 rounded-full transition ${
                    matchYouFilter ? "bg-[#7f4cff]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-[3px] h-[20px] w-[20px] rounded-full bg-white shadow transition-all ${
                      matchYouFilter ? (isRTL ? "right-[23px]" : "left-[23px]") : isRTL ? "right-[3px]" : "left-[3px]"
                    }`}
                  />
                </button>
              </div>
            )}

            {/* grid-cols-1 below (not bare "grid") - same overflow bug as the job-card list
                further down this page: the implicit single column otherwise sizes to its
                widest child's content instead of the container's width. Search stays inline at
                every width (primary action); region/city/type/industry/sort/salary collapse
                behind a "Filters" sheet below lg - the hidden lg:grid block still renders at
                lg+ so this section keeps its original layout on larger screens unchanged. */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div
                className={`flex items-center gap-3 rounded-[20px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 lg:col-span-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Search size={20} className="text-white/45" />
                <input
                  type="text"
                  dir={isRTL ? "rtl" : "ltr"}
                  placeholder={p.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                className={`relative flex items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] font-semibold text-white/85 transition hover:bg-white/[0.08] lg:hidden ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <SlidersHorizontal size={18} />
                {t.common.filters}
                {hasActiveFilters && (
                  <span className="absolute right-3 top-2.5 h-2 w-2 rounded-full bg-fuchsia-400" />
                )}
              </button>

              <div className="hidden lg:col-span-3 lg:grid lg:grid-cols-3 lg:gap-4">
                <select
                  value={regionFilter}
                  onChange={(e) => {
                    setRegionFilter(e.target.value as IsraeliRegion | "");
                    setCityFilter("");
                  }}
                  className="rounded-[20px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] text-white outline-none"
                >
                  <option className="text-black" value="">{p.allRegions}</option>
                  {ISRAELI_REGIONS.map((region) => (
                    <option className="text-black" key={region} value={region}>
                      {p.regions?.[region] || region}
                    </option>
                  ))}
                </select>

                {cities.length > 0 && (
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="rounded-[20px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] text-white outline-none"
                  >
                    <option className="text-black" value="">{p.allCities}</option>
                    {cities.map((city) => (
                      <option className="text-black" key={city} value={city}>{city}</option>
                    ))}
                  </select>
                )}

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-[20px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] text-white outline-none"
                >
                  <option className="text-black" value="">{p.allTypes}</option>
                  {types.map((type) => (
                    <option className="text-black" key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="rounded-[20px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] text-white outline-none lg:col-span-2"
                >
                  <option className="text-black" value="">{t.jobMatches.allIndustries}</option>
                  {INDUSTRY_KEYS.map((key) => (
                    <option className="text-black" key={key} value={key}>
                      {t.jobMatches[key] || key}
                    </option>
                  ))}
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className={`flex items-center rounded-[20px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] text-white outline-none ${isRTL ? "text-right" : "text-left"}`}
                >
                  <option className="text-black" value="match">{p.sortBestMatch}</option>
                  <option className="text-black" value="newest">{p.sortNewestFirst}</option>
                  <option className="text-black" value="oldest">{p.sortOldestFirst}</option>
                </select>

                <div className="lg:col-span-3">
                  <label className={`mb-2 flex items-center gap-2 text-[15px] text-[#d7dbf7] ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                    <DollarSign size={17} />
                    <span>{t.jobMatches.minSalary}: ₪{minSalary}k</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    step={5}
                    value={minSalary}
                    onChange={(e) => setMinSalary(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#171a46]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {filterDrawerOpen && (
            <div className="fixed inset-0 z-[70] lg:hidden">
              <motion.button
                type="button"
                aria-label={t.common.close}
                onClick={() => setFilterDrawerOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={t.common.filters}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 38 }}
                className={`absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-[28px] border-t border-white/10 bg-[#111340] px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3 shadow-floating ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/15" />
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[16px] font-bold text-white">{t.common.filters}</span>
                  <button
                    type="button"
                    onClick={() => setFilterDrawerOpen(false)}
                    aria-label={t.common.close}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <select
                    value={regionFilter}
                    onChange={(e) => {
                      setRegionFilter(e.target.value as IsraeliRegion | "");
                      setCityFilter("");
                    }}
                    className="rounded-[16px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] text-white outline-none"
                  >
                    <option className="text-black" value="">{p.allRegions}</option>
                    {ISRAELI_REGIONS.map((region) => (
                      <option className="text-black" key={region} value={region}>
                        {p.regions?.[region] || region}
                      </option>
                    ))}
                  </select>

                  {cities.length > 0 && (
                    <select
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="rounded-[16px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] text-white outline-none"
                    >
                      <option className="text-black" value="">{p.allCities}</option>
                      {cities.map((city) => (
                        <option className="text-black" key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  )}

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-[16px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] text-white outline-none"
                  >
                    <option className="text-black" value="">{p.allTypes}</option>
                    {types.map((type) => (
                      <option className="text-black" key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="rounded-[16px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] text-white outline-none"
                  >
                    <option className="text-black" value="">{t.jobMatches.allIndustries}</option>
                    {INDUSTRY_KEYS.map((key) => (
                      <option className="text-black" key={key} value={key}>
                        {t.jobMatches[key] || key}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className={`flex items-center rounded-[16px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] text-white outline-none ${isRTL ? "text-right" : "text-left"}`}
                  >
                    <option className="text-black" value="match">{p.sortBestMatch}</option>
                    <option className="text-black" value="newest">{p.sortNewestFirst}</option>
                    <option className="text-black" value="oldest">{p.sortOldestFirst}</option>
                  </select>

                  <div>
                    <label className={`mb-2 flex items-center gap-2 text-[15px] text-[#d7dbf7] ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                      <DollarSign size={17} />
                      <span>{t.jobMatches.minSalary}: ₪{minSalary}k</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={200}
                      step={5}
                      value={minSalary}
                      onChange={(e) => setMinSalary(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#171a46]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(false)}
                  className="mt-5 w-full rounded-[16px] bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(99,102,241,0.28)] transition hover:scale-[1.02]"
                >
                  {t.common.applyFilters}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {isLoggedIn && <AiDisclaimer />}

        {isLoggedIn && matchYouFilter && vocationalJobsCount > 0 && (
          <div className={`mt-4 flex flex-wrap gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <button
              type="button"
              onClick={() => setJobCategory("profession")}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                jobCategory === "profession"
                  ? "border-[#7f4cff]/50 bg-[#7f4cff]/20 text-white"
                  : "border-white/10 bg-white/5 text-[#c4cae9] hover:bg-white/10"
              }`}
            >
              {t.jobMatches.professionMatchesTab}
            </button>
            <button
              type="button"
              onClick={() => setJobCategory("vocational")}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                jobCategory === "vocational"
                  ? "border-[#7f4cff]/50 bg-[#7f4cff]/20 text-white"
                  : "border-white/10 bg-white/5 text-[#c4cae9] hover:bg-white/10"
              }`}
            >
              {t.jobMatches.vocationalJobsTab} ({vocationalJobsCount})
            </button>
          </div>
        )}

        {/* grid-cols-1 (not bare "grid") is load-bearing here, not cosmetic - a bare grid's
            single implicit column sizes to its widest child's own content width instead of the
            container's width, so a job card with enough fixed-width content (e.g. the actions
            column) can overflow past this section's actual boundary at ANY viewport size,
            including desktop. minmax(0,1fr) via grid-cols-1 is what makes children actually
            shrink to fit instead. Found live: articles were rendering ~150-750px wider than
            their grid parent at every tested viewport (375/768/1440px). */}
        <section className="grid grid-cols-1 gap-5">
          {loading && <ListSkeleton count={4} />}

          {/* Job cards render immediately once the list loads (each one starts as its own
              "Calculating match..." ring - see ExternalJobCard) - this banner is purely an
              extra reassurance that the AI matching pass itself is genuinely still working,
              since scoring dozens of jobs can take a while even though results stream in
              progressively rather than all at once. */}
          {!loading && isLoggedIn && matchScoresLoading && (
            <div className="flex items-center gap-3 rounded-[20px] border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-4 text-[14px] text-cyan-100">
              <Loader2 size={18} className="shrink-0 animate-spin text-cyan-300" />
              <span>{p.aiAnalysisInProgress}</span>
            </div>
          )}

          {!loading &&
            filteredJobs.map((job, index) => (
              <Reveal key={job.id} delay={Math.min(index * 0.05, 0.3)}>
                <ExternalJobCard
                  job={job}
                  matchInfo={getMatchInfo(job)}
                  t={t}
                  isRTL={isRTL}
                  onViewDetails={() => navigate(`/job-details/external/${job.id}`)}
                  isSaved={savedJobIds.has(job.id)}
                  onToggleSave={isLoggedIn ? () => handleToggleSave(job) : undefined}
                  onRetryMatch={() => setMatchRetryNonce((n) => n + 1)}
                />
              </Reveal>
            ))}

          {!loading && filteredJobs.length === 0 && (
            <EmptyState icon={<Globe2 size={26} />} title={p.noJobsFound} />
          )}
        </section>
      </div>
    </div>
  );
}

export default ExternalJobsPage;
