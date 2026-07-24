import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
};

// The one button implementation the whole app should use - previously every page hand-wrote its
// own gradient/border classNames per button, with inconsistent padding, focus states, and touch
// targets. `loading` disables the button AND swaps in a spinner (see AuthContext-adjacent forms'
// prior double-submit risk - callers just need to flip one boolean instead of juggling both
// `disabled` and a manual spinner element).
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-brand-glow hover:shadow-[0_16px_36px_rgba(127,76,255,0.4)] disabled:from-brand-500/40 disabled:to-brand-400/40",
  secondary:
    "border border-white/15 bg-white/[0.04] text-ink-200 hover:bg-white/[0.09] hover:text-white disabled:bg-white/[0.02]",
  ghost: "text-ink-300 hover:bg-white/[0.06] hover:text-white disabled:text-ink-600",
  danger:
    "bg-gradient-to-r from-danger-500 to-danger-400 text-white shadow-[0_12px_28px_rgba(244,63,94,0.28)] hover:shadow-[0_16px_36px_rgba(244,63,94,0.36)] disabled:opacity-50",
  success:
    "bg-gradient-to-r from-success-600 to-success-400 text-white shadow-[0_12px_28px_rgba(34,197,94,0.28)] hover:shadow-[0_16px_36px_rgba(34,197,94,0.36)] disabled:opacity-50",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-[38px] px-4 text-[13px] gap-1.5",
  md: "min-h-[44px] px-5 text-[15px] gap-2",
  lg: "min-h-[52px] px-7 text-[16px] gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, icon, fullWidth, disabled, className = "", children, ...rest },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={rest.type ?? "button"}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center rounded-control font-bold transition-[colors,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d2e] disabled:cursor-not-allowed disabled:active:scale-100 active:scale-[0.97] ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
});

export default Button;
