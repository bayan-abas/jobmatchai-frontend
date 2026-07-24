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
import { EmptyState, ListSkeleton, Reveal } from "../components/ui";

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
            className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white`}
          >
            <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
            <span>{t.common.back}</span>
          </button>
        </div>

        <section className="mb-8">
          <div
            className={`mb-6 flex items-start gap-4`}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
              <Bell size={26} />
            </div>

            <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
              <h1 className="text-[42px] font-extrabold leading-tight text-white max-[640px]:text-[28px]">
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
                isRTL ? "" : ""
              }`}
            >
              <div
                className={`flex min-w-0 items-center gap-4`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#5e66ff1f] text-[#7c88ff]">
                  <Bell size={24} />
                </div>

                <div className={`min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
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
                  isRTL ? "self-start md:self-auto" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white`}
                >
                  <CheckCircle2 size={16} />
                  {t.notificationsPage.markAllAsRead}
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className={`inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/15`}
                >
                  <Trash2 size={16} />
                  {t.notificationsPage.clearAll}
                </button>
              </div>
            </div>
          </div>
        </section>

        {isLoading && <ListSkeleton count={4} />}

        {!isLoading && notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={26} />}
            title={t.notificationsPage.noNotifications}
            description={t.notificationsPage.noNotificationsText}
          />
        ) : (
          !isLoading && (
          <section className="space-y-5">
            {notifications.map((item, index) => {
              const presentation = getPresentation(item.type);

              return (
                <Reveal key={item.id} delay={Math.min(index * 0.05, 0.3)}>
                <article
                  onClick={handleOpenNotification}
                  className={`cursor-pointer rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition hover:border-white/20 hover:bg-[rgba(50,52,108,0.96)] ${
                    !item.read ? "ring-1 ring-[#5e66ff33]" : ""
                  }`}
                >
                  <div
                    className={`flex flex-col gap-5 md:flex-row md:items-start ${
                      isRTL ? "" : ""
                    }`}
                  >
                    <div
                      className={`flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br ${presentation.iconBg} text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]`}
                    >
                      {presentation.icon}
                    </div>

                    <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                      <div
                        className={`mb-3 flex flex-wrap items-center gap-3 ${
                          isRTL ? "" : ""
                        }`}
                      >
                        <h2 className="min-w-0 break-words text-[22px] font-extrabold text-white">
                          {item.title}
                        </h2>

                        {!item.read && (
                          <span className="rounded-full border border-[#7c88ff33] bg-[#5e66ff14] px-3 py-1 text-sm font-semibold text-[#cfd5ff]">
                            {t.notificationsPage.new}
                          </span>
                        )}
                      </div>

                      <p className="mb-4 text-[16px] leading-7 text-[#c4cae9]">
                        {item.message}
                      </p>

                      <div
                        className={`flex items-center justify-between gap-2 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 text-[#8f98c6]">
                          <Bell size={14} />
                          <span className="text-[14px]">{formatDate(item.createdAt)}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismiss(item.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#c4cae9] transition hover:bg-white/10 hover:text-white"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {!item.read && (
                      <div className="flex justify-end md:justify-start">
                        <span className="mt-1 h-[10px] w-[10px] rounded-full bg-[#7c88ff] shadow-[0_0_0_6px_rgba(124,136,255,0.16)]" />
                      </div>
                    )}
                  </div>
                </article>
                </Reveal>
              );
            })}
          </section>
          )
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
