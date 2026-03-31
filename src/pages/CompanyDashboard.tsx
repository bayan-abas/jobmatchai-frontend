import { useNavigate } from "react-router-dom";
import {
  Plus,
  BriefcaseBusiness,
  Users,
  FileText,
  Star,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function CompanyDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === "ar" || language === "he";

  const companyName =
    localStorage.getItem("name") ||
    localStorage.getItem("companyName") ||
    "My Company";

  const stats = [
    {
      title: "Active Jobs",
      value: "12",
      icon: <BriefcaseBusiness size={20} />,
      iconWrap:
        "bg-[linear-gradient(135deg,rgba(104,88,255,0.22),rgba(126,90,255,0.18))] text-[#8f8dff]",
    },
    {
      title: "Total Candidates",
      value: "156",
      icon: <Users size={20} />,
      iconWrap:
        "bg-[linear-gradient(135deg,rgba(0,210,255,0.16),rgba(34,197,255,0.14))] text-[#2ed2ff]",
    },
    {
      title: "New Applications",
      value: "23",
      icon: <FileText size={20} />,
      iconWrap:
        "bg-[linear-gradient(135deg,rgba(255,176,58,0.16),rgba(255,140,0,0.16))] text-[#ffb84d]",
    },
    {
      title: "Hired This Month",
      value: "4",
      icon: <Star size={20} />,
      iconWrap:
        "bg-[linear-gradient(135deg,rgba(0,255,191,0.12),rgba(52,211,153,0.12))] text-[#39e3b2]",
    },
  ];

  const topCandidates = [
    {
      name: "Sarah Johnson",
      role: "Senior Frontend Developer",
      fit: "High Fit",
      fitClass: "bg-[#163f3a] text-[#5df0c2]",
      score: 95,
      initial: "S",
    },
    {
      name: "Michael Chen",
      role: "Full Stack Engineer",
      fit: "High Fit",
      fitClass: "bg-[#163f3a] text-[#5df0c2]",
      score: 91,
      initial: "M",
    },
    {
      name: "Emily Davis",
      role: "React Specialist",
      fit: "Medium Fit",
      fitClass: "bg-[#4c3b18] text-[#ffc857]",
      score: 88,
      initial: "E",
    },
  ];

  const recentActivity = [
    {
      name: "Sarah Johnson",
      role: "Senior Frontend Developer",
      status: "Shortlisted",
      statusClass: "bg-[rgba(29,190,255,0.12)] text-[#56d7ff]",
      time: "2 hours ago",
    },
    {
      name: "Michael Chen",
      role: "Full Stack Engineer",
      status: "Under Review",
      statusClass: "bg-[rgba(255,193,7,0.12)] text-[#ffd057]",
      time: "5 hours ago",
    },
    {
      name: "Emily Davis",
      role: "Frontend Developer",
      status: "AI Screening",
      statusClass: "bg-[rgba(168,85,247,0.14)] text-[#d38cff]",
      time: "1 day ago",
    },
    {
      name: "David Wilson",
      role: "Frontend Developer",
      status: "Applied",
      statusClass: "bg-[rgba(96,165,250,0.12)] text-[#7fc2ff]",
      time: "2 days ago",
    },
  ];

  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(87,57,255,0.24),transparent_24%),linear-gradient(90deg,#15124a_0%,#161354_38%,#121a58_100%)] ${
        isRTL ? "text-right" : "text-left"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(0,194,255,0.10),transparent_10%),radial-gradient(circle_at_62%_80%,rgba(116,80,255,0.10),transparent_18%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-8 pb-10 pt-8 max-[700px]:px-4">
        <div
          className={`mb-8 flex items-start justify-between gap-4 max-[900px]:flex-col ${
            isRTL ? "flex-row-reverse max-[900px]:items-end" : ""
          }`}
        >
          <div>
            <p className="mb-3 text-[14px] font-medium tracking-[0.18em] text-[#9ea7e9]/70 uppercase">
              Welcome back · {companyName}
            </p>

            <h1 className="text-[52px] font-extrabold leading-none text-white max-[900px]:text-[36px]">
              Company Dashboard
            </h1>

            <p className="mt-3 text-[24px] text-white/55 max-[900px]:text-[16px]">
              Manage your hiring pipeline with AI assistance
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/post-job")}
            className={`inline-flex items-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#7f6bff,#9b3ff5)] px-5 py-3 text-[16px] font-bold text-white shadow-[0_14px_30px_rgba(139,92,246,0.25)] transition hover:scale-[1.02] hover:opacity-95 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Plus size={18} />
            Post New Job
          </button>
        </div>

        <div className="mb-8 grid grid-cols-4 gap-4 max-[1150px]:grid-cols-2 max-[640px]:grid-cols-1">
          {stats.map((item) => (
            <div
              key={item.title}
              className="group rounded-[22px] border border-white/10 bg-[rgba(40,38,95,0.74)] px-5 py-5 shadow-[0_8px_30px_rgba(0,0,0,0.14)] backdrop-blur-[8px] transition hover:-translate-y-1 hover:bg-[rgba(48,46,108,0.82)]"
            >
              <div
                className={`mb-7 flex items-start justify-between ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-[42px] w-[42px] items-center justify-center rounded-[13px] ${item.iconWrap}`}
                >
                  {item.icon}
                </div>

                <ChevronRight
                  size={18}
                  className={`text-white/18 transition group-hover:text-white/35 ${
                    isRTL ? "rotate-180" : ""
                  }`}
                />
              </div>

              <h3 className="text-[30px] font-extrabold text-white">
                {item.value}
              </h3>
              <p className="mt-1 text-[14px] text-white/45">{item.title}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1.15fr_0.85fr] gap-6 max-[1100px]:grid-cols-1">
          <div className="rounded-[22px] border border-white/10 bg-[rgba(44,42,101,0.78)] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur-[10px]">
            <div
              className={`mb-6 flex items-start justify-between gap-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex items-start gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="mt-1 flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-[rgba(57,255,191,0.10)] text-[#2ee6b8]">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h2 className="text-[18px] font-extrabold text-white">
                    Top Matching Candidates
                  </h2>
                  <p className="mt-1 text-[14px] text-white/45">
                    AI-recommended for your openings
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/company-candidates")}
                className={`inline-flex items-center gap-2 text-[14px] font-bold text-[#2ee6b8] transition hover:opacity-90 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                View All
                <ArrowRight size={16} className={isRTL ? "rotate-180" : ""} />
              </button>
            </div>

            <div className="space-y-4">
              {topCandidates.map((candidate) => (
                <div
                  key={candidate.name}
                  className={`flex items-center gap-4 rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.04)] px-4 py-4 transition hover:bg-[rgba(255,255,255,0.06)] ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#6d6dff,#9b5cff)] text-lg font-bold text-white">
                    {candidate.initial}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className={`mb-1 flex items-center gap-2 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <h3 className="truncate text-[16px] font-extrabold text-white">
                        {candidate.name}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${candidate.fitClass}`}
                      >
                        {candidate.fit}
                      </span>
                    </div>

                    <p className="text-[14px] text-white/50">{candidate.role}</p>
                  </div>

                  <div
                    className={`flex items-center gap-4 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="relative flex h-[54px] w-[54px] items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(#44f28d ${candidate.score}%, rgba(255,255,255,0.08) ${candidate.score}% 100%)`,
                        }}
                      />
                      <div className="absolute inset-[5px] rounded-full bg-[#342f72]" />
                      <div className="relative z-10 text-[14px] font-extrabold text-white">
                        {candidate.score}%
                      </div>
                    </div>

                    <ChevronRight
                      size={18}
                      className={`text-white/20 ${isRTL ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-[rgba(44,42,101,0.78)] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur-[10px]">
            <div
              className={`mb-6 flex items-start gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="mt-1 flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-[rgba(255,176,58,0.14)] text-[#ffb84d]">
                <FileText size={18} />
              </div>

              <div>
                <h2 className="text-[18px] font-extrabold text-white">
                  Recent Activity
                </h2>
                <p className="mt-1 text-[14px] text-white/45">Applications</p>
              </div>
            </div>

            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div
                  key={`${item.name}-${item.time}`}
                  className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.04)] px-4 py-4 transition hover:bg-[rgba(255,255,255,0.06)]"
                >
                  <div
                    className={`mb-3 flex items-start justify-between gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div>
                      <h3 className="text-[15px] font-extrabold text-white">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-[14px] text-white/48">
                        {item.role}
                      </p>
                    </div>

                    <span className="text-[13px] text-white/35">{item.time}</span>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${item.statusClass}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDashboard;