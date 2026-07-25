import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";

type PulseVariant = "pulse" | "glow" | "rotate";

type PulseIconProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  // "pulse" (ברירת מחדל) - נשימה עדינה של scale+rotate, מתאים לרוב האייקונים/מספרים.
  // "glow" - זוהר רך שמתנפח ודועך (למשל ⚡), "rotate" - סיבוב איטי של כמה מעלות מדי כמה שניות (למשל 🎯)
  variant?: PulseVariant;
};

const VARIANT_CLASS: Record<PulseVariant, string> = {
  pulse: "animate-icon-pulse",
  glow: "animate-icon-glow",
  rotate: "animate-icon-rotate",
};

// אנימציית "חיים" עדינה לאייקון - כל variant מתנהג אחרת כדי שכל אייקון ירגיש ייחודי (נשימה/זוהר/סיבוב).
// רץ ב-CSS @keyframes טהור (לא Motion.animate) - נבדק בפועל שלופים אינסופיים דרך Motion "קופאים"
// על ערך היעד בפרויקט הזה בלי לזוז בכלל, בעוד ש-CSS keyframes רצות כרגיל
function PulseIcon({ children, className = "", delay = 0, variant = "pulse" }: PulseIconProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`${className} ${VARIANT_CLASS[variant]}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

export default PulseIcon;
