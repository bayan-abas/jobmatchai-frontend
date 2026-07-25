import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

type AnimatedCounterProps = {
  value: string;
  className?: string;
};

// מפרק ערך כמו "95%" / "10K+" / "500+" למספר בסיסי ולסיומת (%, K+, +) שנשארת קבועה תוך כדי הספירה
function parseValue(raw: string): { number: number; suffix: string } {
  const match = raw.match(/^([\d.]+)(.*)$/);
  if (!match) return { number: 0, suffix: raw };
  return { number: parseFloat(match[1]), suffix: match[2] };
}

// סופר מ-0 עד הערך הסופי ברגע שהאלמנט נכנס למסך - פעם אחת בלבד, ומדלג על האנימציה אם prefers-reduced-motion פעיל
function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();
  const { number, suffix } = parseValue(value);
  const [display, setDisplay] = useState(shouldReduceMotion ? number : 0);

  useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion) {
      setDisplay(number);
      return;
    }

    const controls = animate(0, number, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
    });

    return () => controls.stop();
  }, [isInView, number, shouldReduceMotion]);

  const rounded = Number.isInteger(number) ? Math.round(display) : Math.round(display * 10) / 10;

  return (
    <span ref={ref} className={className}>
      {rounded}
      {suffix}
    </span>
  );
}

export default AnimatedCounter;
