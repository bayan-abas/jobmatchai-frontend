import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL_MS = 30000;

// Pages that mark notifications as read/deleted dispatch this so every mounted
// useUnreadCount() (e.g. the sidebar and topbar badges) refreshes immediately
// instead of waiting out the rest of the poll interval.
export const NOTIFICATIONS_CHANGED_EVENT = "notifications:changed";

// Callers pass the count they already know locally (usually 0, since marking
// read/deleting is done in bulk) so every badge updates on the same tick as
// the click - it doesn't wait on a fresh round trip to the backend, which in
// this environment can take several seconds and made the badges look stuck.
export function notifyNotificationsChanged(knownUnreadCount?: number) {
  window.dispatchEvent(new CustomEvent<number | undefined>(NOTIFICATIONS_CHANGED_EVENT, { detail: knownUnreadCount }));
}

export function useUnreadCount() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    async function poll() {
      try {
        const data = await apiFetch("/api/notifications/unread-count");
        if (!cancelled) {
          setUnreadCount(data.unreadCount ?? 0);
        }
      } catch {
        // ignore transient polling failures
      }
    }

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
