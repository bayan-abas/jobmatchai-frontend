import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL_MS = 30000;

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

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  return unreadCount;
}
