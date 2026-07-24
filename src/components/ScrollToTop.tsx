import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Keyed by full path+search (not just pathname) so distinct query-param states of the same
// route - e.g. a specific page of a paginated list - each remember their own scroll offset.
const scrollPositions = new Map<string, number>();

function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const key = location.pathname + location.search;

  useEffect(() => {
    // Only restore (instead of resetting to top) for real back/forward navigation ("POP") -
    // a fresh PUSH/REPLACE (clicking a link, programmatic navigate()) always starts at the
    // top, same as a normal web page. This is what lets "open a job, then go back" land
    // exactly where the candidate left off in a list, without making every ordinary
    // navigation feel scroll-locked.
    const saved = navigationType === "POP" ? scrollPositions.get(key) : undefined;

    if (saved === undefined) {
      window.scrollTo(0, 0);
    } else {
      // The page being returned to (a job list) re-fetches its data from scratch on every
      // mount - it's often still short (loading skeleton, or only the first few cards in)
      // at the instant this effect runs, so a single scrollTo here would clamp to whatever
      // little height exists yet and never actually land on the card the candidate left from
      // once the real content finishes rendering a moment later. Re-applying the same target
      // on every animation frame - as long as the page keeps growing - is what makes this
      // land correctly regardless of how long the list takes to fill back in, without every
      // page needing its own bespoke "wait for my data" scroll logic. Stops once the page
      // stops growing for a couple of frames in a row (content has settled) or after a hard
      // time cap, whichever comes first - so a page that will never reach that height (fewer
      // items than before, e.g. after applying to or saving a job) doesn't spin forever.
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

    // Records this page's scroll position right before we navigate away from it, so coming
    // back via the browser's back/forward button restores it.
    return () => {
      scrollPositions.set(key, window.scrollY);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, navigationType]);

  return null;
}

export default ScrollToTop;
