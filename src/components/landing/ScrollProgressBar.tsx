import { motion, useScroll, useSpring } from "motion/react";

// פס דק בראש העמוד שממלא לפי אחוז הגלילה - עדין ולא תלוי בכיוון RTL/LTR של הטקסט
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[80] h-[3px] origin-left bg-gradient-to-r from-[#38bdf8] via-[#8b5cf6] to-[#42d4ff]"
      style={{ scaleX }}
    />
  );
}

export default ScrollProgressBar;
