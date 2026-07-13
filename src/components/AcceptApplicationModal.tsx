import { useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";

export type ContactMethod =
  | "phone_call"
  | "email"
  | "whatsapp"
  | "linkedin"
  | "in_person_meeting"
  | "other";

type AcceptApplicationModalProps = {
  candidateName: string;
  jobTitle: string;
  t: any;
  isRTL: boolean;
  onConfirm: (contactMethod: ContactMethod, contactMethodOther: string, contactMessage: string) => Promise<void>;
  onCancel: () => void;
};

const CONTACT_METHODS: ContactMethod[] = [
  "phone_call",
  "email",
  "whatsapp",
  "linkedin",
  "in_person_meeting",
  "other",
];

function AcceptApplicationModal({ candidateName, jobTitle, t, isRTL, onConfirm, onCancel }: AcceptApplicationModalProps) {
  const m = t.acceptApplicationModal;
  const [contactMethod, setContactMethod] = useState<ContactMethod | null>(null);
  const [contactMethodOther, setContactMethodOther] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const methodLabel = (method: ContactMethod) => {
    switch (method) {
      case "phone_call":
        return m.phoneCall;
      case "email":
        return m.email;
      case "whatsapp":
        return m.whatsapp;
      case "linkedin":
        return m.linkedin;
      case "in_person_meeting":
        return m.inPersonMeeting;
      case "other":
        return m.other;
    }
  };

  const handleConfirm = async () => {
    if (!contactMethod) {
      setError(m.missingMethodError);
      return;
    }
    if (contactMethod === "other" && !contactMethodOther.trim()) {
      setError(m.missingOtherError);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await onConfirm(contactMethod, contactMethodOther.trim(), contactMessage.trim());
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
            <CheckCircle2 size={20} />
          </div>
          <h2 className="text-[20px] font-extrabold text-white">{m.title}</h2>
        </div>
        <p className="mb-6 text-[15px] text-[#aeb4d6]">
          {m.subtitle} <span className="font-semibold text-white">{candidateName}</span> - {jobTitle}
        </p>

        <label className="mb-2 block text-[14px] font-semibold text-[#dbe2ff]">{m.contactMethodLabel}</label>
        <div className="grid grid-cols-2 gap-2.5">
          {CONTACT_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setContactMethod(method)}
              className={`rounded-[14px] border px-4 py-3 text-left text-[14px] font-semibold transition ${
                contactMethod === method
                  ? "border-[#7c88ff] bg-[#7c88ff]/15 text-white"
                  : "border-white/10 bg-white/[0.04] text-[#c4cae9] hover:bg-white/[0.07]"
              } ${isRTL ? "text-right" : "text-left"}`}
            >
              {methodLabel(method)}
            </button>
          ))}
        </div>

        {contactMethod === "other" && (
          <div className="mt-4">
            <input
              type="text"
              value={contactMethodOther}
              onChange={(e) => setContactMethodOther(e.target.value)}
              placeholder={m.otherPlaceholder}
              className="w-full rounded-[14px] border border-white/10 bg-white/[0.05] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#8ea2c7] focus:border-[#7c88ff]/60"
            />
          </div>
        )}

        <div className="mt-5">
          <label className="mb-2 block text-[14px] font-semibold text-[#dbe2ff]">{m.messageLabel}</label>
          <textarea
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            rows={3}
            placeholder={m.messagePlaceholder}
            className="w-full resize-none rounded-[14px] border border-white/10 bg-white/[0.05] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#8ea2c7] focus:border-[#7c88ff]/60"
          />
        </div>

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
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-[16px] font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? m.confirming : m.confirmButton}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AcceptApplicationModal;
