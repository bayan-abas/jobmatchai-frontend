import type { RefObject } from "react";
import { motion, useReducedMotion, useScroll } from "motion/react";

type TimelineLineProps = {
  targetRef: RefObject<HTMLElement | null>;
};

// קו אנכי דק שמתמלא מלמעלה למטה בהתאם להתקדמות הגלילה דרך סקשן "איך זה עובד" - מיושר למרכז תגי המספור,
// ומוסתר במובייל כי שם הכרטיסים נערמים אנכית וה-badge כבר לא בעמודה קבועה משמאל
function TimelineLine({ targetRef }: TimelineLineProps) {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.85", "end 0.6"],
  });

  return (
    <div className="pointer-events-none absolute bottom-0 left-[31px] top-0 hidden w-[2px] bg-white/10 max-[900px]:!hidden md:block">
      <motion.div
        className="w-full origin-top bg-gradient-to-b from-[#38bdf8] to-[#8b5cf6]"
        style={{ height: "100%", scaleY: shouldReduceMotion ? 1 : scrollYProgress }}
      />
    </div>
  );
}

export default TimelineLine;
