import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  getRingColor as getSharedRingColor,
  inferIndustry as sharedInferIndustry,
  inferLevel as sharedInferLevel,
  inferExperience as sharedInferExperience,
  INDUSTRY_KEYS,
} from "../utils/jobInference";
import { formatSalary } from "../utils/formatSalary";
import { apiFetch } from "../utils/api";
import { streamSessionMatches, fetchCurrentCvIdentity } from "../utils/matchScoreSession";
import { FREE_PLAN_LIMIT } from "../utils/applicationLimit";
import LoadingScreen from "../components/LoadingScreen";
import PreInterviewModal from "../components/PreInterviewModal";
import ApplicationSuccessModal from "../components/ApplicationSuccessModal";

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
  type?: string;
  about?: string;
  requirementsText?: string;
};

type MatchScoreEntry = {
  matchPercent: number | null;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
  // true = AI decided this job matches the candidate's field; false = AI decided it doesn't
  // (a real verdict, with matchReason explaining why); null = the AI couldn't compute this
  // job's match at all (a transient failure, not a verdict) - the backend never caches this,
  // so it's worth retrying rather than treating it the same as a genuine field mismatch.
  fieldRelated: boolean | null;
  // True when the job posting itself was too thin to support a reliable comparison at all - a
  // deterministic backend verdict (see JobMatchService#isInsufficientJobData), never an AI call.
  insufficientData: boolean;
};

function JobMatches() {
  const navigate = useNavigate();
  const location = useLocation();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [industry, setIndustry] = useState("");
  const [seniority, setSeniority] = useState("");
  const [minSalary, setMinSalary] = useState(0);
  const [minMatch, setMinMatch] = useState(0);
  const [showSavedJobs, setShowSavedJobs] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
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

  // Jobs render immediately once fetched; match percentages stream in progressively (see the
  // streamSessionMatches effect below) rather than blocking the page.
  //
  // The current page number lives in the URL (?page=N), not local-only state, specifically so
  // that opening a job from, say, page 3 and then going back restores page 3 itself, not page 1
  // - see ScrollToTop.tsx, which restores the scroll position for this exact URL (path + query)
  // on back/forward navigation. goToPage below is the only way this should ever change.
  const JOBS_PER_PAGE = 24;
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

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

  const industryRef = useRef<HTMLDivElement>(null);
  const seniorityRef = useRef<HTMLDivElement>(null);

  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language] || translations.en;
  const isRTL = language === "ar" || language === "he";

  const readCandidateIdentity = () => ({
    email: user?.email || "",
    name: user?.name || "Candidate",
  });

  const normalize = (value?: string) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^\w\s+#.-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  // Delegates to the shared, single-source-of-truth implementations in utils/jobInference.ts
  // (also used by ExternalJobsPage) rather than keeping a second copy here - this file used to
  // have its own independent copy of all three, which is how a substring-matching bug (bare
  // "it"/"ui" keywords matching inside ordinary words like "hospital" or "position", so
  // healthcare/education jobs got misclassified as "technology") went unfixed here even after
  // being fixed in the shared copy.
  const inferIndustry = sharedInferIndustry;
  const inferLevel = sharedInferLevel;
  const inferExperience = sharedInferExperience;

  const buildJobFromBackend = (backendJob: BackendJob): Job => {
    // Skill match/miss tags are AI-computed (semantic, not substring matching) and
    // populated later from the /api/jobs/match-scores response — see getMatchInfo().
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
      type: backendJob.type || "Full-time",
      about: backendJob.description || "",
      requirementsText: backendJob.requirements || "",
    };
  };

  useEffect(() => {
    apiFetch(`/api/jobs/all`)
      .then((data: BackendJob[]) => {
        const formattedJobs = data.map((job) => buildJobFromBackend(job));

        setJobs(formattedJobs);
        setFetchError("");

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
        setFetchError("Could not load jobs from backend. Make sure Spring Boot is running.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Match-score fetching itself lives further down (after filteredJobs/paginatedJobs are
  // computed) - it only ever requests scores for the page of jobs actually on screen, not the
  // whole list. See that effect's own comment for why.

// The dropdown must only ever offer values inferIndustry() can actually return (see
// utils/jobInference.ts's INDUSTRY_KEYS) - this used to be a much larger, independently
// hand-written list of ~140 granular categories ("software", "cybersecurity", "callCenter",
// "hotelManagement", ...) that inferIndustry() never produces, so selecting almost any of
// them was guaranteed to show zero jobs no matter what data existed.
const industryOptions = ["allIndustries", ...INDUSTRY_KEYS];

  const seniorityOptions = ["allLevels", "entry", "mid", "senior", "lead"];

  useEffect(() => {
    const titleFromNav = location.state?.selectedJobTitle;
    if (!titleFromNav || jobs.length === 0) return;

    const found = jobs.find((job) => job.title === titleFromNav);
    if (found && found.id != null) {
      navigate(`/job-details/internal/${found.id}`);
    }

    window.history.replaceState({}, document.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, jobs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (industryRef.current && !industryRef.current.contains(target)) {
        setIndustryOpen(false);
      }

      if (seniorityRef.current && !seniorityRef.current.contains(target)) {
        setSeniorityOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // The job posting itself was too thin (title-only, no real requirements/skills) to support
    // a reliable comparison - a deterministic backend verdict, never an AI call spent confirming
    // it. Distinct from "error": this is stable/cached, not something a refresh will change.
    | { status: "insufficientData" }
    // The AI tried and gave a real verdict that this job isn't a field match - matchReason
    // explains why, straight from the AI's own comparison of the CV and the job posting.
    | { status: "noScore"; reason: string }
    // The AI could not compute a score at all (a transient failure), not a verdict - never
    // shown as if it were a real "not a match" result, and never cached, so reloading retries.
    | { status: "error"; reason: string }
    | {
        status: "scored";
        percent: number;
        reason: string;
        matchedSkills: string[];
        missingSkills: string[];
      };

  const getMatchInfo = (job: Job): MatchInfo => {
    if (hasAnalysis === null) {
      return { status: "loading" };
    }

    if (!hasAnalysis) {
      return { status: "noAnalysis" };
    }

    // A job that already has a resolved entry (cached from a previous visit, or just arrived on
    // this one) must render it immediately - checking matchScoresLoading FIRST here used to force
    // every card back to "Calculating match score..." for as long as ANY job in the whole
    // (potentially hundreds-strong) batch was still pending, even ones that resolved instantly
    // (e.g. the deterministic insufficient-data gate, or an already-cached score from
    // sessionStorage). This is what made an already-scored job look like it was recalculating on
    // every single page visit.
    const entry = typeof job.id === "number" ? matchScores.get(job.id) : undefined;
    if (!entry) {
      // Genuinely nothing for this job yet - "loading" while the batch is still in flight is the
      // honest state; only once the WHOLE batch has settled (matchScoresLoading is false) does a
      // still-missing entry mean this specific job's computation gap, not "no CV" (hasAnalysis is
      // already known true above), so the "Analyze your CV" CTA would be misleading here.
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
    };
  };

  // Deliberately does NOT filter by match score/minMatch - every job passing the other filters
  // stays visible as a card (including a genuine "not a field match" or still-loading one) so the
  // candidate can keep browsing everything. minMatch only narrows the count below (see
  // matchingJobsCount), never which cards render - see matchingJobsCount's comment for why.
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesIndustry = !industry || job.industry === industry;
      const matchesLevel =
        !seniority || job.level.toLowerCase() === seniority.toLowerCase();
      const jobSalary = extractSalaryNumber(job.salary);
      // minSalary is the slider value in thousands (label reads "$Xk"), while
      // extractSalaryNumber returns the raw dollar figure - comparing them directly
      // made this filter pass almost everything regardless of slider position.
      const matchesSalary = jobSalary === 0 ? true : jobSalary >= minSalary * 1000;

      return matchesIndustry && matchesLevel && matchesSalary;
    });
  }, [jobs, industry, seniority, minSalary]);

  // Highest match percent first, always - recomputed on every score that arrives (matchScores
  // is a dependency below), so the list keeps re-sorting itself as results stream in rather than
  // settling into place only once. Jobs with no verdict yet (still calculating, or a genuine
  // "not a field match") sort after every scored job, using Array.sort's stable-sort guarantee
  // to keep their relative order steady between renders instead of visibly shuffling among
  // themselves on every unrelated score update - never job id/date/company, only match percent.
  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      const infoA = getMatchInfo(a);
      const infoB = getMatchInfo(b);
      const scoreA = infoA.status === "scored" ? infoA.percent : -1;
      const scoreB = infoB.status === "scored" ? infoB.percent : -1;
      return scoreB - scoreA;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredJobs, matchScores, hasAnalysis, matchScoresLoading]);

  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / JOBS_PER_PAGE));

  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * JOBS_PER_PAGE;
    return sortedJobs.slice(start, start + JOBS_PER_PAGE);
  }, [sortedJobs, page]);

  // Changing a filter changes which jobs exist on "page 1" - always land back there instead of
  // potentially showing an out-of-range empty page. Deliberately does NOT depend on `jobs` (the
  // fetched list) - only on the filters themselves, which only change via explicit user
  // interaction - so the initial data load on mount never fights the page number restored from
  // the URL (see the page/goToPage comment above) by silently resetting it back to 1. A re-sort
  // triggered by an arriving score does NOT reset page either - the candidate's chosen page
  // number is preserved even as which jobs occupy it may change (see sortedJobs above).
  useEffect(() => {
    goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industry, seniority, minSalary]);

  // Smooth-scrolls to top whenever the candidate changes page WHILE already on this page
  // (Previous/Next, or the filter-triggered reset above) - otherwise the new page's jobs render
  // starting from wherever they had scrolled to previously. Deliberately skipped on this
  // component's very first render: when the page number was just restored from the URL (see
  // above) after coming back from a job's details, ScrollToTop.tsx already restores the exact
  // scroll offset, and forcing a scroll-to-top here would immediately fight that.
  const skipNextPageScroll = useRef(true);
  useEffect(() => {
    if (skipNextPageScroll.current) {
      skipNextPageScroll.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // Progressive match scoring for every filtered job (not just the current page) - the correct
  // sort order above depends on knowing every job's score, not only the visible page's. Streamed
  // rather than blocking (see utils/matchScoreSession.ts's streamSessionMatches), so results
  // still render one card at a time as they resolve instead of the whole list waiting on the
  // slowest job, and the currently-visible page's jobs are requested first so what the candidate
  // is actually looking at resolves before jobs further down the (still-unsorted-by-score) list.
  // Already-cached jobs (this session, or ever computed server-side) resolve instantly.
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

    const visibleIds = new Set(
      paginatedJobs.map((job) => job.id).filter((id): id is number => typeof id === "number")
    );
    const prioritizedIds = [
      ...allIds.filter((id) => visibleIds.has(id)),
      ...allIds.filter((id) => !visibleIds.has(id)),
    ];

    const controller = new AbortController();
    setMatchScoresLoading(true);

    // Always resolved fresh (never assumed/cached client-side) before touching the session
    // cache - this is what lets a deleted/replaced CV self-correct: a stale bucket left over
    // from the previous CV simply won't match this identity and gets bypassed (see
    // utils/matchScoreSession.ts).
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
          setMatchScores((prev) => {
            const next = new Map(prev);
            next.set(jobId, {
              matchPercent: entry.matchPercent,
              matchReason: entry.matchReason || "",
              matchedSkills: entry.matchedSkills || [],
              missingSkills: entry.missingSkills || [],
              fieldRelated: entry.fieldRelated === undefined ? true : entry.fieldRelated,
              insufficientData: entry.insufficientData === true,
            });
            return next;
          });
        },
        (hasAnalysisResult) => {
          setHasAnalysis(hasAnalysisResult);
          setMatchScoresLoading(false);
        },
        controller.signal
      );
    });

    return () => {
      controller.abort();
    };
    // Deliberately keyed on filteredJobs (not paginatedJobs/page) - changing page must not
    // restart this fetch, since every filtered job is already being requested up front.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredJobs, language]);

  // The headline count candidates actually care about: of the jobs currently shown (after
  // industry/seniority/salary), how many are REAL matches - the AI gave this job a genuine
  // field-related score, and that score clears the Min Match slider. A "noScore" (unrelated
  // field), still-"loading", or "error" card stays visible for browsing (see filteredJobs above)
  // but must never count as a "match" here regardless of the slider position. Climbs as scores
  // stream in for the full filtered list (see the streaming effect above), not just the page
  // currently on screen.
  const matchingJobsCount = useMemo(() => {
    return filteredJobs.filter((job) => {
      const info = getMatchInfo(job);
      return info.status === "scored" && info.percent >= minMatch;
    }).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredJobs, minMatch, matchScores, hasAnalysis, matchScoresLoading]);

  const activeFiltersCount =
    (industry ? 1 : 0) +
    (seniority ? 1 : 0) +
    (minSalary !== 0 ? 1 : 0) +
    (minMatch !== 0 ? 1 : 0);

  const getRingColor = (info: MatchInfo) =>
    getSharedRingColor(info.status, info.status === "scored" ? info.percent : 0);

  const isJobSaved = (job: Job) => {
    return typeof job.id === "number" && savedJobIds.has(job.id);
  };

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

  const renderJobCard = (job: Job, index: number, fromSaved = false) => {
    const matchInfo = getMatchInfo(job);
    const ringColor = getRingColor(matchInfo);
    const numeric = matchInfo.status === "scored" ? matchInfo.percent : 0;

    return (
      <article
        key={`${job.title}-${job.company}-${index}`}
        onClick={() => job.id != null && navigate(`/job-details/internal/${job.id}`)}
        className="group cursor-pointer rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition hover:border-white/20 hover:bg-[rgba(50,52,108,0.96)]"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex flex-col items-center justify-center md:justify-start">
            <div
              className="relative h-[98px] w-[98px]"
              title={
                matchInfo.status === "noScore" || matchInfo.status === "error"
                  ? matchInfo.reason
                  : matchInfo.status === "insufficientData"
                    ? t.jobMatches.insufficientData
                    : undefined
              }
            >
              <div
                className={`h-full w-full rounded-full transition-all duration-[1800ms] ease-out ${
                  matchInfo.status === "loading" ? "animate-pulse" : ""
                }`}
                style={{
                  background:
                    matchInfo.status === "scored"
                      ? `conic-gradient(${ringColor} ${numeric * 3.6}deg, #2a2c5a 0deg)`
                      : matchInfo.status === "error"
                        ? `conic-gradient(${ringColor} 360deg, #2a2c5a 0deg)`
                        : "conic-gradient(#5f648a 360deg, #2a2c5a 0deg)",
                  boxShadow:
                    matchInfo.status === "scored" || matchInfo.status === "error"
                      ? `0 0 24px ${ringColor}22`
                      : "0 0 0 rgba(0,0,0,0)",
                }}
              />

              <div className="absolute inset-[8px] flex items-center justify-center rounded-full bg-[#252654] text-[22px] font-extrabold text-white shadow-inner">
                {matchInfo.status === "scored"
                  ? `${matchInfo.percent}%`
                  : matchInfo.status === "loading"
                    ? ""
                    : matchInfo.status === "error"
                      ? "!"
                      : matchInfo.status === "noScore"
                        ? "—"
                        : matchInfo.status === "insufficientData"
                          ? "ⓘ"
                          : "?"}
              </div>
            </div>

            {matchInfo.status === "loading" && (
              <span className="mt-2 text-[12px] font-medium text-white/40">
                {t.jobMatches.matchScoreLoading}
              </span>
            )}

            {matchInfo.status === "error" && (
              <span className="mt-2 max-w-[110px] text-center text-[11px] font-medium text-amber-300/80">
                Couldn't compute - refresh to retry
              </span>
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

              if (matchedSkills.length === 0 && missingSkills.length === 0) return null;

              return (
                <div className={`flex flex-wrap gap-2 ${isRTL ? "md:flex-row-reverse" : ""}`}>
                  {matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300"
                    >
                      {skill}
                    </span>
                  ))}

                  {missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-sm font-semibold text-rose-300"
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

  if (loading) {
    return <LoadingScreen message="Finding the best job matches for your profile..." />;
  }

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
                  <h1 className="text-[42px] font-extrabold leading-tight text-white">
                    {t.jobMatches.title}
                  </h1>
                  <p className="mt-2 text-[17px] text-[#aeb4d6]">
                    {t.jobMatches.subtitle}
                  </p>
                </div>
              </div>

              {fetchError && (
                <div className="mb-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-5 py-4 text-rose-200">
                  {fetchError}
                </div>
              )}

              {!fetchError && jobs.length === 0 && (
                <div className="mb-5 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 text-yellow-100">
                  No jobs found in the database yet.
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
                        setMinSalary(0);
                        setMinMatch(0);
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

                {filtersOpen && (
                  <>
                    <div className="my-5 h-px bg-white/10" />

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
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

              {/* Only while there's a real CVAnalysis AND the batch hasn't fully settled yet -
                  never shown for the "no CV" case (nothing is actually being calculated then),
                  and disappears the moment matchScoresLoading flips false (every requested job
                  has been accounted for), matching getMatchInfo's own per-job "loading" gate. */}
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

              <p className={`text-[15px] text-[#aeb4d6] ${isRTL ? "text-right" : "text-left"}`}>
                {matchingJobsCount} {t.jobMatches.jobsMatchCriteria}
              </p>
            </section>

            <section className="space-y-5">
              {paginatedJobs.map((job, index) => renderJobCard(job, index))}
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
                {savedJobs.map((job, index) => renderJobCard(job, index, true))}
              </section>
            ) : (
              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] px-7 py-10 text-center">
                <p className="text-[18px] font-semibold text-white">No saved jobs yet</p>
                <p className="mt-2 text-[#aeb4d6]">
                  Save jobs from the matches list and they will appear here.
                </p>
              </div>
            )}
          </section>
        )}

        {pendingApplyJob && (
          <PreInterviewModal
            jobTitle={pendingApplyJob.title}
            isSubmitting={applyingJobId === pendingApplyJob.id}
            onCancel={() => setPendingApplyJob(null)}
            onSubmit={handleSubmitApplication}
          />
        )}

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