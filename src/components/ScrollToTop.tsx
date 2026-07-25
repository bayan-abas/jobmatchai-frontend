import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const scrollPositions = new Map<string, number>();

// שומר את מיקום הגלילה לכל נתיב, ומשחזר אותו בניווט "אחורה"/"קדימה" - בניווט רגיל פשוט קופץ לראש הדף
function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const key = location.pathname + location.search;

  useEffect(() => {

    const saved = navigationType === "POP" ? scrollPositions.get(key) : undefined;

    if (saved === undefined) {
      window.scrollTo(0, 0);
    } else {

      // התוכן עדיין נטען (lazy routes/תמונות) אז scrollHeight לא סופי מייד - מנסים שוב עד שהגלילה מתייצבת
      let cancelled = false;
      let frame: number | null = null;
      let stableFrames = 0;
      const deadline = performance.now() + 2000;

      const attempt = () => {
        if (cancelled) return;

        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const target = Math.min(saved, maxScroll);
        const reachedTarget = Math.abs(window.scrollY - target) < 2;
        window.scrollTo(0, target);

        if (reachedTarget && maxScroll >= saved) {
          stableFrames += 1;
        } else {
          stableFrames = 0;
        }

        if (stableFrames >= 3 || performance.now() >= deadline) {
          return;
        }
        frame = requestAnimationFrame(attempt);
      };

      frame = requestAnimationFrame(attempt);
      return () => {
        cancelled = true;
        if (frame !== null) cancelAnimationFrame(frame);
        scrollPositions.set(key, window.scrollY);
      };
    }

    return () => {
      scrollPositions.set(key, window.scrollY);
    };

  }, [key, navigationType]);

  return null;
}

export default ScrollToTop;
