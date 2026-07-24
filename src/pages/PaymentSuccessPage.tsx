import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Crown, XCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("error");
      setError("Missing payment session.");
      return;
    }

    let cancelled = false;

    async function confirm() {
      try {
        await apiFetch(`/api/payments/confirm?session_id=${encodeURIComponent(sessionId!)}`);
        if (!cancelled) {
          setStatus("success");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(err instanceof ApiError ? err.message : "Could not confirm payment.");
        }
      }
    }

    confirm();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-10"
    >
      <div className="mx-auto max-w-[760px] rounded-panel border border-white/10 bg-[rgba(44,45,95,0.94)] p-10 text-center shadow-elevated">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-white/10 text-white">
              <Crown size={38} className="animate-pulse" />
            </div>
            <h1 className="text-[30px] font-extrabold text-white">
              Confirming your payment...
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#22c55e] to-[#14b8a6] text-white shadow-[0_18px_40px_rgba(34,197,94,0.28)]">
              <CheckCircle2 size={38} />
            </div>

            <h1 className="text-[36px] font-extrabold text-white">
              {t.paymentPage.successTitle}
            </h1>

            <p className="mx-auto mt-3 max-w-[520px] text-[17px] leading-8 text-[#b9c0ea]">
              {t.paymentPage.successText}
            </p>

            <button
              type="button"
              onClick={() => navigate("/candidate-dashboard")}
              className="mt-8 rounded-[18px] bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] px-8 py-4 text-[16px] font-bold text-white shadow-[0_16px_35px_rgba(168,85,247,0.35)] transition hover:scale-[1.01]"
            >
              {t.paymentPage.goToDashboard}
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-rose-500/15 text-rose-300">
              <XCircle size={38} />
            </div>

            <h1 className="text-[30px] font-extrabold text-white">
              We couldn't confirm your payment
            </h1>

            <p className="mx-auto mt-3 max-w-[520px] text-[17px] leading-8 text-[#b9c0ea]">
              {error}
            </p>

            <button
              type="button"
              onClick={() => navigate("/payment")}
              className="mt-8 rounded-[18px] bg-white/10 px-8 py-4 text-[16px] font-bold text-white transition hover:bg-white/15"
            >
              {t.common.back}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
