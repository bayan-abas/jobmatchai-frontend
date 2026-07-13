import { useEffect, useRef, useState } from "react";
import { X, MailCheck, Loader2 } from "lucide-react";

type EmailVerificationModalProps = {
  email: string;
  t: any;
  isRTL: boolean;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onClose: () => void;
};

const RESEND_COOLDOWN_SECONDS = 30;

function EmailVerificationModal({ email, t, isRTL, onVerify, onResend, onClose }: EmailVerificationModalProps) {
  const v = t.verificationModal;
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      setError(v.invalidCode);
      return;
    }

    setError("");
    setVerifying(true);
    try {
      await onVerify(cleanCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : v.invalidCode);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError("");
    setResending(true);
    try {
      await onResend();
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : v.resendFailed);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="w-full max-w-[440px] rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.96)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.55)]"
      >
        <div className={`mb-5 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
              <MailCheck size={20} />
            </div>
            <h2 className="text-[20px] font-extrabold text-white">{v.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition hover:bg-white/[0.12] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-1 text-sm leading-6 text-[#c4cae9]">
          {v.subtitle} <span className="font-semibold text-white">{email}</span>
        </p>
        <p className="mb-6 text-xs leading-5 text-white/45">{v.checkSpamHint}</p>

        <label className="mb-2 block text-[13px] font-semibold text-[#c4cae9]">{v.codeLabel}</label>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          placeholder="000000"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3.5 text-center text-[24px] font-bold tracking-[0.5em] text-white outline-none focus:border-cyan-400/50"
        />

        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || code.length !== 6}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7f4cff] to-[#a855f7] px-4 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(99,102,241,0.28)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {verifying && <Loader2 size={16} className="animate-spin" />}
          {verifying ? v.verifying : v.verifyButton}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="mt-4 w-full text-center text-sm font-semibold text-cyan-300 transition hover:text-cyan-200 disabled:cursor-not-allowed disabled:text-white/30"
        >
          {cooldown > 0 ? `${v.resendButton} (${cooldown}s)` : resending ? v.resending : v.resendButton}
        </button>
      </div>
    </div>
  );
}

export default EmailVerificationModal;
