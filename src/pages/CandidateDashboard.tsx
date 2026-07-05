import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { computeProfileCompleteness } from "./ProfilePage";
import { getRingColor } from "../utils/jobInference";
import { apiFetch } from "../utils/api";
import { FREE_PLAN_LIMIT } from "../utils/applicationLimit";
import {
  BriefcaseBusiness,
  Globe2,
  Layers,
  FileText,
  CalendarDays,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Building2,
  MapPin,
  Wifi,
  CheckCircle2,
} from "lucide-react";

type RecentApplication = {
  id: number;
  title: string;
  company: string;
  location: string;
  percent: number | null;
  status: string;
  days: string;
  statusClass: string;
};

type MatchItem = {
  title: string;
  company: string;
  location: string;
  remote: boolean;
  score: number;
};

type BackendApplication = {
  id?: number;
  jobId?: number;
  title?: string;
  jobTitle?: string;
  company?: string;
  companyName?: string;
  location?: string;
  status?: string;
  appliedDate?: string;
};

type BackendJob = {
  id?: number;
  title?: string;
  company?: string;
  companyName?: string;
  location?: string;
  remote?: boolean;
};

type MatchScoreEntry = {
  matchPercent: number | null;
  fieldRelated: boolean;
};

type RecentlyViewedItem = {
  jobId: number;
  jobType: "internal" | "external";
  jobTitle?: string;
  companyName?: string;
  location?: string;
};

function getStatusClass(status: string) {
  const clean = status.toLowerCase();

  if (clean.includes("short")) {
    return "border border-violet-400/20 bg-violet-500/12 text-violet-300";
  }

  if (clean.includes("ai")) {
    return "border border-emerald-400/20 bg-emerald-500/12 text-emerald-300";
  }

  if (clean.includes("applied")) {
    return "border border-cyan-400/20 bg-cyan-500/12 text-cyan-300";
  }

  return "border border-yellow-400/20 bg-yellow-500/12 text-yellow-300";
}

function ScoreRing({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <div className="relative h-[88px] w-[88px] shrink-0">
        <div className="h-full w-full animate-pulse rounded-full bg-[#2a2c5a]" />
        <div className="absolute inset-[8px] flex items-center justify-center rounded-full bg-[#252654] text-[11px] font-semibold text-white/50 shadow-inner">
          N/A
        </div>
      </div>
    );
  }

  const ringColor = getRingColor("scored", value);

  return (
    <div className="relative h-[88px] w-[88px] shrink-0">
      <div
        className="h-full w-full rounded-full transition-all duration-[1800ms] ease-out"
        style={{
          background: `conic-gradient(${ringColor} ${value * 3.6}deg, #2a2c5a 0deg)`,
          boxShadow: `0 0 24px ${ringColor}22`,
        }}
      />
      <div className="absolute inset-[8px] flex items-center justify-center rounded-full bg-[#252654] text-[20px] font-extrabold text-white shadow-inner">
        {value}%
      </div>
    </div>
  );
}

function CandidateDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language] || translations.en;
  const isRTL = language === "ar" || language === "he";

  const userName = user?.name || "User";
  const userEmail = user?.email || "";

  const [topMatches, setTopMatches] = useState<MatchItem[]>([]);
  const [applications, setApplications] = useState<RecentApplication[]>([]);
  const [jobsCount, setJobsCount] = useState("0");
  const [applicationsCount, setApplicationsCount] = useState("0");
  const [applicationsThisMonth, setApplicationsThisMonth] = useState(0);
  const [interviewsCount, setInterviewsCount] = useState("0");
  const [profileScore, setProfileScore] = useState(0);
  const [jobStats, setJobStats] = useState({ internal: 0, external: 0, total: 0 });
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const recentlyViewedScrollRef = useRef<HTMLDivElement>(null);

  const scrollRecentlyViewed = (direction: -1 | 1) => {
    recentlyViewedScrollRef.current?.scrollBy({ left: direction * 280, behavior: "smooth" });
  };

  const usedApplications = applicationsThisMonth;
  const remainingApplications = Math.max(FREE_PLAN_LIMIT - usedApplications, 0);
  const usagePercent = Math.min(
    Math.round((usedApplications / FREE_PLAN_LIMIT) * 100),
    100
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobsData, appsData, cvText]: [BackendJob[], BackendApplication[], string] =
          await Promise.all([
            apiFetch(`/api/jobs/all`).catch(() => []),
            userEmail
              ? apiFetch(
                  `/api/applications/candidate/${encodeURIComponent(userEmail)}`
                ).catch(() => [])
              : Promise.resolve([]),
            userEmail
              ? apiFetch(`/api/cv/current`).catch(() => "")
              : Promise.resolve(""),
          ]);

        setJobsCount(String(jobsData.length));
        setApplicationsCount(String(appsData.length));

        const currentMonthPrefix = new Date().toISOString().slice(0, 7);
        setApplicationsThisMonth(
          appsData.filter(
            (app) =>
              typeof app.appliedDate === "string" && app.appliedDate.startsWith(currentMonthPrefix)
          ).length
        );

        const interviewCount = appsData.filter((app) =>
          (app.status || "").toLowerCase().includes("interview")
        ).length;
        setInterviewsCount(String(interviewCount));

        const resumeFileName = (cvText || "").trim();

        const skills = (user?.skills || "")
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0);

        setProfileScore(
          computeProfileCompleteness({
            name: user?.name || "",
            phone: user?.phone || "",
            location: user?.location || "",
            currentTitle: user?.currentTitle || "",
            experience: user?.yearsOfExperience || "",
            summary: user?.professionalSummary || "",
            skills,
            hasResume: Boolean(resumeFileName),
          })
        );

        const jobIdsFromJobs = jobsData
          .map((job) => job.id)
          .filter((id): id is number => typeof id === "number");
        const jobIdsFromApps = appsData
          .map((app) => app.jobId)
          .filter((id): id is number => typeof id === "number");
        const combinedJobIds = Array.from(
          new Set([...jobIdsFromJobs, ...jobIdsFromApps])
        );

        const matchByJobId = new Map<number, MatchScoreEntry>();

        if (userEmail && combinedJobIds.length > 0) {
          try {
            const matchData: {
              hasAnalysis: boolean;
              matches: { jobId: number; matchPercent: number | null; fieldRelated?: boolean }[];
            } = await apiFetch(`/api/jobs/match-scores`, {
              method: "POST",
              body: JSON.stringify({
                email: userEmail,
                jobIds: combinedJobIds,
                language,
              }),
            });

            (matchData.matches || []).forEach((match) => {
              matchByJobId.set(match.jobId, {
                matchPercent: match.matchPercent,
                fieldRelated: match.fieldRelated !== false,
              });
            });
          } catch {
            // keep matchByJobId empty, same as the previous !matchRes.ok fallback
          }
        }

        const jobsWithScores = jobsData
          .filter((job) => {
            if (typeof job.id !== "number") return false;
            const entry = matchByJobId.get(job.id);
            return Boolean(entry && entry.fieldRelated && entry.matchPercent !== null);
          })
          .map((job) => ({
            job,
            score: matchByJobId.get(job.id as number)!.matchPercent as number,
          }))
          .sort((a, b) => b.score - a.score);

        setTopMatches(
          jobsWithScores.slice(0, 3).map(({ job, score }) => ({
            title: job.title || "Job Position",
            company: job.company || job.companyName || "Company",
            location: job.location || "Not specified",
            remote: job.remote ?? true,
            score,
          }))
        );

        setApplications(
          appsData.slice(0, 3).map((app) => {
            const status = app.status || "Under Review";
            const scoreEntry =
              typeof app.jobId === "number" ? matchByJobId.get(app.jobId) : undefined;

            return {
              id: app.id || app.jobId || Math.floor(Math.random() * 100000),
              title: app.title || app.jobTitle || "Application",
              company: app.company || app.companyName || "Company",
              location: app.location || "Not specified",
              percent: scoreEntry ? scoreEntry.matchPercent : null,
              status,
              days: app.appliedDate || "Recently",
              statusClass: getStatusClass(status),
            };
          })
        );
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    fetchDashboardData();
  }, [userEmail, language, user]);

  useEffect(() => {
    apiFetch(`/api/dashboard/stats`)
      .then((data) => {
        if (data) {
          setJobStats({
            internal: data.totalInternalJobs || 0,
            external: data.totalExternalJobs || 0,
            total: data.totalJobs || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    apiFetch(`/api/recently-viewed/candidate/${encodeURIComponent(userEmail)}`)
      .then((data: RecentlyViewedItem[]) => setRecentlyViewed(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [userEmail]);

  const stats = useMemo(
    () => [
      {
        icon: <BriefcaseBusiness size={22} />,
        value: jobsCount,
        label: t.dashboard.stats.jobMatches,
        iconBg: "bg-[#5e66ff1f]",
        iconColor: "text-[#7c88ff]",
        onClick: () => navigate("/job-matches"),
      },
      {
        icon: <FileText size={22} />,
        value: applicationsCount,
        label: t.dashboard.stats.applications,
        iconBg: "bg-[#22d3ee1f]",
        iconColor: "text-[#67e8f9]",
        onClick: () => navigate("/applications"),
      },
      {
        icon: <CalendarDays size={22} />,
        value: interviewsCount,
        label: t.dashboard.stats.interviews,
        iconBg: "bg-[#34d3991f]",
        iconColor: "text-[#6ee7b7]",
      },
      {
        icon: <Sparkles size={22} />,
        value: `${profileScore}%`,
        label: t.dashboard.stats.profileScore,
        iconBg: "bg-[#a855f71f]",
        iconColor: "text-[#d8b4fe]",
        onClick: () => navigate("/profile"),
      },
    ],
    [jobsCount, applicationsCount, interviewsCount, profileScore, navigate, t]
  );

  const profilePercent = profileScore;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-7 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1250px]">
        <section className="mb-8">
          <div
            className={`mb-5 flex items-center ${
              isRTL ? "justify-end" : "justify-start"
            }`}
          >
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
              <span>{t.common.back}</span>
            </button>
          </div>

          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
              <Sparkles size={26} />
            </div>

            <div className={isRTL ? "text-right" : "text-left"}>
              <h1 className="text-[42px] font-extrabold leading-tight text-white">
                {`${t.dashboard.welcome}, ${userName}`} 👋
              </h1>
              <p className="mt-2 text-[17px] text-[#aeb4d6]">
                {t.dashboard.subtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={stat.onClick}
              className={`rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-6 py-6 text-inherit shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition hover:border-white/20 hover:bg-[rgba(50,52,108,0.96)] ${
                stat.onClick ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div className="mb-6 flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconBg} ${stat.iconColor}`}
                >
                  {stat.icon}
                </div>
                <ChevronRight
                  size={20}
                  className={`text-white/30 ${isRTL ? "rotate-180" : ""}`}
                />
              </div>

              <h2 className="mb-1 text-[40px] font-extrabold leading-none text-white">
                {stat.value}
              </h2>
              <p className="text-[15px] text-[#aeb4d6]">{stat.label}</p>
            </button>
          ))}
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            onClick={() => navigate("/job-matches")}
            className="cursor-pointer rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.14)] transition hover:-translate-y-1 hover:bg-white/[0.065]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5e66ff1f] text-[#7c88ff]">
              <BriefcaseBusiness size={22} />
            </div>
            <div className="text-4xl font-extrabold text-white">{jobStats.internal}</div>
            <p className="mt-1 text-[15px] text-white/60">{t.jobStats.internal}</p>
          </div>

          <div
            onClick={() => navigate("/external-jobs")}
            className="cursor-pointer rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.14)] transition hover:-translate-y-1 hover:bg-white/[0.065]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22d3ee1f] text-[#67e8f9]">
              <Globe2 size={22} />
            </div>
            <div className="text-4xl font-extrabold text-white">{jobStats.external}</div>
            <p className="mt-1 text-[15px] text-white/60">{t.jobStats.external}</p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a855f71f] text-[#d8b4fe]">
              <Layers size={22} />
            </div>
            <div className="text-4xl font-extrabold text-white">{jobStats.total}</div>
            <p className="mt-1 text-[15px] text-white/60">{t.jobStats.total}</p>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.95fr]">
          <div className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5e66ff1f] text-[#7c88ff]">
                  <BriefcaseBusiness size={22} />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h3 className="text-[22px] font-extrabold text-white">
                    {t.dashboard.topMatches.title}
                  </h3>
                  <p className="mt-1 text-[15px] text-[#aeb4d6]">
                    {t.dashboard.topMatches.subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/job-matches")}
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#dbe2ff] transition hover:text-white"
              >
                {t.dashboard.topMatches.viewAll}
                <ChevronRight size={18} className={isRTL ? "rotate-180" : ""} />
              </button>
            </div>

            <div className="space-y-5">
              {topMatches.length === 0 ? (
                <div className="rounded-[28px] border border-white/10 bg-[rgba(50,52,108,0.78)] px-5 py-8 text-center text-white/60">
                  No job matches yet.
                </div>
              ) : (
                topMatches.map((job) => (
                  <article
                    key={`${job.title}-${job.company}`}
                    onClick={() =>
                      navigate("/job-matches", {
                        state: { selectedJobTitle: job.title },
                      })
                    }
                    className="group cursor-pointer rounded-[28px] border border-white/10 bg-[rgba(50,52,108,0.78)] px-5 py-5 transition hover:border-white/20 hover:bg-[rgba(56,58,118,0.95)]"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
                      <div className="flex flex-col items-center justify-center md:justify-start">
                        <ScoreRing value={job.score} />
                      </div>

                      <div className="flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <h2 className="text-[22px] font-extrabold text-white">
                            {job.title}
                          </h2>

                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                            {t.dashboard.match}
                          </span>
                        </div>

                        <div
                          className={`mb-3 flex items-center gap-2 text-[#c4cae9] ${
                            isRTL ? "justify-end md:justify-start" : ""
                          }`}
                        >
                          <Building2 size={16} />
                          <span className="text-[15px]">{job.company}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[#aeb4d6]">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{job.location}</span>
                          </div>

                          {job.remote && (
                            <div className="flex items-center gap-2 text-cyan-300">
                              <Wifi size={16} />
                              <span>{t.dashboard.remote}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          className="flex h-11 w-11 items-center justify-center rounded-full text-white/30 transition group-hover:bg-white/5 group-hover:text-white/70"
                        >
                          <ChevronRight
                            size={22}
                            className={isRTL ? "rotate-180" : ""}
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22d3ee1f] text-[#67e8f9]">
                  <FileText size={22} />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h3 className="text-[22px] font-extrabold text-white">
                    {t.dashboard.applications.title}
                  </h3>
                  <p className="mt-1 text-[15px] text-[#aeb4d6]">
                    {t.dashboard.applications.subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/applications")}
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#dbe2ff] transition hover:text-white"
              >
                {t.dashboard.applications.viewAll}
                <ChevronRight size={18} className={isRTL ? "rotate-180" : ""} />
              </button>
            </div>

            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="rounded-[26px] border border-white/10 bg-[rgba(50,52,108,0.78)] px-5 py-8 text-center text-white/60">
                  No recent applications yet.
                </div>
              ) : (
                applications.map((app) => (
                  <article
                    key={app.id}
                    onClick={() =>
                      navigate("/applications", {
                        state: { selectedApplicationId: app.id },
                      })
                    }
                    className="group cursor-pointer rounded-[26px] border border-white/10 bg-[rgba(50,52,108,0.78)] px-5 py-5 transition hover:border-white/20 hover:bg-[rgba(56,58,118,0.95)]"
                  >
                    <div className="flex items-start gap-4">
                      <ScoreRing value={app.percent} />

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-3">
                          <h4 className="truncate text-[20px] font-extrabold text-white">
                            {app.title}
                          </h4>
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${app.statusClass}`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <div className="mb-2 flex items-center gap-2 text-[#c4cae9]">
                          <Building2 size={16} />
                          <span className="text-[15px]">{app.company}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[#aeb4d6]">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{app.location}</span>
                          </div>
                          <div className="text-[14px] text-white/45">
                            {app.days}
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        size={22}
                        className={`mt-1 text-white/30 transition group-hover:text-white/70 ${
                          isRTL ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </article>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("/applications")}
              className="mt-6 w-full rounded-[18px] border border-white/10 bg-white/[0.04] py-3.5 text-center text-[16px] font-bold text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            >
              {t.dashboard.applications.viewAll}
            </button>
          </div>
        </section>

        {recentlyViewed.length > 0 && (
          <section className="mb-8 rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a855f71f] text-[#d8b4fe]">
                  <CalendarDays size={22} />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h3 className="text-[22px] font-extrabold text-white">
                    {t.dashboard.recentlyViewed.title}
                  </h3>
                  <p className="mt-1 text-[15px] text-[#aeb4d6]">
                    {t.dashboard.recentlyViewed.subtitle}
                  </p>
                </div>
              </div>

              {recentlyViewed.length > 1 && (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollRecentlyViewed(isRTL ? 1 : -1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollRecentlyViewed(isRTL ? -1 : 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={recentlyViewedScrollRef}
              onWheel={(e) => {
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
              className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {recentlyViewed.map((item) => (
                <button
                  key={`${item.jobType}-${item.jobId}`}
                  type="button"
                  onClick={() => navigate(`/job-details/${item.jobType}/${item.jobId}`)}
                  className={`w-[260px] shrink-0 rounded-[22px] border border-white/10 bg-[rgba(50,52,108,0.78)] p-5 transition hover:border-white/20 hover:bg-[rgba(56,58,118,0.95)] ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="truncate text-[16px] font-bold text-white">
                      {item.jobTitle || "Untitled Job"}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.jobType === "external"
                          ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                          : "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                      }`}
                    >
                      {item.jobType === "external" ? t.jobDetails.externalJobBadge : t.jobDetails.internalJobBadge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[#aeb4d6]">
                    <Building2 size={14} />
                    <span className="truncate">{item.companyName || "Unknown Company"}</span>
                  </div>
                  {item.location && (
                    <div className="mt-1 flex items-center gap-2 text-[13px] text-[#aeb4d6]">
                      <MapPin size={14} />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] px-7 py-7 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div
                className="relative h-[98px] w-[98px] shrink-0 rounded-full"
                style={{
                  background: `conic-gradient(#facc15 ${
                    profilePercent * 3.6
                  }deg, #2a2c5a 0deg)`,
                  boxShadow: "0 0 24px rgba(250,204,21,0.15)",
                }}
              >
                <div className="absolute inset-[8px] flex items-center justify-center rounded-full bg-[#252654] text-[22px] font-extrabold text-white shadow-inner">
                  {profilePercent}%
                </div>
              </div>

              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-[24px] font-extrabold text-white">
                  {profilePercent >= 100
                    ? t.dashboard.profileBox.completeTitle || "Profile Complete!"
                    : t.dashboard.profileBox.title}
                </h3>
                <p className="mt-2 max-w-[520px] text-[16px] leading-7 text-[#aeb4d6]">
                  {profilePercent >= 100
                    ? t.dashboard.profileBox.completeSubtitle ||
                      "Great job! Your profile is fully filled out."
                    : t.dashboard.profileBox.subtitle}
                </p>

                <div className="mt-4 flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-semibold">
                    {t.dashboard.profileBox.progressText}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 max-[640px]:flex-col">
              <button
                type="button"
                onClick={() => navigate("/resume-manager")}
                className="rounded-[16px] border border-cyan-400/25 bg-cyan-400/10 px-6 py-3 text-[15px] font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
              >
                {t.dashboard.profileBox.uploadResume}
              </button>

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="rounded-[16px] bg-gradient-to-r from-[#7f4cff] to-[#a855f7] px-6 py-3 text-[15px] font-semibold text-white transition hover:opacity-90"
              >
                {t.dashboard.profileBox.editProfile}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(32,35,88,0.96),rgba(49,37,98,0.96))] px-7 py-7 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[640px]">
              <div className="mb-4 inline-flex items-center rounded-full border border-[#c084fc]/20 bg-[#c084fc]/10 px-3 py-1 text-[13px] font-semibold text-[#e9c7ff]">
                {t.dashboard.plan.free}
              </div>

              <h3 className="text-[28px] font-extrabold text-white">
                {usedApplications} of {FREE_PLAN_LIMIT} applications used
              </h3>

              <p className="mt-2 text-[16px] leading-7 text-[#b9c0ea]">
                {t.dashboard.plan.remaining}{" "}
                <span className="font-bold text-white">
                  {remainingApplications}
                </span>{" "}
                {t.dashboard.plan.upgradeText}
              </p>

              <div className="mt-5 flex items-center gap-3">
                <span className="text-[14px] font-semibold text-white/80">
                  {t.dashboard.plan.monthlyUsage}
                </span>

                <span className="rounded-full bg-white/8 px-3 py-1 text-[13px] font-semibold text-white/70">
                  {usagePercent}%
                </span>
              </div>

              <div className="mt-3 h-[10px] w-full max-w-[420px] overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#ec4899] transition-all duration-700"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:w-auto sm:min-w-[240px]">
              <button
                type="button"
                onClick={() => navigate("/payment")}
                className="rounded-[16px] bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_10px_30px_rgba(168,85,247,0.35)] transition hover:scale-[1.02]"
              >
                {t.dashboard.plan.upgradeButton}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CandidateDashboard;