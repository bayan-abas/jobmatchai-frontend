import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  title: string;
  appliedFor: string;
  date: string;
  match: number;
  interviewScore: number;
  fit: FitLevel;
  stage: ApplicationStage;
  currentStep: number;
  email: string;
  phone: string;
  location: string;
  summary: string;
};

function CompanyApplications() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "All" | "New" | "Screening" | "Shortlisted" | "Decided"
  >("All");
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationItem | null>(null);

  const [applications, setApplications] = useState<ApplicationItem[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Frontend Developer",
      appliedFor: "Senior Frontend Developer",
      date: "10.1.2024",
      match: 95,
      interviewScore: 88,
      fit: "High Fit",
      stage: "Shortlisted",
      currentStep: 4,
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 234-5678",
      location: "Tel Aviv",
      summary:
        "Strong senior frontend candidate with excellent React, TypeScript, and system design skills.",
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Full Stack Engineer",
      appliedFor: "Full Stack Engineer",
      date: "12.1.2024",
      match: 91,
      interviewScore: 82,
      fit: "High Fit",
      stage: "Screening",
      currentStep: 3,
      email: "michael.chen@email.com",
      phone: "+1 (555) 456-8899",
      location: "Herzliya",
      summary:
        "Very balanced full stack engineer with strong backend capabilities and solid frontend knowledge.",
    },
    {
      id: 3,
      name: "Emily Davis",
      title: "React Specialist",
      appliedFor: "Frontend Developer",
      date: "15.1.2024",
      match: 88,
      interviewScore: 75,
      fit: "Medium Fit",
      stage: "New",
      currentStep: 2,
      email: "emily.davis@email.com",
      phone: "+1 (555) 992-1144",
      location: "Nazareth",
      summary:
        "Frontend-focused candidate with good UI implementation skills and promising technical fundamentals.",
    },
    {
      id: 4,
      name: "David Wilson",
      title: "Software Engineer",
      appliedFor: "Frontend Developer",
      date: "18.1.2024",
      match: 82,
      interviewScore: 70,
      fit: "Medium Fit",
      stage: "New",
      currentStep: 1,
      email: "david.wilson@email.com",
      phone: "+1 (555) 301-7788",
      location: "Acre",
      summary:
        "Junior-to-mid candidate with solid basics and good potential for growth in frontend roles.",
    },
    {
      id: 5,
      name: "Jessica Martinez",
      title: "Frontend Lead",
      appliedFor: "Senior Frontend Developer",
      date: "5.1.2024",
      match: 94,
      interviewScore: 92,
      fit: "High Fit",
      stage: "Decided",
      currentStep: 5,
      email: "jessica.martinez@email.com",
      phone: "+1 (555) 678-1122",
      location: "Haifa",
      summary:
        "Excellent leadership candidate with strong architecture, frontend strategy, and mentoring background.",
    },
  ]);

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

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const getFitStyles = (fit: FitLevel) => {
    if (fit === "High Fit") {
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20";
    }
    if (fit === "Medium Fit") {
      return "bg-amber-500/15 text-amber-300 border border-amber-400/20";
    }
    return "bg-rose-500/15 text-rose-300 border border-rose-400/20";
  };

  const handleAccept = (id: number) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              stage: "Decided",
              currentStep: 5,
            }
          : app
      )
    );
  };

  const handleReject = (id: number) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              stage: "Decided",
              currentStep: 5,
              fit: "Low Fit",
            }
          : app
      )
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(91,77,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.10),transparent_25%),linear-gradient(135deg,#151748_0%,#141755_45%,#0f143f_100%)] px-6 pb-10 pt-8 md:px-10 text-white">
      <div className="mx-auto max-w-6xl">
        {!selectedApplication ? (
          <>
            <button
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[15px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300 shadow-[0_10px_30px_rgba(249,115,22,0.15)]">
                <FileText size={28} />
              </div>

              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white">
                  Applications
                </h1>
                <p className="mt-2 text-[18px] text-white/60">
                  Manage and track all job applications
                </p>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2 rounded-[18px] border border-white/10 bg-white/[0.04] p-2 w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-[12px] px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab
                      ? "bg-[#5964ff]/30 text-[#cfd5ff] border border-[#7d86ff]/30"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#7b61ff] to-[#a855f7] text-2xl font-extrabold text-white shadow-[0_12px_28px_rgba(124,77,255,0.28)]">
                        {getInitial(app.name)}
                      </div>

                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-3">
                          <h2 className="text-[20px] font-extrabold text-white md:text-[24px]">
                            {app.name}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getFitStyles(
                              app.fit
                            )}`}
                          >
                            {app.fit}
                          </span>
                        </div>

                        <p className="text-[18px] text-white/70">{app.title}</p>

                        <p className="mt-2 text-sm text-white/45">
                          Applied for {app.appliedFor} • {app.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                      <div className="flex items-center gap-6">
                        <ScoreRing value={app.match} />

                        <div className="min-w-[70px]">
                          <p className="text-[14px] text-white/45">Interview</p>
                          <p className="text-[18px] font-extrabold text-white">
                            {app.interviewScore}%
                          </p>
                        </div>
                      </div>

                      <ApplicationSteps currentStep={app.currentStep} />

                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedApplication(app)}
                          className="inline-flex items-center gap-2 rounded-[12px] border border-[#6b78ff]/40 bg-[#5964ff]/10 px-4 py-2 text-sm font-semibold text-[#cfd5ff] transition hover:bg-[#5964ff]/20"
                        >
                          <Eye size={16} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAccept(app.id)}
                          className="inline-flex items-center gap-2 rounded-[12px] bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                        >
                          <CheckCircle2 size={16} />
                          Accept
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(app.id)}
                          className="inline-flex items-center gap-2 rounded-[12px] bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/30"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredApplications.length === 0 && (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-center text-white/65">
                  No applications found in this tab.
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelectedApplication(null)}
              className="mb-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[15px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex flex-1 gap-5">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#7b61ff] to-[#a855f7] text-5xl font-extrabold text-white shadow-[0_12px_28px_rgba(124,77,255,0.28)]">
                    {getInitial(selectedApplication.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h1 className="text-[26px] font-extrabold text-white md:text-[40px]">
                        {selectedApplication.name}
                      </h1>
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-bold ${getFitStyles(
                          selectedApplication.fit
                        )}`}
                      >
                        {selectedApplication.fit}
                      </span>
                    </div>

                    <p className="mb-4 text-[18px] text-white/70 md:text-[28px]">
                      {selectedApplication.title}
                    </p>

                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-[15px] text-white/60">
                      <span>{selectedApplication.location}</span>
                      <span>{selectedApplication.email}</span>
                      <span>{selectedApplication.phone}</span>
                      <span>{selectedApplication.appliedFor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 xl:w-[240px]">
                  <button className="flex items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#7f6bff,#9b3ff5)] px-5 py-3.5 text-[15px] font-bold text-white transition hover:opacity-95">
                    <Send size={17} />
                    Contact Candidate
                  </button>

                  <button className="flex items-center justify-center gap-2 rounded-[14px] border border-white/15 bg-white/[0.03] px-5 py-3.5 text-[15px] font-semibold text-[#b8c4ff] transition hover:bg-white/[0.06]">
                    <CheckCircle2 size={17} />
                    Accept Application
                  </button>

                  <button className="flex items-center justify-center gap-2 rounded-[14px] border border-rose-400/30 bg-rose-400/10 px-5 py-3.5 text-[15px] font-semibold text-rose-300 transition hover:bg-rose-400/15">
                    <XCircle size={17} />
                    Reject Application
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
                    <div>
                      <h2 className="text-[20px] font-extrabold">Application Analysis</h2>
                      <p className="text-sm text-white/50">AI-powered evaluation</p>
                    </div>
                  </div>

                  <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <StatCard label="Match Score" value={`${selectedApplication.match}%`} />
                    <StatCard label="Interview Score" value={`${selectedApplication.interviewScore}%`} />
                    <StatCard label="Stage" value={selectedApplication.stage} />
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5">
                    <h3 className="mb-4 text-[18px] font-bold">Hiring Summary</h3>
                    <p className="text-[16px] leading-8 text-white/75">
                      {selectedApplication.summary}
                    </p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-emerald-500/10 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                      <CheckCircle size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-violet-300">
                        Recommendation
                      </p>
                      <h3 className="text-[20px] font-extrabold text-emerald-300">
                        {selectedApplication.fit === "High Fit"
                          ? "Strong candidate for next stage"
                          : selectedApplication.fit === "Medium Fit"
                          ? "Worth reviewing carefully"
                          : "Lower priority candidate"}
                      </h3>
                    </div>
                  </div>

                  <p className="text-[15px] leading-7 text-white/75">
                    Based on the current scores and evaluation stage, this application
                    can be reviewed for the next hiring decision.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <h2 className="mb-5 text-[20px] font-extrabold">Progress</h2>
                  <ApplicationSteps currentStep={selectedApplication.currentStep} detailed />
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <h2 className="mb-4 text-[20px] font-extrabold">Application Info</h2>
                  <div className="space-y-3 text-[15px] text-white/70">
                    <p>
                      <span className="font-semibold text-white">Applied For:</span>{" "}
                      {selectedApplication.appliedFor}
                    </p>
                    <p>
                      <span className="font-semibold text-white">Date:</span>{" "}
                      {selectedApplication.date}
                    </p>
                    <p>
                      <span className="font-semibold text-white">Email:</span>{" "}
                      {selectedApplication.email}
                    </p>
                    <p>
                      <span className="font-semibold text-white">Phone:</span>{" "}
                      {selectedApplication.phone}
                    </p>
                    <p>
                      <span className="font-semibold text-white">Location:</span>{" "}
                      {selectedApplication.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  return (
    <div className="relative h-[72px] w-[72px]">
      <div
        className="h-full w-full rounded-full"
        style={{
          background: `conic-gradient(#8690ff ${value * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
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
}: {
  currentStep: number;
  detailed?: boolean;
}) {
  const steps = [
    { icon: Send, label: "Applied" },
    { icon: Brain, label: "Screening" },
    { icon: EyeStep, label: "Review" },
    { icon: Star, label: "Shortlisted" },
    { icon: CheckCircle, label: "Decision" },
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