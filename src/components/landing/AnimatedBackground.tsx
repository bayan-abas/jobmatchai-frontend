import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

const ORBS = [
  { top: "8%", left: "12%", size: 320, color: "rgba(139,92,246,0.16)", depth: 18, duration: 16 },
  { top: "58%", left: "78%", size: 380, color: "rgba(56,189,248,0.14)", depth: 26, duration: 20 },
  { top: "32%", left: "62%", size: 240, color: "rgba(66,212,255,0.12)", depth: 12, duration: 14 },
  { top: "78%", left: "18%", size: 260, color: "rgba(124,58,237,0.13)", depth: 22, duration: 18 },
];

const PARTICLES = Array.from({ length: 14 }).map((_, i) => ({
  id: i,
  top: `${(i * 37) % 100}%`,
  left: `${(i * 53) % 100}%`,
  size: 2 + (i % 3),
  duration: 6 + (i % 5),
  delay: (i % 7) * 0.6,
}));

// כמה "קווי AI" עדינים שחוצים את הרקע באלכסון - כל אחד עם פולס אור שזורם דרכו לאט, בתור רמז ויזואלי
// עדין לרשת נוירונים/זרימת נתונים, בלי להיות בולט מדי
const AI_LINES = [
  { x1: 5, y1: 15, x2: 38, y2: 42, duration: 9, delay: 0 },
  { x1: 70, y1: 8, x2: 95, y2: 34, duration: 11, delay: 1.5 },
  { x1: 15, y1: 70, x2: 48, y2: 92, duration: 10, delay: 3 },
  { x1: 60, y1: 60, x2: 90, y2: 88, duration: 12, delay: 2 },
  { x1: 35, y1: 5, x2: 62, y2: 28, duration: 8, delay: 4.5 },
];

// שכבת רקע דקורטיבית בלבד (pointer-events-none) - כדורי זוהר שזזים לאט ומגיבים קלות לתזוזת העכבר (פרלקסה),
// ועוד כמה חלקיקים קטנים שצפים באיטיות. הפולסים/הצפה/זרימת הקווים רצים ב-CSS @keyframes טהור (לא
// Motion `animate`) - נבדק בפועל שאנימציות לופ אינסופיות דרך Motion.animate בפרויקט הזה לא זזות בכלל
// (קופאות על ערך היעד מהפריים הראשון), בעוד ש-CSS keyframes כן רצות בפועל. הפרלקסה (x/y לפי העכבר)
// היא היחידה שנשארת על Motion כי היא מונעת ע"י motion values אמיתיים מאירועי עכבר, לא לופ הצהרתי.
// מבוטל כליל ב-prefers-reduced-motion.
function AnimatedBackground() {
  const shouldReduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      mouseX.set(nx);
      mouseY.set(ny);
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [shouldReduceMotion, mouseX, mouseY]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {ORBS.map((orb, index) => (
        <OrbLayer key={index} orb={orb} springX={springX} springY={springY} reduceMotion={!!shouldReduceMotion} />
      ))}

      {!shouldReduceMotion && (
        <svg
          className="absolute inset-0 h-full w-full opacity-40"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="ai-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(56,189,248,0)" />
              <stop offset="50%" stopColor="rgba(139,124,255,0.9)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0)" />
            </linearGradient>
          </defs>
          {AI_LINES.map((line, index) => (
            <g key={index}>
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="rgba(150,150,255,0.12)"
                strokeWidth={0.15}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="url(#ai-line-gradient)"
                strokeWidth={0.35}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                strokeDasharray="14 86"
                className="animate-ai-line-flow"
                style={{ animationDuration: `${line.duration}s`, animationDelay: `${line.delay}s` }}
              />
            </g>
          ))}
        </svg>
      )}

      {!shouldReduceMotion &&
        PARTICLES.map((particle) => (
          <span
            key={particle.id}
            className="animate-particle-float absolute rounded-full bg-white/40"
            style={{
              top: particle.top,
              left: particle.left,
              width: particle.size,
              height: particle.size,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
    </div>
  );
}

type Orb = (typeof ORBS)[number];

function OrbLayer({
  orb,
  springX,
  springY,
  reduceMotion,
}: {
  orb: Orb;
  springX: ReturnType<typeof useMotionValue<number>>;
  springY: ReturnType<typeof useMotionValue<number>>;
  reduceMotion: boolean;
}) {
  const parallaxX = useTransform(springX, (v) => v * orb.depth);
  const parallaxY = useTransform(springY, (v) => v * orb.depth);

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        top: orb.top,
        left: orb.left,
        width: orb.size,
        height: orb.size,
        x: reduceMotion ? 0 : parallaxX,
        y: reduceMotion ? 0 : parallaxY,
      }}
    >
      <div
        className={`h-full w-full rounded-full blur-3xl ${reduceMotion ? "" : "animate-orb-pulse"}`}
        style={{ background: orb.color, animationDuration: `${orb.duration}s` }}
      />
    </motion.div>
  );
}

export default AnimatedBackground;
