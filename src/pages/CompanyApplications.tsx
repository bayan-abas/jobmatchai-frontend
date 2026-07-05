import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";
import { getMatchTier, getMatchLabel, getRecommendation } from "../utils/matchScore";
import CandidateAiSummaryModal from "../components/CandidateAiSummaryModal";
import {
  ArrowLeft,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  Send,
  Brain,
  Eye as EyeStep,
  Star,
  CheckCircle,
  Calendar,
  Clock3,
  X,
  Download,
  Sparkles,
  Trophy,
  ArrowUpDown,
} from "lucide-react";

type ApplicationStage =
  | "New"
  | "Screening"
  | "Shortlisted"
  | "Decided";

type FitLevel = "High Fit" | "Medium Fit" | "Low Fit";

type ApplicationItem = {
  id: number;
  name: string;
  email: string;
  jobTitle: string;
  date: string;
  match: number | null;
  matchLabel: string | null;
  fit: FitLevel | null;
  stage: ApplicationStage;
  currentStep: number;
  status: string;
  viewedByCompany: boolean;
  preInterviewAnswers: Record<string, string>;
};

type BackendApplicant = {
  id: number;
  jobId: number;
  jobTitle: string | null;
  candidateName: string | null;
  candidateEmail: string | null;
  status: string | null;
  appliedDate: string | null;
  matchPercent: number | null;
  matchLabel: string | null;
  viewedByCompany?: boolean;
  preInterviewAnswers?: Record<string, string>;
};

function deriveFit(match: number | null): FitLevel | null {
  if (match === null) return null;
  if (match >= 85) return "High Fit";
  if (match >= 65) return "Medium Fit";
  return "Low Fit";
}

function deriveStage(status: string | null): ApplicationStage {
  const normalized = (status || "").toLowerCase();
  if (normalized === "accepted" || normalized === "rejected") return "Decided";
  if (normalized === "shortlisted") return "Shortlisted";
  if (normalized === "screening" || normalized === "ai screening" || normalized === "applied") return "Screening";
  return "New";
}

// Highest match score first; ties broken by earliest application date, then by
// application id — both stable, real values, so the order never changes between
// page loads or repeated clicks. Unscored applicants (match === null) sort last,
// since -1 is always lower than any real 0-100 score.
function compareByAiRank(a: ApplicationItem, b: ApplicationItem) {
  const scoreDiff = (b.match ?? -1) - (a.match ?? -1);
  if (scoreDiff !== 0) return scoreDiff;
  const dateDiff = (a.date || "").localeCompare(b.date || "");
  if (dateDiff !== 0) return dateDiff;
  return a.id - b.id;
}

function compareByDateDesc(a: ApplicationItem, b: ApplicationItem) {
  const dateDiff = (b.date || "").localeCompare(a.date || "");
  if (dateDiff !== 0) return dateDiff;
  return a.id - b.id;
}

function deriveStep(stage: ApplicationStage): number {
  if (stage === "Decided") return 5;
  if (stage === "Shortlisted") return 4;
  if (stage === "Screening") return 2;
  return 1;
}

function mapApplicant(item: BackendApplicant): ApplicationItem {
  const match = typeof item.matchPercent === "number" ? item.matchPercent : null;
  const stage = deriveStage(item.status);

  return {
    id: item.id,
    name: item.candidateName || "Unknown Candidate",
    email: item.candidateEmail || "",
    jobTitle: item.jobTitle || "Untitled Role",
    date: item.appliedDate || "",
    match,
    matchLabel: item.matchLabel ?? (match !== null ? getMatchLabel(match) : null),
    fit: deriveFit(match),
    stage,
    currentStep: deriveStep(stage),
    status: item.status || "Under Review",
    viewedByCompany: Boolean(item.viewedByCompany),
    preInterviewAnswers: item.preInterviewAnswers || {},
  };
}

function CompanyApplications() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterJobId = searchParams.get("jobId");
  const filterJobTitle = searchParams.get("jobTitle");
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const page = t.companyApplicationsPage || {};
  const common = t.common || {};
  const isRTL = language === "ar" || language === "he";

  const [activeTab, setActiveTab] = useState<
    "All" | "New" | "Screening" | "Shortlisted" | "Decided"
  >("All");
  // AI Ranking only makes sense within a single job posting's candidate pool,
  // so it's the default sort whenever the list is scoped to one job.
  const [sortMode, setSortMode] = useState<"aiRank" | "date">(filterJobId ? "aiRank" : "date");
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationItem | null>(null);
  const [aiSummaryApplication, setAiSummaryApplication] =
    useState<ApplicationItem | null>(null);

  const [showContactModal, setShowContactModal] = useState(false);
  const [messageText, setMessageText] = useState("");

  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewType, setInterviewType] = useState(
    page.online || "Online"
  );
  const [interviewNotes, setInterviewNotes] = useState("");

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    setSelectedApplication(null);

    const endpoint = filterJobId
      ? `/api/jobs/${encodeURIComponent(filterJobId)}/applications`
      : "/api/applications/company";

    apiFetch(endpoint)
      .then((data: BackendApplicant[]) => {
        if (cancelled) return;
        setApplications(Array.isArray(data) ? data.map(mapApplicant) : []);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(
          error instanceof ApiError
            ? error.message
            : "Could not load applications. Make sure the backend is running."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filterJobId]);

  const tabs: ("All" | "New" | "Screening" | "Shortlisted" | "Decided")[] = [
    "All",
    "New",
    "Screening",
    "Shortlisted",
    "Decided",
  ];

  const filteredApplications = useMemo(() => {
    if (activeTab === "All") return applications;
    return applications.filter((app) => app.stage === activeTab);
  }, [activeTab, applications]);

  // AI Rank (#1, #2, ...) is computed once from the full job-scoped candidate pool
  // (not the tab-filtered view), so a candidate's rank stays the same no matter
  // which stage tab is active. Only scored candidates receive a rank.
  const rankByApplicationId = useMemo(() => {
    if (!filterJobId) return new Map<number, number>();

    const ranked = new Map<number, number>();
    let rank = 0;

    for (const app of [...applications].sort(compareByAiRank)) {
      if (app.match === null) continue;
      rank += 1;
      ranked.set(app.id, rank);
    }

    return ranked;
  }, [applications, filterJobId]);

  const sortedApplications = useMemo(() => {
    const comparator = sortMode === "aiRank" ? compareByAiRank : compareByDateDesc;
    return [...filteredApplications].sort(comparator);
  }, [filteredApplications, sortMode]);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  // Single badge styling/label for the AI match score, shared by the card badge, the
  // detail-page header badge, and the ring caption below it — so the exact same score
  // never renders two different labels (e.g. "Medium Fit" next to "Strong Match").
  const getScoreBadgeStyles = (match: number | null) => {
    if (match === null) return "bg-white/10 text-white/50 border border-white/15";
    const tier = getMatchTier(match);
    return `${tier.bg} ${tier.text} border ${tier.border}`;
  };

  const getScoreBadgeLabel = (match: number | null, matchLabel: string | null) => {
    if (match === null) return page.notScoredYet || "Not scored yet";
    return matchLabel || getMatchLabel(match);
  };

  const getStageLabel = (stage: ApplicationStage) => {
    return page.tabs?.[stage] || stage;
  };

  const applyStatusUpdate = async (id: number, status: "Accepted" | "Rejected") => {
    try {
      const data = await apiFetch(`/api/applications/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      if (!data.success) return;

      const patch = { status, stage: "Decided" as ApplicationStage, currentStep: 5 };

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, ...patch } : app))
      );

      setSelectedApplication((prev) =>
        prev && prev.id === id ? { ...prev, ...patch } : prev
      );
    } catch {
      // Leave state untouched on failure so the UI reflects the real backend state.
    }
  };

  const handleAccept = (id: number) => {
    applyStatusUpdate(id, "Accepted");
  };

  const handleReject = (id: number) => {
    applyStatusUpdate(id, "Rejected");
  };

  const applyAiMatchScore = (id: number, matchScore: number, matchLabel: string) => {
    const patch = { match: matchScore, matchLabel: matchLabel || getMatchLabel(matchScore), fit: deriveFit(matchScore) };

    setApplications((prev) =>
      prev.map((app) => (app.id === id && app.match !== matchScore ? { ...app, ...patch } : app))
    );

    setSelectedApplication((prev) =>
      prev && prev.id === id && prev.match !== matchScore ? { ...prev, ...patch } : prev
    );
  };

  const openApplicationDetail = (app: ApplicationItem) => {
    setSelectedApplication(app);

    if (!app.viewedByCompany) {
      const patch = { viewedByCompany: true };

      setApplications((prev) =>
        prev.map((item) => (item.id === app.id ? { ...item, ...patch } : item))
      );
      setSelectedApplication((prev) =>
        prev && prev.id === app.id ? { ...prev, ...patch } : prev
      );

      apiFetch(`/api/applications/${app.id}/mark-viewed`, { method: "POST" }).catch(() => {});
    }
  };

  const openContactModal = (app: ApplicationItem) => {
    setMessageText(
      `Hi ${app.name}, we would like to contact you regarding your profile.`
    );
    setShowContactModal(true);
  };

  const openInterviewModal = () => {
    setInterviewDate("");
    setInterviewTime("");
    setInterviewType(page.online || "Online");
    setInterviewNotes("");
    setShowInterviewModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
  };

  const closeInterviewModal = () => {
    setShowInterviewModal(false);
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(91,77,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.10),transparent_25%),linear-gradient(135deg,#151748_0%,#141755_45%,#0f143f_100%)] px-6 pb-10 pt-8 text-white md:px-10"
    >
      <div className="mx-auto max-w-6xl">
        {!selectedApplication ? (
          <>
            <button
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[15px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
              {common.back || "Back"}
            </button>

            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300 shadow-[0_10px_30px_rgba(249,115,22,0.15)]">
                <FileText size={28} />
              </div>

              <div className={isRTL ? "text-right" : "text-left"}>
                <h1 className="text-4xl font-extrabold tracking-tight text-white">
                  {page.title || "Applications"}
                </h1>
                <p className="mt-2 text-[18px] text-white/60">
                  {filterJobId
                    ? `Showing candidates for "${filterJobTitle || "this job"}"`
                    : page.subtitle || "Manage and track all job applications"}
                </p>
              </div>
            </div>

            {filterJobId && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#6b78ff]/30 bg-[#5964ff]/10 px-5 py-3">
                <span className="text-sm font-semibold text-[#cfd5ff]">
                  Filtered by job: {filterJobTitle || `#${filterJobId}`}
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/company-applications")}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  View all applications
                </button>
              </div>
            )}

            {loadError && (
              <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
                {loadError}
              </div>
            )}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex w-fit flex-wrap gap-2 rounded-[18px] border border-white/10 bg-white/[0.04] p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-[12px] px-4 py-2 text-sm font-semibold transition ${
                      activeTab === tab
                        ? "border border-[#7d86ff]/30 bg-[#5964ff]/30 text-[#cfd5ff]"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {page.tabs?.[tab] || tab}
                  </button>
                ))}
              </div>

              {filterJobId && (
                <div className="flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-3 py-2">
                  <ArrowUpDown size={16} className="text-white/45" />
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as "aiRank" | "date")}
                    className="bg-transparent text-sm font-semibold text-white/80 outline-none"
                  >
                    <option value="aiRank" className="bg-[#1d2258] text-white">
                      {page.sortByAiRanking || "Sort by AI Ranking"}
                    </option>
                    <option value="date" className="bg-[#1d2258] text-white">
                      {page.sortByDate || "Sort by Application Date"}
                    </option>
                  </select>
                </div>
              )}
            </div>

            {loading && (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-center text-white/65">
                Loading applications...
              </div>
            )}

            {!loading && (
            <div className="space-y-5">
              {sortedApplications.map((app) => {
                const aiRank = rankByApplicationId.get(app.id);

                return (
                <div
                  key={app.id}
                  className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#7b61ff] to-[#a855f7] text-2xl font-extrabold text-white shadow-[0_12px_28px_rgba(124,77,255,0.28)]">
                        {getInitial(app.name)}
                      </div>

                      <div className={`min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
                        <div className="mb-1 flex flex-wrap items-center gap-3">
                          <h2 className="text-[20px] font-extrabold text-white md:text-[24px]">
                            {app.name}
                          </h2>

                          {aiRank !== undefined && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                              <Trophy size={12} />
                              {(page.aiRank || "AI Rank")} #{aiRank}
                            </span>
                          )}

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getScoreBadgeStyles(
                              app.match
                            )}`}
                          >
                            {getScoreBadgeLabel(app.match, app.matchLabel)}
                          </span>
                        </div>

                        <p className="text-[18px] text-white/70">{app.email}</p>

                        <p className="mt-2 text-sm text-white/45">
                          {page.appliedFor || "Applied for"} {app.jobTitle} •{" "}
                          {app.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                      <div className="flex items-center gap-6">
                        {app.match !== null ? (() => {
                          const tier = getMatchTier(app.match);
                          return (
                            <div className="flex flex-col items-center gap-1">
                              <ScoreRing value={app.match} color={tier.ring} />
                              <span className={`flex items-center gap-1 text-[12px] font-bold ${tier.text}`}>
                                <span>{tier.emoji}</span>
                                {app.match}% {page.matchLabel || "Match"}
                              </span>
                              <span className="text-[11px] font-semibold text-white/45">
                                {app.matchLabel || getMatchLabel(app.match)}
                              </span>
                              <span className={`mt-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${tier.bg} ${tier.text} ${tier.border}`}>
                                {getRecommendation(app.match)}
                              </span>
                            </div>
                          );
                        })() : (
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/10 bg-white/5 text-center text-[13px] font-semibold text-white/30">
                              —
                            </div>
                            <span className="text-[11px] font-semibold text-white/40">
                              {page.notScoredYet || "Not scored yet"}
                            </span>
                          </div>
                        )}
                      </div>

                      <ApplicationSteps
                        currentStep={app.currentStep}
                        labels={{
                          applied: page.steps?.applied || "Applied",
                          screening: page.steps?.screening || "Screening",
                          review: page.steps?.review || "Review",
                          shortlisted: page.steps?.shortlisted || "Shortlisted",
                          decision: page.steps?.decision || "Decision",
                        }}
                      />

                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <button
                          type="button"
                          onClick={() => openApplicationDetail(app)}
                          className="inline-flex items-center gap-2 rounded-[12px] border border-[#6b78ff]/40 bg-[#5964ff]/10 px-4 py-2 text-sm font-semibold text-[#cfd5ff] transition hover:bg-[#5964ff]/20"
                        >
                          <Eye size={16} />
                          {page.view || "View"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setAiSummaryApplication(app)}
                          className="inline-flex items-center gap-2 rounded-[12px] border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
                        >
                          <Sparkles size={16} />
                          {page.aiSummary || "AI Summary"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAccept(app.id)}
                          className="inline-flex items-center gap-2 rounded-[12px] bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                        >
                          <CheckCircle2 size={16} />
                          {page.accept || "Accept"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(app.id)}
                          className="inline-flex items-center gap-2 rounded-[12px] bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/30"
                        >
                          <XCircle size={16} />
                          {page.reject || "Reject"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}

              {sortedApplications.length === 0 && (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-center text-white/65">
                  {page.noApplicationsInTab ||
                    "No applications found in this tab."}
                </div>
              )}
            </div>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setSelectedApplication(null)}
              className="mb-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[15px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
              {common.back || "Back"}
            </button>

            <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex flex-1 gap-5">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#7b61ff] to-[#a855f7] text-5xl font-extrabold text-white shadow-[0_12px_28px_rgba(124,77,255,0.28)]">
                    {getInitial(selectedApplication.name)}
                  </div>

                  <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h1 className="text-[26px] font-extrabold text-white md:text-[40px]">
                        {selectedApplication.name}
                      </h1>
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-bold ${getScoreBadgeStyles(
                          selectedApplication.match
                        )}`}
                      >
                        {getScoreBadgeLabel(selectedApplication.match, selectedApplication.matchLabel)}
                      </span>
                    </div>

                    <p className="mb-4 text-[18px] text-white/70 md:text-[28px]">
                      {selectedApplication.jobTitle}
                    </p>

                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-[15px] text-white/60">
                      <span>{selectedApplication.email}</span>
                      <span>{selectedApplication.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 xl:w-[260px]">
                  <button
                    onClick={() => openContactModal(selectedApplication)}
                    className="flex items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#6e4dff,#8b3dff)] px-5 py-4 text-[15px] font-bold text-white shadow-[0_12px_30px_rgba(120,70,255,0.25)] transition hover:scale-[1.01] hover:opacity-95"
                  >
                    <Send size={17} />
                    {page.contactCandidate || "Contact Candidate"}
                  </button>

                  <button
                    onClick={openInterviewModal}
                    className="flex items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-[#131947] px-5 py-4 text-[15px] font-semibold text-[#9aa8d6] transition hover:bg-[#182055]"
                  >
                    <Calendar size={17} />
                    {page.scheduleInterview || "Schedule Interview"}
                  </button>

                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-[14px] border border-cyan-400/20 bg-[#091a43] px-5 py-4 text-[15px] font-semibold text-cyan-300 transition hover:bg-[#0d2358]"
                  >
                    <Download size={17} />
                    {page.downloadResume || "Download Resume"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                      <Brain size={20} />
                    </div>
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <h2 className="text-[20px] font-extrabold">
                        {page.applicationAnalysis || "Application Analysis"}
                      </h2>
                      <p className="text-sm text-white/50">
                        {page.aiPowered || "AI-powered evaluation"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <StatCard
                      label={page.matchScore || "Match Score"}
                      value={selectedApplication.match !== null ? `${selectedApplication.match}%` : "—"}
                    />
                    <StatCard
                      label={page.date || "Date"}
                      value={selectedApplication.date || "—"}
                    />
                    <StatCard
                      label={page.stage || "Stage"}
                      value={getStageLabel(selectedApplication.stage)}
                    />
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5">
                    <h3 className="mb-4 text-[18px] font-bold">
                      {page.hiringSummary || "Hiring Summary"}
                    </h3>
                    <p className="text-[16px] leading-8 text-white/75">
                      {selectedApplication.match !== null
                        ? `This candidate has a ${selectedApplication.match}% CV match score for the ${selectedApplication.jobTitle} role.`
                        : "No CV match analysis is available for this candidate yet."}
                    </p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-emerald-500/10 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                      <CheckCircle size={22} />
                    </div>
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <p className="text-sm font-semibold uppercase tracking-wide text-violet-300">
                        {page.recommendation || "Recommendation"}
                      </p>
                      <h3 className="text-[20px] font-extrabold text-emerald-300">
                        {selectedApplication.fit === "High Fit"
                          ? page.highFitText ||
                            "Strong candidate for next stage"
                          : selectedApplication.fit === "Medium Fit"
                          ? page.mediumFitText ||
                            "Worth reviewing carefully"
                          : selectedApplication.fit === "Low Fit"
                          ? page.lowFitText || "Lower priority candidate"
                          : "Awaiting CV match analysis"}
                      </h3>
                    </div>
                  </div>

                  <p className="text-[15px] leading-7 text-white/75">
                    {page.recommendationBody ||
                      "Based on the current scores and evaluation stage, this application can be reviewed for the next hiring decision."}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <h2 className="mb-5 text-[20px] font-extrabold">
                    {page.progress || "Progress"}
                  </h2>
                  <ApplicationSteps
                    currentStep={selectedApplication.currentStep}
                    detailed
                    labels={{
                      applied: page.steps?.applied || "Applied",
                      screening: page.steps?.screening || "Screening",
                      review: page.steps?.review || "Review",
                      shortlisted:
                        page.steps?.shortlisted || "Shortlisted",
                      decision: page.steps?.decision || "Decision",
                    }}
                  />
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <h2 className="mb-4 text-[20px] font-extrabold">
                    {page.applicationInfo || "Application Info"}
                  </h2>
                  <div className="space-y-3 text-[15px] text-white/70">
                    <p>
                      <span className="font-semibold text-white">
                        {page.appliedForLabel || "Applied For:"}
                      </span>{" "}
                      {selectedApplication.jobTitle}
                    </p>
                    <p>
                      <span className="font-semibold text-white">
                        {page.dateLabel || "Date:"}
                      </span>{" "}
                      {selectedApplication.date}
                    </p>
                    <p>
                      <span className="font-semibold text-white">
                        {page.emailLabel || "Email:"}
                      </span>{" "}
                      {selectedApplication.email}
                    </p>
                  </div>
                </div>

                {Object.keys(selectedApplication.preInterviewAnswers).length > 0 && (
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                    <h2 className="mb-4 text-[20px] font-extrabold">
                      {page.preInterviewAnswers || "Pre-Interview Answers"}
                    </h2>
                    <div className="space-y-4">
                      {Object.entries(selectedApplication.preInterviewAnswers).map(
                        ([question, answer]) => (
                          <div key={question}>
                            <p className="text-[14px] font-semibold text-white/80">
                              {question}
                            </p>
                            <p className="mt-1 text-[15px] leading-6 text-white/60">
                              {answer || "-"}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showContactModal && selectedApplication && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-[2px] px-4">
                <div
                  className="w-full max-w-[560px] rounded-[30px] border border-[#8d7dff]/15 bg-[linear-gradient(180deg,#24266a_0%,#1f215e_100%)] p-6 text-white shadow-[0_25px_90px_rgba(0,0,0,0.45)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <h2 className="text-[24px] font-extrabold leading-tight text-white">
                        {(page.contactCandidate || "Contact Candidate") +
                          " " +
                          selectedApplication.name}
                      </h2>
                      <p className="mt-1 text-sm text-white/55">
                        {selectedApplication.email}
                      </p>
                    </div>

                    <button
                      onClick={closeContactModal}
                      className="mt-1 rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={5}
                    className="mb-6 w-full resize-none rounded-[18px] border border-white/10 bg-white/[0.06] px-5 py-4 text-[15px] leading-7 text-white outline-none placeholder:text-white/35"
                    placeholder={
                      page.writeMessage || "Write your message here..."
                    }
                  />

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={closeContactModal}
                      className="rounded-[10px] bg-white/10 px-5 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/15"
                    >
                      {common.cancel || "Cancel"}
                    </button>

                    <button
                      onClick={() => {
                        apiFetch("/api/messages", {
                          method: "POST",
                          body: JSON.stringify({
                            applicationId: selectedApplication.id,
                            content: messageText,
                          }),
                        }).catch(() => null);

                        alert(page.messageSent || "Message sent!");
                        setShowContactModal(false);
                      }}
                      className="rounded-[10px] bg-[linear-gradient(135deg,#8b4dff,#b14dff)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(160,80,255,0.35)] transition hover:opacity-95"
                    >
                      {page.send || "Send"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showInterviewModal && selectedApplication && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
                <div className="w-full max-w-[560px] rounded-[28px] border border-white/10 bg-[#1b1d57] p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
                  <div className="mb-5 flex items-center justify-between">
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <h2 className="text-[24px] font-extrabold">
                        {page.scheduleInterview || "Schedule Interview"}
                      </h2>
                      <p className="text-sm text-white/55">
                        {page.withCandidate || "With"}{" "}
                        {selectedApplication.name}
                      </p>
                    </div>

                    <button
                      onClick={closeInterviewModal}
                      className="text-white/60 hover:text-white"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-white/70">
                        {page.date || "Date"}
                      </label>
                      <div className="flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3">
                        <Calendar size={18} className="text-white/60" />
                        <input
                          type="date"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          className="w-full bg-transparent text-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-white/70">
                        {page.time || "Time"}
                      </label>
                      <div className="flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3">
                        <Clock3 size={18} className="text-white/60" />
                        <input
                          type="time"
                          value={interviewTime}
                          onChange={(e) => setInterviewTime(e.target.value)}
                          className="w-full bg-transparent text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm text-white/70">
                      {page.interviewType || "Interview Type"}
                    </label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                    >
                      <option
                        value={page.online || "Online"}
                        className="bg-[#1d2258] text-white"
                      >
                        {page.online || "Online"}
                      </option>
                      <option
                        value={page.inPerson || "In Person"}
                        className="bg-[#1d2258] text-white"
                      >
                        {page.inPerson || "In Person"}
                      </option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm text-white/70">
                      {page.notes || "Notes"}
                    </label>
                    <textarea
                      value={interviewNotes}
                      onChange={(e) => setInterviewNotes(e.target.value)}
                      rows={4}
                      className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                      placeholder={
                        page.addInterviewNotes || "Add interview notes..."
                      }
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={closeInterviewModal}
                      className="rounded bg-white/10 px-4 py-2"
                    >
                      {common.cancel || "Cancel"}
                    </button>

                    <button
                      onClick={() => {
                        if (interviewDate && interviewTime) {
                          apiFetch("/api/interviews", {
                            method: "POST",
                            body: JSON.stringify({
                              applicationId: selectedApplication.id,
                              scheduledAt: `${interviewDate}T${interviewTime}`,
                              type: interviewType,
                              notes: interviewNotes,
                            }),
                          }).catch(() => null);
                        }

                        alert(
                          `${page.interviewScheduledWith || "Interview scheduled with"} ${selectedApplication.name}`
                        );
                        setShowInterviewModal(false);
                      }}
                      className="flex items-center gap-2 rounded bg-purple-500 px-4 py-2 text-white"
                    >
                      <Calendar size={16} />
                      {page.confirmSchedule || "Confirm Schedule"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {aiSummaryApplication && (
          <CandidateAiSummaryModal
            applicationId={aiSummaryApplication.id}
            candidateName={aiSummaryApplication.name}
            jobTitle={aiSummaryApplication.jobTitle}
            language={language}
            t={t}
            isRTL={isRTL}
            onClose={() => setAiSummaryApplication(null)}
            onScoreReady={(matchScore, matchLabel) => applyAiMatchScore(aiSummaryApplication.id, matchScore, matchLabel)}
          />
        )}
      </div>
    </div>
  );
}

function ScoreRing({ value, color = "#8690ff" }: { value: number; color?: string }) {
  return (
    <div className="relative h-[72px] w-[72px]">
      <div
        className="h-full w-full rounded-full"
        style={{
          background: `conic-gradient(${color} ${value * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
        }}
      />
      <div className="absolute inset-[6px] flex items-center justify-center rounded-full bg-[#2a2d63] text-[18px] font-extrabold text-white">
        {value}%
      </div>
    </div>
  );
}

function ApplicationSteps({
  currentStep,
  detailed = false,
  labels,
}: {
  currentStep: number;
  detailed?: boolean;
  labels: {
    applied: string;
    screening: string;
    review: string;
    shortlisted: string;
    decision: string;
  };
}) {
  const steps = [
    { icon: Send, label: labels.applied },
    { icon: Brain, label: labels.screening },
    { icon: EyeStep, label: labels.review },
    { icon: Star, label: labels.shortlisted },
    { icon: CheckCircle, label: labels.decision },
  ];

  if (detailed) {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const Icon = step.icon;
          const active = stepNumber <= currentStep;

          return (
            <div key={step.label} className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                  active
                    ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-300"
                    : "border-white/10 bg-white/5 text-white/30"
                }`}
              >
                <Icon size={18} />
              </div>
              <span
                className={`text-sm font-semibold ${
                  active ? "text-white" : "text-white/40"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const Icon = step.icon;
        const active = stepNumber <= currentStep;

        return (
          <div key={step.label} className="flex items-center gap-2">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                active
                  ? stepNumber === currentStep
                    ? "border-[#7d86ff] bg-[#5964ff]/15 text-[#8f98ff]"
                    : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  : "border-white/10 bg-white/5 text-white/25"
              }`}
            >
              <Icon size={17} />
            </div>

            {index !== steps.length - 1 && (
              <div
                className={`h-[2px] w-8 ${
                  stepNumber < currentStep ? "bg-emerald-400/60" : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-5 text-center">
      <div className="text-[20px] font-extrabold text-white">{value}</div>
      <div className="mt-1 text-sm text-white/50">{label}</div>
    </div>
  );
}

export default CompanyApplications;