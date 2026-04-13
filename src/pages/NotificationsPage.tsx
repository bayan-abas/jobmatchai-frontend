import { useNavigate } from "react-router-dom";
import { useState } from "react";
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

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "job",
      title: t.notificationsPage.jobMatchTitle1 || "New Job Match!",
      message:
        t.notificationsPage.jobMatchMessage1 ||
        "Senior Frontend Developer at TechCorp matches 92% with your profile",
      date: "26.3.2026",
      unread: true,
      icon: <Briefcase size={22} />,
      iconBg: "from-[#7f4cff] to-[#a855f7]",
      badge: t.notificationsPage.jobMatch,
    },
    {
      id: 2,
      type: "application",
      title: t.notificationsPage.applicationTitle1 || "Application Status Updated",
      message:
        t.notificationsPage.applicationMessage1 ||
        'Your application for Full Stack Engineer at StartupXYZ moved to "Under Review"',
      date: "26.3.2026",
      unread: true,
      icon: <CheckCircle2 size={22} />,
      iconBg: "from-emerald-500 to-teal-500",
      badge: t.notificationsPage.application,
    },
    {
      id: 3,
      type: "tip",
      title: t.notificationsPage.tipTitle1 || "Profile Tip",
      message:
        t.notificationsPage.tipMessage1 ||
        "Add your certifications to improve your match score by up to 15%",
      date: "25.3.2026",
      unread: false,
      icon: <TrendingUp size={22} />,
      iconBg: "from-[#f6c453] to-[#f59e0b]",
      badge: t.notificationsPage.tip,
    },
    {
      id: 4,
      type: "job",
      title: t.notificationsPage.jobMatchTitle2 || "High Match Alert",
      message:
        t.notificationsPage.jobMatchMessage2 ||
        "React Developer at InnovateLab - 85% match. Apply now!",
      date: "24.3.2026",
      unread: false,
      icon: <Briefcase size={22} />,
      iconBg: "from-[#7f4cff] to-[#6366f1]",
      badge: t.notificationsPage.jobMatch,
    },
    {
      id: 5,
      type: "application",
      title: t.notificationsPage.interviewTitle1 || "Interview Request",
      message:
        t.notificationsPage.interviewMessage1 ||
        "Congratulations! DesignCo wants to schedule an interview",
      date: "23.3.2026",
      unread: true,
      icon: <CheckCircle2 size={22} />,
      iconBg: "from-emerald-500 to-cyan-500",
      badge: t.notificationsPage.interview,
    },
  ]);

  const unreadCount = notifications.filter((item) => item.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        unread: false,
      }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-7 lg:px-8 ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="mx-auto w-full max-w-[1080px]">
        <div
          className={`mb-5 flex items-center ${
            isRTL ? "justify-start" : "justify-start"
          }`}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
            <span>{t.common.back}</span>
          </button>
        </div>

        <section className="mb-8">
          <div
            className={`mb-6 flex items-start gap-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
              <Bell size={26} />
            </div>

            <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
              <h1 className="text-[42px] font-extrabold leading-tight text-white">
                {t.notificationsPage.title}
              </h1>
              <p className="mt-2 text-[17px] text-[#aeb4d6]">
                {unreadCount} {t.notificationsPage.unreadNotifications}
              </p>
            </div>
          </div>

          <div className="overflow-visible rounded-[28px] border border-white/10 bg-white/[0.05] px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
            <div
              className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${
                isRTL ? "md:flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex items-center gap-4 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#5e66ff1f] text-[#7c88ff]">
                  <Bell size={24} />
                </div>

                <div className={isRTL ? "text-right" : "text-left"}>
                  <h3 className="text-[20px] font-extrabold text-white">
                    {t.notificationsPage.notificationCenter}
                  </h3>
                  <p className="mt-1 text-[15px] text-[#aeb4d6]">
                    {t.notificationsPage.subtitle}
                  </p>
                </div>
              </div>

              <div
                className={`flex flex-wrap items-center gap-3 ${
                  isRTL ? "flex-row-reverse self-start md:self-auto" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <CheckCircle2 size={16} />
                  {t.notificationsPage.markAllAsRead}
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className={`inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/15 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Trash2 size={16} />
                  {t.notificationsPage.clearAll}
                </button>
              </div>
            </div>
          </div>
        </section>

        {notifications.length === 0 ? (
          <div className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-7 py-12 text-center shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-white/60">
              <Bell size={26} />
            </div>

            <h3 className="text-[24px] font-extrabold text-white">
              {t.notificationsPage.noNotifications}
            </h3>
            <p className="mt-3 text-[15px] text-[#aeb4d6]">
              {t.notificationsPage.noNotificationsText}
            </p>
          </div>
        ) : (
          <section className="space-y-5">
            {notifications.map((item) => (
              <article
                key={item.id}
                className={`rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition hover:border-white/20 hover:bg-[rgba(50,52,108,0.96)] ${
                  item.unread ? "ring-1 ring-[#5e66ff33]" : ""
                }`}
              >
                <div
                  className={`flex flex-col gap-5 md:flex-row md:items-start ${
                    isRTL ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br ${item.iconBg} text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]`}
                  >
                    {item.icon}
                  </div>

                  <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                    <div
                      className={`mb-3 flex flex-wrap items-center gap-3 ${
                        isRTL ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      <h2 className="text-[22px] font-extrabold text-white">
                        {item.title}
                      </h2>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-[#d6dcff]">
                        {item.badge}
                      </span>

                      {item.unread && (
                        <span className="rounded-full border border-[#7c88ff33] bg-[#5e66ff14] px-3 py-1 text-sm font-semibold text-[#cfd5ff]">
                          {t.notificationsPage.new}
                        </span>
                      )}
                    </div>

                    <p className="mb-4 text-[16px] leading-7 text-[#c4cae9]">
                      {item.message}
                    </p>

                    <div
                      className={`flex items-center gap-2 text-[#8f98c6] ${
                        isRTL ? "flex-row-reverse justify-end md:justify-start" : ""
                      }`}
                    >
                      <Bell size={14} />
                      <span className="text-[14px]">{item.date}</span>
                    </div>
                  </div>

                  {item.unread && (
                    <div className="flex justify-end md:justify-start">
                      <span className="mt-1 h-[10px] w-[10px] rounded-full bg-[#7c88ff] shadow-[0_0_0_6px_rgba(124,136,255,0.16)]" />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;