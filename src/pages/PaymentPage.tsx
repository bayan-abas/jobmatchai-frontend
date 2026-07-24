import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Crown,
  Lock,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";
import { Button, FormField, Input, useConfirm, useToast } from "../components/ui";

function PaymentPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, refreshUser } = useAuth();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";
  const confirm = useConfirm();
  const toast = useToast();

  const [isActivating, setIsActivating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    cardName?: string;
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
  }>({});

  const monthlyPrice = 9.99;

  // Demo/simulated checkout - no Stripe account, no real card processor. Deliberately never
  // sends the card fields anywhere: they only exist to make the flow FEEL like a real checkout
  // for demo purposes (see the field-shaped validation below), then this calls the backend's
  // demo endpoint (see PaymentController#activatePremiumDemo), which activates Premium directly
  // on the account with no Stripe involved at all. refreshUser() picking up premium=true is what
  // flips this same page into its "Premium Activated!" view below - no separate success route,
  // matching the single-page flow this had before Stripe was ever wired in.
  const handleSubscribe = async () => {
    const errors: typeof fieldErrors = {};
    if (!cardName.trim()) errors.cardName = t.common.required;
    if (!/^\d{13,19}$/.test(cardNumber.replace(/\s+/g, ""))) errors.cardNumber = t.common.required;
    if (!/^\d{2}\/\d{2}$/.test(expiry.trim())) errors.expiry = t.common.required;
    if (!/^\d{3,4}$/.test(cvv.trim())) errors.cvv = t.common.required;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsActivating(true);

    try {
      await apiFetch("/api/payments/demo/activate-premium", { method: "POST" });
      await refreshUser();
      toast.success(t.paymentPage.activatedPlan);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : t.feedback.somethingWentWrong
      );
    } finally {
      setIsActivating(false);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = await confirm({
      title: t.paymentPage.cancelModalTitle || "Cancel Premium subscription?",
      description: t.paymentPage.cancelConfirm,
      confirmLabel: t.paymentPage.cancelSubscription,
      cancelLabel: t.paymentPage.keepPremium || "Keep Premium",
      tone: "danger",
    });

    if (!confirmed) return;

    setIsCancelling(true);

    try {
      await apiFetch("/api/payments/demo/cancel-premium", { method: "POST" });
      await refreshUser();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : t.feedback.somethingWentWrong
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
          <div className="mx-auto max-w-[760px] rounded-panel border border-white/10 bg-[rgba(44,45,95,0.94)] p-10 text-center shadow-elevated">
            <div className="mx-auto mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#22c55e] to-[#14b8a6] text-white shadow-[0_18px_40px_rgba(34,197,94,0.28)]">
              <Crown size={38} />
            </div>

            <h1 className="text-[36px] font-extrabold text-white">
              {t.paymentPage.activatedPlan}
            </h1>

            <p className="mx-auto mt-3 max-w-[520px] text-[17px] leading-8 text-[#b9c0ea]">
              {t.paymentPage.premiumMonthly}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/candidate-dashboard")}
                className="rounded-[18px] bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] px-8 py-4 text-[16px] font-bold text-white shadow-[0_16px_35px_rgba(168,85,247,0.35)] transition hover:scale-[1.01]"
              >
                {t.paymentPage.goToDashboard}
              </button>

              <Button
                variant="danger"
                size="lg"
                loading={isCancelling}
                onClick={handleCancelSubscription}
              >
                {isCancelling
                  ? t.paymentPage.cancelling
                  : t.paymentPage.cancelSubscription}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <section className="rounded-panel border border-white/10 bg-[rgba(44,45,95,0.94)] p-8 shadow-elevated">
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

              <div className="mb-8 rounded-card border border-[#a855f7]/20 bg-[rgba(168,85,247,0.08)] p-6">
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

                  <div className={`rounded-card border border-white/10 bg-white/[0.05] px-5 py-4 ${isRTL ? "text-right" : "text-left"}`}>
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

              <div className="rounded-card border border-white/10 bg-white/[0.04] p-6">
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

                <div className="grid gap-4">
                  <FormField label={t.paymentPage.cardholderName} htmlFor="payment-card-name" error={fieldErrors.cardName}>
                    <Input
                      id="payment-card-name"
                      icon={<UserIcon size={18} />}
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder={t.paymentPage.cardholderName}
                      disabled={isActivating}
                      hasError={!!fieldErrors.cardName}
                      autoComplete="cc-name"
                    />
                  </FormField>

                  <FormField label={t.paymentPage.cardNumber} htmlFor="payment-card-number" error={fieldErrors.cardNumber}>
                    <Input
                      id="payment-card-number"
                      icon={<CreditCard size={18} />}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      inputMode="numeric"
                      disabled={isActivating}
                      hasError={!!fieldErrors.cardNumber}
                      autoComplete="cc-number"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label={t.paymentPage.expiry} htmlFor="payment-expiry" error={fieldErrors.expiry}>
                      <Input
                        id="payment-expiry"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        disabled={isActivating}
                        hasError={!!fieldErrors.expiry}
                        autoComplete="cc-exp"
                      />
                    </FormField>

                    <FormField label={t.paymentPage.cvv} htmlFor="payment-cvv" error={fieldErrors.cvv}>
                      <Input
                        id="payment-cvv"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        inputMode="numeric"
                        disabled={isActivating}
                        hasError={!!fieldErrors.cvv}
                        autoComplete="cc-csc"
                      />
                    </FormField>
                  </div>
                </div>

                <Button fullWidth size="lg" className="mt-6" loading={isActivating} onClick={handleSubscribe}>
                  {isActivating
                    ? t.paymentPage.activating
                    : `${t.paymentPage.pay} $${monthlyPrice}`}
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[#9ca8d8]">
                  <Lock size={16} />
                  {t.paymentPage.securePayment}
                </div>
              </div>
            </section>

            <aside className="rounded-panel border border-white/10 bg-[rgba(44,45,95,0.94)] p-8 shadow-elevated">
              <h2 className="mb-6 text-[24px] font-extrabold text-white">
                {t.paymentPage.orderSummary}
              </h2>

              <div className="mb-6 rounded-card border border-[#a855f7]/20 bg-[rgba(168,85,247,0.08)] p-5">
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

              <div className="mb-6 rounded-card border border-white/10 bg-white/[0.04] p-5">
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

              <div className="rounded-card border border-white/10 bg-white/[0.04] p-5">
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
    </>
  );
}

export default PaymentPage;
