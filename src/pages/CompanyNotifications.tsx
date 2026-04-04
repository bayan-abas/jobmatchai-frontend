import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  Trash2,
  TrendingUp,
} from "lucide-react";

type NotificationType = "job" | "status" | "tip";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  date: string;
  type: NotificationType;
  unread: boolean;
};

function CompanyNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: "New Job Match!",
      message:
        "Senior Frontend Developer at TechCorp matches 92% with your profile",
      date: "4.4.2026",
      type: "job",
      unread: true,
    },
    {
      id: 2,
      title: "Application Status Updated",
      message:
        'Your application for Full Stack Engineer at StartupXYZ moved to "Under Review"',
      date: "4.4.2026",
      type: "status",
      unread: true,
    },
    {
      id: 3,
      title: "Profile Tip",
      message:
        "Add your certifications to improve your match score by up to 15%",
      date: "3.4.2026",
      type: "tip",
      unread: false,
    },
    {
      id: 4,
      title: "High Match Alert",
      message: "React Developer at InnovateLab - 85% match. Apply now!",
      date: "2.4.2026",
      type: "job",
      unread: false,
    },
    {
      id: 5,
      title: "Interview Request",
      message: "Congratulations! DesignCo wants to schedule an interview",
      date: "1.4.2026",
      type: "status",
      unread: true,
    },
  ]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        unread: false,
      }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markOneAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unread: false } : item
      )
    );
  };

  const getIcon = (type: NotificationType) => {
    if (type === "job") {
      return {
        icon: BriefcaseBusiness,
        wrapper:
          "bg-gradient-to-br from-violet-500 to-purple-600 text-white",
      };
    }

    if (type === "status") {
      return {
        icon: CheckCircle2,
        wrapper: "bg-gradient-to-br from-emerald-500 to-teal-500 text-white",
      };
    }

    return {
      icon: TrendingUp,
      wrapper: "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
    };
  };

  return (
    <div className="w-full min-h-screen px-6 md:px-10 lg:px-14 py-8 text-white">
      <div className="mx-auto max-w-[1200px]">
        <button
          onClick={() => window.history.back()}
          className="mb-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/20">
              <Bell size={24} />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Notifications
              </h1>
              <p className="mt-1 text-sm md:text-base text-white/60">
                {unreadCount} unread notifications
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/20"
            >
              <CheckCircle2 size={16} />
              Mark all read
            </button>

            <button
              onClick={clearAll}
              className="flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
            >
              <Trash2 size={16} />
              Clear all
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center shadow-2xl backdrop-blur-xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <Bell size={28} className="text-white/70" />
              </div>
              <h3 className="text-2xl font-bold">No notifications yet</h3>
              <p className="mt-2 text-white/60">
                When new updates arrive, they will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const { icon: Icon, wrapper } = getIcon(item.type);

              return (
                <div
                  key={item.id}
                  onClick={() => markOneAsRead(item.id)}
                  className="group relative cursor-pointer rounded-[26px] border border-white/10 bg-white/5 p-5 md:p-6 shadow-2xl backdrop-blur-xl transition hover:bg-white/[0.07]"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${wrapper}`}
                    >
                      <Icon size={24} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-[15px] leading-7 text-white/70">
                            {item.message}
                          </p>
                          <p className="mt-3 text-sm text-white/45">
                            {item.date}
                          </p>
                        </div>

                        {item.unread && (
                          <span className="mt-1 block h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.9)]" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default CompanyNotifications;