import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { useIsRTL } from "../../context/LanguageContext";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
};

// Consistent label + control + helper/error-text stack for every form in the app (previously
// every auth/profile/job-posting form hand-rolled its own label markup with no shared
// required-indicator or error-message convention).
function FormField({ label, htmlFor, required, error, helperText, children, className = "" }: FormFieldProps) {
  const isRTL = useIsRTL();

  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={`mb-2 block text-[14px] font-semibold text-ink-200 ${isRTL ? "text-right" : "text-left"}`}>
        {label}
        {required && (
          <span className="text-danger-400" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className={`mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-danger-300 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`} role="alert">
          <AlertCircle size={13} className="shrink-0" />
          {error}
        </p>
      ) : helperText ? (
        <p className={`mt-1.5 text-[12.5px] text-ink-500 ${isRTL ? "text-right" : "text-left"}`}>{helperText}</p>
      ) : null}
    </div>
  );
}

export default FormField;
