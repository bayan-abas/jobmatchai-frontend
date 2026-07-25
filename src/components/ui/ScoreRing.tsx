import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { getMatchTier } from "../../utils/matchScore";

type ScoreRingProps = {

  percent: number | null;
  size?: number;

  label?: string;
  pulse?: boolean;
  className?: string;
};

function ScoreRing({ percent, size = 88, label, pulse = false, className = "" }: ScoreRingProps) {
  const reduceMotion = useReducedMotion();

  const clampedPercent = percent !== null ? Math.max(0, Math.min(100, percent)) : null;
  const tier = clampedPercent !== null ? getMatchTier(clampedPercent) : null;
  const stroke = size * 0.09;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const fraction = clampedPercent !== null ? clampedPercent / 100 : 0;

  const [displayed, setDisplayed] = useState(reduceMotion ? clampedPercent ?? 0 : 0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (clampedPercent === null) return;
    if (reduceMotion) {
      setDisplayed(clampedPercent);
      return;
    }

    const durationMs = 900;
    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(from + (clampedPercent - from) * eased));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };

  }, [clampedPercent, reduceMotion]);

  return (
    <div className={`relative shrink-0 ${pulse ? "animate-pulse" : ""} ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
        {clampedPercent !== null && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={tier!.ring}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - fraction) }}
            transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#252654] text-white shadow-inner" style={{ margin: stroke }}>
        <span className="font-extrabold" style={{ fontSize: size * 0.22 }}>
          {label ?? (clampedPercent !== null ? `${displayed}%` : "—")}
        </span>
      </div>
    </div>
  );
}

export default ScoreRing;
