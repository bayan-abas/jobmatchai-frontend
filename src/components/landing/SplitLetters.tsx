import { motion, useReducedMotion } from "motion/react";

const NBSP = " ";

type SplitBy = "letter" | "word";
type Trigger = "mount" | "view";

type SplitLettersProps = {
  text: string;
  className?: string;
  delayStart?: number;
  staggerStep?: number;
  // "letter" (ברירת מחדל) לכותרות קצרות/דרמטיות, "word" לכותרות ארוכות יותר - עדין יותר, פחות "רועש"
  splitBy?: SplitBy;
  // "mount" (ברירת מחדל) - רץ מיד עם העלייה של הרכיב (כמו כותרת הירו), "view" - רץ כשנכנס למסך בגלילה (כמו כותרות סקשן)
  trigger?: Trigger;
  y?: number;
  // מחלקות עיצוב (למשל gradient+bg-clip-text) שצריך להחיל על כל אות בנפרד, לא רק על ה-span העוטף -
  // background-clip:text לא "עובר דרך" ילדים עם display:inline-block, אז אי אפשר להסתמך על ירושה
  // מההורה כשמפצלים טקסט עם גרדיאנט לאותיות בודדות
  letterClassName?: string;
  // כופה כיוון קבוע (למשל "ltr" לשם מותג לטיני כמו "JobMatchAI") - בלי זה, פיצול לאותיות עם
  // display:inline-block שובר את קיבוץ ה-bidi הרגיל של הדפדפן וטקסט LTR בתוך עמוד RTL מוצג הפוך
  dir?: "ltr" | "rtl";
};

// מפרק טקסט לאותיות/מילים ומכניס כל יחידה בנפרד עם פיזור (stagger) עדין, עלייה קלה למעלה + fade-in -
// משאיר את הטקסט המלא כ-aria-label כדי שקוראי מסך יקראו אותו כרגיל, לא יחידה-יחידה.
// מבוטל לגמרי (טקסט רגיל, בלי אנימציה) ב-prefers-reduced-motion.
// עובד גם ב-RTL כי כל יחידה היא span נפרד בזרימה רגילה - הדפדפן כבר מסדר אותם נכון לפי ה-dir של האב,
// חוץ ממקרה של טקסט LTR (כמו שם מותג לטיני) בתוך עמוד RTL - לזה יש את ה-prop dir למעלה.
// רווח רגיל בתוך inline-block עלול "להתכווץ" - משתמשים ב-NBSP כדי לשמור על הרווח בין מילים/אותיות.
function SplitLetters({
  text,
  className = "",
  delayStart = 0,
  staggerStep,
  splitBy = "letter",
  trigger = "mount",
  y = 22,
  letterClassName = "",
  dir,
}: SplitLettersProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <span className={className} dir={dir}>
        {text}
      </span>
    );
  }

  const effectiveStagger = staggerStep ?? (splitBy === "word" ? 0.07 : 0.028);

  const motionProps = (delay: number) =>
    trigger === "view"
      ? {
          initial: { opacity: 0, y, rotateX: -30 },
          whileInView: { opacity: 1, y: 0, rotateX: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
        }
      : {
          initial: { opacity: 0, y, rotateX: -30 },
          animate: { opacity: 1, y: 0, rotateX: 0 },
          transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  const words = text.split(/(\s+)/);
  let animatedIndex = 0;

  return (
    <span className={className} aria-label={text} dir={dir}>
      {words.map((word, wordIndex) => {
        if (word.trim().length === 0) {
          return <span key={wordIndex} aria-hidden>{NBSP}</span>;
        }

        if (splitBy === "word") {
          const delay = delayStart + animatedIndex * effectiveStagger;
          animatedIndex += 1;
          return (
            <motion.span
              key={wordIndex}
              aria-hidden
              {...motionProps(delay)}
              className={letterClassName}
              style={{ display: "inline-block", transformPerspective: 400 }}
            >
              {word}
            </motion.span>
          );
        }

        // "letter" - כל אותיות המילה עטופות ב-span אחד עם white-space:nowrap כדי שהדפדפן
        // לעולם לא ישבור שורה באמצע מילה (כל אות בפני עצמה היא inline-block "אטומי" מבחינת wrapping)
        return (
          <span key={wordIndex} aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {Array.from(word).map((letter, letterIndex) => {
              const delay = delayStart + animatedIndex * effectiveStagger;
              animatedIndex += 1;
              return (
                <motion.span
                  key={letterIndex}
                  {...motionProps(delay)}
                  className={letterClassName}
                  style={{ display: "inline-block", transformPerspective: 400 }}
                >
                  {letter}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}

export default SplitLetters;
