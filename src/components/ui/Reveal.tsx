import type { ReactNode } from "react";
import { motion } from "motion/react";

type RevealDirection = "up" | "down" | "left" | "right";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li";
  // כיוון הכניסה - "up" (ברירת מחדל, זהה להתנהגות הקודמת) נכנס מלמטה, "down" נכנס מלמעלה,
  // ו-"left"/"right" נכנסים מהצד - לגיוון בין כרטיסים באותה שורה/סקשן
  direction?: RevealDirection;
};

function Reveal({ children, delay = 0, y = 16, className = "", as = "div", direction = "up" }: RevealProps) {
  const Component = as === "li" ? motion.li : motion.div;

  const initial =
    direction === "left"
      ? { opacity: 0, x: -40, y: 0 }
      : direction === "right"
        ? { opacity: 0, x: 40, y: 0 }
        : direction === "down"
          ? { opacity: 0, x: 0, y: -y }
          : { opacity: 0, x: 0, y };

  return (
    <Component
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
}

export default Reveal;
