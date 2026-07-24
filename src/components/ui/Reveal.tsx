import type { ReactNode } from "react";
import { motion } from "motion/react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li";
};

// Thin scroll-reveal wrapper (fade + slide-up, once) for landing-page sections and dashboard
// cards. `once: true` so re-scrolling past an already-revealed section never re-triggers it -
// respects prefers-reduced-motion automatically via the app-level <MotionConfig reducedMotion>.
function Reveal({ children, delay = 0, y = 16, className = "", as = "div" }: RevealProps) {
  const Component = as === "li" ? motion.li : motion.div;

  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
}

export default Reveal;
