import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe2, Search, DollarSign, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import ExternalJobCard, { type ExternalJobData, type MatchInfo } from "../components/ExternalJobCard";
import { inferIndustry, extractSalaryNumber } from "../utils/jobInference";

const API_BASE_URL = "http://localhost:8080";

const INDUSTRY_KEYS = [
  "technology", "engineering", "healthcare", "education", "finance", "marketing",
  "retail", "sales", "customerService", "hospitality", "restaurants", "logistics",
  "construction", "factory", "security", "legal", "administration", "humanResources",
  "realEstate", "beauty", "cleaning", "agriculture", "media", "design", "translation",
  "writing", "general",
];

type MatchScoreEntry = {
  matchPercent: number | null;
  fieldRelated: boolean;
};

function readCandidateIdentity() {
  const readObject = (key: string) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  const user =
    readObject("currentUser") ||
    readObject("loggedInUser") ||
    readObject("user") ||
    readObject("candidateProfile") ||
    readObject("userProfile") ||
    {};

  return {
    email:
      user.email ||
      localStorage.getItem("email") ||
      localStorage.getItem("userEmail") ||
      localStorage.getItem("candidateEmail") ||
      "",
  };
}

function ExternalJobsPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const p = t.externalJobsPage;
  const isRTL = language === "ar" || language === "he";

  const [jobs, setJobs] = useState<ExternalJobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [minSalary, setMinSalary] = useState(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [matchScores, setMatchScores] = useState<Map<number, MatchScoreEntry>>(new Map());
  const [hasAnalysis, setHasAnalysis] = useState<boolean | null>(null);
  const [matchScoresLoading, setMatchScoresLoading] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/external-jobs/all`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load external jobs");
        return res.json();
      })
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
    let cancelled = false;
    setMatchScoresLoading(true);

    fetch(`${API_BASE_URL}/api/external-jobs/match-scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: identity.email, externalJobIds, language }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load match scores");
        return res.json();
      })
      .then((data: { hasAnalysis: boolean; matches: { jobId: number; matchPercent: number | null; fieldRelated?: boolean }[] }) => {
        if (cancelled) return;
        setHasAnalysis(Boolean(data.hasAnalysis));

        const nextScores = new Map<number, MatchScoreEntry>();
        (data.matches || []).forEach((match) => {
          nextScores.set(match.jobId, {
            matchPercent: match.matchPercent,
            fieldRelated: match.fieldRelated !== false,
          });
        });
        setMatchScores(nextScores);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setHasAnalysis(false);
          setMatchScores(new Map());
        }
      })
      .finally(() => {
        if (!cancelled) setMatchScoresLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobs, language]);

  useEffect(() => {
    const identity = readCandidateIdentity();
    if (!identity.email) return;

    fetch(`${API_BASE_URL}/api/saved-jobs/candidate/${encodeURIComponent(identity.email)}`)
      .then((res) => (res.ok ? res.json() : []))
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
      fetch(
        `${API_BASE_URL}/api/saved-jobs/candidate/${encodeURIComponent(identity.email)}/external/${job.id}`,
        { method: "DELETE" }
      ).catch(() => {
        setSavedJobIds((prev) => new Set(prev).add(job.id));
      });
    } else {
      fetch(`${API_BASE_URL}/api/saved-jobs/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const countries = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.country).filter(Boolean))) as string[],
    [jobs]
  );

  const cities = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.city).filter(Boolean))) as string[],
    [jobs]
  );

  const types = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.type).filter(Boolean))) as string[],
    [jobs]
  );

  const getMatchInfo = (job: ExternalJobData): MatchInfo => {
    if (!isLoggedIn) return { status: "loggedOut", percent: 0 };
    if (matchScoresLoading || hasAnalysis === null) return { status: "loading", percent: 0 };
    if (!hasAnalysis) return { status: "noAnalysis", percent: 0 };

    const entry = matchScores.get(job.id);
    if (!entry) return { status: "noAnalysis", percent: 0 };

    if (!entry.fieldRelated || entry.matchPercent === null) {
      return { status: "noScore", percent: 0 };
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

      const matchesCountry = !countryFilter || job.country === countryFilter;
      const matchesCity = !cityFilter || job.city === cityFilter;
      const matchesType = !typeFilter || job.type === typeFilter;
      const matchesIndustry = !industryFilter || inferIndustry(job) === industryFilter;

      const jobSalary = extractSalaryNumber(job.salary);
      const matchesSalary = jobSalary === 0 ? true : jobSalary >= minSalary;

      return matchesSearch && matchesCountry && matchesCity && matchesType && matchesIndustry && matchesSalary;
    });

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
    countryFilter,
    cityFilter,
    typeFilter,
    industryFilter,
    minSalary,
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
              <Globe2 size={26} />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
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

            <div className="grid gap-4 lg:grid-cols-3">
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
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="rounded-[20px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] text-white outline-none"
              >
                <option className="text-black" value="">{p.allCountries}</option>
                {countries.map((country) => (
                  <option className="text-black" key={country} value={country}>{country}</option>
                ))}
              </select>

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

              <div className="lg:col-span-3">
                <label className={`mb-2 flex items-center gap-2 text-[15px] text-[#d7dbf7] ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                  <DollarSign size={17} />
                  <span>{t.jobMatches.minSalary}: {minSalary}k</span>
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

        <section className="grid gap-5">
          {loading && (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-white/65">
              {p.loading}
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
