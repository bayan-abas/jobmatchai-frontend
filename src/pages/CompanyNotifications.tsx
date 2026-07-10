import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Trash2,
  TrendingUp,
  UserPlus,
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

const JOB_TYPES = new Set(["JOB_POSTED", "JOB_UPDATED", "JOB_DELETED"]);
const STATUS_TYPES = new Set([
  "APPLICATION_ACCEPTED",
  "APPLICATION_REJECTED",
  "APPLICATION_REMOVED",
  "CANDIDATE_SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_UPDATED",
]);
const APPLICATION_TYPES = new Set(["APPLICATION_SUBMITTED"]);
const AI_TYPES = new Set(["AI_ANALYSIS_COMPLETED"]);

function getIcon(type: string) {
  if (APPLICATION_TYPES.has(type)) {
    return {
      icon: UserPlus,
      wrapper: "bg-gradient-to-br from-cyan-500 to-blue-500 text-white",
    };
  }

  if (AI_TYPES.has(type)) {
    return {
      icon: Sparkles,
      wrapper: "bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white",
    };
  }

  if (JOB_TYPES.has(type)) {
    return {
      icon: BriefcaseBusiness,
      wrapper: "bg-gradient-to-br from-violet-500 to-purple-600 text-white",
    };
  }

  if (STATUS_TYPES.has(type)) {
    return {
      icon: CheckCircle2,
      wrapper: "bg-gradient-to-br from-emerald-500 to-teal-500 text-white",
    };
  }

  if (type === "COMPANY_MESSAGE") {
    return {
      icon: MessageSquare,
      wrapper: "bg-gradient-to-br from-cyan-500 to-blue-500 text-white",
    };
  }

  return {
    icon: TrendingUp,
    wrapper: "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
  };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

type GroupKey = "today" | "yesterday" | "earlier";

function groupKeyFor(iso: string): GroupKey {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "earlier";

  const today = startOfDay(new Date());
  const yesterday = today - 24 * 60 * 60 * 1000;
  const day = startOfDay(date);

  if (day === today) return "today";
  if (day === yesterday) return "yesterday";
  return "earlier";
}

// Today/Yesterday groups already convey the day, so just the time is clearer there;
// anything older shows a short date since "Earlier" spans an unbounded range.
function formatItemTime(iso: string, group: GroupKey) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  if (group === "earlier") {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function CompanyNotifications() {
  const { language } = useLanguage();
  const t = translations[language];
  const n = t.companyNotificationsPage;
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

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  // Backend already returns notifications ordered by createdAt desc (see
  // NotificationService.getNotifications), so grouping preserves that order within
  // each bucket without needing to re-sort.
  const groupedNotifications = useMemo(() => {
    const buckets: Record<GroupKey, BackendNotification[]> = {
      today: [],
      yesterday: [],
      earlier: [],
    };

    for (const item of notifications) {
      buckets[groupKeyFor(item.createdAt)].push(item);
    }

    return (
      [
        { key: "today" as const, label: n.groupToday || "Today", items: buckets.today },
        { key: "yesterday" as const, label: n.groupYesterday || "Yesterday", items: buckets.yesterday },
        { key: "earlier" as const, label: n.groupEarlier || "Earlier", items: buckets.earlier },
      ] satisfies { key: GroupKey; label: string; items: BackendNotification[] }[]
    ).filter((group) => group.items.length > 0);
  }, [notifications, n.groupToday, n.groupYesterday, n.groupEarlier]);

  const hasNotifications = notifications.length > 0;

  const markAllAsRead = async () => {
    if (!hasNotifications) return;

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

  const clearAll = async () => {
    if (!hasNotifications) return;

    const all = notifications;
    setNotifications([]);
    notifyNotificationsChanged(0);

    await Promise.all(
      all.map((item) => apiFetch(`/api/notifications/${item.id}`, { method: "DELETE" }).catch(() => null))
    );
  };

  // Clicking any single notification clears the whole unread badge, not just
  // that one item - mirrors the candidate-side notifications page.
  const markOneAsRead = () => markAllAsRead();

  const emptyStateHints = [
    { icon: UserPlus, label: n.hintNewApplication || "New candidate application" },
    { icon: Sparkles, label: n.hintAiAnalysis || "AI analysis completed" },
    { icon: CheckCircle2, label: n.hintStatusUpdate || "Application status updated" },
  ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`w-full min-h-screen px-6 md:px-10 lg:px-14 py-8 text-white ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="mx-auto max-w-[1200px]">
        <button
          onClick={() => window.history.back()}
          className={`mb-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          {t.common.back}
        </button>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/20">
              <Bell size={24} />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {n.title}
              </h1>
              <p className="mt-1 text-sm md:text-base text-white/60">
                {unreadCount} {n.unreadNotifications}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={markAllAsRead}
              disabled={!hasNotifications}
              className={`flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-indigo-500/10 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <CheckCircle2 size={16} />
              {n.markAllAsRead}
            </button>

            <button
              onClick={clearAll}
              disabled={!hasNotifications}
              className={`flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-rose-500/10 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Trash2 size={16} />
              {n.clearAll}
            </button>
          </div>
        </div>

        {!isLoading && !hasNotifications && (
          <div className="mx-auto max-w-[440px] rounded-[24px] border border-white/10 bg-white/5 px-6 py-7 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Bell size={20} className="text-white/70" />
            </div>
            <h3 className="text-lg font-bold">{n.noNotifications}</h3>
            <p className="mt-1.5 text-sm leading-6 text-white/55">{n.noNotificationsText}</p>

            <div className="mt-5 space-y-2">
              {emptyStateHints.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 ${
                    isRTL ? "flex-row-reverse text-right" : "text-left"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/60">
                    <Icon size={14} />
                  </span>
                  <span className="text-xs font-medium text-white/60">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasNotifications && (
          <div className="space-y-8">
            {groupedNotifications.map((group) => (
              <div key={group.key}>
                <h2
                  className={`mb-3 text-xs font-bold uppercase tracking-wider text-white/40 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {group.label}
                </h2>

                <div className="space-y-4">
                  {group.items.map((item) => {
                    const { icon: Icon, wrapper } = getIcon(item.type);

                    return (
                      <div
                        key={item.id}
                        onClick={markOneAsRead}
                        className="group relative cursor-pointer rounded-[26px] border border-white/10 bg-white/5 p-5 md:p-6 shadow-2xl backdrop-blur-xl transition hover:bg-white/[0.07]"
                      >
                        <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${wrapper}`}
                          >
                            <Icon size={24} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div
                              className={`flex items-start justify-between gap-4 ${
                                isRTL ? "flex-row-reverse" : ""
                              }`}
                            >
                              <div>
                                <h3 className="text-xl font-bold text-white">
                                  {item.title}
                                </h3>
                                <p className="mt-2 text-[15px] leading-7 text-white/70">
                                  {item.message}
                                </p>
                                <p className="mt-3 text-sm text-white/45">
                                  {formatItemTime(item.createdAt, group.key)}
                                </p>
                              </div>

                              {!item.read && (
                                <span className="mt-1 block h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.9)]" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyNotifications;
