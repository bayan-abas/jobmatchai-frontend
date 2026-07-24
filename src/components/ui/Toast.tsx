import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";
import { useIsRTL } from "../../context/LanguageContext";

type ToastVariant = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: number;
  variant: ToastVariant;
  message: string;
};

type ToastContextType = {
  show: (variant: ToastVariant, message: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const VARIANT_META: Record<ToastVariant, { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: "border-success-400/25 bg-[#0f2b1e] text-success-300" },
  error: { icon: XCircle, classes: "border-danger-400/25 bg-[#2b1220] text-danger-300" },
  warning: { icon: TriangleAlert, classes: "border-warning-400/25 bg-[#2b2210] text-warning-300" },
  info: { icon: Info, classes: "border-info-400/25 bg-[#0f2333] text-info-300" },
};

let nextId = 1;
const AUTO_DISMISS_MS = 5000;

// Replaces the app's 4 remaining native `alert(...)` call sites and gives every form a
// consistent transient-feedback surface (as opposed to inline-only banners, which stay
// reachable for validation errors - this is for one-off confirmations/failures). Mounted once
// near the app root (see App.tsx) so any page can call useToast() without prop drilling.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const isRTL = useIsRTL();

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, variant, message }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const meta = VARIANT_META[t.variant];
            const Icon = meta.icon;
            return (
              <motion.div
                key={t.id}
                dir={isRTL ? "rtl" : "ltr"}
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={`pointer-events-auto flex w-full max-w-[420px] items-start gap-3 rounded-card border px-4 py-3 shadow-floating backdrop-blur-xl ${meta.classes}`}
              >
                <Icon size={19} className="mt-0.5 shrink-0" />
                <p className="flex-1 text-sm font-semibold leading-5 text-white">{t.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 rounded-full p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return {
    success: (message: string) => context.show("success", message),
    error: (message: string) => context.show("error", message),
    warning: (message: string) => context.show("warning", message),
    info: (message: string) => context.show("info", message),
  };
}
