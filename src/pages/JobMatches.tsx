import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock3,
  DollarSign,
  Landmark,
  MapPin,
  Scale,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Wallet,
  Wifi,
  Bookmark,
  Crown,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import {
  inferIndustry as sharedInferIndustry,
  inferLevel as sharedInferLevel,
  inferExperience as sharedInferExperience,
  inferRegion,
  INDUSTRY_KEYS,
  REGION_KEYS,
} from "../utils/jobInference";
import { formatSalary } from "../utils/formatSalary";
import { apiFetch, apiFetchWithRetry } from "../utils/api";
import { streamSessionMatches, fetchCurrentCvIdentity } from "../utils/matchScoreSession";
import { FREE_PLAN_LIMIT } from "../utils/applicationLimit";
import PreInterviewModal from "../components/PreInterviewModal";
import ApplicationSuccessModal from "../components/ApplicationSuccessModal";
import AiDisclaimer from "../components/AiDisclaimer";
import { ScoreRing, EmptyState, ListSkeleton, Reveal } from "../components/ui";

type BackendJob = {
  id?: number;
  title?: string;
  companyName?: string;
  location?: string;
  type?: string;
  salary?: string;
  description?: string;
  requirements?: string;
  skills?: string;
};

type Job = {
  id?: number;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  experience: string;
  salary: string;
  level: string;
  status: string;
  industry?: string;
  region?: string | null;
  type?: string;
  about?: string;
  requirementsText?: string;
};

type MatchScoreEntry = {
  matchPercent: number | null;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchedRequiredSkills: string[];
  matchedPreferredSkills: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];

  fieldRelated: boolean | null;

  insufficientData: boolean;

  generalVocationalRole: boolean;

  excludedFromListing: boolean;

  stale: boolean;
};

function JobMatches() {
  const navigate = useNavigate();
  const location = useLocation();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [industry, setIndustry] = useState("");
  const [seniority, setSeniority] = useState("");
  const [region, setRegion] = useState("");
  const [minSalary, setMinSalary] = useState(0);
  const [minMatch, setMinMatch] = useState(0);
  const [showSavedJobs, setShowSavedJobs] = useState(false);

  const [jobCategory, setJobCategory] = useState<"profession" | "vocational">("profession");

  const [matchYouFilter, setMatchYouFilter] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [reconnecting, setReconnecting] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [monthlyApplicationsCount, setMonthlyApplicationsCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [justAppliedJob, setJustAppliedJob] = useState<Job | null>(null);
  const [pendingApplyJob, setPendingApplyJob] = useState<Job | null>(null);
  const [matchScores, setMatchScores] = useState<Map<number, MatchScoreEntry>>(new Map());
  const [hasAnalysis, setHasAnalysis] = useState<boolean | null>(null);
  const [matchScoresLoading, setMatchScoresLoading] = useState(false);

  const [matchRetryNonce, setMatchRetryNonce] = useState(0);

  const staleRetryCountRef = useRef(0);
  const MAX_STALE_RETRIES = 5; // אחרי זה מפסיקים לנסות - מניחים שהניתוח נתקע

  const JOBS_PER_PAGE = 24;
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  // מעדכן את מספר העמוד ב-URL כדי שאפשר יהיה לשתף/לרענן ולהישאר באותו עמוד
  const goToPage = (nextPage: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(Math.max(1, nextPage)));
        return next;
      },
      { replace: true }
    );
  };

  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const savedJobs = useMemo(
    () => jobs.filter((job) => typeof job.id === "number" && savedJobIds.has(job.id)),
    [jobs, savedJobIds]
  );

  const [industryOpen, setIndustryOpen] = useState(false);
  const [seniorityOpen, setSeniorityOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);

  const industryRef = useRef<HTMLDivElement>(null);
  const seniorityRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language] || translations.en;
  const isRTL = language === "ar" || language === "he";

  // מחזיר את המייל והשם של המשתמש המחובר, בשימוש בכל קריאה שדורשת זיהוי מועמד
  const readCandidateIdentity = () => ({
    email: user?.email || "",
    name: user?.name || "Candidate",
  });

  // מנרמל מחרוזת (אותיות קטנות, בלי תווים מוזרים) כדי שהשוואות טקסט יעבדו טוב יותר
  const normalize = (value?: string) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^\w\s+#.-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const inferIndustry = sharedInferIndustry;
  const inferLevel = sharedInferLevel;
  const inferExperience = sharedInferExperience;

  // הופך משרה כפי שהיא מגיעה מהשרת למבנה Job של הפרונט, כולל השלמת שדות חסרים והסקת תעשייה/רמה/אזור
  const buildJobFromBackend = (backendJob: BackendJob): Job => {

    return {
      id: backendJob.id,
      title: backendJob.title || "Untitled Job",
      company: backendJob.companyName || "Unknown Company",
      location: backendJob.location || "Not specified",
      remote: normalize(backendJob.type).includes("remote"),
      experience: inferExperience(backendJob),
      salary: backendJob.salary || "Not specified",
      level: inferLevel(backendJob),
      status: "Active",
      industry: inferIndustry(backendJob),
      region: inferRegion(backendJob.location),
      type: backendJob.type || "Full-time",
      about: backendJob.description || "",
      requirementsText: backendJob.requirements || "",
    };
  };

  // טוען את כל המשרות מהשרת, ואם המשתמש מחובר גם טוען את ההגשות שלו כדי לדעת אילו משרות כבר הוגשו וכמה הגשות היו החודש
  const loadJobs = () => {
    setLoading(true);
    setFetchError("");
    apiFetchWithRetry(`/api/jobs/all`, {}, { onRetry: () => setReconnecting(true) })
      .then((data: BackendJob[]) => {
        const formattedJobs = data.map((job) => buildJobFromBackend(job));

        setJobs(formattedJobs);
        setFetchError("");
        setReconnecting(false);

        const identity = readCandidateIdentity();
        if (identity.email) {
          apiFetch(`/api/applications/candidate/${encodeURIComponent(identity.email)}`)
            .then((applications) => {
              const list = Array.isArray(applications) ? applications : [];
              const ids = list
                .map((application: any) => Number(application.jobId))
                .filter((id: number) => !Number.isNaN(id));

              setAppliedJobIds(ids);

              const currentMonthPrefix = new Date().toISOString().slice(0, 7);
              const thisMonthCount = list.filter(
                (application: any) =>
                  typeof application.appliedDate === "string" &&
                  application.appliedDate.startsWith(currentMonthPrefix)
              ).length;
              setMonthlyApplicationsCount(thisMonthCount);
            })
            .catch(() => {
              setAppliedJobIds([]);
              setMonthlyApplicationsCount(0);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        setJobs([]);
        setReconnecting(false);
        setFetchError(t.jobMatches.loadError || "Could not load jobs from the backend. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // טעינת המשרות פעם אחת כשהעמוד עולה
  useEffect(() => {
    loadJobs();

  }, []);

const industryOptions = ["allIndustries", ...INDUSTRY_KEYS];

  const seniorityOptions = ["allLevels", "entry", "mid", "senior", "lead"];

  const regionOptions = ["allRegions", ...REGION_KEYS];

  // אם הגענו לעמוד עם כותרת משרה מסוימת (למשל מהצ'אט), מנווטים ישר לדף הפרטים שלה
  useEffect(() => {
    const titleFromNav = location.state?.selectedJobTitle;
    if (!titleFromNav || jobs.length === 0) return;

    const found = jobs.find((job) => job.title === titleFromNav);
    if (found && found.id != null) {
      navigate(`/job-details/internal/${found.id}`);
    }

    window.history.replaceState({}, document.title);

  }, [location.state, jobs]);

  // סוגר את תפריטי הפילטרים הנפתחים (תעשייה/ותק/אזור) בלחיצה מחוץ להם
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (industryRef.current && !industryRef.current.contains(target)) {
        setIndustryOpen(false);
      }

      if (seniorityRef.current && !seniorityRef.current.contains(target)) {
        setSeniorityOpen(false);
      }

      if (regionRef.current && !regionRef.current.contains(target)) {
        setRegionOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // טוען את המשרות השמורות של המשתמש מהשרת, ובפעם הראשונה גם מהגר משרות שמורות ישנות מה-localStorage לשרת
  useEffect(() => {
    const identity = readCandidateIdentity();
    if (!identity.email) return;

    const loadSavedJobs = () => {
      apiFetch(`/api/saved-jobs/candidate/${encodeURIComponent(identity.email)}`)
        .then((rows: { jobId: number; jobType: string }[]) => {
          const ids = Array.isArray(rows)
            ? rows.filter((row) => row.jobType === "internal").map((row) => row.jobId)
            : [];
          setSavedJobIds(new Set(ids));
        })
        .catch(() => {});
    };

    if (!localStorage.getItem("savedJobsMigratedV1")) {
      let legacyJobs: Job[] = [];
      try {
        const stored = localStorage.getItem("savedJobs");
        legacyJobs = stored ? JSON.parse(stored) : [];
      } catch {
        legacyJobs = [];
      }

      const migratable = legacyJobs.filter((job) => typeof job.id === "number");
      Promise.all(
        migratable.map((job) =>
          apiFetch(`/api/saved-jobs/save`, {
            method: "POST",
            body: JSON.stringify({
              candidateEmail: identity.email,
              jobId: job.id,
              jobType: "internal",
              jobTitle: job.title,
              companyName: job.company,
              location: job.location,
              salary: job.salary,
            }),
          }).catch(() => {})
        )
      ).finally(() => {
        localStorage.setItem("savedJobsMigratedV1", "1");
        localStorage.removeItem("savedJobs");
        loadSavedJobs();
      });
    } else {
      loadSavedJobs();
    }

  }, []);

  // מוציא מספר שכר מתוך מחרוזת חופשית (עם ₪/k/פסיקים וכו') כדי שאפשר יהיה לסנן ולמיין לפיו
  const extractSalaryNumber = (salary: string) => {
    if (!salary) return 0;

    const normalized = String(salary)
      .toLowerCase()
      .replace(/,/g, "")
      .replace(/\$/g, "")
      .replace(/₪/g, "")
      .replace(/nis/g, "")
      .replace(/ils/g, "")
      .replace(/shekel/g, "")
      .replace(/שח/g, "")
      .replace(/שקל/g, "")
      .replace(/k/g, "000");

    const numbers = normalized.match(/\d+/g);

    if (!numbers || numbers.length === 0) return 0;

    return Math.max(...numbers.map((num) => Number(num)));
  };

  type MatchInfo =
    | { status: "loading" }
    | { status: "noAnalysis" }

    | { status: "insufficientData" }

    | { status: "noScore"; reason: string }

    | { status: "error"; reason: string }
    | {
        status: "scored";
        percent: number;
        reason: string;
        matchedSkills: string[];
        missingSkills: string[];
        matchedRequiredSkills: string[];
        matchedPreferredSkills: string[];
        missingRequiredSkills: string[];
        missingPreferredSkills: string[];
      };

  // מתרגם את הנתונים הגולמיים של ציון ההתאמה למשרה למצב תצוגה אחד ברור (טוען/אין ניתוח/שגיאה/מחושב וכו')
  const getMatchInfo = (job: Job): MatchInfo => {
    if (hasAnalysis === null) {
      return { status: "loading" };
    }

    if (!hasAnalysis) {
      return { status: "noAnalysis" };
    }

    const entry = typeof job.id === "number" ? matchScores.get(job.id) : undefined;
    if (!entry) {

      return matchScoresLoading ? { status: "loading" } : { status: "error", reason: "" };
    }

    if (entry.insufficientData) {
      return { status: "insufficientData" };
    }

    if (entry.fieldRelated === null) {
      return { status: "error", reason: entry.matchReason };
    }

    if (!entry.fieldRelated || entry.matchPercent === null) {
      return { status: "noScore", reason: entry.matchReason };
    }

    return {
      status: "scored",
      percent: entry.matchPercent,
      reason: entry.matchReason,
      matchedSkills: entry.matchedSkills,
      missingSkills: entry.missingSkills,
      matchedRequiredSkills: entry.matchedRequiredSkills,
      matchedPreferredSkills: entry.matchedPreferredSkills,
      missingRequiredSkills: entry.missingRequiredSkills,
      missingPreferredSkills: entry.missingPreferredSkills,
    };
  };

  // מסנן את כל המשרות לפי הפילטרים שנבחרו: תעשייה, ותק, אזור (או רימוט) ושכר מינימלי
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesIndustry = !industry || job.industry === industry;
      const matchesLevel =
        !seniority || job.level.toLowerCase() === seniority.toLowerCase();

      const matchesRegion = !region || job.remote || job.region === region;
      const jobSalary = extractSalaryNumber(job.salary);

      const matchesSalary = jobSalary === 0 ? true : jobSalary >= minSalary * 1000;

      return matchesIndustry && matchesLevel && matchesRegion && matchesSalary;
    });
  }, [jobs, industry, seniority, region, minSalary]);

  // מחלק את המשרות המסוננות לטאב "התאמה למקצוע" מול "משרות כלליות/מקצועיות אחרות", לפי ניתוח ה-AI
  const categorizedJobs = useMemo(() => {
    if (!matchYouFilter) {
      return filteredJobs;
    }
    return filteredJobs.filter((job) => {
      const entry = typeof job.id === "number" ? matchScores.get(job.id) : undefined;
      if (!entry) {
        return jobCategory === "profession";
      }
      if (entry.excludedFromListing) {
        return false;
      }
      return jobCategory === "vocational" ? entry.generalVocationalRole : !entry.generalVocationalRole;
    });
  }, [filteredJobs, matchScores, jobCategory, matchYouFilter]);

  // סופר כמה משרות מסווגות כ"כלליות/וקוקציונליות" כדי להציג את המספר על כפתור הטאב
  const vocationalJobsCount = useMemo(() => {
    return filteredJobs.filter((job) => {
      const entry = typeof job.id === "number" ? matchScores.get(job.id) : undefined;
      return entry ? entry.generalVocationalRole && !entry.excludedFromListing : false;
    }).length;
  }, [filteredJobs, matchScores]);

  // ממיין את המשרות לפי אחוז ההתאמה, מהגבוה לנמוך (משרות בלי ציון יורדות לסוף)
  const sortedJobs = useMemo(() => {
    return [...categorizedJobs].sort((a, b) => {
      const infoA = getMatchInfo(a);
      const infoB = getMatchInfo(b);
      const scoreA = infoA.status === "scored" ? infoA.percent : -1;
      const scoreB = infoB.status === "scored" ? infoB.percent : -1;
      return scoreB - scoreA;
    });

  }, [categorizedJobs, matchScores, hasAnalysis, matchScoresLoading]);

  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / JOBS_PER_PAGE));

  // חותך את הרשימה הממוינת לעמוד הנוכחי בלבד (עימוד)
  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * JOBS_PER_PAGE;
    return sortedJobs.slice(start, start + JOBS_PER_PAGE);
  }, [sortedJobs, page]);

  // כל שינוי בפילטרים מחזיר אותנו לעמוד 1, כדי לא להישאר בעמוד ריק
  useEffect(() => {
    goToPage(1);

  }, [industry, seniority, minSalary, jobCategory, matchYouFilter]);

  const skipNextPageScroll = useRef(true);
  // גולל חזרה לראש העמוד בכל מעבר עמוד, חוץ מהטעינה הראשונית
  useEffect(() => {
    if (skipNextPageScroll.current) {
      skipNextPageScroll.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // שולף בסטרימינג את ציוני ההתאמה של כל המשרות המסוננות מול קורות החיים של המשתמש, כשעדיפות למשרות שבעמוד הנוכחי
  useEffect(() => {
    const identity = readCandidateIdentity();
    if (!identity.email) {
      setHasAnalysis(false);
      return;
    }

    const allIds = filteredJobs
      .map((job) => job.id)
      .filter((id): id is number => typeof id === "number");

    if (allIds.length === 0) {
      return;
    }

    // קודם שולחים לחישוב את המשרות שבעמוד הנוכחי, כדי שהמשתמש יראה ציונים מהר
    const visibleIds = new Set(
      paginatedJobs.map((job) => job.id).filter((id): id is number => typeof id === "number")
    );
    const prioritizedIds = [
      ...allIds.filter((id) => visibleIds.has(id)),
      ...allIds.filter((id) => !visibleIds.has(id)),
    ];

    const controller = new AbortController();
    setMatchScoresLoading(true);

    let needsRetry = false;

    fetchCurrentCvIdentity().then((cvIdentity) => {
      if (controller.signal.aborted) return;

      streamSessionMatches(
        identity.email,
        "internal",
        cvIdentity,
        prioritizedIds,
        language,
        (jobId, entry) => {
          setHasAnalysis(true);
          // stale / fieldRelated null = השרת עוד מחשב את הציון (למשל CV הועלה מחדש) - נצטרך לרענן
          if (entry.stale || entry.fieldRelated === null) {
            needsRetry = true;
          }
          setMatchScores((prev) => {
            const next = new Map(prev);
            next.set(jobId, {
              matchPercent: entry.matchPercent,
              matchReason: entry.matchReason || "",
              matchedSkills: entry.matchedSkills || [],
              missingSkills: entry.missingSkills || [],
              matchedRequiredSkills: entry.matchedRequiredSkills || [],
              matchedPreferredSkills: entry.matchedPreferredSkills || [],
              missingRequiredSkills: entry.missingRequiredSkills || [],
              missingPreferredSkills: entry.missingPreferredSkills || [],
              fieldRelated: entry.fieldRelated === undefined ? true : entry.fieldRelated,
              insufficientData: entry.insufficientData === true,
              generalVocationalRole: entry.generalVocationalRole === true,
              excludedFromListing: entry.excludedFromListing === true,
              stale: entry.stale === true,
            });
            return next;
          });
        },
        (hasAnalysisResult) => {
          setHasAnalysis(hasAnalysisResult);
          setMatchScoresLoading(false);

          if (needsRetry && !controller.signal.aborted && staleRetryCountRef.current < MAX_STALE_RETRIES) {
            staleRetryCountRef.current += 1;
            // backoff הדרגתי - 12s, 16s, 20s... כדי לא להציף את השרת בזמן שהוא עדיין מחשב
            const delayMs = 8000 + staleRetryCountRef.current * 4000;
            window.setTimeout(() => {
              if (!controller.signal.aborted) {
                setMatchRetryNonce((n) => n + 1);
              }
            }, delayMs);
          } else if (!needsRetry) {
            staleRetryCountRef.current = 0;
          }
        },
        controller.signal
      );
    });

    return () => {
      controller.abort();
    };

  }, [filteredJobs, language, matchRetryNonce]);

  // סופר כמה משרות עומדות גם בפילטרים וגם באחוז ההתאמה המינימלי, למספר שמוצג למשתמש
  const matchingJobsCount = useMemo(() => {
    return categorizedJobs.filter((job) => {
      const info = getMatchInfo(job);
      return info.status === "scored" && info.percent >= minMatch;
    }).length;

  }, [categorizedJobs, minMatch, matchScores, hasAnalysis, matchScoresLoading]);

  // סופר כמה פילטרים פעילים כרגע, כדי להציג את המספר ליד "פילטרים חכמים"
  const activeFiltersCount =
    (industry ? 1 : 0) +
    (seniority ? 1 : 0) +
    (region ? 1 : 0) +
    (minSalary !== 0 ? 1 : 0) +
    (minMatch !== 0 ? 1 : 0) +
    (matchYouFilter ? 0 : 1);

  const isJobSaved = (job: Job) => {
    return typeof job.id === "number" && savedJobIds.has(job.id);
  };

  // שומר משרה: מעדכן את המצב מיד (עדכון אופטימי) ואז שולח לשרת, ומחזיר אחורה אם הבקשה נכשלת
  const handleSaveJob = (job: Job) => {
    if (typeof job.id !== "number") return;
    const jobId = job.id;

    setSavedJobIds((prev) => new Set(prev).add(jobId));

    const identity = readCandidateIdentity();
    if (!identity.email) return;

    apiFetch(`/api/saved-jobs/save`, {
      method: "POST",
      body: JSON.stringify({
        candidateEmail: identity.email,
        jobId,
        jobType: "internal",
        jobTitle: job.title,
        companyName: job.company,
        location: job.location,
        salary: job.salary,
      }),
    }).catch(() => {
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    });
  };

  // מסיר משרה מהשמורות באותה גישה - עדכון מיידי במסך ואז מחיקה בשרת, עם חזרה אחורה אם נכשל
  const handleRemoveSavedJob = (job: Job) => {
    if (typeof job.id !== "number") return;
    const jobId = job.id;

    setSavedJobIds((prev) => {
      const next = new Set(prev);
      next.delete(jobId);
      return next;
    });

    const identity = readCandidateIdentity();
    if (!identity.email) return;

    apiFetch(
      `/api/saved-jobs/candidate/${encodeURIComponent(identity.email)}/internal/${jobId}`,
      { method: "DELETE" }
    ).catch(() => {
      setSavedJobIds((prev) => new Set(prev).add(jobId));
    });
  };

  // מתג שמירה/הסרה - בוחר איזו פעולה להפעיל לפי המצב הנוכחי של המשרה
  const handleToggleSaveJob = (job: Job) => {
    if (isJobSaved(job)) {
      handleRemoveSavedJob(job);
    } else {
      handleSaveJob(job);
    }
  };

  const hasAppliedToJob = (job: Job) => {
    if (!job.id) return false;
    return appliedJobIds.includes(job.id);
  };

  // בודק שאפשר להגיש למשרה הזו (יש ID, לא הוגשה כבר, לא חרג ממכסת התוכנית החינמית, מחובר) ואז פותח את מודל ההגשה
  const handleApply = (job: Job) => {
    if (!job.id) {
      setApplyMessage(
        "This job is missing an ID, so the application cannot be submitted yet."
      );
      return;
    }

    if (hasAppliedToJob(job)) {
      setApplyMessage("You already applied to this job.");
      return;
    }

    if (monthlyApplicationsCount >= FREE_PLAN_LIMIT) {
      setShowUpgradeModal(true);
      setApplyMessage("");
      return;
    }

    const identity = readCandidateIdentity();

    if (!identity.email) {
      setApplyMessage("Please sign in again before applying.");
      return;
    }

    setApplyMessage("");
    setPendingApplyJob(job);
  };

  // שולח את הגשת המועמדות בפועל לשרת עם התשובות מהראיון המקדים, ומעדכן את רשימת ההגשות ומונה החודש בהצלחה
  const handleSubmitApplication = (answers: Record<string, string>) => {
    const job = pendingApplyJob;
    if (!job || !job.id) return;

    setApplyingJobId(job.id);

    apiFetch(`/api/applications/apply`, {
      method: "POST",
      body: JSON.stringify({
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.company,
        preInterviewAnswers: answers,
      }),
    })
      .then((data) => {
        if (data.success) {
          setAppliedJobIds((prev) => [...new Set([...prev, job.id as number])]);
          setMonthlyApplicationsCount((prev) => prev + 1);
          setJustAppliedJob(job);
        } else if (data.message && data.message.includes("free plan limit")) {
          setPendingApplyJob(null);
          setShowUpgradeModal(true);
        } else {
          setApplyMessage(data.message || "Could not submit application.");
        }
      })
      .catch(() => {
        setApplyMessage(
          "Could not submit application. Make sure the backend is running."
        );
      })
      .finally(() => {
        setApplyingJobId(null);
        setPendingApplyJob(null);
      });
  };

  const dropdownBase =
    "absolute left-0 right-0 top-full z-[60] mt-3 overflow-hidden rounded-[10px] border border-[#d9d9df] bg-[#f7f7f8] shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition-all duration-200";

  const dropdownAnimationOpen =
    "translate-y-0 opacity-100 scale-100 pointer-events-auto";

  const dropdownAnimationClosed =
    "pointer-events-none -translate-y-1 opacity-0 scale-[0.98]";

  // מציג כרטיס משרה בודד עם ציון ההתאמה, פרטי המשרה, כישורים תואמים/חסרים וכפתורי שמירה/הגשה
  const renderJobCard = (job: Job, index: number, fromSaved = false) => {
    const matchInfo = getMatchInfo(job);

    return (
      <article
        key={`${job.title}-${job.company}-${index}`}
        onClick={() => job.id != null && navigate(`/job-details/internal/${job.id}`)}
        className="group cursor-pointer rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition hover:border-white/20 hover:bg-[rgba(50,52,108,0.96)]"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex flex-col items-center justify-center md:justify-start">
            <div
              title={
                matchInfo.status === "noScore" || matchInfo.status === "error"
                  ? matchInfo.reason
                  : matchInfo.status === "insufficientData"
                    ? t.jobMatches.insufficientData
                    : undefined
              }
            >
              <ScoreRing
                percent={matchInfo.status === "scored" ? matchInfo.percent : null}
                size={98}
                pulse={matchInfo.status === "loading"}
                label={
                  matchInfo.status === "scored"
                    ? undefined
                    : matchInfo.status === "loading"
                      ? ""
                      : matchInfo.status === "error"
                        ? "!"
                        : matchInfo.status === "noScore"
                          ? "—"
                          : matchInfo.status === "insufficientData"
                            ? "ⓘ"
                            : "?"
                }
              />
            </div>

            {matchInfo.status === "loading" && (
              <span className="mt-2 text-[12px] font-medium text-white/40">
                {t.jobMatches.matchScoreLoading}
              </span>
            )}

            {matchInfo.status === "error" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMatchRetryNonce((n) => n + 1);
                }}
                className="mt-2 max-w-[110px] rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-center text-[11px] font-semibold text-amber-300/90 transition hover:bg-amber-400/20"
              >
                {t.jobMatches.matchScoreErrorRetry || "Couldn't compute - tap to retry"}
              </button>
            )}

            {matchInfo.status === "insufficientData" && (
              <span className="mt-2 max-w-[110px] text-center text-[11px] font-medium text-white/40">
                {t.jobMatches.insufficientData}
              </span>
            )}

            {matchInfo.status === "noAnalysis" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/resume-manager");
                }}
                className="mt-2 rounded-full border border-[#7c88ff]/30 bg-[#7c88ff]/15 px-3 py-1 text-center text-[11px] font-semibold text-[#c4b5fd] transition hover:bg-[#7c88ff]/25"
              >
                {t.jobMatches.analyzeCvForScore}
              </button>
            )}
          </div>

          <div className="flex-1">
            <div
              className={`mb-3 flex flex-wrap items-center gap-3 ${
                isRTL ? "md:flex-row-reverse" : ""
              }`}
            >
              <h2 className="text-[22px] font-extrabold text-white">{job.title}</h2>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                {t.jobMatches.statusActive || "Active"}
              </span>

              {fromSaved && (
                <span className="rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/15 px-3 py-1 text-sm font-semibold text-[#c4b5fd]">
                  Saved
                </span>
              )}
            </div>

            <div
              className={`mb-3 flex items-center gap-2 text-[#c4cae9] ${
                isRTL ? "flex-row-reverse justify-end md:justify-start" : ""
              }`}
            >
              <Building2 size={16} />
              <span className="text-[15px]">{job.company}</span>
            </div>

            <div
              className={`mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[#aeb4d6] ${
                isRTL ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{job.location}</span>
              </div>

              {job.remote && (
                <div className="flex items-center gap-2 text-cyan-300">
                  <Wifi size={16} />
                  <span>{t.jobMatches.remote || "Remote"}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <BriefcaseBusiness size={16} />
                <span>{job.experience}</span>
              </div>

              <div className="flex items-center gap-2">
                <Wallet size={16} />
                <span className="font-semibold text-emerald-300">{formatSalary(job.salary)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock3 size={16} />
                <span>{job.level}</span>
              </div>

              {job.industry && (
                <div className="flex items-center gap-2">
                  <Landmark size={16} />
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-[#d6dcff]">
                    {t.jobMatches[job.industry] || job.industry}
                  </span>
                </div>
              )}
            </div>

            {(() => {
              const matchInfo = getMatchInfo(job);
              if (matchInfo.status !== "scored") return null;

              const matchedSkills = matchInfo.matchedSkills;
              const missingSkills = matchInfo.missingSkills.slice(0, 4);
              const preferredSet = new Set(matchInfo.missingPreferredSkills);
              const matchedPreferredSet = new Set(matchInfo.matchedPreferredSkills);

              if (matchedSkills.length === 0 && missingSkills.length === 0) return null;

              return (
                <div className={`flex flex-wrap gap-2 ${isRTL ? "md:flex-row-reverse" : ""}`}>
                  {matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className={
                        matchedPreferredSet.has(skill)
                          ? "rounded-full border border-dashed border-emerald-400/30 bg-emerald-400/5 px-3 py-1 text-sm font-medium text-emerald-300/80"
                          : "rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300"
                      }
                    >
                      {skill}
                    </span>
                  ))}

                  {missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className={
                        preferredSet.has(skill)
                          ? "rounded-full border border-dashed border-amber-400/30 bg-amber-400/5 px-3 py-1 text-sm font-medium text-amber-300/80"
                          : "rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-sm font-semibold text-rose-300"
                      }
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {job.id != null && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSaveJob(job);
                }}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isJobSaved(job)
                    ? "border-[#8b5cf6]/40 bg-[#8b5cf6]/20 text-[#c4b5fd]"
                    : "border-white/15 bg-white/[0.06] text-white/80 hover:bg-white/[0.1] hover:text-white"
                }`}
              >
                <Bookmark size={16} className={isJobSaved(job) ? "fill-current" : ""} />
                {isJobSaved(job)
                  ? t.jobMatches.saved || "Saved"
                  : t.jobMatches.saveJob || "Save Job"}
              </button>
            )}

            {job.id != null && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply(job);
                }}
                disabled={hasAppliedToJob(job) || applyingJobId === job.id}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  hasAppliedToJob(job)
                    ? "cursor-not-allowed border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                }`}
              >
                {applyingJobId === job.id
                  ? t.jobMatches.applying || "Applying..."
                  : hasAppliedToJob(job)
                  ? t.jobMatches.applied || "Applied"
                  : t.jobMatches.applyNow || "Apply Now"}
              </button>
            )}

            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/30 transition group-hover:bg-white/5 group-hover:text-white/70"
            >
              <ChevronRight size={22} className={isRTL ? "rotate-180" : ""} />
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-7 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1080px]">
        {applyMessage && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-[15px] font-semibold text-white">
            {applyMessage}
          </div>
        )}

        {!showSavedJobs && (
          <>
            <section className="mb-8">
              <div
                className={`mb-5 flex flex-wrap items-center gap-3 ${
                  isRTL ? "flex-row-reverse justify-end" : "justify-start"
                }`}
              >
                <button
                  type="button"
                  onClick={() => navigate("/candidate-dashboard")}
                  className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
                  <span>{t.common?.back || "Back"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSavedJobs(true)}
                  className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Bookmark size={16} />
                  <span>Saved Jobs ({savedJobs.length})</span>
                </button>
              </div>

              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
                  <BriefcaseBusiness size={26} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-[42px] font-extrabold leading-tight text-white max-[640px]:text-[28px]">
                    {t.jobMatches.title}
                  </h1>
                  <p className="mt-2 text-[17px] text-[#aeb4d6]">
                    {t.jobMatches.subtitle}
                  </p>
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
                      loadJobs();
                    }}
                    className="rounded-full border border-rose-300/40 px-4 py-1.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
                  >
                    {t.common.retry}
                  </button>
                </div>
              )}

              <div className="mb-5 overflow-visible rounded-[28px] border border-white/10 bg-white/[0.05] px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                <div
                  className={`flex flex-wrap items-start justify-between gap-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className={`flex min-w-0 items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#5e66ff1f] text-[#7c88ff]">
                      <SlidersHorizontal size={24} />
                    </div>

                    <div className={`min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
                      <h3 className="text-[20px] font-extrabold text-white">
                        {t.jobMatches.smartFilters}
                      </h3>
                      <p className="mt-1 text-[15px] text-[#aeb4d6]">
                        {activeFiltersCount} {t.jobMatches.activeFilters}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-5 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <button
                      type="button"
                      className="text-[15px] font-semibold text-[#c8ccee] transition hover:text-white"
                      onClick={() => {
                        setIndustry("");
                        setSeniority("");
                        setRegion("");
                        setMinSalary(0);
                        setMinMatch(0);
                        setMatchYouFilter(true);
                      }}
                    >
                      {t.jobMatches.clearAll}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFiltersOpen((prev) => !prev)}
                      className="text-[#aeb4d6] transition hover:text-white"
                    >
                      {filtersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
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

                {filtersOpen && (
                  <>
                    <div className="my-5 h-px bg-white/10" />

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
                      <div ref={industryRef} className="relative overflow-visible">
                        <label
                          className={`mb-3 flex items-center gap-2 text-[15px] text-[#d7dbf7] ${
                            isRTL ? "flex-row-reverse justify-end" : ""
                          }`}
                        >
                          <Landmark size={17} />
                          <span>{t.jobMatches.industry}</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setIndustryOpen((prev) => !prev);
                            setSeniorityOpen(false);
                            setRegionOpen(false);
                          }}
                          className={`flex h-[48px] w-full items-center justify-between rounded-[12px] border border-white/10 bg-[#2a2f68] px-4 text-[15px] text-[#d7dbf7] outline-none transition hover:bg-[#313776] ${
                            isRTL ? "flex-row-reverse text-right" : "text-left"
                          }`}
                        >
                          <span className="truncate">
                            {industry ? t.jobMatches[industry] : t.jobMatches.allIndustries}
                          </span>

                          <ChevronDown
                            size={18}
                            className={`shrink-0 text-[#8d94bd] transition ${
                              industryOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <div
                          className={`${dropdownBase} ${
                            industryOpen ? dropdownAnimationOpen : dropdownAnimationClosed
                          }`}
                        >
                          <div className="max-h-[330px] overflow-y-auto py-1">
                            {industryOptions.map((item) => {
                              const isSelected =
                                (item === "allIndustries" && !industry) || industry === item;

                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => {
                                    setIndustry(item === "allIndustries" ? "" : item);
                                    setIndustryOpen(false);
                                  }}
                                  className={`block w-full px-4 py-3 text-[14px] text-[#1f1f1f] transition ${
                                    isRTL ? "text-right" : "text-left"
                                  } ${
                                    isSelected
                                      ? "bg-[#ececec] font-medium"
                                      : "bg-transparent hover:bg-[#ececec]"
                                  }`}
                                >
                                  {t.jobMatches[item]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div ref={seniorityRef} className="relative overflow-visible">
                        <label
                          className={`mb-3 flex items-center gap-2 text-[15px] text-[#d7dbf7] ${
                            isRTL ? "flex-row-reverse justify-end" : ""
                          }`}
                        >
                          <TrendingUp size={17} />
                          <span>{t.jobMatches.seniorityLevel}</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setSeniorityOpen((prev) => !prev);
                            setIndustryOpen(false);
                            setRegionOpen(false);
                          }}
                          className={`flex h-[48px] w-full items-center justify-between rounded-[12px] border border-white/10 bg-[#2a2f68] px-4 text-[15px] text-[#d7dbf7] outline-none transition hover:bg-[#313776] ${
                            isRTL ? "flex-row-reverse text-right" : "text-left"
                          }`}
                        >
                          <span className="truncate">
                            {seniority ? t.jobMatches[seniority] : t.jobMatches.allLevels}
                          </span>

                          <ChevronDown
                            size={18}
                            className={`shrink-0 text-[#8d94bd] transition ${
                              seniorityOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <div
                          className={`${dropdownBase} ${
                            seniorityOpen ? dropdownAnimationOpen : dropdownAnimationClosed
                          }`}
                        >
                          <div className="max-h-[330px] overflow-y-auto py-1">
                            {seniorityOptions.map((item) => {
                              const isSelected =
                                (item === "allLevels" && !seniority) || seniority === item;

                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => {
                                    setSeniority(item === "allLevels" ? "" : item);
                                    setSeniorityOpen(false);
                                  }}
                                  className={`block w-full px-4 py-3 text-[14px] text-[#1f1f1f] transition ${
                                    isRTL ? "text-right" : "text-left"
                                  } ${
                                    isSelected
                                      ? "bg-[#ececec] font-medium"
                                      : "bg-transparent hover:bg-[#ececec]"
                                  }`}
                                >
                                  {t.jobMatches[item]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div ref={regionRef} className="relative overflow-visible">
                        <label
                          className={`mb-3 flex items-center gap-2 text-[15px] text-[#d7dbf7] ${
                            isRTL ? "flex-row-reverse justify-end" : ""
                          }`}
                        >
                          <MapPin size={17} />
                          <span>{t.jobMatches.region}</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setRegionOpen((prev) => !prev);
                            setIndustryOpen(false);
                            setSeniorityOpen(false);
                          }}
                          className={`flex h-[48px] w-full items-center justify-between rounded-[12px] border border-white/10 bg-[#2a2f68] px-4 text-[15px] text-[#d7dbf7] outline-none transition hover:bg-[#313776] ${
                            isRTL ? "flex-row-reverse text-right" : "text-left"
                          }`}
                        >
                          <span className="truncate">
                            {region ? t.jobMatches[region] : t.jobMatches.allRegions}
                          </span>

                          <ChevronDown
                            size={18}
                            className={`shrink-0 text-[#8d94bd] transition ${
                              regionOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <div
                          className={`${dropdownBase} ${
                            regionOpen ? dropdownAnimationOpen : dropdownAnimationClosed
                          }`}
                        >
                          <div className="max-h-[330px] overflow-y-auto py-1">
                            {regionOptions.map((item) => {
                              const isSelected =
                                (item === "allRegions" && !region) || region === item;

                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => {
                                    setRegion(item === "allRegions" ? "" : item);
                                    setRegionOpen(false);
                                  }}
                                  className={`block w-full px-4 py-3 text-[14px] text-[#1f1f1f] transition ${
                                    isRTL ? "text-right" : "text-left"
                                  } ${
                                    isSelected
                                      ? "bg-[#ececec] font-medium"
                                      : "bg-transparent hover:bg-[#ececec]"
                                  }`}
                                >
                                  {t.jobMatches[item]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label
                          className={`mb-3 flex items-center gap-2 text-[15px] text-[#d7dbf7] ${
                            isRTL ? "flex-row-reverse justify-end" : ""
                          }`}
                        >
                          <DollarSign size={17} />
                          <span>
                            {t.jobMatches.minSalary}: ₪{minSalary}k
                          </span>
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

                      <div>
                        <label
                          className={`mb-3 flex items-center gap-2 text-[15px] text-[#d7dbf7] ${
                            isRTL ? "flex-row-reverse justify-end" : ""
                          }`}
                        >
                          <Target size={17} />
                          <span>
                            {t.jobMatches.minMatch}: {minMatch}%
                          </span>
                        </label>

                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={minMatch}
                          onChange={(e) => setMinMatch(Number(e.target.value))}
                          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#171a46]"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {hasAnalysis === true && matchScoresLoading && (
                <div
                  className={`mb-5 flex items-start gap-3 rounded-2xl border border-[#7c88ff55] bg-[#7c88ff14] px-5 py-4 text-white/85 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <span className="mt-0.5 shrink-0 text-lg leading-none">🤖</span>
                  <p className={`text-sm leading-6 ${isRTL ? "text-right" : "text-left"}`}>
                    <span className="font-bold text-white">
                      {t.jobMatches.analyzingBannerTitle}
                    </span>{" "}
                    {t.jobMatches.analyzingBannerSubtitle}
                  </p>
                </div>
              )}

              <div
                className={`mb-5 flex items-start gap-3 rounded-2xl border border-[#5e66ff55] bg-[#5e66ff14] px-5 py-4 text-white/80 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Scale size={18} className="mt-0.5 shrink-0 text-[#f6c453]" />
                <p className={`text-sm leading-6 ${isRTL ? "text-right" : "text-left"}`}>
                  <span className="font-bold text-white">
                    {t.jobMatches.fairMatchingTitle}
                  </span>{" "}
                  {t.jobMatches.fairMatchingText}
                </p>
              </div>

              <AiDisclaimer className="mb-5" />

              <p className={`text-[15px] text-[#aeb4d6] ${isRTL ? "text-right" : "text-left"}`}>
                {matchingJobsCount} {t.jobMatches.jobsMatchCriteria}
              </p>

              {matchYouFilter && hasAnalysis === true && vocationalJobsCount > 0 && (
                <div className={`mt-5 flex flex-wrap gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
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

              {matchYouFilter && jobCategory === "vocational" && (
                <p className={`mt-3 text-xs leading-5 text-white/45 ${isRTL ? "text-right" : "text-left"}`}>
                  {t.jobMatches.vocationalJobsNote}
                </p>
              )}
            </section>

            <section className="space-y-5">
              {loading && <ListSkeleton count={4} />}

              {!loading &&
                paginatedJobs.map((job, index) => (
                  <Reveal key={`${job.title}-${job.company}-${index}`} delay={Math.min(index * 0.05, 0.3)}>
                    {renderJobCard(job, index)}
                  </Reveal>
                ))}

              {!loading && paginatedJobs.length === 0 && (
                <EmptyState
                  icon={<BriefcaseBusiness size={26} />}
                  title={jobs.length === 0 ? t.jobMatches.noJobsFound : t.jobMatches.noFilteredMatches}
                />
              )}
            </section>

            {totalPages > 1 && (
              <div className={`mt-8 flex items-center justify-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <button
                  type="button"
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isRTL ? "הקודם" : "Previous"}
                </button>

                <span className="text-sm font-semibold text-[#aeb4d6]">
                  {t.common?.page || "Page"} {page} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isRTL ? "הבא" : "Next"}
                </button>
              </div>
            )}
          </>
        )}

        {showSavedJobs && (
          <section className="space-y-6">
            <div className={`mb-2 flex items-center ${isRTL ? "justify-end" : "justify-start"}`}>
              <button
                type="button"
                onClick={() => setShowSavedJobs(false)}
                className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
                <span>{t.common?.back || "Back"}</span>
              </button>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] px-7 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <h2 className="text-[28px] font-extrabold text-white">Saved Jobs</h2>
              <p className="mt-2 text-[16px] text-[#aeb4d6]">
                {savedJobs.length} saved job{savedJobs.length === 1 ? "" : "s"}
              </p>
            </div>

            {savedJobs.length > 0 ? (
              <section className="space-y-5">
                {savedJobs.map((job, index) => (
                  <Reveal key={`${job.title}-${job.company}-${index}`} delay={Math.min(index * 0.05, 0.3)}>
                    {renderJobCard(job, index, true)}
                  </Reveal>
                ))}
              </section>
            ) : (
              <EmptyState
                icon={<Bookmark size={26} />}
                title={t.jobMatches.noSavedJobsTitle}
                description={t.jobMatches.noSavedJobsText}
              />
            )}
          </section>
        )}

        <AnimatePresence>
          {pendingApplyJob && (
            <PreInterviewModal
              jobTitle={pendingApplyJob.title}
              isSubmitting={applyingJobId === pendingApplyJob.id}
              onCancel={() => setPendingApplyJob(null)}
              onSubmit={handleSubmitApplication}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {justAppliedJob && (
            <ApplicationSuccessModal
              jobTitle={justAppliedJob.title}
              companyName={justAppliedJob.company}
              copy={t.jobDetails.applySuccessModal}
              isRTL={isRTL}
              onClose={() => setJustAppliedJob(null)}
              onViewApplications={() => navigate("/applications")}
            />
          )}
        </AnimatePresence>

        {showUpgradeModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div
              dir={isRTL ? "rtl" : "ltr"}
              className="w-full max-w-[500px] rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,#181b58_0%,#101548_100%)] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.55)]"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] text-white shadow-[0_12px_42px_rgba(168,85,247,0.45)]">
                <Crown size={36} />
              </div>

              <h2 className="text-[32px] font-extrabold text-white">
                Upgrade to Premium
              </h2>

              <p className="mt-4 text-[16px] leading-7 text-[#c4cae9]">
                You reached the free plan limit. Upgrade to Premium to unlock
                unlimited applications, stronger AI insights, and advanced job
                matching tools.
              </p>

              <div className="mt-6 rounded-2xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 px-5 py-4">
                <p className="text-[15px] font-semibold text-[#e9d5ff]">
                  Free Plan Usage
                </p>
                <p className="mt-2 text-[42px] font-extrabold leading-none text-white">
                  {monthlyApplicationsCount}/{FREE_PLAN_LIMIT}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/payment")}
                  className="rounded-[18px] bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] px-6 py-4 text-[16px] font-bold text-white shadow-[0_10px_35px_rgba(168,85,247,0.4)] transition hover:scale-[1.02]"
                >
                  Upgrade Now
                </button>

                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="rounded-[18px] border border-white/10 bg-white/[0.04] px-6 py-4 text-[15px] font-semibold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobMatches;
