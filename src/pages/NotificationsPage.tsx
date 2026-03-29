import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

function NotificationsPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const notifications = [
    {
      id: 1,
      type: "job",
      title: "New Job Match!",
      message:
        "Senior Frontend Developer at TechCorp matches 92% with your profile",
      date: "26.3.2026",
      unread: true,
      icon: <Briefcase size={22} />,
      iconBg: "bg-[linear-gradient(135deg,#8b5cf6,#6366f1)]",
    },
    {
      id: 2,
      type: "application",
      title: "Application Status Updated",
      message:
        'Your application for Full Stack Engineer at StartupXYZ moved to "Under Review"',
      date: "26.3.2026",
      unread: true,
      icon: <CheckCircle2 size={22} />,
      iconBg: "bg-[linear-gradient(135deg,#10b981,#14b8a6)]",
    },
    {
      id: 3,
      type: "tip",
      title: "Profile Tip",
      message:
        "Add your certifications to improve your match score by up to 15%",
      date: "25.3.2026",
      unread: false,
      icon: <TrendingUp size={22} />,
      iconBg: "bg-[linear-gradient(135deg,#f59e0b,#f97316)]",
    },
    {
      id: 4,
      type: "job",
      title: "High Match Alert",
      message: "React Developer at InnovateLab - 85% match. Apply now!",
      date: "24.3.2026",
      unread: false,
      icon: <Briefcase size={22} />,
      iconBg: "bg-[linear-gradient(135deg,#8b5cf6,#6366f1)]",
    },
    {
      id: 5,
      type: "application",
      title: "Interview Request",
      message: "Congratulations! DesignCo wants to schedule an interview",
      date: "23.3.2026",
      unread: true,
      icon: <CheckCircle2 size={22} />,
      iconBg: "bg-[linear-gradient(135deg,#10b981,#14b8a6)]",
    },
  ];

  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <div
      className={`min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(90,56,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(36,122,255,0.20),transparent_30%),linear-gradient(135deg,#17184a_0%,#1a1b56_42%,#10244d_100%)] px-8 py-8 ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="mx-auto max-w-[980px]">
        <div
          className={`mb-8 flex items-center justify-between ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.05] px-5 py-3 text-[18px] font-semibold text-[#d7dcff] transition hover:bg-white/[0.08] hover:text-white ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <ArrowLeft size={20} />
            {t.common.back}
          </button>
        </div>

        <div
          className={`mb-8 flex items-start justify-between gap-4 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div
            className={`flex items-center gap-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#ff4b8b,#ff6b57)] text-white shadow-[0_12px_30px_rgba(255,75,139,0.28)]">
              <Bell size={28} />
            </div>

            <div>
              <h1 className="text-[46px] font-extrabold leading-none text-white">
                Notifications
              </h1>
              <p className="mt-2 text-[18px] text-[#b9c0ea]">
                {unreadCount} unread notifications
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 max-[700px]:hidden ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <button
              type="button"
              className={`flex items-center gap-2 rounded-[14px] border border-[#7180ff]/50 bg-[rgba(113,128,255,0.08)] px-5 py-3 text-[16px] font-semibold text-[#dbe0ff] transition hover:bg-[rgba(113,128,255,0.14)] ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <CheckCircle2 size={18} />
              Mark all read
            </button>

            <button
              type="button"
              className={`flex items-center gap-2 rounded-[14px] border border-[#ff6b8e]/50 bg-[rgba(255,107,142,0.08)] px-5 py-3 text-[16px] font-semibold text-[#ffd1da] transition hover:bg-[rgba(255,107,142,0.14)] ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Trash2 size={18} />
              Clear all
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`relative flex items-start gap-5 rounded-[28px] border border-[rgba(117,132,255,0.30)] bg-[rgba(57,70,134,0.36)] px-6 py-6 shadow-[0_14px_35px_rgba(0,0,0,0.16)] backdrop-blur-[8px] transition hover:bg-[rgba(64,79,150,0.42)] ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[20px] text-white ${item.iconBg}`}
              >
                {item.icon}
              </div>

              <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                <h3 className="mb-2 text-[20px] font-extrabold text-white">
                  {item.title}
                </h3>
                <p className="mb-3 text-[16px] leading-7 text-[#c2c8ea]">
                  {item.message}
                </p>
                <p className="text-[14px] text-[#8f98c6]">{item.date}</p>
              </div>

              {item.unread && (
                <span className="mt-2 h-[10px] w-[10px] rounded-full bg-[#6f78ff] shadow-[0_0_0_6px_rgba(111,120,255,0.14)]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;