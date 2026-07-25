import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import { apiFetch, apiFetchBlob, ApiError } from "../utils/api";
import { getMatchTier, getMatchLabel } from "../utils/matchScore";
import CandidateAiSummaryModal from "../components/CandidateAiSummaryModal";
import AcceptApplicationModal, { type ContactMethod } from "../components/AcceptApplicationModal";
import RejectApplicationModal from "../components/RejectApplicationModal";
import {
  ScoreRing as SharedScoreRing,
  Badge,
  applicationStatusTone,
  EmptyState,
  ListSkeleton,
  Reveal,
  Skeleton,
  useToast,
} from "../components/ui";
import {
  ArrowLeft,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  Send,
  Brain,
  Star,
  CheckCircle,
  Calendar,
  Clock3,
  X,
  Download,
  Sparkles,
  Trophy,
  ArrowUpDown,
  GraduationCap,
  Languages as LanguagesIcon,
  Briefcase,
  Loader2,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";

type ApplicationStage =
  | "New"
  | "Screening"
  | "Shortlisted"
  | "Decided";

type ApplicationItem = {
  id: number;
  name: string;
  email: string;
  jobTitle: string;
  date: string;
  match: number | null;
  matchLabel: string | null;

  recommendation: string | null;

  hasAiSummary: boolean;
  stage: ApplicationStage;
  currentStep: number;
  status: string;
  viewedByCompany: boolean;
  preInterviewAnswers: Record<string, string>;
  contactMethod: string | null;
  contactMethodOther: string | null;
  contactMessage: string | null;
  rejectionReason: string | null;
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
  recommendation: string | null;
  hasAiSummary?: boolean;
  viewedByCompany?: boolean;
  rejectionReason?: string | null;
  preInterviewAnswers?: Record<string, string>;
  contactMethod?: string | null;
  contactMethodOther?: string | null;
  contactMessage?: string | null;
};

type CandidateProfile = {
  hasAnalysis: boolean;
  resumeUploaded: boolean;
  skills?: string[];
  yearsOfExperience?: string | null;
  experienceLevel?: string | null;
  previousJobTitles?: string | null;
  educationEvidence?: string | null;
  certificationsEvidence?: string | null;
  licensesEvidence?: string | null;
  languages?: string | null;
};

type InlineAiSummary = {
  hasAnalysis: boolean;
  professionalBackground?: string;
  keySkills?: string[];
  yearsOfExperience?: string;
  strengths?: string;
  weaknesses?: string;
  overallSuitability?: string;
  matchScore?: number;
  matchLabel?: string;
  recommendation?: string;
  message?: string;
};

// שלוש הפונקציות הבאות ממירות את קוד ההשכלה/ההסמכה/הרישיון שה-AI זיהה לטקסט תיאורי להצגה למעסיק
function describeEducationEvidence(value: string | null | undefined): string | null {
  switch (value) {
    case "relevant_degree":
      return "Has a degree directly relevant to this field.";
    case "general":
      return "Has a general degree, not specific to this field.";
    default:
      return null;
  }
}

function describeCertificationsEvidence(value: string | null | undefined): string | null {
  switch (value) {
    case "field_relevant":
      return "Holds a certification relevant to this field.";
    case "general":
      return "Holds a general professional certification.";
    default:
      return null;
  }
}

function describeLicensesEvidence(value: string | null | undefined): string | null {
  switch (value) {
    case "licensed":
      return "Holds a required professional license.";
    case "in_progress":
      return "A required professional license is in progress.";
    default:
      return null;
  }
}

function recommendationLabel(category: string | null, page: Record<string, string | undefined>): string {
  if (category === "accept") return page.accept || "Accept";
  if (category === "consider") return page.keepUnderReview || "Keep Under Review";
  if (category === "reject") return page.reject || "Reject";
  return page.awaitingAnalysis || "Awaiting Analysis";
}

// ממפה סטטוס בקשה גולמי מהשרת לשלב תצוגה (חדש/בסינון/ברשימה קצרה/הוכרע) עבור טאבי הסינון
function deriveStage(status: string | null): ApplicationStage {
  const normalized = (status || "").toLowerCase();
  if (normalized === "accepted" || normalized === "rejected") return "Decided";
  if (normalized === "shortlisted") return "Shortlisted";
  if (normalized === "screening" || normalized === "ai screening" || normalized === "applied") return "Screening";
  return "New";
}

// ממיין מועמדים לפי דירוג AI - ציון התאמה גבוה קודם, ואז לפי תאריך הגשה מוקדם יותר
function compareByAiRank(a: ApplicationItem, b: ApplicationItem) {
  const scoreDiff = (b.match ?? -1) - (a.match ?? -1);
  if (scoreDiff !== 0) return scoreDiff;
  const dateDiff = (a.date || "").localeCompare(b.date || "");
  if (dateDiff !== 0) return dateDiff;
  return a.id - b.id;
}

// ממיין מועמדים לפי תאריך הגשה, מהחדש לישן
function compareByDateDesc(a: ApplicationItem, b: ApplicationItem) {
  const dateDiff = (b.date || "").localeCompare(a.date || "");
  if (dateDiff !== 0) return dateDiff;
  return a.id - b.id;
}

// ממיר שלב תצוגה למספר צעד בפס ההתקדמות שמוצג למועמד/למעסיק
function deriveStep(stage: ApplicationStage): number {
  if (stage === "Decided") return 5;
  if (stage === "Shortlisted") return 4;
  if (stage === "Screening") return 2;
  return 1;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

type ProgressStepState = "completed" | "current" | "pending" | "rejected";
type ProgressStep = { key: string; label: string; state: ProgressStepState };

// בונה את רשימת שלבי ההתקדמות (הוגש/ניתוח AI/בבדיקה/ברשימה קצרה/הוחלט) עם המצב של כל שלב לפי הסטטוס הנוכחי
function computeCandidateProgress(status: string | null, hasAnalysis: boolean, labels: {
  applied: string; aiAnalysis: string; underReview: string; shortlisted: string; accepted: string; rejected: string;
}): ProgressStep[] {
  const normalized = (status || "").toLowerCase();
  const isRejected = normalized === "rejected";
  const isAccepted = normalized === "accepted";
  const isShortlisted = normalized === "shortlisted";

  const underReviewState: ProgressStepState =
    isShortlisted || isAccepted || isRejected ? "completed" : "current";

  const shortlistedState: ProgressStepState =
    isShortlisted ? "current" : isAccepted ? "completed" : "pending";

  return [
    { key: "applied", label: labels.applied, state: "completed" },
    { key: "aiAnalysis", label: labels.aiAnalysis, state: hasAnalysis ? "completed" : "pending" },
    { key: "underReview", label: labels.underReview, state: underReviewState },
    { key: "shortlisted", label: labels.shortlisted, state: shortlistedState },
    {
      key: "decision",
      label: isRejected ? labels.rejected : labels.accepted,
      state: isRejected ? "rejected" : isAccepted ? "completed" : "pending",
    },
  ];
}

function contactMethodLabel(t: any, method: string | null, other: string | null): string {
  const m = t.acceptApplicationModal || {};
  switch (method) {
    case "phone_call":
      return m.phoneCall || "Phone call";
    case "email":
      return m.email || "Email";
    case "whatsapp":
      return m.whatsapp || "WhatsApp";
    case "linkedin":
      return m.linkedin || "LinkedIn";
    case "in_person_meeting":
      return m.inPersonMeeting || "In-person meeting";
    case "other":
      return other || m.other || "Other";
    default:
      return "";
  }
}

// ממפה אובייקט בקשה כפי שמגיע מהשרת למבנה שהעמוד עובד איתו (כולל חישוב שלב וצעד תצוגה)
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
    recommendation: item.recommendation ?? null,
    hasAiSummary: Boolean(item.hasAiSummary),
    stage,
    currentStep: deriveStep(stage),
    status: item.status || "Under Review",
    viewedByCompany: Boolean(item.viewedByCompany),
    preInterviewAnswers: item.preInterviewAnswers || {},
    contactMethod: item.contactMethod ?? null,
    contactMethodOther: item.contactMethodOther ?? null,
    contactMessage: item.contactMessage ?? null,
    rejectionReason: item.rejectionReason ?? null,
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
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<
    "All" | "New" | "Screening" | "Shortlisted" | "Decided"
  >("All");

  const [sortMode, setSortMode] = useState<"aiRank" | "date">(filterJobId ? "aiRank" : "date");
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationItem | null>(null);
  const [aiSummaryApplication, setAiSummaryApplication] =
    useState<ApplicationItem | null>(null);

  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [candidateProfileLoading, setCandidateProfileLoading] = useState(false);

  const [inlineAiSummary, setInlineAiSummary] = useState<InlineAiSummary | null>(null);
  const [inlineAiSummaryLoading, setInlineAiSummaryLoading] = useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState("");
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState("");

  const [showContactModal, setShowContactModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [contactModalError, setContactModalError] = useState("");
  const [contactModalSuccess, setContactModalSuccess] = useState(false);

  const [acceptTarget, setAcceptTarget] = useState<ApplicationItem | null>(null);

  const [rejectTarget, setRejectTarget] = useState<ApplicationItem | null>(null);

  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewType, setInterviewType] = useState(
    page.online || "Online"
  );
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [isSchedulingInterview, setIsSchedulingInterview] = useState(false);
  const [interviewModalError, setInterviewModalError] = useState("");
  const [interviewModalSuccess, setInterviewModalSuccess] = useState(false);

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // טוען את כל הבקשות של החברה, או רק את הבקשות למשרה ספציפית אם הגענו מסינון לפי משרה
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

  // מסנן את הבקשות לפי הטאב הנבחר (הכל/חדש/בסינון/ברשימה קצרה/הוכרע)
  const filteredApplications = useMemo(() => {
    if (activeTab === "All") return applications;
    return applications.filter((app) => app.stage === activeTab);
  }, [activeTab, applications]);

  // כשמסננים לפי משרה, מחשב לכל בקשה את הדירוג שלה מבין המועמדים למשרה הזו לפי ציון ההתאמה
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

  // ממיין את רשימת הבקשות המוצגת לפי דירוג AI או לפי תאריך, בהתאם לבחירת המשתמש
  const sortedApplications = useMemo(() => {
    const comparator = sortMode === "aiRank" ? compareByAiRank : compareByDateDesc;
    return [...filteredApplications].sort(comparator);
  }, [filteredApplications, sortMode]);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const getScoreBadgeStyles = (match: number | null) => {
    if (match === null) return "bg-white/10 text-white/50 border border-white/15";
    const tier = getMatchTier(match);
    return `${tier.bg} ${tier.text} border ${tier.border}`;
  };

  const getScoreBadgeLabel = (match: number | null, matchLabel: string | null) => {
    if (match === null) return page.notScoredYet || "Not scored yet";
    return matchLabel || getMatchLabel(match);
  };

  // שולח לשרת עדכון סטטוס לבקשה (התקבל/נדחה/רשימה קצרה/בבדיקה) ומעדכן את המצב המקומי בהתאם
  const applyStatusUpdate = async (
    id: number,
    status: "Accepted" | "Rejected" | "Shortlisted" | "Under Review",
    extra?:
      | { contactMethod: ContactMethod; contactMethodOther: string; contactMessage: string }
      | { rejectionReason: string }
  ) => {
    const contact = extra && "contactMethod" in extra ? extra : undefined;
    const rejection = extra && "rejectionReason" in extra ? extra : undefined;

    const data = await apiFetch(`/api/applications/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status,
        contactMethod: contact?.contactMethod,
        contactMethodOther: contact?.contactMethodOther,
        contactMessage: contact?.contactMessage,
        rejectionReason: rejection?.rejectionReason,
      }),
    });

    if (!data.success) {
      throw new Error(data.message || "Could not update application status.");
    }

    const stage = deriveStage(status);
    const patch = {
      status,
      stage,
      currentStep: deriveStep(stage),
      contactMethod: contact?.contactMethod ?? null,
      contactMethodOther: contact?.contactMethod === "other" ? contact.contactMethodOther : null,
      contactMessage: contact?.contactMessage || null,
      rejectionReason: rejection?.rejectionReason ?? null,
    };

    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...patch } : app))
    );

    setSelectedApplication((prev) =>
      prev && prev.id === id ? { ...prev, ...patch } : prev
    );
  };

  // פותח את מודל האישור שבו המעסיק בוחר איך ליצור קשר עם המועמד לפני קבלתו בפועל
  const handleAccept = (id: number) => {
    const app = applications.find((item) => item.id === id) ?? null;
    setAcceptTarget(app);
  };

  // מאשר את קבלת המועמד ושומר בשרת את פרטי דרך יצירת הקשר וההודעה שנבחרו
  const handleConfirmAccept = async (
    contactMethod: ContactMethod,
    contactMethodOther: string,
    contactMessage: string
  ) => {
    if (!acceptTarget) return;
    setIsUpdatingStatus(true);
    setStatusUpdateError("");
    setStatusUpdateSuccess("");
    try {
      await applyStatusUpdate(acceptTarget.id, "Accepted", { contactMethod, contactMethodOther, contactMessage });
      setStatusUpdateSuccess(page.acceptSuccess || "Application accepted.");
      setAcceptTarget(null);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // מעביר את הבקשה לסטטוס "רשימה קצרה"
  const handleShortlist = async (id: number) => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setStatusUpdateError("");
    setStatusUpdateSuccess("");
    try {
      await applyStatusUpdate(id, "Shortlisted");
      setStatusUpdateSuccess(page.shortlistSuccess || "Candidate shortlisted.");
    } catch (err) {
      setStatusUpdateError(err instanceof Error ? err.message : "Could not shortlist this application.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // מחזיר בקשה למצב "בבדיקה" (למשל אם המעסיק מתחרט על החלטה קודמת)
  const handleKeepUnderReview = async (id: number) => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setStatusUpdateError("");
    setStatusUpdateSuccess("");
    try {
      await applyStatusUpdate(id, "Under Review");
      setStatusUpdateSuccess(page.underReviewSuccess || "Application kept under review.");
    } catch (err) {
      setStatusUpdateError(err instanceof Error ? err.message : "Could not update this application.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // פותח את מודל הדחייה שבו המעסיק מזין את סיבת הדחייה למועמד
  const handleReject = (id: number) => {
    const app = applications.find((item) => item.id === id) ?? null;
    setRejectTarget(app);
  };

  // מאשר את דחיית המועמד ושומר בשרת את סיבת הדחייה שתישלח אליו
  const handleConfirmReject = async (rejectionReason: string) => {
    if (!rejectTarget) return;
    setIsUpdatingStatus(true);
    setStatusUpdateError("");
    setStatusUpdateSuccess("");
    try {
      await applyStatusUpdate(rejectTarget.id, "Rejected", { rejectionReason });
      setStatusUpdateSuccess(page.rejectSuccess || "Application rejected.");
      setRejectTarget(null);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // מעדכן בקשה עם ציון ההתאמה וההמלצה שהתקבלו מניתוח ה-AI לאחר שהופק סיכום
  const applyAiMatchScore = (id: number, matchScore: number, matchLabel: string, recommendation: string) => {
    const patch = {
      match: matchScore,
      matchLabel: matchLabel || getMatchLabel(matchScore),
      recommendation: recommendation || null,

      hasAiSummary: true,
    };

    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, ...patch } : app)));

    setSelectedApplication((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  };

  // פותח את פרטי הבקשה ומסמן אותה כנצפתה על ידי החברה, ואם היא עדיין "הוגש" מעביר אותה ל"בבדיקה"
  const openApplicationDetail = (app: ApplicationItem) => {
    setSelectedApplication(app);

    if (!app.viewedByCompany) {

      const normalizedStatus = (app.status || "").toLowerCase();
      const movesToUnderReview = normalizedStatus === "applied" || normalizedStatus === "ai screening" || !app.status;

      const patch = {
        viewedByCompany: true,
        ...(movesToUnderReview ? { status: "Under Review" } : {}),
      };

      setApplications((prev) =>
        prev.map((item) => (item.id === app.id ? { ...item, ...patch } : item))
      );
      setSelectedApplication((prev) =>
        prev && prev.id === app.id ? { ...prev, ...patch } : prev
      );

      apiFetch(`/api/applications/${app.id}/mark-viewed`, { method: "POST" }).catch(() => {});
    }
  };

  // מבקש מהשרת ליצור/להביא סיכום AI לבקשה הזו ומציג אותו בעמוד הפרטים
  const fetchInlineAiSummary = (applicationId: number) => {
    setInlineAiSummaryLoading(true);
    apiFetch(`/api/applications/${applicationId}/ai-summary?language=${language}`, { method: "POST" })
      .then((data: InlineAiSummary) => setInlineAiSummary(data))
      .catch(() => setInlineAiSummary(null))
      .finally(() => setInlineAiSummaryLoading(false));
  };

  // כשנפתחת בקשה, טוען את פרופיל המועמד ומביא סיכום AI קיים אם כבר נוצר בעבר
  useEffect(() => {
    setStatusUpdateError("");
    setStatusUpdateSuccess("");
    setCandidateProfile(null);
    setInlineAiSummary(null);

    if (!selectedApplication) return;

    let cancelled = false;
    setCandidateProfileLoading(true);

    apiFetch(`/api/applications/${selectedApplication.id}/candidate-profile`)
      .then((data: CandidateProfile) => {
        if (!cancelled) setCandidateProfile(data);
      })
      .catch(() => {
        if (!cancelled) setCandidateProfile(null);
      })
      .finally(() => {
        if (!cancelled) setCandidateProfileLoading(false);
      });

    if (selectedApplication.hasAiSummary) {
      fetchInlineAiSummary(selectedApplication.id);
    }

    return () => {
      cancelled = true;
    };

  }, [selectedApplication?.id, language]);

  const openContactModal = (app: ApplicationItem) => {
    setMessageText(
      `Hi ${app.name}, we would like to contact you regarding your profile.`
    );
    setContactModalError("");
    setContactModalSuccess(false);
    setShowContactModal(true);
  };

  const openInterviewModal = () => {
    setInterviewDate("");
    setInterviewTime("");
    setInterviewType(page.online || "Online");
    setInterviewLocation("");
    setInterviewNotes("");
    setInterviewModalError("");
    setInterviewModalSuccess(false);
    setShowInterviewModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
  };

  const closeInterviewModal = () => {
    setShowInterviewModal(false);
  };

  const detailMatch = selectedApplication?.match ?? null;

  const detailRecommendation =
    (inlineAiSummary?.hasAnalysis ? inlineAiSummary.recommendation : null) ??
    selectedApplication?.recommendation ??
    null;
  const detailTier = detailMatch !== null ? getMatchTier(detailMatch) : null;

  const detailIsFinal = selectedApplication
    ? ["accepted", "rejected"].includes((selectedApplication.status || "").toLowerCase())
    : false;
  const detailIsAccepted = selectedApplication?.status === "Accepted";
  const detailIsShortlisted = selectedApplication?.status === "Shortlisted";

  // קובע את הפעולה שה-AI ממליץ עליה (קבל/שקול/דחה) ואת הנימוק המוצג עבורה
  const aiRecommendedAction =
    detailRecommendation === "accept"
      ? { label: page.accept || "Accept", reason: `The match score is ${detailMatch}% and the candidate's profile aligns well with this role's requirements.` }
      : detailRecommendation === "consider"
      ? { label: page.keepUnderReview || "Keep Under Review", reason: `The match score is ${detailMatch}%, a moderate fit - worth a closer look before deciding.` }
      : detailRecommendation === "reject"
      ? { label: page.reject || "Reject", reason: `The match score is ${detailMatch}% and the candidate's profile has significant gaps against this role's requirements.` }
      : { label: page.keepUnderReview || "Keep Under Review", reason: "No AI analysis is available for this candidate yet, so there isn't enough information for a confident decision." };

  const recommendationExplanation =
    inlineAiSummary?.hasAnalysis && inlineAiSummary.weaknesses
      ? inlineAiSummary.weaknesses
      : inlineAiSummary?.hasAnalysis && inlineAiSummary.overallSuitability
      ? inlineAiSummary.overallSuitability
      : aiRecommendedAction.reason;

  const progressSteps = selectedApplication
    ? computeCandidateProgress(selectedApplication.status, detailMatch !== null, {
        applied: page.steps?.applied || "Applied",
        aiAnalysis: page.steps?.aiAnalysis || "AI Analysis",
        underReview: page.steps?.underReview || "Under Review",
        shortlisted: page.steps?.shortlisted || "Shortlisted",
        accepted: page.steps?.accepted || "Accepted",
        rejected: page.steps?.rejected || "Rejected",
      })
    : [];

  // מוריד את קובץ קורות החיים של המועמד ופותח אותו בטאב חדש
  const handleDownloadResume = async () => {
    if (!selectedApplication) return;
    try {
      const blob = await apiFetchBlob(`/api/cv/company-download/${selectedApplication.id}`);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : page.downloadResumeError || "Could not download this candidate's resume."
      );
    }
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
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300 shadow-[0_10px_30px_rgba(249,115,22,0.15)]">
                <FileText size={28} />
              </div>

              <div className={`min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
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

            {loading && <ListSkeleton count={4} />}

            {!loading && (
            <div className="space-y-5">
              {sortedApplications.map((app, index) => {
                const aiRank = rankByApplicationId.get(app.id);

                const isFinal = ["accepted", "rejected"].includes((app.status || "").toLowerCase());

                return (
                <Reveal key={app.id} delay={Math.min(index * 0.05, 0.3)}>
                <div
                  className="min-w-0 rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] md:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#7b61ff] to-[#a855f7] text-2xl font-extrabold text-white shadow-[0_12px_28px_rgba(124,77,255,0.28)]">
                        {getInitial(app.name)}
                      </div>

                      <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h2 className="text-[19px] font-extrabold text-white md:text-[22px]">
                            {app.name}
                          </h2>

                          {aiRank !== undefined && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300">
                              <Trophy size={12} />
                              {(page.aiRank || "AI Rank")} #{aiRank}
                            </span>
                          )}

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${getScoreBadgeStyles(
                              app.match
                            )}`}
                          >
                            {getScoreBadgeLabel(app.match, app.matchLabel)}
                          </span>

                          <Badge tone={applicationStatusTone(app.status)}>
                            {app.status || "Applied"}
                          </Badge>
                        </div>

                        <p className="truncate text-[16px] text-white/70 md:text-[18px]">{app.email}</p>

                        <p className="mt-2 truncate text-sm text-white/45">
                          {page.appliedFor || "Applied for"} {app.jobTitle} •{" "}
                          {app.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-center xl:justify-start">
                      <div className="flex flex-col items-center gap-1">
                        <SharedScoreRing percent={app.match} size={72} />
                        {app.match !== null ? (() => {
                          const tier = getMatchTier(app.match);
                          return (
                            <>
                              <span className={`flex items-center gap-1 text-[12px] font-bold ${tier.text}`}>
                                <span>{tier.emoji}</span>
                                {app.match}% {page.matchLabel || "Match"}
                              </span>
                              <span className="text-[11px] font-semibold text-white/45">
                                {app.matchLabel || getMatchLabel(app.match)}
                              </span>
                              <span className={`mt-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${tier.bg} ${tier.text} ${tier.border}`}>
                                {recommendationLabel(app.recommendation, page)}
                              </span>
                            </>
                          );
                        })() : (
                          <span className="text-[11px] font-semibold text-white/40">
                            {page.notScoredYet || "Not scored yet"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 xl:shrink-0 xl:justify-end">
                      <button
                        type="button"
                        onClick={() => openApplicationDetail(app)}
                        className="inline-flex items-center gap-2 rounded-[12px] border border-[#6b78ff]/40 bg-[#5964ff]/10 px-3.5 py-2 text-sm font-semibold text-[#cfd5ff] transition hover:bg-[#5964ff]/20"
                      >
                        <Eye size={16} />
                        {page.view || "View"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setAiSummaryApplication(app)}
                        className="inline-flex items-center gap-2 rounded-[12px] border border-violet-400/30 bg-violet-500/10 px-3.5 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
                      >
                        <Sparkles size={16} />
                        {page.aiSummary || "AI Summary"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAccept(app.id)}
                        disabled={isFinal}
                        className="inline-flex items-center gap-2 rounded-[12px] bg-emerald-500/20 px-3.5 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <CheckCircle2 size={16} />
                        {page.accept || "Accept"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(app.id)}
                        disabled={isFinal}
                        className="inline-flex items-center gap-2 rounded-[12px] bg-rose-500/20 px-3.5 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <XCircle size={16} />
                        {page.reject || "Reject"}
                      </button>
                    </div>
                  </div>
                </div>
                </Reveal>
                );
              })}

              {sortedApplications.length === 0 && (
                <EmptyState
                  icon={<FileText size={26} />}
                  title={page.noApplicationsInTab || "No applications found in this tab."}
                />
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
                <div className="flex min-w-0 flex-1 gap-5">
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
                      <Badge tone={applicationStatusTone(selectedApplication.status)} className="px-4 py-2 text-sm">
                        {selectedApplication.status || "Applied"}
                      </Badge>
                    </div>

                    <p className="mb-4 text-[18px] text-white/70 md:text-[28px]">
                      {selectedApplication.jobTitle}
                    </p>

                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-[15px] text-white/60">
                      <span>{selectedApplication.email}</span>
                      <span>{formatDate(selectedApplication.date) || "—"}</span>
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
                    onClick={handleDownloadResume}
                    disabled={candidateProfile !== null && !candidateProfile.resumeUploaded}
                    className="flex items-center justify-center gap-2 rounded-[14px] border border-cyan-400/20 bg-[#091a43] px-5 py-4 text-[15px] font-semibold text-cyan-300 transition hover:bg-[#0d2358] disabled:cursor-not-allowed disabled:opacity-40"
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
                    <div className="flex flex-col items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/[0.04] p-5 text-center">
                      <SharedScoreRing percent={selectedApplication.match} size={64} />
                      <div className="text-sm text-white/50">{page.matchScore || "Match Score"}</div>
                    </div>
                    <StatCard
                      label={page.applicationDate || "Application Date"}
                      value={formatDate(selectedApplication.date) || "—"}
                    />
                    <StatCard
                      label={page.currentStatus || "Current Status"}
                      value={selectedApplication.status || "Applied"}
                    />
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5">
                    <h3 className="mb-4 text-[18px] font-bold">
                      {page.hiringSummary || "AI Hiring Summary"}
                    </h3>

                    {inlineAiSummaryLoading && (
                      <div className="space-y-2.5">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    )}

                    {!inlineAiSummaryLoading && inlineAiSummary?.hasAnalysis && (
                      <p className="text-[16px] leading-8 text-white/75">
                        {inlineAiSummary.overallSuitability ||
                          [inlineAiSummary.strengths, inlineAiSummary.weaknesses].filter(Boolean).join(" ")}
                      </p>
                    )}

                    {!inlineAiSummaryLoading && !inlineAiSummary?.hasAnalysis && (
                      <div>
                        <p className="mb-4 flex items-start gap-2 text-[15px] leading-7 text-white/60">
                          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-300" />
                          {selectedApplication.hasAiSummary
                            ? page.summaryLoadError || "Could not load the AI summary. Please try again."
                            : page.noAiSummaryYet ||
                              "No AI analysis has been generated for this candidate and role yet."}
                        </p>
                        <button
                          type="button"
                          onClick={() => setAiSummaryApplication(selectedApplication)}
                          className="inline-flex items-center gap-2 rounded-[12px] border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
                        >
                          <Sparkles size={16} />
                          {page.generateAiSummary || "Generate AI Summary"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`rounded-[28px] border p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] ${
                    detailRecommendation === "accept"
                      ? "border-emerald-400/20 bg-emerald-500/10"
                      : detailRecommendation === "consider"
                      ? "border-amber-400/20 bg-amber-500/10"
                      : detailRecommendation === "reject"
                      ? "border-rose-400/20 bg-rose-500/10"
                      : "border-white/10 bg-white/[0.05]"
                  }`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        detailTier ? `${detailTier.bg} ${detailTier.text}` : "bg-white/10 text-white/50"
                      }`}
                    >
                      <CheckCircle size={22} />
                    </div>
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
                        {page.recommendation || "Recommendation"}
                      </p>
                      <h3 className={`text-[20px] font-extrabold ${detailTier ? detailTier.text : "text-white/70"}`}>
                        {detailRecommendation === "accept"
                          ? page.strongCandidate || "Strong Candidate"
                          : detailRecommendation === "consider"
                          ? page.considerCandidate || "Consider"
                          : detailRecommendation === "reject"
                          ? page.notRecommended || "Not Recommended"
                          : page.awaitingAnalysis || "Awaiting Analysis"}
                      </h3>
                    </div>
                  </div>

                  <p className="text-[15px] leading-7 text-white/75">
                    {recommendationExplanation}
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                      <Briefcase size={20} />
                    </div>
                    <h2 className="text-[20px] font-extrabold">
                      {page.candidateSkills || "Candidate Skills"}
                    </h2>
                  </div>

                  {candidateProfileLoading && (
                    <div className="flex items-center gap-3 text-white/50">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm">{common.loading || "Loading..."}</span>
                    </div>
                  )}

                  {!candidateProfileLoading && candidateProfile?.skills && candidateProfile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {candidateProfile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {!candidateProfileLoading && (!candidateProfile?.skills || candidateProfile.skills.length === 0) && (
                    <p className="text-sm text-white/45">
                      {page.noSkillsInfo || "No skills information available."}
                    </p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                        <Briefcase size={18} />
                      </div>
                      <h2 className="text-[18px] font-extrabold">
                        {page.experience || "Experience"}
                      </h2>
                    </div>

                    {!candidateProfileLoading && candidateProfile?.hasAnalysis ? (
                      <div className="space-y-2 text-[15px] text-white/70">
                        {candidateProfile.yearsOfExperience && (
                          <p>
                            <span className="font-semibold text-white">{page.totalExperience || "Total experience"}: </span>
                            {candidateProfile.yearsOfExperience}
                          </p>
                        )}
                        {candidateProfile.previousJobTitles && (
                          <p>
                            <span className="font-semibold text-white">{page.previousRoles || "Previous roles"}: </span>
                            {candidateProfile.previousJobTitles}
                          </p>
                        )}
                        {!candidateProfile.yearsOfExperience && !candidateProfile.previousJobTitles && (
                          <p className="text-white/45">{page.noExperienceInfo || "No experience information available."}</p>
                        )}
                      </div>
                    ) : (
                      !candidateProfileLoading && (
                        <p className="text-sm text-white/45">{page.noExperienceInfo || "No experience information available."}</p>
                      )
                    )}
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                        <GraduationCap size={18} />
                      </div>
                      <h2 className="text-[18px] font-extrabold">
                        {page.education || "Education"}
                      </h2>
                    </div>

                    {(() => {
                      if (candidateProfileLoading) return null;

                      const educationLine = describeEducationEvidence(candidateProfile?.educationEvidence);
                      const certificationLine = describeCertificationsEvidence(candidateProfile?.certificationsEvidence);
                      const licenseLine = describeLicensesEvidence(candidateProfile?.licensesEvidence);
                      const lines = [educationLine, certificationLine, licenseLine].filter(
                        (line): line is string => Boolean(line)
                      );

                      if (!candidateProfile?.hasAnalysis || lines.length === 0) {
                        return (
                          <p className="text-sm text-white/45">
                            {page.noEducationInfo || "No education information available."}
                          </p>
                        );
                      }

                      return (
                        <div className="space-y-2 text-[15px] leading-6 text-white/70">
                          {lines.map((line) => (
                            <p key={line}>{line}</p>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {!candidateProfileLoading && candidateProfile?.languages && candidateProfile.languages.trim() && (
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300">
                        <LanguagesIcon size={18} />
                      </div>
                      <h2 className="text-[18px] font-extrabold">
                        {page.languages || "Languages"}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {candidateProfile.languages.split(",").map((lang) => lang.trim()).filter(Boolean).map((lang) => (
                        <span
                          key={lang}
                          className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1.5 text-sm font-semibold text-fuchsia-200"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                      <ClipboardCheck size={20} />
                    </div>
                    <h2 className="text-[20px] font-extrabold">
                      {page.hiringDecision || "Hiring Decision"}
                    </h2>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-white/60">
                    <span className="font-semibold text-white">{page.currentStatus || "Current Status"}:</span>
                    <Badge tone={applicationStatusTone(selectedApplication.status)}>
                      {selectedApplication.status || "Applied"}
                    </Badge>
                  </div>

                  <div className="mb-5 rounded-[18px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/45">
                      {page.aiRecommendedAction || "AI Recommended Action"}
                    </p>
                    <p className="mb-2 text-[17px] font-bold text-white">{aiRecommendedAction.label}</p>
                    <p className="text-sm leading-6 text-white/60">{aiRecommendedAction.reason}</p>
                  </div>

                  {statusUpdateError && (
                    <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {statusUpdateError}
                    </div>
                  )}
                  {statusUpdateSuccess && (
                    <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                      {statusUpdateSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5 max-[380px]:grid-cols-1">
                    <button
                      type="button"
                      onClick={() => handleAccept(selectedApplication.id)}
                      disabled={isUpdatingStatus || detailIsFinal}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] bg-emerald-500/20 px-3.5 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <CheckCircle2 size={16} />
                      {page.accept || "Accept"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(selectedApplication.id)}
                      disabled={isUpdatingStatus || detailIsFinal}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] bg-rose-500/20 px-3.5 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <XCircle size={16} />
                      {page.reject || "Reject"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleKeepUnderReview(selectedApplication.id)}
                      disabled={isUpdatingStatus || detailIsFinal}
                      className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isUpdatingStatus ? <Loader2 size={16} className="animate-spin" /> : <Clock3 size={16} />}
                      {page.keepUnderReview || "Keep Under Review"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShortlist(selectedApplication.id)}
                      disabled={isUpdatingStatus || detailIsFinal || detailIsShortlisted}
                      className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Star size={16} />
                      {page.shortlist || "Shortlist"}
                    </button>
                  </div>

                  {detailIsFinal && (
                    <p className="mt-3 text-xs text-white/40">
                      {detailIsAccepted
                        ? page.alreadyAccepted || "This application has already been accepted."
                        : page.alreadyRejected || "This application has already been rejected."}
                    </p>
                  )}
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <h2 className="mb-5 text-[20px] font-extrabold">
                    {page.progress || "Progress"}
                  </h2>
                  <CandidateProgressSteps steps={progressSteps} />
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
                        {page.applicationDateLabel || "Application Date:"}
                      </span>{" "}
                      {formatDate(selectedApplication.date) || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-white">
                        {page.currentStatusLabel || "Current Status:"}
                      </span>{" "}
                      {selectedApplication.status || "Applied"}
                    </p>
                    <p>
                      <span className="font-semibold text-white">
                        {page.resumeUploadedLabel || "Resume Uploaded:"}
                      </span>{" "}
                      {candidateProfileLoading ? "—" : candidateProfile?.resumeUploaded ? common.yes || "Yes" : common.no || "No"}
                    </p>
                    <p>
                      <span className="font-semibold text-white">
                        {page.aiAnalysisCompletedLabel || "AI Analysis Completed:"}
                      </span>{" "}
                      {selectedApplication.hasAiSummary ? common.yes || "Yes" : common.no || "No"}
                    </p>
                    <p>
                      <span className="font-semibold text-white">
                        {page.emailLabel || "Candidate Email:"}
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

                {selectedApplication.status === "Accepted" && selectedApplication.contactMethod && (
                  <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/[0.06] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                    <h2 className="mb-4 text-[20px] font-extrabold">
                      {page.contactInfoTitle || "Contact info sent to candidate"}
                    </h2>
                    <p className="text-[15px] leading-6 text-white/70">
                      <span className="font-semibold text-white">{page.contactMethodLabel || "Contact method"}: </span>
                      {contactMethodLabel(t, selectedApplication.contactMethod, selectedApplication.contactMethodOther)}
                    </p>
                    {selectedApplication.contactMessage && (
                      <p className="mt-3 whitespace-pre-line text-[15px] leading-6 text-white/70">
                        {selectedApplication.contactMessage}
                      </p>
                    )}
                  </div>
                )}

                {selectedApplication.status === "Rejected" && selectedApplication.rejectionReason && (
                  <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/[0.06] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                    <h2 className="mb-4 text-[20px] font-extrabold">
                      {page.rejectionReasonTitle || "Reason for rejection sent to candidate"}
                    </h2>
                    <p className="whitespace-pre-line text-[15px] leading-6 text-white/70">
                      {selectedApplication.rejectionReason}
                    </p>
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
                    disabled={isSendingMessage}
                    className="mb-4 w-full resize-none rounded-[18px] border border-white/10 bg-white/[0.06] px-5 py-4 text-[15px] leading-7 text-white outline-none placeholder:text-white/35 disabled:opacity-60"
                    placeholder={
                      page.writeMessage || "Write your message here..."
                    }
                  />

                  {contactModalError && (
                    <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {contactModalError}
                    </div>
                  )}

                  {contactModalSuccess && (
                    <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                      {page.messageSent || "Message sent!"}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={closeContactModal}
                      disabled={isSendingMessage}
                      className="rounded-[10px] bg-white/10 px-5 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {contactModalSuccess ? common.close || "Close" : common.cancel || "Cancel"}
                    </button>

                    {!contactModalSuccess && (
                      // שולח הודעה חופשית מהמעסיק למועמד דרך המערכת
                      <button
                        onClick={async () => {
                          if (!messageText.trim() || isSendingMessage) return;
                          setIsSendingMessage(true);
                          setContactModalError("");
                          try {
                            const data = await apiFetch("/api/messages", {
                              method: "POST",
                              body: JSON.stringify({
                                applicationId: selectedApplication.id,
                                content: messageText,
                              }),
                            });
                            if (!data.success) {
                              throw new Error(data.message || "Could not send the message.");
                            }
                            setContactModalSuccess(true);
                          } catch (err) {
                            setContactModalError(
                              err instanceof ApiError ? err.message : "Could not send the message. Please try again."
                            );
                          } finally {
                            setIsSendingMessage(false);
                          }
                        }}
                        disabled={isSendingMessage || !messageText.trim()}
                        className="inline-flex items-center gap-2 rounded-[10px] bg-[linear-gradient(135deg,#8b4dff,#b14dff)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(160,80,255,0.35)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSendingMessage && <Loader2 size={15} className="animate-spin" />}
                        {page.send || "Send"}
                      </button>
                    )}
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
                      {page.interviewLocation || "Location / Meeting Link"}
                    </label>
                    <input
                      type="text"
                      value={interviewLocation}
                      onChange={(e) => setInterviewLocation(e.target.value)}
                      className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                      placeholder={
                        page.interviewLocationPlaceholder ||
                        "e.g. https://zoom.us/j/... or the office address"
                      }
                    />
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

                  {interviewModalError && (
                    <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {interviewModalError}
                    </div>
                  )}

                  {interviewModalSuccess && (
                    <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                      {`${page.interviewScheduledWith || "Interview scheduled with"} ${selectedApplication.name}`}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={closeInterviewModal}
                      disabled={isSchedulingInterview}
                      className="rounded bg-white/10 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {interviewModalSuccess ? common.close || "Close" : common.cancel || "Cancel"}
                    </button>

                    {!interviewModalSuccess && (
                      // שולח לשרת בקשה לקביעת ראיון עם המועמד בתאריך/שעה/סוג שנבחרו
                      <button
                        onClick={async () => {
                          if (!interviewDate || !interviewTime || isSchedulingInterview) {
                            if (!interviewDate || !interviewTime) {
                              setInterviewModalError(page.interviewDateTimeRequired || "Please choose a date and time.");
                            }
                            return;
                          }

                          setIsSchedulingInterview(true);
                          setInterviewModalError("");
                          try {
                            const data = await apiFetch("/api/interviews", {
                              method: "POST",
                              body: JSON.stringify({
                                applicationId: selectedApplication.id,
                                scheduledAt: `${interviewDate}T${interviewTime}`,
                                type: interviewType,
                                location: interviewLocation,
                                notes: interviewNotes,
                              }),
                            });
                            if (!data.success) {
                              throw new Error(data.message || "Could not schedule the interview.");
                            }
                            setInterviewModalSuccess(true);
                          } catch (err) {
                            setInterviewModalError(
                              err instanceof ApiError ? err.message : "Could not schedule the interview. Please try again."
                            );
                          } finally {
                            setIsSchedulingInterview(false);
                          }
                        }}
                        disabled={isSchedulingInterview}
                        className="flex items-center gap-2 rounded bg-purple-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSchedulingInterview ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                        {page.confirmSchedule || "Confirm Schedule"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <AnimatePresence>
          {aiSummaryApplication && (
            <CandidateAiSummaryModal
              applicationId={aiSummaryApplication.id}
              candidateName={aiSummaryApplication.name}
              jobTitle={aiSummaryApplication.jobTitle}
              language={language}
              t={t}
              isRTL={isRTL}
              onClose={() => {
                const closedId = aiSummaryApplication.id;
                setAiSummaryApplication(null);

                if (selectedApplication?.id === closedId) {
                  fetchInlineAiSummary(closedId);
                }
              }}
              onScoreReady={(matchScore, matchLabel, recommendation) =>
                applyAiMatchScore(aiSummaryApplication.id, matchScore, matchLabel, recommendation)
              }
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {acceptTarget && (
            <AcceptApplicationModal
              candidateName={acceptTarget.name}
              jobTitle={acceptTarget.jobTitle}
              t={t}
              isRTL={isRTL}
              onConfirm={handleConfirmAccept}
              onCancel={() => setAcceptTarget(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {rejectTarget && (
            <RejectApplicationModal
              candidateName={rejectTarget.name}
              jobTitle={rejectTarget.jobTitle}
              t={t}
              isRTL={isRTL}
              onConfirm={handleConfirmReject}
              onCancel={() => setRejectTarget(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CandidateProgressSteps({ steps }: { steps: ProgressStep[] }) {
  return (
    <div className="space-y-4">
      {steps.map((step) => {
        const Icon =
          step.state === "rejected" ? XCircle : step.state === "completed" ? CheckCircle : Clock3;

        const circleClass =
          step.state === "completed"
            ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-300"
            : step.state === "current"
            ? "border-[#7d86ff] bg-[#5964ff]/15 text-[#8f98ff]"
            : step.state === "rejected"
            ? "border-rose-400/30 bg-rose-500/15 text-rose-300"
            : "border-white/10 bg-white/5 text-white/30";

        const labelClass =
          step.state === "completed"
            ? "text-emerald-200"
            : step.state === "current"
            ? "text-white"
            : step.state === "rejected"
            ? "text-rose-300"
            : "text-white/40";

        return (
          <div key={step.key} className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${circleClass}`}>
              <Icon size={18} />
            </div>
            <span className={`text-sm font-semibold ${labelClass}`}>{step.label}</span>
            {step.state === "current" && (
              <span className="rounded-full border border-[#7d86ff]/40 bg-[#5964ff]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#b6bcff]">
                {"●"}
              </span>
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
