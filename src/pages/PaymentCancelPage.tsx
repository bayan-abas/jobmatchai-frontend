import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

function PaymentCancelPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-10"
    >
      <div className="mx-auto max-w-[760px] rounded-[32px] border border-white/10 bg-[rgba(44,45,95,0.94)] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        <div className="mx-auto mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-amber-500/15 text-amber-300">
          <XCircle size={38} />
        </div>

        <h1 className="text-[30px] font-extrabold text-white">
          Checkout cancelled
        </h1>

        <p className="mx-auto mt-3 max-w-[520px] text-[17px] leading-8 text-[#b9c0ea]">
          No charge was made. You can try again anytime.
        </p>

        <button
          type="button"
          onClick={() => navigate("/payment")}
          className="mt-8 rounded-[18px] bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] px-8 py-4 text-[16px] font-bold text-white shadow-[0_16px_35px_rgba(168,85,247,0.35)] transition hover:scale-[1.01]"
        >
          {t.common.back}
        </button>
      </div>
    </div>
  );
}

export default PaymentCancelPage;
