import { motion } from "motion/react";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "./ui";

type ApplySuccessCopy = {
  title: string;
  message: string;
  viewApplications: string;
  keepBrowsing: string;
  close?: string;
};

type ApplicationSuccessModalProps = {
  jobTitle: string;
  companyName: string;
  copy: ApplySuccessCopy;
  isRTL?: boolean;
  onViewApplications: () => void;
  onClose: () => void;
};

function ApplicationSuccessModal({
  jobTitle,
  companyName,
  copy,
  isRTL,
  onViewApplications,
  onClose,
}: ApplicationSuccessModalProps) {
  const message = copy.message
    .replace("{jobTitle}", jobTitle)
    .replace("{companyName}", companyName);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-success-modal-title"
        dir={isRTL ? "rtl" : "ltr"}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,#09152f_0%,#0d1730_100%)] p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)] max-[480px]:rounded-[22px] max-[480px]:p-5"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.close || "Close"}
          className={`absolute top-5 rounded-full text-[#9aa4cf] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${isRTL ? "left-5" : "right-5"}`}
        >
          <X size={22} />
        </button>

        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 size={36} className="text-emerald-400" />
          </div>
        </div>

        <h2 id="application-success-modal-title" className="mb-3 text-center text-[22px] font-extrabold text-white">
          {copy.title}
        </h2>
        <p className="mb-7 text-center text-[15px] leading-6 text-[#aeb4d6]">{message}</p>

        <div className="grid grid-cols-2 gap-4 max-[420px]:grid-cols-1">
          <Button type="button" variant="secondary" onClick={onClose} className="max-[420px]:order-2">
            {copy.keepBrowsing}
          </Button>

          <Button type="button" variant="success" onClick={onViewApplications} className="max-[420px]:order-1">
            {copy.viewApplications}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ApplicationSuccessModal;
