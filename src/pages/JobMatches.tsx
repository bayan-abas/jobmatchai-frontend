import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  Bookmark,
  Crown,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { getRingColor as getSharedRingColor } from "../utils/jobInference";
import { apiFetch } from "../utils/api";

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
  fieldRelated: boolean;
};

type JobDetailExtra = {
  about: string;
  requirements: string[];
  niceToHave: string[];
  improvementSuggestions: string[];
};

const FREE_PLAN_LIMIT = 10;

function JobMatches() {
  const navigate = useNavigate();
  const location = useLocation();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [industry, setIndustry] = useState("");
  const [seniority, setSeniority] = useState("");
  const [minSalary, setMinSalary] = useState(0);
  const [minMatch, setMinMatch] = useState(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedScrollY, setSavedScrollY] = useState(0);
  const [showSavedJobs, setShowSavedJobs] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [matchScores, setMatchScores] = useState<Map<number, MatchScoreEntry>>(new Map());
  const [hasAnalysis, setHasAnalysis] = useState<boolean | null>(null);
  const [matchScoresLoading, setMatchScoresLoading] = useState(false);

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
  const t = translations[language];
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

  const inferIndustry = (job: BackendJob) => {
    const text = normalize(
      `${job.title || ""} ${job.description || ""} ${job.requirements || ""} ${job.skills || ""} ${job.type || ""}`
    );

    if (
      text.includes("react") ||
      text.includes("java") ||
      text.includes("python") ||
      text.includes("javascript") ||
      text.includes("typescript") ||
      text.includes("developer") ||
      text.includes("programmer") ||
      text.includes("software") ||
      text.includes("frontend") ||
      text.includes("backend") ||
      text.includes("full stack") ||
      text.includes("data") ||
      text.includes("it") ||
      text.includes("cyber") ||
      text.includes("cloud") ||
      text.includes("network") ||
      text.includes("devops") ||
      text.includes("qa") ||
      text.includes("ui") ||
      text.includes("ux")
    ) {
      return "technology";
    }

    if (
      text.includes("engineer") ||
      text.includes("engineering") ||
      text.includes("autocad") ||
      text.includes("infrastructure") ||
      text.includes("civil") ||
      text.includes("mechanical") ||
      text.includes("electrical") ||
      text.includes("industrial") ||
      text.includes("chemical") ||
      text.includes("architect") ||
      text.includes("architecture")
    ) {
      return "engineering";
    }

    if (
      text.includes("medical") ||
      text.includes("health") ||
      text.includes("doctor") ||
      text.includes("nurse") ||
      text.includes("nursing") ||
      text.includes("hospital") ||
      text.includes("clinic") ||
      text.includes("pharmacy") ||
      text.includes("pharmacist") ||
      text.includes("dentist") ||
      text.includes("lab") ||
      text.includes("laboratory") ||
      text.includes("psychology")
    ) {
      return "healthcare";
    }

    if (
      text.includes("teacher") ||
      text.includes("teaching") ||
      text.includes("education") ||
      text.includes("learning") ||
      text.includes("school") ||
      text.includes("tutor") ||
      text.includes("professor") ||
      text.includes("lecturer")
    ) {
      return "education";
    }

    if (
      text.includes("account") ||
      text.includes("accounting") ||
      text.includes("finance") ||
      text.includes("financial") ||
      text.includes("bank") ||
      text.includes("banking") ||
      text.includes("tax") ||
      text.includes("insurance") ||
      text.includes("auditor") ||
      text.includes("economics")
    ) {
      return "finance";
    }

    if (
      text.includes("marketing") ||
      text.includes("seo") ||
      text.includes("content") ||
      text.includes("social media") ||
      text.includes("copywriter") ||
      text.includes("digital marketing") ||
      text.includes("advertising") ||
      text.includes("campaign")
    ) {
      return "marketing";
    }

    if (
      text.includes("retail") ||
      text.includes("store") ||
      text.includes("shop") ||
      text.includes("cashier") ||
      text.includes("supermarket") ||
      text.includes("pos") ||
      text.includes("sales associate")
    ) {
      return "retail";
    }

    if (
      text.includes("sales") ||
      text.includes("salesperson") ||
      text.includes("sales manager") ||
      text.includes("business development")
    ) {
      return "sales";
    }

    if (
      text.includes("customer service") ||
      text.includes("customer support") ||
      text.includes("call center") ||
      text.includes("support representative") ||
      text.includes("service representative")
    ) {
      return "customerService";
    }

    if (
      text.includes("hotel") ||
      text.includes("hospitality") ||
      text.includes("tourism") ||
      text.includes("guest")
    ) {
      return "hospitality";
    }

    if (
      text.includes("restaurant") ||
      text.includes("chef") ||
      text.includes("waiter") ||
      text.includes("barista") ||
      text.includes("kitchen") ||
      text.includes("cook") ||
      text.includes("food service") ||
      text.includes("baking")
    ) {
      return "restaurants";
    }

    if (
      text.includes("logistics") ||
      text.includes("shipping") ||
      text.includes("supply") ||
      text.includes("warehouse") ||
      text.includes("delivery") ||
      text.includes("driver") ||
      text.includes("transportation") ||
      text.includes("truck")
    ) {
      return "logistics";
    }

    if (
      text.includes("construction") ||
      text.includes("builder") ||
      text.includes("building") ||
      text.includes("plumbing") ||
      text.includes("carpentry") ||
      text.includes("electrician") ||
      text.includes("maintenance")
    ) {
      return "construction";
    }

    if (
      text.includes("factory") ||
      text.includes("manufacturing") ||
      text.includes("production") ||
      text.includes("machine operator") ||
      text.includes("packaging")
    ) {
      return "factory";
    }

    if (
      text.includes("security") ||
      text.includes("guard") ||
      text.includes("police") ||
      text.includes("military") ||
      text.includes("fire safety")
    ) {
      return "security";
    }

    if (
      text.includes("legal") ||
      text.includes("lawyer") ||
      text.includes("attorney") ||
      text.includes("law")
    ) {
      return "legal";
    }

    if (
      text.includes("office") ||
      text.includes("administration") ||
      text.includes("secretary") ||
      text.includes("secretarial") ||
      text.includes("assistant")
    ) {
      return "administration";
    }

    if (
      text.includes("hr") ||
      text.includes("human resources") ||
      text.includes("recruiter") ||
      text.includes("recruitment")
    ) {
      return "humanResources";
    }

    if (
      text.includes("real estate") ||
      text.includes("property") ||
      text.includes("broker")
    ) {
      return "realEstate";
    }

    if (
      text.includes("beauty") ||
      text.includes("makeup") ||
      text.includes("hairdresser") ||
      text.includes("nail")
    ) {
      return "beauty";
    }

    if (
      text.includes("cleaning") ||
      text.includes("housekeeping") ||
      text.includes("janitor") ||
      text.includes("laundry")
    ) {
      return "cleaning";
    }

    if (
      text.includes("agriculture") ||
      text.includes("farm") ||
      text.includes("farming")
    ) {
      return "agriculture";
    }

    if (
      text.includes("media") ||
      text.includes("journalism") ||
      text.includes("photography") ||
      text.includes("video editing") ||
      text.includes("animation")
    ) {
      return "media";
    }

    if (
      text.includes("design") ||
      text.includes("graphic") ||
      text.includes("interior design")
    ) {
      return "design";
    }

    if (
      text.includes("translation") ||
      text.includes("translator")
    ) {
      return "translation";
    }

    if (
      text.includes("writing") ||
      text.includes("writer")
    ) {
      return "writing";
    }

    return "general";
  };

  const inferLevel = (job: BackendJob) => {
    const text = normalize(`${job.title || ""} ${job.description || ""} ${job.requirements || ""}`);

    if (text.includes("lead") || text.includes("principal")) return "Lead";
    if (text.includes("senior") || text.includes("5+")) return "Senior";
    if (text.includes("junior") || text.includes("entry") || text.includes("0-1")) return "Entry";
    return "Mid";
  };

  const inferExperience = (job: BackendJob) => {
    const text = `${job.title || ""} ${job.description || ""} ${job.requirements || ""}`;
    const match = text.match(/(\d+)\+?\s*(years|year|yrs|yr)/i);

    if (match) return `${match[1]}+ years`;

    const level = inferLevel(job);
    if (level === "Entry") return "1+ years";
    if (level === "Senior") return "5+ years";
    if (level === "Lead") return "7+ years";
    return "2+ years";
  };

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
              const ids = Array.isArray(applications)
                ? applications
                    .map((application: any) => Number(application.jobId))
                    .filter((id: number) => !Number.isNaN(id))
                : [];

              setAppliedJobIds(ids);
            })
            .catch(() => {
              setAppliedJobIds([]);
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

  useEffect(() => {
    if (jobs.length === 0) return;

    const identity = readCandidateIdentity();
    if (!identity.email) {
      setHasAnalysis(false);
      setMatchScores(new Map());
      return;
    }

    const jobIds = jobs
      .map((job) => job.id)
      .filter((id): id is number => typeof id === "number");

    if (jobIds.length === 0) return;

    let cancelled = false;
    setMatchScoresLoading(true);

    apiFetch(`/api/jobs/match-scores`, {
      method: "POST",
      body: JSON.stringify({
        email: identity.email,
        jobIds,
        language,
      }),
    })
      .then((data: {
        hasAnalysis: boolean;
        matches: {
          jobId: number;
          fieldRelated?: boolean;
          matchPercent: number | null;
          matchReason: string;
          matchedSkills?: string[];
          missingSkills?: string[];
        }[];
      }) => {
        if (cancelled) return;

        setHasAnalysis(Boolean(data.hasAnalysis));

        const nextScores = new Map<number, MatchScoreEntry>();
        (data.matches || []).forEach((match) => {
          nextScores.set(match.jobId, {
            matchPercent: match.matchPercent,
            matchReason: match.matchReason,
            matchedSkills: match.matchedSkills || [],
            missingSkills: match.missingSkills || [],
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
        if (!cancelled) {
          setMatchScoresLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [jobs, language]);

  const jobDetailsMap: Record<string, JobDetailExtra> = {};

const industryOptions = [
 "allIndustries",

"technology",
"software",
"hardware",
"engineering",
"civilEngineering",
"mechanicalEngineering",
"electricalEngineering",
"industrialEngineering",
"chemicalEngineering",
"architecture",
"interiorDesign",
"construction",
"maintenance",
"plumbing",
"carpentry",
"electricity",
"mechanics",
"automotive",
"transportation",
"delivery",
"logistics",
"warehouse",
"supplyChain",
"shipping",
"customs",
"aviation",
"airportServices",
"marine",
"tourism",
"hospitality",
"hotelManagement",
"restaurants",
"foodService",
"chef",
"waiter",
"barista",
"baking",
"cashier",
"supermarket",
"retail",
"luxuryRetail",
"sales",
"customerService",
"customerSupport",
"callCenter",
"officeWork",
"administration",
"secretarial",
"management",
"projectManagement",
"business",
"consulting",
"humanResources",
"finance",
"accounting",
"banking",
"insurance",
"economics",
"marketing",
"digitalMarketing",
"seo",
"socialMedia",
"copywriting",
"contentCreation",
"media",
"journalism",
"photography",
"videoEditing",
"animation",
"music",
"fashion",
"beauty",
"fitness",
"sports",
"healthcare",
"medical",
"nursing",
"dentistry",
"pharmacy",
"laboratory",
"psychology",
"socialWork",
"elderCare",
"childcare",
"vet",
"education",
"teaching",
"research",
"mathematics",
"statistics",
"physics",
"chemistry",
"biotechnology",
"dataScience",
"ai",
"machineLearning",
"cybersecurity",
"networking",
"cloudComputing",
"devOps",
"qaTesting",
"gameDevelopment",
"uiux",
"telecommunications",
"ecommerce",
"translation",
"writing",
"legal",
"government",
"security",
"police",
"military",
"fireSafety",
"emergencyServices",
"ngo",
"religiousServices",
"factory",
"manufacturing",
"packaging",
"printing",
"agriculture",
"mining",
"oilGas",
"renewableEnergy",
"cleaning",
"housekeeping",
"laundry",
"realEstate",
"procurement",
"importExport",
"eventManagement",
"studentJobs",
"internship",
"partTime",
"fullTime",
"remoteWork",
"freelance",
"general",
  ];

  const seniorityOptions = ["allLevels", "entry", "mid", "senior", "lead"];

  useEffect(() => {
    const titleFromNav = location.state?.selectedJobTitle;
    if (!titleFromNav || jobs.length === 0) return;

    const found = jobs.find((job) => job.title === titleFromNav);
    if (found) {
      setSelectedJob(found);
      setShowSavedJobs(false);
    }

    window.history.replaceState({}, document.title);
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
    if (selectedJob) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [selectedJob]);

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
    | { status: "noScore"; reason: string }
    | {
        status: "scored";
        percent: number;
        reason: string;
        matchedSkills: string[];
        missingSkills: string[];
      };

  const getMatchInfo = (job: Job): MatchInfo => {
    if (matchScoresLoading || hasAnalysis === null) {
      return { status: "loading" };
    }

    if (!hasAnalysis) {
      return { status: "noAnalysis" };
    }

    const entry = typeof job.id === "number" ? matchScores.get(job.id) : undefined;
    if (!entry) {
      return { status: "noAnalysis" };
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

  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
      const matchesIndustry = !industry || job.industry === industry;
      const matchesLevel =
        !seniority || job.level.toLowerCase() === seniority.toLowerCase();
      const jobSalary = extractSalaryNumber(job.salary);
      const matchesSalary = jobSalary === 0 ? true : jobSalary >= minSalary;

      const info = getMatchInfo(job);
      const matchesScore = info.status === "scored" ? info.percent >= minMatch : true;

      return matchesIndustry && matchesLevel && matchesSalary && matchesScore;
    });

    return [...filtered].sort((a, b) => {
      const infoA = getMatchInfo(a);
      const infoB = getMatchInfo(b);
      const scoreA = infoA.status === "scored" ? infoA.percent : -1;
      const scoreB = infoB.status === "scored" ? infoB.percent : -1;
      return scoreB - scoreA;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, industry, seniority, minSalary, minMatch, matchScores, hasAnalysis, matchScoresLoading]);

  const activeFiltersCount =
    (industry ? 1 : 0) +
    (seniority ? 1 : 0) +
    (minSalary !== 0 ? 1 : 0) +
    (minMatch !== 0 ? 1 : 0);

  const getRingColor = (info: MatchInfo) =>
    getSharedRingColor(info.status, info.status === "scored" ? info.percent : 0);

  const selectedDetails = selectedJob ? jobDetailsMap[selectedJob.title] : undefined;

  const selectedMatchInfo = selectedJob ? getMatchInfo(selectedJob) : null;

  const derivedExperienceYears = (experience: string) => {
    const match = experience.match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  };

  const buildRequirementsList = (job: Job) => {
    if (job.requirementsText) {
      return job.requirementsText
        .split(/[,;\n|]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [
      `${job.experience} of relevant experience`,
      `Strong fit for ${job.level} level responsibilities`,
      "Good communication and teamwork skills",
      "Ability to learn quickly and work independently",
    ];
  };

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

    if (appliedJobIds.length >= FREE_PLAN_LIMIT) {
      setShowUpgradeModal(true);
      setApplyMessage("");
      return;
    }

    const identity = readCandidateIdentity();

    if (!identity.email) {
      setApplyMessage("Please sign in again before applying.");
      return;
    }

    setApplyingJobId(job.id);
    setApplyMessage("");

    apiFetch(`/api/applications/apply`, {
      method: "POST",
      body: JSON.stringify({
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.company,
        candidateEmail: identity.email,
        candidateName: identity.name,
      }),
    })
      .then((data) => {
        if (data.success) {
          setAppliedJobIds((prev) => [...new Set([...prev, job.id as number])]);
          setApplyMessage("Application submitted successfully.");
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
      });
  };

  const dropdownBase =
    "absolute left-0 right-0 top-full z-[60] mt-3 overflow-hidden rounded-[10px] border border-[#d9d9df] bg-[#f7f7f8] shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition-all duration-200";

  const dropdownAnimationOpen =
    "translate-y-0 opacity-100 scale-100 pointer-events-auto";

  const dropdownAnimationClosed =
    "pointer-events-none -translate-y-1 opacity-0 scale-[0.98]";

  const openJobDetails = (job: Job) => {
    setSavedScrollY(window.scrollY);
    setSelectedJob(job);
    setShowSavedJobs(false);
  };

  const renderJobCard = (job: Job, index: number, fromSaved = false) => {
    const matchInfo = getMatchInfo(job);
    const ringColor = getRingColor(matchInfo);
    const numeric = matchInfo.status === "scored" ? matchInfo.percent : 0;

    return (
      <article
        key={`${job.title}-${job.company}-${index}`}
        onClick={() => openJobDetails(job)}
        className="group cursor-pointer rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition hover:border-white/20 hover:bg-[rgba(50,52,108,0.96)]"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex flex-col items-center justify-center md:justify-start">
            <div className="relative h-[98px] w-[98px]">
              <div
                className={`h-full w-full rounded-full transition-all duration-[1800ms] ease-out ${
                  matchInfo.status === "loading" ? "animate-pulse" : ""
                }`}
                style={{
                  background:
                    matchInfo.status === "scored"
                      ? `conic-gradient(${ringColor} ${numeric * 3.6}deg, #2a2c5a 0deg)`
                      : "conic-gradient(#5f648a 360deg, #2a2c5a 0deg)",
                  boxShadow: matchInfo.status === "scored" ? `0 0 24px ${ringColor}22` : "0 0 0 rgba(0,0,0,0)",
                }}
              />

              <div className="absolute inset-[8px] flex items-center justify-center rounded-full bg-[#252654] text-[22px] font-extrabold text-white shadow-inner">
                {matchInfo.status === "scored" ? `${matchInfo.percent}%` : matchInfo.status === "loading" ? "" : "?"}
              </div>
            </div>

            {matchInfo.status === "loading" && (
              <span className="mt-2 text-[12px] font-medium text-white/40">
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
                <span className="font-semibold text-emerald-300">{job.salary}</span>
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

          <div className="flex items-center justify-end gap-2">
            {fromSaved && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSavedJob(job);
                }}
                className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/20"
              >
                Remove
              </button>
            )}

            {job.id != null && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/job-details/internal/${job.id}`);
                }}
                className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.1] hover:text-white"
              >
                {t.jobMatches.viewFullDetails || "View Full Details"}
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
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[#101548] px-4 text-center text-2xl font-bold text-white">
        Loading jobs...
      </div>
    );
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-7 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1080px]">
        {!selectedJob && !showSavedJobs && (
          <>
            <section className="mb-8">
              <div
                className={`mb-5 flex items-center gap-3 ${
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
                  onClick={() => {
                    setShowSavedJobs(true);
                    setSelectedJob(null);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Bookmark size={16} />
                  <span>Saved Jobs ({savedJobs.length})</span>
                </button>
              </div>

              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
                  <BriefcaseBusiness size={26} />
                </div>

                <div>
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
                  className={`flex items-start justify-between gap-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5e66ff1f] text-[#7c88ff]">
                      <SlidersHorizontal size={24} />
                    </div>

                    <div className={isRTL ? "text-right" : "text-left"}>
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
                            {t.jobMatches.minSalary}: ${minSalary}k
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
                {filteredJobs.length} {t.jobMatches.jobsMatchCriteria}
              </p>
            </section>

            <section className="space-y-5">
              {filteredJobs.map((job, index) => renderJobCard(job, index))}
            </section>
          </>
        )}

        {!selectedJob && showSavedJobs && (
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

        {selectedJob && (
          <section className="space-y-6">
            <div className={`mb-2 flex items-center ${isRTL ? "justify-end" : "justify-start"}`}>
              <button
                type="button"
                onClick={() => {
                  setSelectedJob(null);

                  setTimeout(() => {
                    window.scrollTo({
                      top: savedScrollY,
                      left: 0,
                      behavior: "instant" as ScrollBehavior,
                    });
                  }, 0);
                }}
                className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
                <span>{t.common?.back || "Back"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              {/* Left Column: Main Job Content */}
              <div className="space-y-6">
                <div className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] px-7 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                  <div className={`mb-4 flex flex-wrap items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <h1 className="text-[28px] font-extrabold text-white lg:text-[34px]">
                      {selectedJob.title}
                    </h1>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-base font-semibold text-emerald-300">
                      {selectedJob.status}
                    </span>
                  </div>

                  <div className={`mb-4 flex items-center gap-2 text-[#c4cae9] ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Building2 size={18} />
                    <span className="text-[16px]">{selectedJob.company}</span>
                  </div>

                  <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 text-[16px] text-[#aeb4d6] ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="flex items-center gap-2">
                      <MapPin size={18} />
                      <span>{selectedJob.location}</span>
                    </div>
                    {selectedJob.remote && (
                      <div className="flex items-center gap-2 text-cyan-300">
                        <Wifi size={18} />
                        <span>{t.jobMatches.remote || "Remote"}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Wallet size={18} />
                      <span className="font-semibold text-emerald-300">
                        {selectedJob.salary}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 size={18} />
                      <span>{selectedJob.level}</span>
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <p className="text-sm text-[#aeb4d6]">Experience</p>
                      <p className="mt-2 text-[24px] font-extrabold text-white">
                        {derivedExperienceYears(selectedJob.experience)}+ yrs
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <p className="text-sm text-[#aeb4d6]">Level</p>
                      <p className="mt-2 text-[24px] font-extrabold text-white">
                        {selectedJob.level}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <p className="text-sm text-[#aeb4d6]">Industry</p>
                      <p className="mt-2 text-[24px] font-extrabold text-white">
                        {selectedJob.industry
                          ? t.jobMatches[selectedJob.industry] || selectedJob.industry
                          : "General"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-[22px] font-extrabold text-white">
                    <Zap size={20} className="text-[#facc15]" />
                    About the role
                  </h2>
                  <p className="leading-7 text-[#c4cae9]">
                    {selectedDetails?.about || selectedJob.about || `This role at ${selectedJob.company} is a strong opportunity for candidates with experience in ${selectedJob.level.toLowerCase()} level work and relevant industry knowledge.`}
                  </p>
                </div>

                <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-[22px] font-extrabold text-white">
                    <CheckCircle2 size={20} className="text-emerald-300" />
                    Requirements
                  </h2>
                  <ul className="space-y-3 text-[#c4cae9]">
                    {(selectedDetails?.requirements || buildRequirementsList(selectedJob)).map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 size={17} className="mt-1 shrink-0 text-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: AI Score, Actions & Insights */}
              <div className="space-y-6">
                <div className="sticky top-6 rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative h-[130px] w-[130px]">
                      <div
                        className={`h-full w-full rounded-full ${
                          selectedMatchInfo?.status === "loading" ? "animate-pulse" : ""
                        }`}
                        style={{
                          background:
                            selectedMatchInfo?.status === "scored"
                              ? `conic-gradient(${getRingColor(selectedMatchInfo)} ${selectedMatchInfo.percent * 3.6}deg, #2a2c5a 0deg)`
                              : "conic-gradient(#5f648a 360deg, #2a2c5a 0deg)",
                        }}
                      />
                      <div className="absolute inset-[10px] flex items-center justify-center rounded-full bg-[#252654] text-[32px] font-extrabold text-white">
                        {selectedMatchInfo?.status === "scored"
                          ? `${selectedMatchInfo.percent}%`
                          : selectedMatchInfo?.status === "loading"
                          ? ""
                          : "?"}
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-[#aeb4d6]">
                      {selectedMatchInfo?.status === "scored"
                        ? t.jobMatches.profileMatchScore
                        : selectedMatchInfo?.status === "noScore"
                        ? t.jobDetails.differentField
                        : selectedMatchInfo?.status === "loading"
                        ? t.jobMatches.matchScoreLoading
                        : t.jobMatches.noScoreAvailable}
                    </p>

                    {(selectedMatchInfo?.status === "scored" || selectedMatchInfo?.status === "noScore") &&
                      selectedMatchInfo.reason && (
                        <p className="mt-3 text-[13px] leading-6 text-[#c4cae9]" title={selectedMatchInfo.reason}>
                          {selectedMatchInfo.reason}
                        </p>
                      )}

                    {selectedMatchInfo?.status === "noAnalysis" && (
                      <button
                        type="button"
                        onClick={() => navigate("/resume-manager")}
                        className="mt-4 inline-flex items-center justify-center rounded-full border border-[#7c88ff]/30 bg-[#7c88ff]/15 px-4 py-2 text-sm font-semibold text-[#c4b5fd] transition hover:bg-[#7c88ff]/25"
                      >
                        {t.jobMatches.analyzeCvForScore}
                      </button>
                    )}
                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => handleApply(selectedJob)}
                      disabled={hasAppliedToJob(selectedJob) || applyingJobId === selectedJob.id}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)] transition ${
                        hasAppliedToJob(selectedJob)
                          ? "cursor-not-allowed bg-emerald-500/70"
                          : "bg-gradient-to-r from-[#7f4cff] to-[#a855f7] hover:scale-[1.02]"
                      }`}
                    >
                      <Send size={18} />
                      <span>
                        {applyingJobId === selectedJob.id
                          ? "Applying..."
                          : hasAppliedToJob(selectedJob)
                          ? "Applied"
                          : "Apply Now"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveJob(selectedJob)}
                      disabled={isJobSaved(selectedJob)}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-[15px] font-bold transition ${
                        isJobSaved(selectedJob)
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                          : "border-white/10 bg-white/5 text-[#dbe2ff] hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Bookmark size={18} />
                      <span>{isJobSaved(selectedJob) ? "Saved" : "Save Job"}</span>
                    </button>

                    {selectedJob.id != null && (
                      <button
                        type="button"
                        onClick={() => navigate(`/job-details/internal/${selectedJob.id}`)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-[15px] font-bold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white"
                      >
                        <Target size={18} />
                        <span>{t.jobMatches.viewFullDetails || "View Full Details"}</span>
                      </button>
                    )}
                  </div>

                  {applyMessage && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.05] p-3 text-center text-sm font-semibold text-[#dbe2ff]">
                      {applyMessage}
                    </div>
                  )}
                </div>

                {(() => {
                  const matchInfo = getMatchInfo(selectedJob);

                  if (matchInfo.status === "loading") {
                    return (
                      <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                        <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
                      </div>
                    );
                  }

                  if (matchInfo.status === "noAnalysis" || matchInfo.status === "noScore") {
                    return null;
                  }

                  const matchedSkills = matchInfo.matchedSkills;
                  const missingSkills = matchInfo.missingSkills;

                  return (
                    <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                      <h2 className="mb-4 text-[18px] font-extrabold text-white">Matched skills</h2>
                      {matchedSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {matchedSkills.map((skill) => (
                            <span key={skill} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#c4cae9]">No matched skills detected.</p>
                      )}

                      <h2 className="mb-4 mt-6 text-[18px] font-extrabold text-white flex items-center gap-2">
                        <AlertTriangle size={18} className="text-rose-300" />
                        Skills to improve
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {missingSkills.length > 0 ? (
                          missingSkills.map((skill) => (
                            <span key={skill} className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-300">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-[#c4cae9]">No specific missing skills detected.</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-[18px] font-extrabold text-white">
                    <Target size={18} className="text-cyan-300" />
                    AI suggestions
                  </h2>
                  <ul className="space-y-3 text-sm text-[#c4cae9]">
                    {(selectedDetails?.improvementSuggestions || [
                      "Keep your profile skills updated to improve matching accuracy",
                      "Add more specific target role information in your profile",
                      "Mention tools and skills that appear in the job description",
                    ]).map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cyan-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
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
                  {appliedJobIds.length}/{FREE_PLAN_LIMIT}
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