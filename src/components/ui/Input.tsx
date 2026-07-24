import { forwardRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useIsRTL } from "../../context/LanguageContext";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  hasError?: boolean;
};

// Shared text input: consistent focus ring, optional leading icon, and - when `type="password"`
// is passed - a built-in visibility toggle (previously absent on every auth form in the app).
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon, hasError, type, className = "", ...rest },
  ref
) {
  const isRTL = useIsRTL();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword ? (revealed ? "text" : "password") : type;

  return (
    <div className="relative">
      {icon && (
        <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-500 ${isRTL ? "right-4" : "left-4"}`}>
          {icon}
        </span>
      )}
      <input
        ref={ref}
        type={effectiveType}
        className={`w-full rounded-control border bg-white/5 py-3.5 text-white outline-none transition placeholder:text-white/40 focus:bg-white/10 ${
          hasError ? "border-danger-400/60 focus:border-danger-400" : "border-white/10 focus:border-brand-400/60"
        } ${icon ? (isRTL ? "pr-12" : "pl-12") : "px-4"} ${isPassword ? (isRTL ? "pl-12" : "pr-12") : isRTL ? "pl-4" : "pr-4"} ${
          isRTL ? "text-right" : "text-left"
        } ${className}`}
        {...rest}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setRevealed((prev) => !prev)}
          aria-label={revealed ? "Hide password" : "Show password"}
          tabIndex={-1}
          className={`absolute top-1/2 -translate-y-1/2 text-ink-500 transition hover:text-white ${isRTL ? "left-4" : "right-4"}`}
        >
          {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
});

export default Input;
