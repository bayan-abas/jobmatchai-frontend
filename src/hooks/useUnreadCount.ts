import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL_MS = 30000;

export const NOTIFICATIONS_CHANGED_EVENT = "notifications:changed";

// אפשר להעביר את המספר הידוע ישירות כדי לעדכן מיידית בלי לחכות לפולינג הבא
export function notifyNotificationsChanged(knownUnreadCount?: number) {
  window.dispatchEvent(new CustomEvent<number | undefined>(NOTIFICATIONS_CHANGED_EVENT, { detail: knownUnreadCount }));
}

// בודק כל כמה שניות אם יש התראות חדשות שלא נקראו, ומחזיר את המספר העדכני לתצוגה בפעמון
export function useUnreadCount() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    // שולף מהשרת את מספר ההתראות שלא נקראו
    async function poll() {
      try {
        const data = await apiFetch("/api/notifications/unread-count");
        if (!cancelled) {
          setUnreadCount(data.unreadCount ?? 0);
        }
      } catch {
        // כישלון בפולינג לא אמור לשבור את ה-UI, פשוט מדלגים לסבב הבא
      }
    }

    // מגיב לאירוע גלובלי של שינוי בהתראות - אם כבר יודעים את המספר החדש עדכון מיידי, אחרת פולינג מחדש
    function onNotificationsChanged(event: Event) {
      const knownCount = (event as CustomEvent<number | undefined>).detail;
      if (typeof knownCount === "number") {
        setUnreadCount(knownCount);
      } else {
        poll();
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onNotificationsChanged);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onNotificationsChanged);
    };
  }, [user]);

  return unreadCount;
}
