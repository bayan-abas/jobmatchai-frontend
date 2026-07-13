import { X, CheckCircle2 } from "lucide-react";

type ApplySuccessCopy = {
  title: string;
  message: string;
  viewApplications: string;
  keepBrowsing: string;
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="relative max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,#09152f_0%,#0d1730_100%)] p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-5 text-[#9aa4cf] transition hover:text-white ${isRTL ? "left-5" : "right-5"}`}
        >
          <X size={22} />
        </button>

        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 size={36} className="text-emerald-400" />
          </div>
        </div>

        <h2 className="mb-3 text-center text-[22px] font-extrabold text-white">{copy.title}</h2>
        <p className="mb-7 text-center text-[15px] leading-6 text-[#aeb4d6]">{message}</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[14px] border border-white/15 bg-transparent px-5 py-3 text-[15px] font-bold text-white transition hover:bg-white/[0.05]"
          >
            {copy.keepBrowsing}
          </button>

          <button
            type="button"
            onClick={onViewApplications}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-[15px] font-bold text-white transition hover:opacity-90"
          >
            {copy.viewApplications}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationSuccessModal;
