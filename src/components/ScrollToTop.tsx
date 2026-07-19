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
    window.scrollTo(0, saved ?? 0);

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
