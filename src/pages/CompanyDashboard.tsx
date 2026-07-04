import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Globe2,
  Layers,
  Users,
  FileText,
  Star,
  Sparkles,
  ArrowRight,
  Plus,
  TrendingUp,
  Zap,
  ChevronRight,
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { apiFetch } from "../utils/api";
import { getMatchTier, getMatchLabel } from "../utils/matchScore";

type CompanyApplicant = {
  id: number;
  jobId: number;
  jobTitle: string | null;
  candidateName: string | null;
  candidateEmail: string | null;
  status: string | null;
  appliedDate: string | null;
  matchPercent: number | null;
  matchLabel: string | null;
};

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-500",
  "from-indigo-400 to-fuchsia-500",
  "from-blue-400 to-purple-500",
  "from-emerald-400 to-cyan-500",
  "from-amber-400 to-rose-500",
];

function getInitial(name: string | null) {
  return (name || "?").charAt(0).toUpperCase();
}

function getStatusClass(status: string | null) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "shortlisted") return "bg-cyan-500/12 text-cyan-300 border-cyan-400/25";
  if (normalized === "accepted") return "bg-emerald-500/12 text-emerald-300 border-emerald-400/25";
  if (normalized === "rejected") return "bg-rose-500/12 text-rose-300 border-rose-400/25";
  return "bg-amber-500/12 text-amber-300 border-amber-400/25";
}

function isWithinLastDays(dateStr: string | null, days: number) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  const diffMs = Date.now() - date.getTime();
  return diffMs >= 0 && diffMs <= days * 24 * 60 * 60 * 1000;
}

function CompanyDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language] || translations.en;
  const page = t.companyDashboard;
  const isRTL = language === "ar" || language === "he";

  const [jobStats, setJobStats] = useState({ internal: 0, external: 0, total: 0 });
  const [jobPostsCount, setJobPostsCount] = useState(0);
  const [applications, setApplications] = useState<CompanyApplicant[]>([]);
  const [loading, setLoading] = useState(true);

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
    const companyEmail = user?.email;

    if (!companyEmail) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      apiFetch(`/api/jobs/company/${companyEmail}`).catch(() => []),
      apiFetch("/api/applications/company").catch(() => []),
    ]).then(([jobs, apps]) => {
      if (cancelled) return;
      setJobPostsCount(Array.isArray(jobs) ? jobs.length : 0);
      setApplications(Array.isArray(apps) ? apps : []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const candidatesCount = useMemo(() => {
    return new Set(applications.map((a) => a.candidateEmail).filter(Boolean)).size;
  }, [applications]);

  const scoredApplications = useMemo(
    () => applications.filter((a): a is CompanyApplicant & { matchPercent: number } => typeof a.matchPercent === "number"),
    [applications]
  );

  const avgMatchScore = useMemo(() => {
    if (scoredApplications.length === 0) return null;
    const total = scoredApplications.reduce((sum, a) => sum + a.matchPercent, 0);
    return Math.round(total / scoredApplications.length);
  }, [scoredApplications]);

  const stats = [
    {
      title: page.stats.jobPosts,
      value: String(jobPostsCount),
      icon: BriefcaseBusiness,
      iconBg: "bg-indigo-500/15",
      iconColor: "text-indigo-300",
      route: "/company-job-postings",
    },
    {
      title: page.stats.candidates,
      value: String(candidatesCount),
      icon: Users,
      iconBg: "bg-cyan-500/15",
      iconColor: "text-cyan-300",
      route: "/company-candidates",
    },
    {
      title: page.stats.applications,
      value: String(applications.length),
      icon: FileText,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-300",
      route: "/company-applications",
    },
    {
      title: page.stats.avgMatchScore || "Avg Match Score",
      value: avgMatchScore !== null ? `${avgMatchScore}%` : "—",
      icon: Star,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-300",
      route: "/company-applications",
    },
  ];

  const topCandidates = useMemo(() => {
    const seen = new Set<string>();
    const unique: (CompanyApplicant & { matchPercent: number })[] = [];

    for (const app of [...scoredApplications].sort((a, b) => b.matchPercent - a.matchPercent)) {
      const key = app.candidateEmail || String(app.id);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(app);
      if (unique.length >= 3) break;
    }

    return unique;
  }, [scoredApplications]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => (b.appliedDate || "").localeCompare(a.appliedDate || ""))
      .slice(0, 3);
  }, [applications]);

  const highMatchAwaitingReview = applications.filter(
    (a) => typeof a.matchPercent === "number" && a.matchPercent >= 70 && (a.status || "").toLowerCase() === "under review"
  ).length;

  const applicationsThisWeek = applications.filter((a) => isWithinLastDays(a.appliedDate, 7)).length;

  const shortlistedAwaitingDecision = applications.filter(
    (a) => (a.status || "").toLowerCase() === "shortlisted"
  ).length;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen w-full bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#102a56_100%)] px-6 pb-10 pt-8 md:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-[1700px]">
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[rgba(18,22,74,0.58)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 top-20 h-52 w-52 rounded-full bg-cyan-500/10 blur-[90px]" />
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-violet-500/10 blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />
          </div>

          <div className="relative z-10">
            <div
              className={`mb-8 flex flex-col gap-5 lg:mb-10 lg:flex-row lg:items-start ${
                isRTL ? "lg:justify-between" : "lg:justify-between"
              }`}
            >
              <div className={isRTL ? "text-right" : "text-left"}>
                <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  {page.title}
                </h1>
                <p className="mt-2 text-[15px] text-white/65 md:text-base">
                  {page.subtitle}
                </p>
              </div>

              <button
                onClick={() => navigate("/post-job")}
                className="inline-flex items-center gap-2 self-start rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(99,102,241,0.35)] transition hover:scale-[1.02]"
              >
                <Plus size={18} />
                {page.quickActions.postJob}
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    onClick={() => navigate(item.route)}
                    className="group rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.14)] transition hover:-translate-y-1 hover:bg-white/[0.065] cursor-pointer"
                  >
                    <div className="mb-8 flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg} ${item.iconColor}`}
                      >
                        <Icon size={22} />
                      </div>

                      <ChevronRight
                        className={`text-white/18 transition group-hover:text-white/35 ${
                          isRTL ? "rotate-180" : ""
                        }`}
                        size={18}
                      />
                    </div>

                    <div className="text-4xl font-extrabold text-white">
                      {item.value}
                    </div>
                    <p className="mt-1 text-[15px] text-white/60">
                      {item.title}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div
                onClick={() => navigate("/company-job-postings")}
                className="cursor-pointer rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.14)] transition hover:-translate-y-1 hover:bg-white/[0.065]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                  <BriefcaseBusiness size={22} />
                </div>
                <div className="text-4xl font-extrabold text-white">{jobStats.internal}</div>
                <p className="mt-1 text-[15px] text-white/60">{t.jobStats.internal}</p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                  <Globe2 size={22} />
                </div>
                <div className="text-4xl font-extrabold text-white">{jobStats.external}</div>
                <p className="mt-1 text-[15px] text-white/60">{t.jobStats.external}</p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                  <Layers size={22} />
                </div>
                <div className="text-4xl font-extrabold text-white">{jobStats.total}</div>
                <p className="mt-1 text-[15px] text-white/60">{t.jobStats.total}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.75fr_0.95fr]">
              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.14)] md:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-300">
                      <Sparkles size={20} />
                    </div>

                    <div className={isRTL ? "text-right" : "text-left"}>
                      <h2 className="text-2xl font-bold text-white">
                        {page.candidates.title}
                      </h2>
                      <p className="mt-1 text-sm text-white/55">
                        {page.candidateHints.recommended}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/company-candidates")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
                  >
                    {t.common.viewAll}
                    <ArrowRight
                      size={16}
                      className={isRTL ? "rotate-180" : ""}
                    />
                  </button>
                </div>

                <div className="space-y-4">
                  {!loading && topCandidates.length === 0 && (
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/50">
                      {page.candidateHints.none ||
                        "No scored candidates yet. Open \"AI Summary\" on an application to generate one."}
                    </div>
                  )}

                  {topCandidates.map((candidate, index) => {
                    const tier = getMatchTier(candidate.matchPercent);
                    return (
                      <button
                        key={candidate.id}
                        onClick={() => navigate("/company-candidates")}
                        className="flex w-full items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.045] px-4 py-4 text-left transition hover:bg-white/[0.07]"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]} text-xl font-bold text-white`}
                          >
                            {getInitial(candidate.candidateName)}
                          </div>

                          <div className={`min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-lg font-bold text-white">
                                {candidate.candidateName || "Unknown Candidate"}
                              </h3>
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tier.bg} ${tier.text} ${tier.border}`}
                              >
                                {candidate.matchLabel || getMatchLabel(candidate.matchPercent)}
                              </span>
                            </div>
                            <p className="truncate text-[15px] text-white/55">
                              {candidate.jobTitle || "Untitled Role"}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-4">
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-full border bg-white/[0.05] text-xl font-extrabold ${tier.text} ${tier.border}`}
                          >
                            {candidate.matchPercent}%
                          </div>
                          <ChevronRight
                            className={`text-white/22 ${isRTL ? "rotate-180" : ""}`}
                            size={20}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.14)] md:p-6">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-300">
                    <FileText size={20} />
                  </div>

                  <div className={isRTL ? "text-right" : "text-left"}>
                    <h2 className="text-2xl font-bold text-white">
                      {page.recentActivity.title}
                    </h2>
                    <p className="mt-1 text-sm text-white/55">
                      {page.recentActivity.subtitle}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {!loading && recentApplications.length === 0 && (
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/50">
                      {page.recentActivity.none || "No applications yet."}
                    </div>
                  )}

                  {recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4 transition hover:bg-white/[0.065]"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className={isRTL ? "text-right" : "text-left"}>
                          <h3 className="text-lg font-bold text-white">
                            {app.candidateName || "Unknown Candidate"}
                          </h3>
                          <p className="mt-1 text-[15px] text-white/55">
                            {app.jobTitle || "Untitled Role"}
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-1 text-xs text-white/40">
                          {app.appliedDate || ""}
                        </div>
                      </div>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(app.status)}`}
                      >
                        {app.status || "Under Review"}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate("/company-applications")}
                  className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3.5 text-sm font-bold text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                >
                  {page.recentActivity.viewAll}
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-[30px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.14)] md:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/12 text-violet-300">
                  <TrendingUp size={20} />
                </div>

                <div className={isRTL ? "text-right" : "text-left"}>
                  <h2 className="text-2xl font-bold text-white">
                    {page.insights.title}
                  </h2>
                  <p className="mt-1 text-sm text-white/55">
                    {page.insights.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5 transition hover:bg-white/[0.065]">
                  <div className="mb-3 flex items-center gap-2 text-white/75">
                    <span className="text-base">💡</span>
                    <h3 className="text-lg font-semibold text-white/85">
                      {page.insights.tip}
                    </h3>
                  </div>
                  <p className="text-[15px] leading-7 text-white/58">
                    {highMatchAwaitingReview > 0
                      ? `${highMatchAwaitingReview} candidate${highMatchAwaitingReview === 1 ? " is" : "s are"} highly matched and still under review.`
                      : "No highly matched candidates are currently awaiting review."}
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5 transition hover:bg-white/[0.065]">
                  <div className="mb-3 flex items-center gap-2 text-white/75">
                    <span className="text-base">📈</span>
                    <h3 className="text-lg font-semibold text-white/85">
                      {page.insights.trend}
                    </h3>
                  </div>
                  <p className="text-[15px] leading-7 text-white/58">
                    {applicationsThisWeek > 0
                      ? `${applicationsThisWeek} new application${applicationsThisWeek === 1 ? "" : "s"} received in the last 7 days.`
                      : "No new applications received in the last 7 days."}
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5 transition hover:bg-white/[0.065]">
                  <div className="mb-3 flex items-center gap-2 text-white/75">
                    <span className="text-base">⚡</span>
                    <h3 className="text-lg font-semibold text-white/85">
                      {page.insights.action}
                    </h3>
                  </div>
                  <p className="text-[15px] leading-7 text-white/58">
                    {shortlistedAwaitingDecision > 0
                      ? `${shortlistedAwaitingDecision} shortlisted candidate${shortlistedAwaitingDecision === 1 ? " is" : "s are"} awaiting a final decision.`
                      : "No shortlisted candidates are awaiting a final decision."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.09),rgba(255,255,255,0.03))] p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/12 text-cyan-300">
                  <Zap size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {page.cards.fasterHiring}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Keep candidates moving through the pipeline with AI-assisted
                  screening and prioritization.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(139,92,246,0.09),rgba(255,255,255,0.03))] p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/12 text-violet-300">
                  <Users size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {page.cards.betterCandidates}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Discover stronger profiles with clearer fit scores, skill
                  matching, and decision support.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.09),rgba(255,255,255,0.03))] p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-300">
                  <BriefcaseBusiness size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {page.cards.smarterJobs}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Track all your openings, applications, and recommendations in
                  one place with a cleaner workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDashboard;
