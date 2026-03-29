import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import {
  Briefcase,
  FileText,
  CalendarDays,
  Sparkles,
  ChevronRight,
} from "lucide-react";

function CandidateDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const userName = localStorage.getItem("name") || "User";
  const isFirstLogin = localStorage.getItem("isFirstLogin") === "true";

  useEffect(() => {
    if (isFirstLogin) {
      localStorage.setItem("isFirstLogin", "false");
    }
  }, [isFirstLogin]);

  const profilePercent = 78;

  const stats = [
    {
      icon: <Briefcase size={22} />,
      value: "24",
      label: t.dashboard.stats.jobMatches,
      iconBg: "bg-[rgba(99,102,241,0.24)]",
      iconColor: "text-[#8ea2ff]",
      onClick: () => navigate("/job-matches"),
    },
    {
      icon: <FileText size={22} />,
      value: "8",
      label: t.dashboard.stats.applications,
      iconBg: "bg-[rgba(34,211,238,0.18)]",
      iconColor: "text-[#22d3ee]",
      onClick: () => navigate("/applications"),
    },
    {
      icon: <CalendarDays size={22} />,
      value: "3",
      label: t.dashboard.stats.interviews,
      iconBg: "bg-[rgba(52,211,153,0.18)]",
      iconColor: "text-[#34d399]",
    },
    {
      icon: <Sparkles size={22} />,
      value: "78%",
      label: t.dashboard.stats.profileScore,
      iconBg: "bg-[rgba(168,85,247,0.18)]",
      iconColor: "text-[#c084fc]",
    },
  ];

  const topMatches = [
    {
      score: 92,
      title: "Senior Frontend Developer",
      company: "Check Point • Tel Aviv",
    },
    {
      score: 87,
      title: "Full Stack Engineer",
      company: "Wix • Tel Aviv",
    },
    {
      score: 85,
      title: "React Developer",
      company: "Monday.com • Ramat Gan",
    },
  ];

  const applications = [
    {
      title: "Product Designer",
      company: "Fiverr",
      status: t.dashboard.applications.underReview,
      days: t.dashboard.applications.daysAgo2,
      statusClass:
        "bg-[rgba(255,190,47,0.16)] text-[#f7c948] border border-[rgba(255,190,47,0.35)]",
    },
    {
      title: "UX Engineer",
      company: "IronSource",
      status: t.dashboard.applications.aiScreening,
      days: t.dashboard.applications.daysAgo5,
      statusClass:
        "bg-[rgba(168,85,247,0.16)] text-[#d8a4ff] border border-[rgba(168,85,247,0.35)]",
    },
  ];

  const renderProgressCircle = (percent: number) => {
    const radius = 28;
    const stroke = 5;
    const normalizedRadius = radius;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset =
      circumference - (percent / 100) * circumference;

    return (
      <div className="relative flex h-[62px] w-[62px] items-center justify-center">
        <svg
          height="62"
          width="62"
          viewBox="0 0 62 62"
          className="-rotate-90"
        >
          <circle
            cx="31"
            cy="31"
            r={normalizedRadius}
            fill="transparent"
            stroke="rgba(65,228,143,0.16)"
            strokeWidth={stroke}
          />
          <circle
            cx="31"
            cy="31"
            r={normalizedRadius}
            fill="transparent"
            stroke="#41e48f"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        <div className="absolute text-[15px] font-extrabold text-white">
          {percent}%
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen bg-transparent pb-10 ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="px-8 py-5">
        <div className="mb-8">
          <h1 className="mb-2 text-[48px] font-extrabold leading-none text-white">
            {isFirstLogin
              ? `${t.dashboard.welcome}, ${userName}`
              : `${t.dashboard.welcomeBack}, ${userName}`}{" "}
            <span className="text-[38px]">👋</span>
          </h1>
          <p className="text-[17px] text-[#aeb4d6]">{t.dashboard.subtitle}</p>
        </div>

        <div className="mb-8 grid grid-cols-4 gap-4 max-[1300px]:grid-cols-2 max-[700px]:grid-cols-1">
          {stats.map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={stat.onClick}
              className={`rounded-[24px] border border-white/10 bg-[rgba(52,50,110,0.78)] px-5 py-5 text-inherit shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition hover:-translate-y-1 hover:bg-[rgba(58,56,122,0.92)] ${
                stat.onClick ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`mb-7 flex items-start justify-between ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-[46px] w-[46px] items-center justify-center rounded-[15px] ${stat.iconBg} ${stat.iconColor}`}
                >
                  {stat.icon}
                </div>
                <span className="text-[#747caf]">
                  <ChevronRight
                    size={22}
                    className={isRTL ? "rotate-180" : ""}
                  />
                </span>
              </div>

              <h2 className="mb-1 text-[44px] font-extrabold leading-none text-white">
                {stat.value}
              </h2>
              <p className="text-[16px] text-[#aeb4d6]">{stat.label}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[1.9fr_0.95fr] gap-6 max-[1300px]:grid-cols-1">
          <div className="rounded-[28px] border border-white/10 bg-[rgba(52,50,110,0.82)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
            <div
              className={`mb-6 flex items-center justify-between ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[15px] bg-[rgba(99,102,241,0.24)] text-[#8ea2ff]">
                  <Sparkles size={22} />
                </div>

                <div>
                  <h3 className="text-[21px] font-extrabold text-white">
                    {t.dashboard.topMatches.title}
                  </h3>
                  <p className="text-[15px] text-[#aeb4d6]">
                    {t.dashboard.topMatches.subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/job-matches")}
                className={`flex items-center gap-2 text-[15px] font-semibold text-[#8ea2ff] transition hover:text-white ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                {t.dashboard.topMatches.viewAll}
                <ChevronRight
                  size={18}
                  className={isRTL ? "rotate-180" : ""}
                />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {topMatches.map((job) => (
                <button
                  key={job.title}
                  type="button"
                  onClick={() => navigate("/job-matches")}
                  className={`flex items-center justify-between rounded-[20px] border border-white/10 bg-[rgba(66,68,122,0.72)] px-5 py-4 text-inherit transition hover:bg-[rgba(74,77,136,0.84)] ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex items-center gap-4 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    {renderProgressCircle(job.score)}

                    <div className={isRTL ? "text-right" : "text-left"}>
                      <h4 className="mb-1 text-[19px] font-bold text-white">
                        {job.title}
                      </h4>
                      <p className="text-[15px] text-[#aeb4d6]">
                        {job.company}
                      </p>
                    </div>
                  </div>

                  <span className="text-[#7076a6]">
                    <ChevronRight
                      size={24}
                      className={isRTL ? "rotate-180" : ""}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[rgba(48,61,112,0.82)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
            <div
              className={`mb-6 flex items-center justify-between ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[15px] bg-[rgba(34,211,238,0.18)] text-[#22d3ee]">
                  <FileText size={22} />
                </div>

                <div>
                  <h3 className="text-[21px] font-extrabold text-white">
                    {t.dashboard.applications.title}
                  </h3>
                  <p className="text-[15px] text-[#aeb4d6]">
                    {t.dashboard.applications.subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/applications")}
                className={`flex items-center gap-2 text-[15px] font-semibold text-[#8ea2ff] transition hover:text-white ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                {t.dashboard.applications.viewAll}
                <ChevronRight
                  size={18}
                  className={isRTL ? "rotate-180" : ""}
                />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {applications.map((app) => (
                <button
                  key={app.title}
                  type="button"
                  onClick={() => navigate("/applications")}
                  className="rounded-[20px] border border-white/10 bg-[rgba(70,86,138,0.48)] px-5 py-4 text-left transition hover:bg-[rgba(78,95,152,0.58)]"
                >
                  <h4 className="mb-2 text-[18px] font-bold text-white">
                    {app.title}
                  </h4>
                  <p className="mb-4 text-[15px] text-[#aeb4d6]">
                    {app.company}
                  </p>

                  <div
                    className={`flex items-center justify-between gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span
                      className={`rounded-full px-4 py-2 text-[13px] font-bold ${app.statusClass}`}
                    >
                      {app.status}
                    </span>
                    <span className="text-[14px] text-[#98a0c7]">
                      {app.days}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate("/applications")}
              className="mt-6 w-full rounded-[16px] border border-white/10 bg-white/[0.04] py-3 text-center text-[16px] font-bold text-[#e3e7ff] transition hover:bg-white/[0.08]"
            >
              {t.dashboard.applications.viewAll}
            </button>
          </div>
        </div>

        <div
          className={`mt-10 flex items-center justify-between rounded-[28px] border border-white/10 bg-gradient-to-r from-[#2b2e6a] to-[#243b6b] p-8 shadow-[0_12px_30px_rgba(0,0,0,0.2)] max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-6 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div
            className={`flex items-center gap-6 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className="relative flex h-[90px] w-[90px] items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#facc15 ${profilePercent}%, #2e325f ${profilePercent}% 100%)`,
              }}
            >
              <div className="absolute flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#1a1d4d] text-lg font-bold text-white">
                {profilePercent}%
              </div>
            </div>

            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-[20px] font-bold text-white">
                {t.dashboard.profileBox.title}
              </h3>
              <p className="text-[15px] text-[#aeb4d6]">
                {t.dashboard.profileBox.subtitle}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-4 max-[600px]:w-full max-[600px]:flex-col ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <button
              type="button"
              className="rounded-[12px] border border-cyan-400 px-5 py-2 text-cyan-300 transition hover:bg-cyan-400/10 max-[600px]:w-full"
            >
              {t.dashboard.profileBox.uploadResume}
            </button>

            <button
              type="button"
              className="rounded-[12px] bg-gradient-to-r from-[#7f4cff] to-[#a855f7] px-5 py-2 font-semibold text-white transition hover:opacity-90 max-[600px]:w-full"
            >
              {t.dashboard.profileBox.editProfile}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateDashboard;