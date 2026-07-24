import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TriangleAlert } from "lucide-react";
import { useIsRTL, useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";
import Button from "./Button";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "brand";
};

type ConfirmRequest = ConfirmOptions & { resolve: (value: boolean) => void };

type ConfirmContextType = (options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

// Promise-based confirmation dialog - `if (await confirm({...})) { ... }` - replacing the
// bespoke reject/cancel-subscription modals' duplicated overlay+panel markup with one shared
// primitive, and giving any future destructive action (delete job, etc.) the same pattern for
// free instead of a new bespoke modal every time.
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const isRTL = useIsRTL();
  const { language } = useLanguage();
  const t = translations[language];
  const resolvedRef = useRef(false);

  const confirm = useCallback((options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolvedRef.current = false;
      setRequest({ ...options, resolve });
    });
  }, []);

  const settle = (value: boolean) => {
    if (resolvedRef.current || !request) return;
    resolvedRef.current = true;
    request.resolve(value);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {request && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => settle(false)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              dir={isRTL ? "rtl" : "ltr"}
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px] rounded-panel border border-white/10 bg-[linear-gradient(180deg,#171a4d_0%,#12153f_100%)] p-7 text-white shadow-floating"
            >
              <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                  request.tone === "danger" ? "bg-danger-500/15 text-danger-300" : "bg-brand-500/15 text-brand-300"
                }`}
              >
                <TriangleAlert size={26} />
              </div>

              <h2 id="confirm-dialog-title" className="mb-2 text-center text-[19px] font-extrabold">
                {request.title || t.feedback.areYouSure}
              </h2>
              <p className="mb-6 text-center text-[14px] leading-6 text-ink-400">
                {request.description || t.feedback.actionCannotBeUndone}
              </p>

              <div className="grid grid-cols-2 gap-3 max-[360px]:grid-cols-1">
                <Button variant="secondary" onClick={() => settle(false)} className="max-[360px]:order-2">
                  {request.cancelLabel || t.common.cancel}
                </Button>
                <Button
                  variant={request.tone === "danger" ? "danger" : "primary"}
                  onClick={() => settle(true)}
                  className="max-[360px]:order-1"
                  autoFocus
                >
                  {request.confirmLabel || t.common.confirm}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used inside ConfirmProvider");
  }
  return context;
}
