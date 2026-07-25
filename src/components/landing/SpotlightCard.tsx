import { useRef, useState } from "react";
import type { ReactNode, MouseEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  glowBorder?: boolean;
};

// עוטף כרטיס קיים בלי לשנות את העיצוב שלו - מוסיף הרמה עדינה + זום קל בהובר, נטייה תלת-ממדית עדינה
// שעוקבת אחרי מיקום העכבר (parallax), זוהר שעוקב אחרי העכבר, ואופציונלית מסגרת זוהרת אמביינטית
// שמסתובבת לאט סביב הכרטיס כל ~6 שניות (glowBorder), גם בלי הובר
function SpotlightCard({ children, className = "", glowBorder = false }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 16 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 16 });

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setSpotlight({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });

    if (!shouldReduceMotion) {
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      // טווח נטייה קטן ומינימלי (עד ~4 מעלות) כדי ליצור תחושת עומק בלי לפגוע בשימושיות
      rotateX.set(((py - rect.height / 2) / (rect.height / 2)) * -4);
      rotateY.set(((px - rect.width / 2) / (rect.width / 2)) * 4);
    }
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={
        shouldReduceMotion
          ? undefined
          : { rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 800 }
      }
      className={`group/spotlight relative overflow-hidden transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(99,102,241,0.28)] ${className}`}
    >
      {glowBorder && !shouldReduceMotion && (
        <div
          aria-hidden
          className="animate-glow-border-spin pointer-events-none absolute -inset-[40%] opacity-35 transition-opacity duration-500 group-hover/spotlight:opacity-90"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, rgba(56,189,248,0.5) 12%, transparent 24%, transparent 100%)",
          }}
        />
      )}

      {/* זוהר שעוקב אחרי מיקום העכבר בתוך הכרטיס - נעלם לחלוטין כשאין הובר */}
      {!shouldReduceMotion && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
          style={{
            background: `radial-gradient(320px circle at ${spotlight.x}% ${spotlight.y}%, rgba(139,124,255,0.16), transparent 70%)`,
          }}
        />
      )}

      {/* בלי wrapper div נוסף סביב children - כדי לא לשבור flex/grid שה-className של הקורא מגדיר על
          הילדים הישירים שלו (למשל שורת "אייקון + טקסט" בכרטיסי "איך זה עובד"). האוברליים למעלה כבר
          absolute (מחוץ לזרימה הרגילה) ומצוירים ראשונים ב-DOM, אז ה-children הרגילים נשארים מעליהם ויזואלית. */}
      {children}
    </motion.div>
  );
}

export default SpotlightCard;
