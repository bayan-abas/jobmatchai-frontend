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
  XCircle,
  Clock3,
  Phone,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";
import { getRingColor } from "../utils/jobInference";
import { fetchCurrentCvIdentity, NO_CV_IDENTITY } from "../utils/matchScoreSession";

type FilterType = "all" | "active" | "accepted";
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
  interviewScore?: number | string;
  score?: number | string;
  viewedByCompany?: boolean;
  contactMethod?: string | null;
  contactMethodOther?: string | null;
  contactMessage?: string | null;
  rejectionReason?: string | null;
};

type ApplicationItem = {
  id: number;
  jobId: number | null;
  title: string;
  company: string;
  location: string;
  date: string;
  score?: string;
  pending?: string;
  progress: number;
  status: "active" | "accepted" | "rejected";
  reviewStatus: string;
  about: string;
  requirements: string[];
  skills: string[];
  preInterviewScore?: string;
  preInterviewStrength?: string;
  preInterviewText?: string;
  currentStep: ProgressStep;
  viewedByCompany: boolean;
  // How the company will reach out, set only once the application is accepted - see
  // ApplicationController#updateStatus on the backend. contactMethodOther holds the company's
  // own text when contactMethod is "other"; contactMessage is their optional note (e.g. date of
  // contact, next steps, interview/onboarding instructions).
  contactMethod: string | null;
  contactMethodOther: string | null;
  contactMessage: string | null;
  // Mandatory, company-written feedback set only when the application is rejected - preserved
  // exactly as written, never AI-generated or a generic message. See
  // ApplicationController#updateStatus on the backend.
  rejectionReason: string | null;
};

// Mirrors ApplicationController.CONTACT_METHOD_LABELS on the backend - keep in sync.
function getContactMethodLabel(t: any, contactMethod: string | null, contactMethodOther: string | null): string {
  const c = t.applicationsPage;
  switch (contactMethod) {
    case "phone_call":
      return c.contactMethodPhoneCall || "Phone call";
    case "email":
      return c.contactMethodEmail || "Email";
    case "whatsapp":
      return c.contactMethodWhatsapp || "WhatsApp";
    case "linkedin":
      return c.contactMethodLinkedin || "LinkedIn";
    case "in_person_meeting":
      return c.contactMethodInPerson || "In-person meeting";
    case "other":
      return contactMethodOther || c.contactMethodOther || "Other";
    default:
      return "";
  }
}

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
  if (clean.toLowerCase() === "viewed") return "Viewed";
  if (clean.toLowerCase() === "shortlisted") return "Shortlisted";
  if (clean.toLowerCase() === "final decision") return "Final Decision";
  if (clean.toLowerCase() === "accepted") return "Final Decision";
  if (clean.toLowerCase() === "completed") return "Final Decision";
  if (clean.toLowerCase() === "rejected") return "Rejected";

  return clean;
}

function getProgressFromStatus(status: string) {
  switch (status) {
    case "Applied":
      return 1;
    case "AI Screening":
      return 2;
    case "Under Review":
    case "Viewed":
      return 3;
    case "Shortlisted":
      return 4;
    case "Final Decision":
    case "Rejected":
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
    case "Viewed":
      return "review";
    case "Shortlisted":
      return "shortlisted";
    case "Final Decision":
    case "Rejected":
      return "final";
    default:
      return "review";
  }
}

function mapBackendApplication(app: BackendApplication): ApplicationItem {
  const reviewStatus = normalizeStatus(app.status);
  const scoreValue = app.interviewScore ?? app.score;
  // A terminal outcome (rejected or a final accept decision) means the workflow has stopped -
  // no future stage, including "Pre-interview pending", is still outstanding, regardless of
  // whether a score happens to be missing. Without this, every application with no score
  // (which is all of them today - the backend has no interviewScore/score field yet) showed
  // "Pre-interview pending" even after being rejected.
  const isTerminal = reviewStatus === "Rejected" || reviewStatus === "Final Decision";

  return {
    id: app.id ?? app.jobId ?? Math.floor(Math.random() * 100000),
    jobId: typeof app.jobId === "number" ? app.jobId : null,
    title: app.jobTitle ?? app.title ?? "Job Application",
    company: app.companyName ?? app.company ?? "Company",
    location: app.location ?? "Not specified",
    date: app.appliedDate ?? app.date ?? "Not specified",
    score: scoreValue !== undefined && scoreValue !== null ? toPercent(scoreValue) : undefined,
    pending:
      !isTerminal && (scoreValue === undefined || scoreValue === null)
        ? "Pre-interview pending"
        : undefined,
    progress: getProgressFromStatus(reviewStatus),
    status:
      reviewStatus === "Rejected" ? "rejected" : reviewStatus === "Final Decision" ? "accepted" : "active",
    reviewStatus,
    viewedByCompany: Boolean(app.viewedByCompany),
    contactMethod: app.contactMethod ?? null,
    contactMethodOther: app.contactMethodOther ?? null,
    contactMessage: app.contactMessage ?? null,
    rejectionReason: app.rejectionReason ?? null,
    about: "Application details are loaded from the backend. More job information can be connected later from the jobs table.",
    requirements: [],
    skills: [],
    preInterviewScore: scoreValue !== undefined && scoreValue !== null ? toPercent(scoreValue) : undefined,
    preInterviewStrength: scoreValue !== undefined && scoreValue !== null ? "Good" : undefined,
    preInterviewText:
      scoreValue !== undefined && scoreValue !== null
        ? "Pre-interview score is available for this application."
        : isTerminal
          ? undefined
          : "Pre-interview has not been completed yet. Assessment will appear here once available.",
    currentStep: getCurrentStepFromStatus(reviewStatus),
  };
}

type MatchScoreEntry = {
  matchPercent: number | null;
  matchReason: string;
  // true = AI decided this job matches the candidate's field; false = a real "not a match"
  // verdict; null/undefined = the backend couldn't compute this one (transient failure, never
  // persisted) - mirrors JobMatches.tsx's MatchScoreEntry shape/semantics exactly, since both
  // pages read the same persisted JobMatchScore rows and must treat them the same way.
  fieldRelated?: boolean | null;
};

type MatchInfo =
  | { status: "loading" }
  | { status: "noAnalysis" }
  // The AI gave a real verdict that this job isn't a field match, or the backend couldn't
  // compute it at all - either way there is no percentage to show, so this must never fall
  // through to the "scored" case (which unconditionally renders `${percent}%`).
  | { status: "noScore" }
  | { status: "scored"; percent: number; reason: string };

function ScoreRing({ info }: { info: MatchInfo }) {
  const safeValue = info.status === "scored" ? info.percent : 0;
  // Shared with JobMatches.tsx/ExternalJobCard.tsx (see utils/jobInference.ts) - this page used
  // to have its own hardcoded (and different) color scale, so the same score rendered a
  // different color depending on which page you were looking at it from.
  const ringColor = getRingColor(info.status, safeValue);

  return (
    <div className="relative h-[98px] w-[98px] shrink-0">
      <div
        className={`h-full w-full rounded-full transition-all duration-[1800ms] ease-out ${
          info.status === "loading" ? "animate-pulse" : ""
        }`}
        style={{
          background:
            info.status === "scored"
              ? `conic-gradient(${ringColor} ${safeValue * 3.6}deg, #2a2c5a 0deg)`
              : "conic-gradient(#5f648a 360deg, #2a2c5a 0deg)",
          boxShadow: info.status === "scored" ? `0 0 24px ${ringColor}22` : "0 0 0 rgba(0,0,0,0)",
        }}
      />
      <div className="absolute inset-[8px] flex items-center justify-center rounded-full bg-[#252654] text-[22px] font-extrabold text-white shadow-inner">
        {info.status === "scored"
          ? `${info.percent}%`
          : info.status === "loading"
            ? ""
            : info.status === "noScore"
              ? "—"
              : "?"}
      </div>
    </div>
  );
}

function Applications() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [savedScrollY, setSavedScrollY] = useState(0);

  const [candidateEmail, setCandidateEmail] = useState("");
  const [matchScores, setMatchScores] = useState<Map<number, MatchScoreEntry>>(new Map());
  const [hasAnalysis, setHasAnalysis] = useState<boolean | null>(null);
  const [matchScoresLoading, setMatchScoresLoading] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const email = user?.email || "";

        setCandidateEmail(email);

        // No "/all" fallback when email isn't known yet - the backend endpoint that used to
        // back that fallback returned every candidate's applications system-wide with no
        // per-user filtering, and there's nothing useful to show this candidate without their
        // own email anyway.
        if (!email) {
          setApplications([]);
          return;
        }

        const data: BackendApplication[] = await apiFetch(
          `/api/applications/candidate/${encodeURIComponent(email)}`
        );
        setApplications(data.map(mapBackendApplication));
      } catch (err) {
        console.error(err);
        setError("Could not load applications from backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  useEffect(() => {
    if (applications.length === 0) return;

    if (!candidateEmail) {
      setHasAnalysis(false);
      setMatchScores(new Map());
      return;
    }

    const jobIds = Array.from(
      new Set(
        applications
          .map((app) => app.jobId)
          .filter((id): id is number => typeof id === "number")
      )
    );

    if (jobIds.length === 0) {
      setHasAnalysis(false);
      setMatchScores(new Map());
      return;
    }

    let cancelled = false;
    setMatchScoresLoading(true);

    // Checked before ever calling the match-scores endpoint - a candidate with no CV has nothing
    // to compute, and the backend already knows that too (it returns instantly with
    // hasAnalysis:false, no AI/queue work triggered), but skipping the request entirely here is
    // what stops the "Calculating match score..." flash from ever appearing in that case.
    fetchCurrentCvIdentity().then((cvIdentity) => {
      if (cancelled) return;

      if (cvIdentity === NO_CV_IDENTITY) {
        setHasAnalysis(false);
        setMatchScores(new Map());
        setMatchScoresLoading(false);
        return;
      }

      apiFetch(`/api/jobs/match-scores`, {
        method: "POST",
        body: JSON.stringify({
          email: candidateEmail,
          jobIds,
          language,
        }),
      })
        .then((data: {
          hasAnalysis: boolean;
          matches: { jobId: number; matchPercent: number | null; matchReason: string; fieldRelated?: boolean | null }[];
        }) => {
          if (cancelled) return;

          setHasAnalysis(Boolean(data.hasAnalysis));

          const nextScores = new Map<number, MatchScoreEntry>();
          (data.matches || []).forEach((match) => {
            nextScores.set(match.jobId, {
              matchPercent: match.matchPercent,
              matchReason: match.matchReason,
              fieldRelated: match.fieldRelated,
            });
          });

          setMatchScores(nextScores);
        })
        .catch((err) => {
          console.error(err);
          if (!cancelled) {
            setHasAnalysis(false);
            setMatchScores(new Map());
          }
        })
        .finally(() => {
          if (!cancelled) {
            setMatchScoresLoading(false);
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [applications, candidateEmail, language]);

  const getMatchInfo = (app: ApplicationItem): MatchInfo => {
    if (hasAnalysis === null) {
      return { status: "loading" };
    }

    if (!hasAnalysis) {
      return { status: "noAnalysis" };
    }

    // Mirrors JobMatches.tsx's getMatchInfo - a resolved entry must render immediately rather
    // than being forced back to "loading" by a batch-wide flag (see that file's comment for the
    // full rationale; the risk is smaller here since this page fetches scores in one blocking
    // call rather than streaming, but the same gating bug would apply if that ever changes).
    const entry = app.jobId !== null ? matchScores.get(app.jobId) : undefined;
    if (!entry) {
      return matchScoresLoading ? { status: "loading" } : { status: "noAnalysis" };
    }

    // A real "not a field match" verdict (fieldRelated === false) or a transient AI failure
    // (fieldRelated === null/undefined, matchPercent === null) both mean there is no percentage
    // to show - rendering `${entry.matchPercent}%` here for either case is exactly how this page
    // used to show a literal "null%" instead of JobMatches.tsx's "—" for the same situation.
    if (entry.fieldRelated === false || entry.matchPercent === null || entry.matchPercent === undefined) {
      return { status: "noScore" };
    }

    return { status: "scored", percent: entry.matchPercent, reason: entry.matchReason };
  };

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

  const handleWithdraw = async () => {
    if (!selectedApplication) return;

    setWithdrawError("");
    setWithdrawing(true);

    try {
      const data = await apiFetch(`/api/applications/${selectedApplication.id}`, {
        method: "DELETE",
      });

      if (data.success) {
        const withdrawnId = selectedApplication.id;
        setApplications((prev) => prev.filter((app) => app.id !== withdrawnId));
        setSelectedId(null);
      } else {
        setWithdrawError(data.message || t.applicationsPage.withdrawBlocked);
      }
    } catch (err) {
      setWithdrawError(
        err instanceof ApiError ? err.message : "Could not withdraw application."
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const selectedMatchInfo: MatchInfo = selectedApplication
    ? getMatchInfo(selectedApplication)
    : { status: "loading" };

  const getReviewStatusLabel = (status: string) => {
    switch (status) {
      case "Applied":
        return t.applicationsPage.applied || "Applied";
      case "AI Screening":
        return t.applicationsPage.aiScreening;
      case "Under Review":
        return t.applicationsPage.underReview;
      case "Viewed":
        return t.applicationsPage.viewed || "Viewed by Company";
      case "Shortlisted":
        return t.applicationsPage.shortlisted;
      case "Final Decision":
        return t.applicationsPage.accepted || "Final Decision";
      case "Rejected":
        return t.applicationsPage.rejected || "Rejected";
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
      case "Viewed":
        return "bg-blue-500/12 text-blue-300 border border-blue-400/20";
      case "Shortlisted":
        return "bg-violet-500/12 text-violet-300 border border-violet-400/20";
      case "Final Decision":
        return "bg-indigo-500/12 text-indigo-300 border border-indigo-400/20";
      case "Rejected":
        return "bg-rose-500/12 text-rose-300 border border-rose-400/20";
      default:
        return "bg-white/10 text-white/70 border border-white/10";
    }
  };

  // The final stage's label/icon must reflect the ACTUAL outcome - both "Final Decision"
  // (accepted) and "Rejected" share the same step index/progress value (see
  // getCurrentStepFromStatus/getProgressFromStatus), so without this the timeline's last step
  // showed "Accepted" with a checkmark even for a rejected application.
  const isSelectedRejected = selectedApplication?.reviewStatus === "Rejected";

  const steps = [
    { key: "applied", label: t.applicationsPage.applied || "Applied", icon: Send },
    { key: "ai", label: t.applicationsPage.aiScreening, icon: Brain },
    { key: "review", label: t.applicationsPage.underReview, icon: Eye },
    { key: "shortlisted", label: t.applicationsPage.shortlisted, icon: Star },
    {
      key: "final",
      label: isSelectedRejected
        ? t.applicationsPage.rejected || "Rejected"
        : t.applicationsPage.accepted || "Final Decision",
      icon: isSelectedRejected ? XCircle : CheckCircle2,
    },
  ] as const;

  const getCurrentStepIndex = (step: ProgressStep) =>
    steps.findIndex((item) => item.key === step);

  const renderStep = (index: number, progress: number, rejected: boolean) => {
    const done = index < progress;
    const current = index === progress;
    // The last dot represents the terminal outcome, not just "another completed stage" -
    // showing it as a checkmark for a rejected application would contradict the status badge
    // shown right next to it.
    const isRejectedFinalDot = current && index === 5 && rejected;
    const icons = ["✈", "✦", "◉", "☆", "✓"];
    const icon = isRejectedFinalDot ? "✕" : icons[index - 1];

    return (
      <div key={index} className="flex items-center">
        <div
          className={`flex h-[42px] w-[42px] items-center justify-center rounded-full border text-[15px] transition ${
            isRejectedFinalDot
              ? "border-rose-400 bg-rose-500/20 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.25)]"
              : done
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
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#22d3ee] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
                  <FileText size={26} />
                </div>

                <div className="min-w-0 flex-1">
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
                    className={`inline-flex w-fit flex-wrap rounded-[20px] border border-white/10 bg-[#141845] p-1.5 ${
                      isRTL ? "self-end lg:self-auto" : ""
                    }`}
                  >
                    <button onClick={() => setFilter("all")} className={filterButtonClass("all")}>
                      {t.applicationsPage.allApplications}
                    </button>
                    <button onClick={() => setFilter("active")} className={filterButtonClass("active")}>
                      {t.common.active}
                    </button>
                    <button onClick={() => setFilter("accepted")} className={filterButtonClass("accepted")}>
                      {t.applicationsPage.accepted}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {loading && (
              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] px-8 py-12 text-center">
                <h3 className="text-[24px] font-bold text-white">
                  {t.applicationsPage.loadingApplications || "Loading applications..."}
                </h3>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-[30px] border border-red-400/20 bg-red-500/10 px-8 py-12 text-center">
                <h3 className="text-[24px] font-bold text-red-200">{error}</h3>
              </div>
            )}

            {!loading && !error && (
              <section className="space-y-5">
                {filteredApplications.map((app, index) => {
                  const matchInfo = getMatchInfo(app);

                  return (
                  <article
                    key={`${app.id}-${index}`}
                    onClick={() => {
                      setSavedScrollY(window.scrollY);
                      setWithdrawError("");
                      setSelectedId(app.id);
                    }}
                    className="group cursor-pointer rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition hover:border-white/20 hover:bg-[rgba(50,52,108,0.96)]"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                      <div className="flex flex-col items-center justify-center gap-2 lg:justify-start">
                        <ScoreRing info={matchInfo} />

                        {matchInfo.status === "loading" && (
                          <span className="text-[12px] font-medium text-white/40">
                            {t.jobMatches.matchScoreLoading}
                          </span>
                        )}

                        {matchInfo.status === "noAnalysis" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/resume-manager");
                            }}
                            className="rounded-full border border-[#7c88ff]/30 bg-[#7c88ff]/15 px-3 py-1 text-center text-[11px] font-semibold text-[#c4b5fd] transition hover:bg-[#7c88ff]/25"
                          >
                            {t.jobMatches.analyzeCvForScore}
                          </button>
                        )}
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

                          {app.status === "accepted" && app.contactMethod && (
                            <div className="flex items-center gap-2 text-emerald-300">
                              <Phone size={16} />
                              <span>
                                {t.applicationsPage.contactMethodLabel}:{" "}
                                {getContactMethodLabel(t, app.contactMethod, app.contactMethodOther)}
                              </span>
                            </div>
                          )}
                        </div>

                        {app.status === "rejected" && app.rejectionReason && (
                          <div className="mb-4 flex items-start gap-2 text-[#e6a3b3]">
                            <XCircle size={16} className="mt-0.5 shrink-0" />
                            <span className="line-clamp-2">
                              <span className="font-semibold">{t.applicationsPage.rejectionReasonTitle}: </span>
                              {app.rejectionReason}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          {[1, 2, 3, 4, 5].map((step) =>
                            renderStep(step, app.progress, app.status === "rejected")
                          )}
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
                  );
                })}

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
                <div className="flex flex-col items-center gap-2">
                  <ScoreRing info={selectedMatchInfo} />

                  {selectedMatchInfo.status === "loading" && (
                    <span className="text-[12px] font-medium text-white/40">
                      {t.jobMatches.matchScoreLoading}
                    </span>
                  )}

                  {selectedMatchInfo.status === "noAnalysis" && (
                    <button
                      type="button"
                      onClick={() => navigate("/resume-manager")}
                      className="rounded-full border border-[#7c88ff]/30 bg-[#7c88ff]/15 px-3 py-1 text-center text-[11px] font-semibold text-[#c4b5fd] transition hover:bg-[#7c88ff]/25"
                    >
                      {t.jobMatches.analyzeCvForScore}
                    </button>
                  )}

                  {selectedMatchInfo.status === "scored" && selectedMatchInfo.reason && (
                    <p
                      className="max-w-[220px] text-center text-[12px] leading-5 text-[#aeb4d6]"
                      title={selectedMatchInfo.reason}
                    >
                      {selectedMatchInfo.reason}
                    </p>
                  )}
                </div>

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
                              : getReviewStatusLabel(selectedApplication.reviewStatus)}
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

              {withdrawError && (
                <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {withdrawError}
                </div>
              )}

              {!selectedApplication.viewedByCompany ? (
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="mt-6 rounded-[16px] border border-[rgba(255,88,120,0.45)] bg-transparent px-6 py-3 text-[15px] font-bold text-[#ff7d9d] transition hover:bg-[rgba(255,88,120,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {withdrawing
                    ? t.applicationsPage.withdrawing
                    : t.applicationsPage.withdrawApplication}
                </button>
              ) : (
                <p className="mt-6 text-[14px] text-white/45">
                  {t.applicationsPage.withdrawBlocked}
                </p>
              )}
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
                  // The final step is the terminal outcome, not just "another completed stage" -
                  // giving it the same badge color as the Rejected badge (rose) when rejected is
                  // what keeps the badge, timeline, and stage label all representing the same
                  // state instead of a rejected application ending on a green checkmark.
                  const isRejectedFinalStep = isCurrent && step.key === "final" && isSelectedRejected;

                  return (
                    <div
                      key={step.key}
                      className="relative flex flex-col items-center text-center"
                    >
                      <div className="mb-4 flex items-center justify-center">
                        <div
                          className={`flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border transition ${
                            isRejectedFinalStep
                              ? "border-rose-400 bg-rose-500/18 text-rose-300 shadow-[0_0_18px_rgba(244,63,94,0.22)]"
                              : isDone
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

                      <h3
                        className={`text-[16px] font-bold ${isRejectedFinalStep ? "text-rose-300" : "text-white"}`}
                      >
                        {step.label}
                      </h3>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedApplication.reviewStatus === "Final Decision" && selectedApplication.contactMethod && (
              <div className="rounded-[30px] border border-emerald-400/20 bg-emerald-500/[0.06] px-8 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                <h2 className={`mb-4 flex items-center gap-2 text-[22px] font-extrabold text-white ${isRTL ? "flex-row-reverse text-right" : ""}`}>
                  <Phone size={20} className="text-emerald-300" />
                  {t.applicationsPage.contactInfoTitle}
                </h2>
                <p className={`text-[15px] leading-7 text-[#c4cae9] ${isRTL ? "text-right" : ""}`}>
                  <span className="font-semibold text-white">{t.applicationsPage.contactMethodLabel}: </span>
                  {getContactMethodLabel(t, selectedApplication.contactMethod, selectedApplication.contactMethodOther)}
                </p>
                {selectedApplication.contactMessage && (
                  <p className={`mt-3 whitespace-pre-line text-[15px] leading-7 text-[#c4cae9] ${isRTL ? "text-right" : ""}`}>
                    {selectedApplication.contactMessage}
                  </p>
                )}
              </div>
            )}

            {selectedApplication.reviewStatus === "Rejected" && selectedApplication.rejectionReason && (
              <div className="rounded-[30px] border border-rose-400/20 bg-rose-500/[0.06] px-8 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                <h2 className={`mb-4 flex items-center gap-2 text-[22px] font-extrabold text-white ${isRTL ? "flex-row-reverse text-right" : ""}`}>
                  <XCircle size={20} className="text-rose-300" />
                  {t.applicationsPage.rejectionReasonTitle}
                </h2>
                <p className={`whitespace-pre-line text-[15px] leading-7 text-[#c4cae9] ${isRTL ? "text-right" : ""}`}>
                  {selectedApplication.rejectionReason}
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default Applications;