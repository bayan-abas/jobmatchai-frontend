import { useState } from "react";
import { X, XCircle, Loader2 } from "lucide-react";

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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="relative max-h-[85vh] w-full max-w-[520px] overflow-y-auto rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,#09152f_0%,#0d1730_100%)] p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          className={`absolute top-5 text-[#9aa4cf] transition hover:text-white ${isRTL ? "left-5" : "right-5"}`}
        >
          <X size={22} />
        </button>

        <div className="mb-2 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-400/10 text-rose-300">
            <XCircle size={20} />
          </div>
          <h2 className="text-[20px] font-extrabold text-white">{m.title}</h2>
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

        <div className="mt-7 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-[14px] border border-white/15 bg-transparent px-5 py-3 text-[16px] font-bold text-white transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {m.cancelButton}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-rose-500 to-red-500 px-5 py-3 text-[16px] font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? m.confirming : m.confirmButton}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectApplicationModal;
