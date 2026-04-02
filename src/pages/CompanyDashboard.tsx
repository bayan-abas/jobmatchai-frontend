import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Users,
  FileText,
  Star,
  Sparkles,
  ArrowRight,
  Plus,
  TrendingUp,
  Zap,
  Clock3,
  ChevronRight,
} from "lucide-react";

function CompanyDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Active Jobs",
      value: "12",
      icon: BriefcaseBusiness,
      iconBg: "bg-indigo-500/15",
      iconColor: "text-indigo-300",
    },
    {
      title: "Total Candidates",
      value: "156",
      icon: Users,
      iconBg: "bg-cyan-500/15",
      iconColor: "text-cyan-300",
    },
    {
      title: "New Applications",
      value: "23",
      icon: FileText,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-300",
    },
    {
      title: "Hired This Month",
      value: "4",
      icon: Star,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-300",
    },
  ];

  const topCandidates = [
    {
      name: "Sarah Johnson",
      role: "Senior Frontend Developer",
      fit: "High Fit",
      fitColor: "text-emerald-300",
      fitBg: "bg-emerald-500/10",
      score: 95,
      avatar: "S",
      avatarBg: "from-violet-500 to-purple-500",
    },
    {
      name: "Michael Chen",
      role: "Full Stack Engineer",
      fit: "High Fit",
      fitColor: "text-emerald-300",
      fitBg: "bg-emerald-500/10",
      score: 91,
      avatar: "M",
      avatarBg: "from-indigo-400 to-fuchsia-500",
    },
    {
      name: "Emily Davis",
      role: "React Specialist",
      fit: "Medium Fit",
      fitColor: "text-amber-300",
      fitBg: "bg-amber-500/10",
      score: 88,
      avatar: "E",
      avatarBg: "from-blue-400 to-purple-500",
    },
  ];

  const recentApplications = [
    {
      name: "Sarah Johnson",
      role: "Senior Frontend Developer",
      time: "2 hours ago",
      status: "Shortlisted",
      statusClass:
        "bg-cyan-500/12 text-cyan-300 border-cyan-400/25",
    },
    {
      name: "Michael Chen",
      role: "Full Stack Engineer",
      time: "5 hours ago",
      status: "Under Review",
      statusClass:
        "bg-amber-500/12 text-amber-300 border-amber-400/25",
    },
    {
      name: "Emily Davis",
      role: "Frontend Developer",
      time: "1 day ago",
      status: "AI Screening",
      statusClass:
        "bg-fuchsia-500/12 text-fuchsia-300 border-fuchsia-400/25",
    },
    {
      name: "David Wilson",
      role: "Frontend Developer",
      time: "2 days ago",
      status: "Applied",
      statusClass:
        "bg-blue-500/12 text-blue-300 border-blue-400/25",
    },
    {
      name: "Jessica Martinez",
      role: "Senior Frontend Developer",
      time: "5 days ago",
      status: "Final Decision",
      statusClass:
        "bg-indigo-500/12 text-indigo-300 border-indigo-400/25",
    },
  ];

  const insights = [
    {
      title: "Tip",
      text: "3 candidates are highly matched but haven’t been reviewed in 5+ days.",
      icon: "💡",
    },
    {
      title: "Trend",
      text: "Application rate increased 25% this week for your Frontend role.",
      icon: "📈",
    },
    {
      title: "Action",
      text: "2 shortlisted candidates are awaiting final decision.",
      icon: "⚡",
    },
  ];

  const scoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-300 border-emerald-400/30";
    if (score >= 85) return "text-cyan-300 border-cyan-400/30";
    return "text-amber-300 border-amber-400/30";
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#102a56_100%)] px-6 pb-10 pt-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1700px]">
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[rgba(18,22,74,0.58)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 top-20 h-52 w-52 rounded-full bg-cyan-500/10 blur-[90px]" />
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-violet-500/10 blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />
          </div>

          <div className="relative z-10">
            <div className="mb-8 flex flex-col gap-5 lg:mb-10 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  Company Dashboard
                </h1>
                <p className="mt-2 text-[15px] text-white/65 md:text-base">
                  Manage your hiring pipeline with AI assistance
                </p>
              </div>

              <button
                onClick={() => navigate("/postJob")}
                className="inline-flex items-center gap-2 self-start rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(99,102,241,0.35)] transition hover:scale-[1.02]"
              >
                <Plus size={18} />
                Post New Job
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.14)] transition hover:-translate-y-1 hover:bg-white/[0.065]"
                  >
                    <div className="mb-8 flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg} ${item.iconColor}`}
                      >
                        <Icon size={22} />
                      </div>

                      <ChevronRight
                        className="text-white/18 transition group-hover:text-white/35"
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

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.75fr_0.95fr]">
              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.14)] md:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-300">
                      <Sparkles size={20} />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Top Matching Candidates
                      </h2>
                      <p className="mt-1 text-sm text-white/55">
                        AI-recommended for your openings
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/company-candidates")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
                  >
                    View All
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  {topCandidates.map((candidate) => (
                    <button
                      key={candidate.name}
                      onClick={() => navigate("/company-candidates")}
                      className="flex w-full items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.045] px-4 py-4 text-left transition hover:bg-white/[0.07]"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${candidate.avatarBg} text-xl font-bold text-white`}
                        >
                          {candidate.avatar}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-lg font-bold text-white">
                              {candidate.name}
                            </h3>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${candidate.fitBg} ${candidate.fitColor} border-current/20`}
                            >
                              {candidate.fit}
                            </span>
                          </div>
                          <p className="truncate text-[15px] text-white/55">
                            {candidate.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-4">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-full border bg-white/[0.05] text-xl font-extrabold ${scoreColor(
                            candidate.score
                          )}`}
                        >
                          {candidate.score}%
                        </div>
                        <ChevronRight className="text-white/22" size={20} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.14)] md:p-6">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-300">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Recent Activity
                    </h2>
                    <p className="mt-1 text-sm text-white/55">
                      Applications
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div
                      key={`${app.name}-${app.time}`}
                      className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4 transition hover:bg-white/[0.065]"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {app.name}
                          </h3>
                          <p className="mt-1 text-[15px] text-white/55">
                            {app.role}
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-1 text-xs text-white/40">
                          <Clock3 size={14} />
                          {app.time}
                        </div>
                      </div>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${app.statusClass}`}
                      >
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate("/company-applications")}
                  className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3.5 text-sm font-bold text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                >
                  View All Applications
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-[30px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.14)] md:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/12 text-violet-300">
                  <TrendingUp size={20} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white">
                    AI Hiring Insights
                  </h2>
                  <p className="mt-1 text-sm text-white/55">
                    Smart recommendations for your hiring process
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {insights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5 transition hover:bg-white/[0.065]"
                  >
                    <div className="mb-3 flex items-center gap-2 text-white/75">
                      <span className="text-base">{item.icon}</span>
                      <h3 className="text-lg font-semibold text-white/85">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-[15px] leading-7 text-white/58">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.09),rgba(255,255,255,0.03))] p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/12 text-cyan-300">
                  <Zap size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Faster Hiring Flow
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
                  Better Candidate Quality
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
                  Smarter Job Management
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