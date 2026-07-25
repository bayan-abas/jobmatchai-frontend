import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type RippleButtonProps = {
  children: ReactNode;
  className: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

type Ripple = { id: number; x: number; y: number; size: number };

let rippleId = 0;

// עוטף כפתור קיים בלי לגעת בעיצוב שלו (className נשאר בדיוק כמו שהוא) - מוסיף אפקט ריפל בלחיצה
// והרמה/זום עדינים בהובר. overflow-hidden חוסם רק את הריפל מלגלוש החוצה, לא את ה-box-shadow של הכפתור עצמו.
function RippleButton({ children, className, onClick, type = "button" }: RippleButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!shouldReduceMotion) {
      const rect = event.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.8;
      const next: Ripple = {
        id: ++rippleId,
        x: event.clientX - rect.left - size / 2,
        y: event.clientY - rect.top - size / 2,
        size,
      };
      setRipples((prev) => [...prev, next]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== next.id));
      }, 650);
    }
    onClick?.();
  };

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.03 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden bg-[length:200%_auto] bg-left transition-[background-position] duration-500 hover:bg-right ${className}`}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full bg-white/30"
            style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}

export default RippleButton;
