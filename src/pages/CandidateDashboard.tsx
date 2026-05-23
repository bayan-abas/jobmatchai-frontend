import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import {
  BriefcaseBusiness,
  FileText,
  CalendarDays,
  Sparkles,
  ChevronRight,
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
  percent: number;
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
  matchPercent?: number | string;
  matchScore?: number | string;
};

type BackendJob = {
  id?: number;
  title?: string;
  company?: string;
  companyName?: string;
  location?: string;
  remote?: boolean;
  matchPercent?: number | string;
  matchScore?: number | string;
};

const API_BASE_URL = "http://localhost:8080";
const FREE_PLAN_LIMIT = 10;

function toNumber(value: unknown, fallback = 80) {
  if (value === null || value === undefined || value === "") return fallback;
  const num = Number(String(value).replace("%", ""));
  return Number.isNaN(num) ? fallback : num;
}

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

function ScoreRing({ value }: { value: number }) {
  const ringColor =
    value >= 85 ? "#49e38d" : value >= 75 ? "#8b93ff" : "#f5c542";

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
  const t = translations[language] || translations.en;
  const isRTL = language === "ar" || language === "he";

  const userName = localStorage.getItem("name") || "User";
  const userEmail =
    localStorage.getItem("email") ||
    localStorage.getItem("userEmail") ||
    localStorage.getItem("candidateEmail") ||
    "";

  const [topMatches, setTopMatches] = useState<MatchItem[]>([]);
  const [applications, setApplications] = useState<RecentApplication[]>([]);
  const [jobsCount, setJobsCount] = useState("0");
  const [applicationsCount, setApplicationsCount] = useState("0");

  const usedApplications = Number(applicationsCount);
  const remainingApplications = Math.max(FREE_PLAN_LIMIT - usedApplications, 0);
  const usagePercent = Math.min(
    Math.round((usedApplications / FREE_PLAN_LIMIT) * 100),
    100
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/jobs/all`),
          userEmail
            ? fetch(
                `${API_BASE_URL}/api/applications/candidate/${encodeURIComponent(
                  userEmail
                )}`
              )
            : fetch(`${API_BASE_URL}/api/applications/all`),
        ]);

        const jobsData: BackendJob[] = jobsRes.ok ? await jobsRes.json() : [];
        const appsData: BackendApplication[] = appsRes.ok
          ? await appsRes.json()
          : [];

        setJobsCount(String(jobsData.length));
        setApplicationsCount(String(appsData.length));

        setTopMatches(
          jobsData.slice(0, 3).map((job) => ({
            title: job.title || "Job Position",
            company: job.company || job.companyName || "Company",
            location: job.location || "Not specified",
            remote: job.remote ?? true,
            score: toNumber(job.matchPercent ?? job.matchScore, 80),
          }))
        );

        setApplications(
          appsData.slice(0, 3).map((app) => {
            const status = app.status || "Under Review";

            return {
              id: app.id || app.jobId || Math.floor(Math.random() * 100000),
              title: app.title || app.jobTitle || "Application",
              company: app.company || app.companyName || "Company",
              location: app.location || "Not specified",
              percent: toNumber(app.matchPercent ?? app.matchScore, 80),
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
        value: "3",
        label: t.dashboard.stats.interviews,
        iconBg: "bg-[#34d3991f]",
        iconColor: "text-[#6ee7b7]",
      },
      {
        icon: <Sparkles size={22} />,
        value: "78%",
        label: t.dashboard.stats.profileScore,
        iconBg: "bg-[#a855f71f]",
        iconColor: "text-[#d8b4fe]",
        onClick: () => navigate("/profile"),
      },
    ],
    [jobsCount, applicationsCount, navigate, t]
  );

  const profilePercent = 78;

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
                  {t.dashboard.profileBox.title}
                </h3>
                <p className="mt-2 max-w-[520px] text-[16px] leading-7 text-[#aeb4d6]">
                  {t.dashboard.profileBox.subtitle}
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