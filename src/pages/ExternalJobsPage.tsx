import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe2, Search, DollarSign, SlidersHorizontal, Loader2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import ExternalJobCard, { type ExternalJobData, type MatchInfo } from "../components/ExternalJobCard";
import { inferIndustry, extractSalaryNumber, INDUSTRY_KEYS } from "../utils/jobInference";
import { apiFetch, apiFetchStream } from "../utils/api";
import { fetchCurrentCvIdentity, NO_CV_IDENTITY } from "../utils/matchScoreSession";
import { ISRAELI_CITIES } from "../utils/israeliCities";
import { ISRAELI_REGIONS, getRegionForLocation, type IsraeliRegion } from "../utils/israeliRegions";

type SortOrder = "match" | "newest" | "oldest";

type MatchScoreEntry = {
  matchPercent: number | null;
  matchReason: string;
  // true = real "field match" verdict; false = real "not a field match" verdict (matchReason
  // explains why); null = the AI couldn't compute this job at all - a transient failure, not
  // a verdict, and never cached by the backend, so it's worth retrying.
  fieldRelated: boolean | null;
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

  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState<IsraeliRegion | "">("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [minSalary, setMinSalary] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>("match");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [matchScores, setMatchScores] = useState<Map<number, MatchScoreEntry>>(new Map());
  const [hasAnalysis, setHasAnalysis] = useState<boolean | null>(null);
  const [matchScoresLoading, setMatchScoresLoading] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    apiFetch(`/api/external-jobs/all`)
      .then((data: ExternalJobData[]) => {
        setJobs(Array.isArray(data) ? data : []);
        setFetchError("");
      })
      .catch((error) => {
        console.error(error);
        setJobs([]);
        setFetchError(p.loadError);
      })
      .finally(() => setLoading(false));
  }, [p.loadError]);

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
            };
            setHasAnalysis(true);
            // Per-card progressive update: each "score" event updates just that one job's entry,
            // so a job that's already resolved shows its real percentage immediately instead of
            // waiting for every other job in the batch to finish too.
            setMatchScores((prev) => {
              const next = new Map(prev);
              next.set(match.jobId, {
                matchPercent: match.matchPercent,
                matchReason: match.matchReason || "",
                fieldRelated: match.fieldRelated === undefined ? true : match.fieldRelated,
              });
              return next;
            });
            return;
          }

          if (evt.event === "done") {
            setMatchScoresLoading(false);
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
  }, [jobs, language]);

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

      return matchesSearch && matchesRegion && matchesCity && matchesType && matchesIndustry && matchesSalary;
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
  ]);

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
              <h1 className="text-[42px] font-extrabold leading-tight text-white">{p.title}</h1>
              <p className="mt-2 text-[17px] text-[#aeb4d6]">{p.subtitle}</p>
            </div>
          </div>

          {fetchError && (
            <div className="mb-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-5 py-4 text-rose-200">
              {fetchError}
            </div>
          )}

          <div className="mb-5 rounded-[28px] border border-white/10 bg-white/[0.05] px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
            <div className={`mb-4 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5e66ff1f] text-[#7c88ff]">
                <SlidersHorizontal size={20} />
              </div>
              <h3 className="text-[18px] font-extrabold text-white">{t.jobMatches.smartFilters}</h3>
            </div>

            {/* grid-cols-1 below (not bare "grid") - same overflow bug as the job-card list
                further down this page: the implicit single column otherwise sizes to its
                widest child's content instead of the container's width. */}
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
        </section>

        {/* grid-cols-1 (not bare "grid") is load-bearing here, not cosmetic - a bare grid's
            single implicit column sizes to its widest child's own content width instead of the
            container's width, so a job card with enough fixed-width content (e.g. the actions
            column) can overflow past this section's actual boundary at ANY viewport size,
            including desktop. minmax(0,1fr) via grid-cols-1 is what makes children actually
            shrink to fit instead. Found live: articles were rendering ~150-750px wider than
            their grid parent at every tested viewport (375/768/1440px). */}
        <section className="grid grid-cols-1 gap-5">
          {loading && (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-white/65">
              {p.loading}
            </div>
          )}

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
            filteredJobs.map((job) => (
              <ExternalJobCard
                key={job.id}
                job={job}
                matchInfo={getMatchInfo(job)}
                t={t}
                isRTL={isRTL}
                onViewDetails={() => navigate(`/job-details/external/${job.id}`)}
                isSaved={savedJobIds.has(job.id)}
                onToggleSave={isLoggedIn ? () => handleToggleSave(job) : undefined}
              />
            ))}

          {!loading && filteredJobs.length === 0 && (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-white/65">
              {p.noJobsFound}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ExternalJobsPage;
