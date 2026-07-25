import { motion } from "motion/react";

type AnimatedUnderlineProps = {
  className?: string;
};

// הקו הדק מתחת לכותרות הסקשנים - "מצטייר" משמאל לימין (או להפך ב-RTL, בגלל transform-origin) כשהוא נכנס למסך
function AnimatedUnderline({ className = "" }: AnimatedUnderlineProps) {
  return (
    <motion.span
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`mt-5 inline-block h-1 w-[90px] origin-left rounded-full bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6] ${className}`}
    />
  );
}

export default AnimatedUnderline;
