import type { ReactNode } from "react";

export type BadgeTone = "brand" | "success" | "danger" | "warning" | "info" | "neutral";

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  brand: "border-brand-400/25 bg-brand-500/15 text-brand-300",
  success: "border-success-400/25 bg-success-500/15 text-success-300",
  danger: "border-danger-400/25 bg-danger-500/15 text-danger-300",
  warning: "border-warning-400/25 bg-warning-500/15 text-warning-300",
  info: "border-info-400/25 bg-info-500/15 text-info-300",
  neutral: "border-white/15 bg-white/[0.06] text-ink-300",
};

function Badge({ children, tone = "neutral", icon, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

export function applicationStatusTone(status: string | null | undefined): BadgeTone {
  switch ((status ?? "").toLowerCase()) {
    case "accepted":
      return "success";
    case "rejected":
      return "danger";
    case "shortlisted":
      return "brand";
    case "under review":
    case "reviewing":
      return "info";
    case "pending":
    case "applied":
    default:
      return "neutral";
  }
}

export default Badge;
