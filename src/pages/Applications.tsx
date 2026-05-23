import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  MapPin,
  ArrowLeft,
  ChevronRight,
  FileText,
  CalendarDays,
  Send,
  Brain,
  Eye,
  Star,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

type FilterType = "all" | "active" | "completed";
type ProgressStep = "applied" | "ai" | "review" | "shortlisted" | "final";

type BackendApplication = {
  id?: number;
  jobId?: number;
  candidateEmail?: string;
  jobTitle?: string;
  title?: string;
  companyName?: string;
  company?: string;
  location?: string;
  appliedDate?: string;
  date?: string;
  status?: string;
  matchPercent?: number | string;
  matchScore?: number | string;
  interviewScore?: number | string;
  score?: number | string;
};

type ApplicationItem = {
  id: number;
  percent: string;
  title: string;
  company: string;
  location: string;
  date: string;
  score?: string;
  pending?: string;
  progress: number;
  status: "active" | "completed";
  reviewStatus: string;
  about: string;
  requirements: string[];
  skills: string[];
  preInterviewScore?: string;
  preInterviewStrength?: string;
  preInterviewText?: string;
  currentStep: ProgressStep;
};

const API_BASE_URL = "http://localhost:8080";

function toPercent(value: unknown, fallback = "80%") {
  if (value === null || value === undefined || value === "") return fallback;

  const text = String(value);
  if (text.includes("%")) return text;

  const num = Number(value);
  if (Number.isNaN(num)) return fallback;

  return `${num}%`;
}

function normalizeStatus(status?: string) {
  if (!status) return "Under Review";

  const clean = status.trim();

  if (clean.toLowerCase() === "applied") return "Applied";
  if (clean.toLowerCase() === "ai screening") return "AI Screening";
  if (clean.toLowerCase() === "under review") return "Under Review";
  if (clean.toLowerCase() === "shortlisted") return "Shortlisted";
  if (clean.toLowerCase() === "final decision") return "Final Decision";
  if (clean.toLowerCase() === "accepted") return "Final Decision";
  if (clean.toLowerCase() === "completed") return "Final Decision";

  return clean;
}

function getProgressFromStatus(status: string) {
  switch (status) {
    case "Applied":
      return 1;
    case "AI Screening":
      return 2;
    case "Under Review":
      return 3;
    case "Shortlisted":
      return 4;
    case "Final Decision":
      return 5;
    default:
      return 3;
  }
}

function getCurrentStepFromStatus(status: string): ProgressStep {
  switch (status) {
    case "Applied":
      return "applied";
    case "AI Screening":
      return "ai";
    case "Under Review":
      return "review";
    case "Shortlisted":
      return "shortlisted";
    case "Final Decision":
      return "final";
    default:
      return "review";
  }
}

function mapBackendApplication(app: BackendApplication): ApplicationItem {
  const reviewStatus = normalizeStatus(app.status);
  const scoreValue = app.interviewScore ?? app.score;

  return {
    id: app.id ?? app.jobId ?? Math.floor(Math.random() * 100000),
    percent: toPercent(app.matchPercent ?? app.matchScore, "80%"),
    title: app.jobTitle ?? app.title ?? "Job Application",
    company: app.companyName ?? app.company ?? "Company",
    location: app.location ?? "Not specified",
    date: app.appliedDate ?? app.date ?? "Not specified",
    score: scoreValue !== undefined && scoreValue !== null ? toPercent(scoreValue) : undefined,
    pending: scoreValue === undefined || scoreValue === null ? "Pre-interview pending" : undefined,
    progress: getProgressFromStatus(reviewStatus),
    status: reviewStatus === "Final Decision" ? "completed" : "active",
    reviewStatus,
    about: "Application details are loaded from the backend. More job information can be connected later from the jobs table.",
    requirements: [],
    skills: [],
    preInterviewScore: scoreValue !== undefined && scoreValue !== null ? toPercent(scoreValue) : undefined,
    preInterviewStrength: scoreValue !== undefined && scoreValue !== null ? "Good" : undefined,
    preInterviewText:
      scoreValue !== undefined && scoreValue !== null
        ? "Pre-interview score is available for this application."
        : "Pre-interview has not been completed yet. Assessment will appear here once available.",
    currentStep: getCurrentStepFromStatus(reviewStatus),
  };
}

function ScoreRing({ percent }: { percent: string }) {
  const value = parseInt(percent.replace("%", ""));
  const safeValue = Number.isNaN(value) ? 0 : value;
  const ringColor = safeValue >= 90 ? "#49e38d" : safeValue >= 80 ? "#8b93ff" : "#f5c542";

  return (
    <div className="relative h-[98px] w-[98px] shrink-0">
      <div
        className="h-full w-full rounded-full transition-all duration-[1800ms] ease-out"
        style={{
          background: `conic-gradient(${ringColor} ${safeValue * 3.6}deg, #2a2c5a 0deg)`,
          boxShadow: `0 0 24px ${ringColor}22`,
        }}
      />
      <div className="absolute inset-[8px] flex items-center justify-center rounded-full bg-[#252654] text-[22px] font-extrabold text-white shadow-inner">
        {percent}
      </div>
    </div>
  );
}

function Applications() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [savedScrollY, setSavedScrollY] = useState(0);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const candidateEmail =
          localStorage.getItem("email") ||
          localStorage.getItem("userEmail") ||
          localStorage.getItem("candidateEmail");

        const url = candidateEmail
          ? `${API_BASE_URL}/api/applications/candidate/${encodeURIComponent(candidateEmail)}`
          : `${API_BASE_URL}/api/applications/all`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to load applications");
        }

        const data: BackendApplication[] = await response.json();
        setApplications(data.map(mapBackendApplication));
      } catch (err) {
        console.error(err);
        setError("Could not load applications from backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    const idFromNav = location.state?.selectedApplicationId;
    if (typeof idFromNav === "number") {
      const found = applications.find((a) => a.id === idFromNav);
      if (found) {
        setSelectedId(found.id);
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, applications]);

  useEffect(() => {
    if (selectedId !== null) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [selectedId]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (filter === "all") return true;
      return app.status === filter;
    });
  }, [filter, applications]);

  const selectedApplication =
    applications.find((app) => app.id === selectedId) ?? null;

  const getReviewStatusLabel = (status: string) => {
    switch (status) {
      case "Applied":
        return t.applicationsPage.applied || "Applied";
      case "AI Screening":
        return t.applicationsPage.aiScreening;
      case "Under Review":
        return t.applicationsPage.underReview;
      case "Shortlisted":
        return t.applicationsPage.shortlisted;
      case "Final Decision":
        return t.applicationsPage.accepted || "Final Decision";
      default:
        return status;
    }
  };

  const filterButtonClass = (value: FilterType) =>
    `min-w-[88px] rounded-[16px] px-5 py-3 text-[15px] font-semibold transition ${
      filter === value
        ? "bg-[#222a75] text-white border border-[#4b57ff]"
        : "text-white/70 hover:bg-white/[0.05] hover:text-white border border-transparent"
    }`;

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-cyan-500/12 text-cyan-300 border border-cyan-400/20";
      case "AI Screening":
        return "bg-emerald-500/12 text-emerald-300 border border-emerald-400/20";
      case "Under Review":
        return "bg-yellow-500/12 text-yellow-300 border border-yellow-400/20";
      case "Shortlisted":
        return "bg-violet-500/12 text-violet-300 border border-violet-400/20";
      case "Final Decision":
        return "bg-indigo-500/12 text-indigo-300 border border-indigo-400/20";
      default:
        return "bg-white/10 text-white/70 border border-white/10";
    }
  };

  const steps = [
    { key: "applied", label: t.applicationsPage.applied || "Applied", icon: Send },
    { key: "ai", label: t.applicationsPage.aiScreening, icon: Brain },
    { key: "review", label: t.applicationsPage.underReview, icon: Eye },
    { key: "shortlisted", label: t.applicationsPage.shortlisted, icon: Star },
    { key: "final", label: t.applicationsPage.accepted || "Final Decision", icon: CheckCircle2 },
  ] as const;

  const getCurrentStepIndex = (step: ProgressStep) =>
    steps.findIndex((item) => item.key === step);

  const renderStep = (index: number, progress: number) => {
    const done = index < progress;
    const current = index === progress;
    const icons = ["✈", "✦", "◉", "☆", "✓"];
    const icon = icons[index - 1];

    return (
      <div key={index} className="flex items-center">
        <div
          className={`flex h-[42px] w-[42px] items-center justify-center rounded-full border text-[15px] transition ${
            done
              ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-300"
              : current
              ? "border-indigo-400 bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
              : "border-white/10 bg-white/5 text-white/30"
          }`}
        >
          {icon}
        </div>
        {index !== 5 && (
          <div
            className={`mx-2 h-[2px] w-7 lg:w-9 ${
              index < progress ? "bg-cyan-400/70" : "bg-white/10"
            }`}
          />
        )}
      </div>
    );
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-7 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1080px]">
        {!selectedApplication ? (
          <>
            <section className="mb-8">
              <div className="mb-5 flex justify-start">
                <button
                  type="button"
                  onClick={() => navigate("/candidate-dashboard")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
                  <span>{t.common.back}</span>
                </button>
              </div>

              <div className={`mb-6 flex items-start gap-4 ${isRTL ? "text-right" : ""}`}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#22d3ee] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
                  <FileText size={26} />
                </div>

                <div className="flex-1">
                  <h1 className="text-[42px] font-extrabold leading-tight text-white">
                    {t.applicationsPage.title}
                  </h1>
                  <p className="mt-2 text-[17px] text-[#aeb4d6]">
                    {t.applicationsPage.subtitle}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.05] px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <h3 className="text-[20px] font-extrabold text-white">
                      {t.applicationsPage.allApplications}
                    </h3>
                    <p className="mt-1 text-[15px] text-[#aeb4d6]">
                      {filteredApplications.length} {t.applicationsPage.recentActivity}
                    </p>
                  </div>

                  <div
                    className={`inline-flex w-fit rounded-[20px] border border-white/10 bg-[#141845] p-1.5 ${
                      isRTL ? "self-end lg:self-auto" : ""
                    }`}
                  >
                    <button onClick={() => setFilter("all")} className={filterButtonClass("all")}>
                      {t.applicationsPage.allApplications}
                    </button>
                    <button onClick={() => setFilter("active")} className={filterButtonClass("active")}>
                      {t.common.active}
                    </button>
                    <button onClick={() => setFilter("completed")} className={filterButtonClass("completed")}>
                      {t.applicationsPage.accepted}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {loading && (
              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] px-8 py-12 text-center">
                <h3 className="text-[24px] font-bold text-white">Loading applications...</h3>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-[30px] border border-red-400/20 bg-red-500/10 px-8 py-12 text-center">
                <h3 className="text-[24px] font-bold text-red-200">{error}</h3>
              </div>
            )}

            {!loading && !error && (
              <section className="space-y-5">
                {filteredApplications.map((app, index) => (
                  <article
                    key={`${app.id}-${index}`}
                    onClick={() => {
                      setSavedScrollY(window.scrollY);
                      setSelectedId(app.id);
                    }}
                    className="group cursor-pointer rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition hover:border-white/20 hover:bg-[rgba(50,52,108,0.96)]"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                      <div className="flex justify-center lg:justify-start">
                        <ScoreRing percent={app.percent} />
                      </div>

                      <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <h2 className="text-[22px] font-extrabold text-white">
                            {app.title}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${statusBadgeClass(
                              app.reviewStatus
                            )}`}
                          >
                            {getReviewStatusLabel(app.reviewStatus)}
                          </span>
                        </div>

                        <div className="mb-3 flex items-center gap-2 text-[#c4cae9]">
                          <Building2 size={16} />
                          <span className="text-[15px]">{app.company}</span>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-[#aeb4d6]">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{app.location}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <CalendarDays size={16} />
                            <span>
                              {t.applicationsPage.appliedOn} {app.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {[1, 2, 3, 4, 5].map((step) => renderStep(step, app.progress))}
                        </div>
                      </div>

                      <div className="flex flex-row items-center justify-between gap-4 lg:min-w-[170px]">
                        <div className={`${isRTL ? "text-left" : "text-right"} min-w-[88px]`}>
                          {app.pending ? (
                            <div className="rounded-full border border-yellow-400/20 bg-yellow-500/12 px-4 py-2.5 text-[14px] font-semibold text-yellow-300">
                              {app.pending}
                            </div>
                          ) : (
                            <>
                              <h2 className="text-[42px] font-extrabold leading-none text-white">
                                {app.score}
                              </h2>
                              <p className="mt-2 text-[14px] text-white/50">
                                Interview Score
                              </p>
                            </>
                          )}
                        </div>

                        <button
                          type="button"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/30 transition group-hover:bg-white/5 group-hover:text-white/70"
                        >
                          <ChevronRight size={22} className={isRTL ? "rotate-180" : ""} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}

                {filteredApplications.length === 0 && (
                  <div className="rounded-[30px] border border-white/10 bg-white/[0.05] px-8 py-12 text-center">
                    <h3 className="text-[24px] font-bold text-white">
                      {t.applicationsPage.noApplications}
                    </h3>
                    <p className="mt-2 text-white/55">
                      {t.applicationsPage.noApplicationsText}
                    </p>
                  </div>
                )}
              </section>
            )}
          </>
        ) : (
          <section className="space-y-6">
            <div className="mb-2 flex justify-start">
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setTimeout(() => {
                    window.scrollTo({
                      top: savedScrollY,
                      left: 0,
                      behavior: "instant" as ScrollBehavior,
                    });
                  }, 0);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
                <span>{t.common.back}</span>
              </button>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] px-7 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                <ScoreRing percent={selectedApplication.percent} />

                <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h1 className="truncate text-[38px] font-extrabold text-white">
                          {selectedApplication.title}
                        </h1>

                        <span
                          className={`rounded-full px-4 py-2 text-[15px] font-semibold ${statusBadgeClass(
                            selectedApplication.reviewStatus
                          )}`}
                        >
                          {getReviewStatusLabel(selectedApplication.reviewStatus)}
                        </span>
                      </div>

                      <div className="mb-3 flex items-center gap-2 text-[#c4cae9]">
                        <Building2 size={17} />
                        <span className="text-[16px]">{selectedApplication.company}</span>
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-[#aeb4d6]">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span>{selectedApplication.location}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} />
                          <span>
                            {t.applicationsPage.appliedOn} {selectedApplication.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock3 size={16} />
                          <span>
                            {selectedApplication.status === "active"
                              ? t.common.active
                              : t.applicationsPage.accepted}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-5 text-center">
                      {selectedApplication.pending ? (
                        <>
                          <p className="text-[15px] font-semibold text-yellow-300">
                            {selectedApplication.pending}
                          </p>
                          <p className="mt-2 text-[14px] text-white/45">
                            {t.applicationsPage.applicationStatus}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[40px] font-extrabold leading-none text-white">
                            {selectedApplication.score}
                          </p>
                          <p className="mt-2 text-[14px] text-white/50">
                            Interview Score
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] px-8 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <h2 className={`mb-6 text-[24px] font-extrabold text-white ${isRTL ? "text-right" : "text-left"}`}>
                {t.applicationsPage.applicationStatus}
              </h2>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const currentIndex = getCurrentStepIndex(selectedApplication.currentStep);
                  const isDone = index < currentIndex;
                  const isCurrent = index === currentIndex;

                  return (
                    <div
                      key={step.key}
                      className="relative flex flex-col items-center text-center"
                    >
                      <div className="mb-4 flex items-center justify-center">
                        <div
                          className={`flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border transition ${
                            isDone
                              ? "border-cyan-400/25 bg-cyan-400/12 text-cyan-300"
                              : isCurrent
                              ? "border-indigo-400 bg-indigo-500/18 text-indigo-300 shadow-[0_0_18px_rgba(99,102,241,0.22)]"
                              : "border-white/10 bg-white/[0.04] text-white/30"
                          }`}
                        >
                          <Icon size={30} />
                        </div>
                      </div>

                      {index !== steps.length - 1 && (
                        <div className="absolute left-[58%] top-[36px] hidden h-[2px] w-[88%] md:block">
                          <div
                            className={`h-full w-full ${
                              index < currentIndex ? "bg-cyan-400/70" : "bg-white/10"
                            }`}
                          />
                        </div>
                      )}

                      <h3 className="text-[16px] font-bold text-white">{step.label}</h3>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Applications;