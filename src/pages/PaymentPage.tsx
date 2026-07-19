import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Crown,
  Lock,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";

function PaymentPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, refreshUser } = useAuth();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const monthlyPrice = 9.99;

  // Starts a real Stripe Checkout session and redirects there - Stripe itself collects the
  // card and handles the charge. Control comes back to PaymentSuccessPage (which calls
  // /api/payments/confirm) or PaymentCancelPage depending on what the candidate does there;
  // this page never activates Premium directly.
  const handleSubscribe = async () => {
    setError("");
    setIsActivating(true);

    try {
      const data = await apiFetch("/api/payments/create-checkout-session", { method: "POST" });
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError("Could not start checkout. Please try again.");
      setIsActivating(false);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not start checkout. Please try again."
      );
      setIsActivating(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelError("");
    setIsCancelling(true);

    try {
      await apiFetch("/api/payments/cancel-subscription", { method: "POST" });
      await refreshUser();
      setShowCancelModal(false);
    } catch (err) {
      setCancelError(
        err instanceof ApiError
          ? err.message
          : "Could not cancel subscription. Please try again."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-10 lg:px-8 ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="mx-auto max-w-[1100px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
          {t.common.back}
        </button>

        {user?.premium ? (
          <div className="mx-auto max-w-[760px] rounded-[32px] border border-white/10 bg-[rgba(44,45,95,0.94)] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
            <div className="mx-auto mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#22c55e] to-[#14b8a6] text-white shadow-[0_18px_40px_rgba(34,197,94,0.28)]">
              <Crown size={38} />
            </div>

            <h1 className="text-[36px] font-extrabold text-white">
              {t.paymentPage.activatedPlan}
            </h1>

            <p className="mx-auto mt-3 max-w-[520px] text-[17px] leading-8 text-[#b9c0ea]">
              {t.paymentPage.premiumMonthly}
            </p>

            {cancelError && (
              <div className="mx-auto mt-4 max-w-[480px] rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {cancelError}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/candidate-dashboard")}
                className="rounded-[18px] bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] px-8 py-4 text-[16px] font-bold text-white shadow-[0_16px_35px_rgba(168,85,247,0.35)] transition hover:scale-[1.01]"
              >
                {t.paymentPage.goToDashboard}
              </button>

              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                disabled={isCancelling}
                className="rounded-[18px] border border-red-400/30 bg-red-500/10 px-8 py-4 text-[16px] font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCancelling
                  ? t.paymentPage.cancelling
                  : t.paymentPage.cancelSubscription}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <section className="rounded-[32px] border border-white/10 bg-[rgba(44,45,95,0.94)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <div className="mb-8 flex items-start gap-4">
                <div className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] text-white shadow-[0_20px_40px_rgba(168,85,247,0.35)]">
                  <Crown size={30} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-[34px] font-extrabold leading-tight text-white">
                    {t.paymentPage.title}
                  </h1>
                  <p className="mt-2 text-[17px] text-[#aeb4d6]">
                    {t.paymentPage.subtitle}
                  </p>
                </div>
              </div>

              <div className="mb-8 rounded-[26px] border border-[#a855f7]/20 bg-[rgba(168,85,247,0.08)] p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[15px] text-[#cdb8ff]">
                      {t.paymentPage.selectedPlan}
                    </p>
                    <h2 className="mt-1 text-[30px] font-extrabold text-white">
                      {t.paymentPage.premiumMonthly}
                    </h2>
                    <p className="mt-2 text-[15px] text-[#b9c0ea]">
                      {t.paymentPage.flexible}
                    </p>
                  </div>

                  <div className={`rounded-[22px] border border-white/10 bg-white/[0.05] px-5 py-4 ${isRTL ? "text-right" : "text-left"}`}>
                    <p className="text-[14px] text-[#b9c0ea]">
                      {t.paymentPage.price}
                    </p>
                    <h3 className="mt-1 text-[30px] font-extrabold text-white">
                      ${monthlyPrice}
                      <span className="text-[14px] font-medium text-[#aeb4d6]">
                        {" "}
                        / {t.paymentPage.perMonth}
                      </span>
                    </h3>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8b5cf6]/15 text-[#c084fc]">
                    <CreditCard size={20} />
                  </div>
                  <h2 className="text-[22px] font-extrabold text-white">
                    {t.paymentPage.paymentDetails}
                  </h2>
                </div>

                <p className="mb-6 text-[15px] leading-7 text-[#b9c0ea]">
                  {t.paymentPage.secureText}
                </p>

                {error && (
                  <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={isActivating}
                  className="mt-2 w-full rounded-[18px] bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] px-6 py-4 text-[17px] font-bold text-white shadow-[0_16px_35px_rgba(168,85,247,0.35)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isActivating
                    ? t.paymentPage.activating
                    : `${t.paymentPage.pay} $${monthlyPrice}`}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[#9ca8d8]">
                  <Lock size={16} />
                  {t.paymentPage.securePayment}
                </div>
              </div>
            </section>

            <aside className="rounded-[32px] border border-white/10 bg-[rgba(44,45,95,0.94)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <h2 className="mb-6 text-[24px] font-extrabold text-white">
                {t.paymentPage.orderSummary}
              </h2>

              <div className="mb-6 rounded-[24px] border border-[#a855f7]/20 bg-[rgba(168,85,247,0.08)] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] text-white">
                    <Crown size={20} />
                  </div>

                  <div>
                    <h3 className="text-[18px] font-extrabold text-white">
                      {t.paymentPage.premiumMonthly}
                    </h3>
                    <p className="text-[14px] text-[#b9c0ea]">
                      {t.paymentPage.billedMonthly}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-[15px] text-[#d8ddf6]">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>{t.paymentPage.unlimitedApplications}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>{t.paymentPage.aiAnalysis}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>{t.paymentPage.aiInsights}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>{t.paymentPage.priorityStatus}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>{t.paymentPage.cancelAnytime}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-[#7dd3fc]" />
                  <h3 className="text-[18px] font-extrabold text-white">
                    {t.paymentPage.secureCheckout}
                  </h3>
                </div>

                <p className="text-[15px] leading-7 text-[#b9c0ea]">
                  {t.paymentPage.secureText}
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <div className="mb-4 flex items-center justify-between text-[15px] text-[#b9c0ea]">
                  <span>{t.paymentPage.plan}</span>
                  <span className="font-semibold text-white">
                    {t.paymentPage.premiumMonthly}
                  </span>
                </div>

                <div className="mb-4 flex items-center justify-between text-[15px] text-[#b9c0ea]">
                  <span>{t.paymentPage.billing}</span>
                  <span className="font-semibold text-white">
                    {t.paymentPage.everyMonth}
                  </span>
                </div>

                <div className="mb-4 flex items-center justify-between text-[15px] text-[#b9c0ea]">
                  <span>{t.paymentPage.status}</span>
                  <span className="font-semibold text-emerald-300">
                    {t.paymentPage.activeAfterPayment}
                  </span>
                </div>

                <div className="mb-4 h-px bg-white/10" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[14px] text-[#b9c0ea]">
                      {t.paymentPage.total}
                    </p>
                    <h3 className="mt-1 text-[30px] font-extrabold text-white">
                      ${monthlyPrice}
                    </h3>
                  </div>

                  <p className="text-[14px] text-[#aeb4d6]">
                    / {t.paymentPage.perMonth}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>

    {showCancelModal && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(1,4,19,0.72)] px-4 backdrop-blur-md"
        onClick={() => !isCancelling && setShowCancelModal(false)}
      >
        <div
          className="relative w-full max-w-[480px] rounded-[30px] border border-[rgba(255,166,64,0.3)] bg-[linear-gradient(180deg,#09152f_0%,#0d1730_100%)] p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
          onClick={(e) => e.stopPropagation()}
        >
          {!isCancelling && (
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className={`absolute top-5 text-[#9aa4cf] transition hover:text-white ${
                isRTL ? "left-5" : "right-5"
              }`}
            >
              <X size={22} />
            </button>
          )}

          <div className="mb-5 flex justify-center">
            <div className="flex h-[78px] w-[78px] items-center justify-center rounded-[24px] bg-gradient-to-br from-[#f59e0b] to-[#ea580c] shadow-[0_18px_40px_rgba(245,158,11,0.35)]">
              <AlertTriangle size={34} />
            </div>
          </div>

          <h2 className="mb-2 text-center text-[24px] font-extrabold">
            {t.paymentPage.cancelModalTitle || "Cancel Premium subscription?"}
          </h2>

          <p className="mb-6 text-center text-[16px] text-[#aeb4d6]">
            {t.paymentPage.cancelConfirm}
          </p>

          {cancelError && (
            <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {cancelError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 max-[420px]:grid-cols-1">
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
              className="rounded-[14px] border border-white/15 bg-transparent px-5 py-3 text-[16px] font-bold text-white transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t.paymentPage.keepPremium || "Keep Premium"}
            </button>

            <button
              type="button"
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              className="rounded-[14px] bg-gradient-to-r from-[#f59e0b] to-[#ea580c] px-5 py-3 text-[16px] font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCancelling
                ? t.paymentPage.cancelling
                : t.paymentPage.cancelSubscription}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default PaymentPage;
