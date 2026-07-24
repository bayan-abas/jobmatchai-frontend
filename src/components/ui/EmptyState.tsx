import type { ReactNode } from "react";
import { motion } from "motion/react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

// Standardizes the "no CV / no applications / no saved jobs / no matches" messages that
// already existed per-page but with inconsistent styling - icon + heading + description +
// optional call-to-action, always in that order.
function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex flex-col items-center rounded-panel border border-white/10 bg-white/[0.03] px-6 py-14 text-center ${className}`}
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06] text-ink-400">
        {icon}
      </div>
      <h3 className="text-[18px] font-bold text-white">{title}</h3>
      {description && <p className="mt-2 max-w-[380px] text-[14px] leading-6 text-ink-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

export default EmptyState;
