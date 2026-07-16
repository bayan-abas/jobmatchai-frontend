import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Crown,
  Trash2,
  XCircle,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import { apiFetch } from "../utils/api";
import { notifyNotificationsChanged } from "../hooks/useUnreadCount";

type BackendNotification = {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
};

const JOB_TYPES = new Set(["JOB_MATCH_HIGH"]);
const APPLICATION_TYPES = new Set([
  "APPLICATION_SUBMITTED",
  "APPLICATION_REMOVED",
  "APPLICATION_ACCEPTED",
  "APPLICATION_REJECTED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_UPDATED",
]);

function getPresentation(type: string) {
  if (JOB_TYPES.has(type)) {
    return { icon: <Briefcase size={22} />, iconBg: "from-[#7f4cff] to-[#a855f7]", kind: "job" as const };
  }
  if (APPLICATION_TYPES.has(type)) {
    return { icon: <CheckCircle2 size={22} />, iconBg: "from-emerald-500 to-teal-500", kind: "application" as const };
  }
  if (type === "COMPANY_MESSAGE") {
    return { icon: <MessageSquare size={22} />, iconBg: "from-cyan-500 to-blue-500", kind: "message" as const };
  }
  if (type === "PREMIUM_ACTIVATED") {
    return { icon: <Crown size={22} />, iconBg: "from-[#8b5cf6] to-[#d946ef]", kind: "premium" as const };
  }
  if (type === "PREMIUM_CANCELLED") {
    return { icon: <XCircle size={22} />, iconBg: "from-slate-500 to-slate-600", kind: "premiumCancelled" as const };
  }
  if (type === "PREMIUM_PAYMENT_FAILED") {
    return { icon: <AlertTriangle size={22} />, iconBg: "from-rose-500 to-red-600", kind: "premiumPaymentFailed" as const };
  }
  return { icon: <TrendingUp size={22} />, iconBg: "from-[#f6c453] to-[#f59e0b]", kind: "tip" as const };
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

function NotificationsPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data: BackendNotification[] = await apiFetch("/api/notifications");
        if (cancelled) return;

        setNotifications(data);

        // Opening this page is itself "seeing" the notifications - mark everything
        // read right away instead of waiting for an explicit click, so the badge
        // clears the moment the user opens the panel.
        if (data.some((item) => !item.read)) {
          setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
          notifyNotificationsChanged(0);
          // keepalive: the browser would otherwise cancel this in-flight request if the
          // user closes the tab/navigates away right after opening the page (a completely
          // normal flow) - without it, the badge clears locally but the read status never
          // reaches the database, so it reappears unread on the next visit.
          apiFetch("/api/notifications/mark-all-read", { method: "POST", keepalive: true }).catch(() => null);
        }
      } catch {
        if (!cancelled) {
          setNotifications([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleMarkAllAsRead = async () => {
    const hasUnread = notifications.some((item) => !item.read);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    // Marking everything read makes the new unread count deterministically 0 -
    // push that to every badge right away instead of waiting on a fresh
    // GET /unread-count round trip, which can take several seconds and made
    // the badges look stuck even though the backend write itself succeeded.
    notifyNotificationsChanged(0);

    if (!hasUnread) return;

    await apiFetch("/api/notifications/mark-all-read", { method: "POST", keepalive: true }).catch(() => null);
  };

  const handleClearAll = async () => {
    const all = notifications;
    setNotifications([]);
    notifyNotificationsChanged(0);

    await Promise.all(
      all.map((item) => apiFetch(`/api/notifications/${item.id}`, { method: "DELETE" }).catch(() => null))
    );
  };

  const handleDismiss = async (id: number) => {
    const remainingUnread = notifications.filter((item) => item.id !== id && !item.read).length;
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    notifyNotificationsChanged(remainingUnread);
    try {
      await apiFetch(`/api/notifications/${id}`, { method: "DELETE" });
    } catch {
      // already removed from view; nothing else to reconcile
    }
  };

  // Clicking any single notification clears the whole unread badge, not just
  // that one item - this mirrors how most notification centers behave (opening
  // one is treated as having seen the list) and is what candidates expect here.
  const handleOpenNotification = () => handleMarkAllAsRead();

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`w-full min-h-screen px-6 md:px-10 lg:px-14 py-8 text-white ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="mx-auto max-w-[1200px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`mb-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          {t.common.back}
        </button>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#a855f7] shadow-lg shadow-[rgba(127,76,255,0.3)]">
              <Bell size={24} />
            </div>

            <div className={isRTL ? "text-right" : "text-left"}>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {t.notificationsPage.title}
              </h1>
              <p className="mt-1 text-sm md:text-base text-white/60">
                {unreadCount} {t.notificationsPage.unreadNotifications}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className={`flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/20 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <CheckCircle2 size={16} />
              {t.notificationsPage.markAllAsRead}
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className={`flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Trash2 size={16} />
              {t.notificationsPage.clearAll}
            </button>
          </div>
        </div>

        {!isLoading && notifications.length === 0 ? (
          <div className="mx-auto max-w-[440px] rounded-[24px] border border-white/10 bg-white/5 px-6 py-7 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Bell size={20} className="text-white/70" />
            </div>
            <h3 className="text-lg font-bold">{t.notificationsPage.noNotifications}</h3>
            <p className="mt-1.5 text-sm leading-6 text-white/55">
              {t.notificationsPage.noNotificationsText}
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            {notifications.map((item) => {
              const presentation = getPresentation(item.type);

              return (
                <article
                  key={item.id}
                  onClick={handleOpenNotification}
                  className={`group relative cursor-pointer rounded-[26px] border border-white/10 bg-white/5 p-5 md:p-6 shadow-2xl backdrop-blur-xl transition hover:bg-white/[0.07] ${
                    !item.read ? "ring-1 ring-[#5e66ff33]" : ""
                  }`}
                >
                  <div
                    className={`flex flex-col gap-5 md:flex-row md:items-start ${
                      isRTL ? "" : ""
                    }`}
                  >
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${presentation.iconBg} text-white`}
                    >
                      {presentation.icon}
                    </div>

                    <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                      <div
                        className={`flex items-start justify-between gap-4 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex min-w-0 flex-wrap items-center gap-3">
                          <h2 className="min-w-0 break-words text-xl font-bold text-white">
                            {item.title}
                          </h2>

                          {!item.read && (
                            <span className="rounded-full border border-[#7c88ff33] bg-[#5e66ff14] px-3 py-1 text-xs font-semibold text-[#cfd5ff]">
                              {t.notificationsPage.new}
                            </span>
                          )}
                        </div>

                        {!item.read && (
                          <span className="mt-1 block h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.9)]" />
                        )}
                      </div>

                      <p className="mt-2 text-[15px] leading-7 text-white/70">
                        {item.message}
                      </p>

                      <div
                        className={`mt-3 flex items-center justify-between gap-2 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className="text-sm text-white/45">{formatDate(item.createdAt)}</span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismiss(item.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
