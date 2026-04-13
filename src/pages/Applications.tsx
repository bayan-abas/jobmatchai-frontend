import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
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
} from "lucide-react";

type FilterType = "all" | "active" | "completed";

type ProgressStep = "applied" | "ai" | "review" | "shortlisted" | "final";

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

function CircleProgress({ percent }: { percent: string }) {
  const value = parseInt(percent.replace("%", ""));
  const size = 90;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = (num: number) => {
    if (num >= 90) return "#8b93ff";
    if (num >= 75) return "#7f4cff";
    return "#22d3ee";
  };

  return (
    <div className="relative h-[90px] w-[90px] shrink-0">
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(value)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
          style={{ filter: "drop-shadow(0 0 12px rgba(139,147,255,0.28))" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[18px] font-extrabold text-white">
        {percent}
      </div>
    </div>
  );
}

function Applications() {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ إضافة useLocation
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const applications: ApplicationItem[] = [
    {
      id: 1,
      percent: "92%",
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "Tel Aviv",
      date: "15/01/2024",
      score: "85%",
      progress: 3,
      status: "active",
      reviewStatus: "Under Review",
      about:
        "We are looking for a Senior Frontend Developer to join our growing team. You will lead the development of our web platform and mentor junior developers.",
      requirements: [
        "5+ years React experience",
        "TypeScript proficiency",
        "Experience with GraphQL",
        "Strong CSS/Tailwind skills",
      ],
      skills: ["React", "TypeScript", "GraphQL", "AWS", "Node.js"],
      preInterviewScore: "85%",
      preInterviewStrength: "Strong",
      preInterviewText:
        "Strong technical performance. Demonstrated deep React knowledge and solid problem-solving skills.",
      currentStep: "review",
    },
    {
      id: 2,
      percent: "87%",
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "Herzliya",
      date: "18/01/2024",
      score: "78%",
      progress: 2,
      status: "active",
      reviewStatus: "AI Screening",
      about:
        "Join our product engineering team to build scalable features across frontend and backend services in a fast-moving startup environment.",
      requirements: [
        "Experience with React and Node.js",
        "Good database knowledge",
        "REST API experience",
        "Team collaboration skills",
      ],
      skills: ["React", "Node.js", "PostgreSQL", "REST APIs", "AWS"],
      preInterviewScore: "78%",
      preInterviewStrength: "Good",
      preInterviewText:
        "Good overall fit. Strong engineering fundamentals with room to improve architectural depth.",
      currentStep: "ai",
    },
    {
      id: 3,
      percent: "85%",
      title: "React Developer",
      company: "InnovateLab",
      location: "Ramat Gan",
      date: "10/01/2024",
      score: "90%",
      progress: 4,
      status: "active",
      reviewStatus: "Shortlisted",
      about:
        "We need a React Developer to help us build elegant user experiences and collaborate closely with design and product teams.",
      requirements: [
        "Advanced React skills",
        "Clean component architecture",
        "Attention to UI detail",
        "Good communication",
      ],
      skills: ["React", "JavaScript", "Figma", "CSS", "Testing"],
      preInterviewScore: "90%",
      preInterviewStrength: "Excellent",
      preInterviewText:
        "Excellent UI thinking and strong implementation quality. Candidate shows clear product sense.",
      currentStep: "shortlisted",
    },
    {
      id: 4,
      percent: "80%",
      title: "UX Engineer",
      company: "DesignCo",
      location: "Remote",
      date: "20/01/2024",
      pending: "Pre-interview pending",
      progress: 1,
      status: "active",
      reviewStatus: "Applied",
      about:
        "DesignCo is seeking a UX Engineer who can bridge design systems and frontend implementation across modern digital products.",
      requirements: [
        "Figma and design systems experience",
        "Frontend implementation ability",
        "Strong UX understanding",
        "Cross-functional collaboration",
      ],
      skills: ["Figma", "Design Systems", "HTML", "CSS", "Accessibility"],
      preInterviewText:
        "Pre-interview has not been completed yet. Assessment will appear here once available.",
      currentStep: "applied",
    },
    {
      id: 5,
      percent: "88%",
      title: "Software Architect",
      company: "Enterprise Inc",
      location: "Haifa",
      date: "05/01/2024",
      score: "92%",
      progress: 5,
      status: "completed",
      reviewStatus: "Final Decision",
      about:
        "Enterprise Inc is hiring a Software Architect to lead architecture decisions, guide technical standards, and shape long-term platform strategy.",
      requirements: [
        "Architecture leadership experience",
        "Distributed systems knowledge",
        "Strong mentoring skills",
        "Cloud infrastructure understanding",
      ],
      skills: ["Architecture", "Microservices", "AWS", "Leadership", "Security"],
      preInterviewScore: "92%",
      preInterviewStrength: "Outstanding",
      preInterviewText:
        "Outstanding senior-level performance. Strong system design thinking and leadership readiness.",
      currentStep: "final",
    },
  ];

  // ✅ التعديل الرئيسي: قراءة الـ id من navigation state وفتح الطلب مباشرة
  useEffect(() => {
    const idFromNav = location.state?.selectedApplicationId;
    if (idFromNav) {
      const found = applications.find((a) => a.id === idFromNav);
      if (found) {
        setSelectedId(found.id);
      }
      // تنظيف الـ state
      window.history.replaceState({}, document.title);
    }
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (filter === "all") return true;
      return app.status === filter;
    });
  }, [filter]);

  const selectedApplication =
    applications.find((app) => app.id === selectedId) ?? null;

  const filterButtonClass = (value: FilterType) =>
    `rounded-[18px] px-8 py-3 text-[18px] font-semibold transition ${
      filter === value
        ? "bg-indigo-500/25 text-indigo-200 shadow-[0_0_0_1px_rgba(129,140,248,0.16)]"
        : "text-white/60 hover:bg-white/[0.04] hover:text-white"
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
    { key: "applied", label: "Applied", icon: Send },
    { key: "ai", label: "AI Screening", icon: Brain },
    { key: "review", label: "Under Review", icon: Eye },
    { key: "shortlisted", label: "Shortlisted", icon: Star },
    { key: "final", label: "Final Decision", icon: CheckCircle2 },
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
          className={`flex h-[44px] w-[44px] items-center justify-center rounded-full border text-[16px] transition ${
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
            className={`mx-2 h-[2px] w-8 lg:w-10 ${
              index < progress ? "bg-cyan-400/70" : "bg-white/10"
            }`}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_24%),linear-gradient(135deg,#17184a_0%,#1a1b56_42%,#17234f_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1280px]">
        {!selectedApplication ? (
          <section>
            <button
              onClick={() => navigate("/candidate-dashboard")}
              className="mb-8 flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.05] px-7 py-3 text-[18px] font-semibold text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft size={20} />
              Back
            </button>

            <div className="mb-8 flex items-center gap-5">
              <div className="flex h-[74px] w-[74px] items-center justify-center rounded-[24px] bg-gradient-to-b from-sky-500 to-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.35)]">
                <FileText size={34} className="text-white" />
              </div>
              <div>
                <h1 className="text-[52px] font-extrabold leading-none text-white">
                  My Applications
                </h1>
                <p className="mt-3 text-[20px] text-white/60">
                  Track and manage your job applications
                </p>
              </div>
            </div>

            <div className="mb-12 inline-flex rounded-[22px] border border-white/10 bg-white/[0.05] p-1.5">
              <button onClick={() => setFilter("all")} className={filterButtonClass("all")}>
                All
              </button>
              <button onClick={() => setFilter("active")} className={filterButtonClass("active")}>
                Active
              </button>
              <button onClick={() => setFilter("completed")} className={filterButtonClass("completed")}>
                Completed
              </button>
            </div>

            <div className="space-y-6">
              {filteredApplications.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setSelectedId(app.id)}
                  className="w-full rounded-[34px] border border-white/10 bg-white/[0.07] px-6 py-7 text-left shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-sm transition hover:bg-white/[0.09] lg:px-9"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-6">
                      <CircleProgress percent={app.percent} />
                      <div className="min-w-0">
                        <h3 className="truncate text-[30px] font-extrabold text-white">
                          {app.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-5 text-[17px] text-white/55">
                          <span className="flex items-center gap-2">
                            <BriefcaseBusiness size={17} />
                            {app.company}
                          </span>
                          <span className="flex items-center gap-2">
                            <MapPin size={17} />
                            {app.location}
                          </span>
                        </div>
                        <p className="mt-3 text-[16px] text-white/40">
                          Applied {app.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center xl:justify-center">
                      {[1, 2, 3, 4, 5].map((step) => renderStep(step, app.progress))}
                    </div>

                    <div className="flex min-w-[190px] items-center justify-between gap-4 xl:justify-end">
                      <div className="text-right">
                        {app.pending ? (
                          <div className="rounded-full bg-yellow-500/20 px-5 py-2.5 text-[15px] font-semibold text-yellow-300">
                            {app.pending}
                          </div>
                        ) : (
                          <>
                            <h2 className="text-[44px] font-extrabold leading-none text-white">
                              {app.score}
                            </h2>
                            <p className="mt-2 text-[16px] text-white/50">
                              Interview Score
                            </p>
                          </>
                        )}
                      </div>
                      <span className="text-white/35 transition hover:text-white">
                        <ChevronRight size={34} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {filteredApplications.length === 0 && (
                <div className="rounded-[30px] border border-white/10 bg-white/[0.05] px-8 py-12 text-center">
                  <h3 className="text-[24px] font-bold text-white">
                    No applications found
                  </h3>
                  <p className="mt-2 text-white/55">
                    There are no applications in this section yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section>
            <button
              onClick={() => setSelectedId(null)}
              className="mb-9 flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.05] px-7 py-3 text-[18px] font-semibold text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft size={20} />
              Back
            </button>

            <div className="mb-8 rounded-[34px] border border-white/10 bg-white/[0.07] px-7 py-7 shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-sm lg:px-9">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                <CircleProgress percent={selectedApplication.percent} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <h1 className="truncate text-[38px] font-extrabold text-white">
                        {selectedApplication.title}
                      </h1>
                      <div className="mt-4 flex flex-wrap items-center gap-6 text-[18px] text-white/60">
                        <span className="flex items-center gap-2">
                          <BriefcaseBusiness size={18} />
                          {selectedApplication.company}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin size={18} />
                          {selectedApplication.location}
                        </span>
                        <span className="flex items-center gap-2">
                          <CalendarDays size={18} />
                          Applied {selectedApplication.date}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`shrink-0 rounded-full px-6 py-3 text-[16px] font-semibold ${statusBadgeClass(
                        selectedApplication.reviewStatus
                      )}`}
                    >
                      {selectedApplication.reviewStatus}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8 rounded-[34px] border border-white/10 bg-white/[0.07] px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-sm">
              <h2 className="mb-10 text-[26px] font-extrabold text-white">
                Application Progress
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
                      <p
                        className={`text-[15px] font-medium ${
                          isDone
                            ? "text-cyan-300"
                            : isCurrent
                              ? "text-indigo-300"
                              : "text-white/35"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-[34px] border border-white/10 bg-white/[0.07] px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-sm">
                <h2 className="mb-6 text-[24px] font-extrabold text-white">
                  About the Role
                </h2>
                <p className="mb-8 text-[18px] leading-10 text-white/70">
                  {selectedApplication.about}
                </p>
                <h3 className="mb-5 text-[18px] font-bold text-white">Requirements</h3>
                <div className="space-y-4">
                  {selectedApplication.requirements.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 text-[17px] text-white/70"
                    >
                      <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-indigo-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[34px] border border-white/10 bg-white/[0.07] px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-sm">
                <h2 className="mb-6 text-[24px] font-extrabold text-white">
                  Required Skills
                </h2>
                <div className="mb-10 flex flex-wrap gap-3">
                  {selectedApplication.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-[16px] font-semibold text-white/75"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <h3 className="mb-5 text-[22px] font-extrabold text-white">
                  Pre-Interview
                </h3>
                {selectedApplication.preInterviewScore ? (
                  <>
                    <div className="mb-4 flex items-end gap-4">
                      <span className="text-[42px] font-extrabold leading-none text-white">
                        {selectedApplication.preInterviewScore}
                      </span>
                      <div className="pb-1">
                        <p className="text-[18px] text-white/55">Interview Score</p>
                        <p className="text-[16px] font-semibold text-emerald-400">
                          {selectedApplication.preInterviewStrength}
                        </p>
                      </div>
                    </div>
                    <p className="text-[18px] leading-9 text-white/70">
                      {selectedApplication.preInterviewText}
                    </p>
                  </>
                ) : (
                  <p className="text-[18px] leading-9 text-white/65">
                    {selectedApplication.preInterviewText}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Applications;