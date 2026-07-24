import { useState } from "react";
import { motion } from "motion/react";
import { X, XCircle } from "lucide-react";
import { Button } from "./ui";

type RejectApplicationModalProps = {
  candidateName: string;
  jobTitle: string;
  t: any;
  isRTL: boolean;
  onConfirm: (rejectionReason: string) => Promise<void>;
  onCancel: () => void;
};

function RejectApplicationModal({ candidateName, jobTitle, t, isRTL, onConfirm, onCancel }: RejectApplicationModalProps) {
  const m = t.rejectApplicationModal;
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!rejectionReason.trim()) {
      setError(m.missingReasonError);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await onConfirm(rejectionReason.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : m.submitFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onCancel}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-application-modal-title"
        dir={isRTL ? "rtl" : "ltr"}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-[520px] overflow-y-auto rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,#09152f_0%,#0d1730_100%)] p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)] max-[480px]:rounded-[22px] max-[480px]:p-5"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label={t.common?.close || "Close"}
          className={`absolute top-5 rounded-full text-[#9aa4cf] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${isRTL ? "left-5" : "right-5"}`}
        >
          <X size={22} />
        </button>

        <div className="mb-2 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-400/10 text-rose-300">
            <XCircle size={20} />
          </div>
          <h2 id="reject-application-modal-title" className="text-[20px] font-extrabold text-white">
            {m.title}
          </h2>
        </div>
        <p className="mb-6 text-[15px] text-[#aeb4d6]">
          {m.subtitle} <span className="font-semibold text-white">{candidateName}</span> - {jobTitle}
        </p>

        <label className="mb-2 block text-[14px] font-semibold text-[#dbe2ff]">{m.reasonLabel}</label>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={4}
          placeholder={m.reasonPlaceholder}
          className="w-full resize-none rounded-[14px] border border-white/10 bg-white/[0.05] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#8ea2c7] focus:border-rose-400/60"
        />
        <p className="mt-2 text-xs text-white/40">{m.reasonHint}</p>

        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

        <div className="mt-7 grid grid-cols-2 gap-4 max-[420px]:grid-cols-1">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
            className="max-[420px]:order-2"
          >
            {m.cancelButton}
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            loading={submitting}
            className="max-[420px]:order-1"
          >
            {submitting ? m.confirming : m.confirmButton}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default RejectApplicationModal;
