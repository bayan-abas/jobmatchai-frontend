export type MatchTier = {
  emoji: string;
  text: string;
  border: string;
  bg: string;
  bar: string;
  ring: string;
};

// מחזיר את סט הצבעים/סגנון המתאים לציון ההתאמה, לפי טווח (מצוין/טוב/בינוני/חלש)
export function getMatchTier(score: number): MatchTier {
  if (score >= 85) {
    return {
      emoji: "🟢",
      text: "text-emerald-300",
      border: "border-emerald-400/20",
      bg: "bg-emerald-500/10",
      bar: "bg-emerald-400",
      ring: "#34d399",
    };
  }

  if (score >= 70) {
    return {
      emoji: "🟢",
      text: "text-lime-300",
      border: "border-lime-400/20",
      bg: "bg-lime-500/10",
      bar: "bg-lime-400",
      ring: "#a3e635",
    };
  }

  if (score >= 50) {
    return {
      emoji: "🟠",
      text: "text-orange-300",
      border: "border-orange-400/20",
      bg: "bg-orange-500/10",
      bar: "bg-orange-400",
      ring: "#fb923c",
    };
  }

  return {
    emoji: "🔴",
    text: "text-rose-300",
    border: "border-rose-400/20",
    bg: "bg-rose-500/10",
    bar: "bg-rose-400",
    ring: "#fb7185",
  };
}

// מתרגם ציון התאמה מספרי לתווית טקסטואלית קריאה למשתמש
export function getMatchLabel(score: number): string {
  if (score >= 85) return "Excellent Match";
  if (score >= 70) return "Strong Match";
  if (score >= 50) return "Moderate Match";
  if (score >= 30) return "Weak Match";
  return "Poor Match";
}
