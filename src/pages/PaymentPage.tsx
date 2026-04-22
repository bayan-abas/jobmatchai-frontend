import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Crown,
  Lock,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

function PaymentPage() {
  const navigate = useNavigate();

  const [paid, setPaid] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const monthlyPrice = 9.99;

  const handlePayment = () => {
    if (!cardName || !cardNumber || !expiry || !cvv) {
      alert("Please fill in all payment details.");
      return;
    }

    setPaid(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-10 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {!paid ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <section className="rounded-[32px] border border-white/10 bg-[rgba(44,45,95,0.94)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <div className="mb-8 flex items-start gap-4">
                <div className="flex h-[74px] w-[74px] items-center justify-center rounded-[24px] bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] text-white shadow-[0_20px_40px_rgba(168,85,247,0.35)]">
                  <Crown size={30} />
                </div>

                <div>
                  <h1 className="text-[34px] font-extrabold leading-tight text-white">
                    Upgrade to Premium
                  </h1>
                  <p className="mt-2 text-[17px] text-[#aeb4d6]">
                    Get unlimited applications and unlock advanced AI-powered
                    career tools.
                  </p>
                </div>
              </div>

              <div className="mb-8 rounded-[26px] border border-[#a855f7]/20 bg-[rgba(168,85,247,0.08)] p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[15px] text-[#cdb8ff]">Selected Plan</p>
                    <h2 className="mt-1 text-[30px] font-extrabold text-white">
                      Premium Monthly
                    </h2>
                    <p className="mt-2 text-[15px] text-[#b9c0ea]">
                      Flexible monthly subscription. Cancel anytime.
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-white/[0.05] px-5 py-4 text-left">
                    <p className="text-[14px] text-[#b9c0ea]">Price</p>
                    <h3 className="mt-1 text-[30px] font-extrabold text-white">
                      $9.99
                      <span className="text-[14px] font-medium text-[#aeb4d6]">
                        {" "}
                        / month
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
                    Payment Details
                  </h2>
                </div>

                <div className="grid gap-4">
                  <input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Cardholder Name"
                    className="rounded-[16px] border border-white/10 bg-white/[0.05] px-5 py-4 text-white outline-none placeholder:text-[#8ea2c7]"
                  />

                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card Number"
                    className="rounded-[16px] border border-white/10 bg-white/[0.05] px-5 py-4 text-white outline-none placeholder:text-[#8ea2c7]"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="rounded-[16px] border border-white/10 bg-white/[0.05] px-5 py-4 text-white outline-none placeholder:text-[#8ea2c7]"
                    />

                    <input
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="CVV"
                      className="rounded-[16px] border border-white/10 bg-white/[0.05] px-5 py-4 text-white outline-none placeholder:text-[#8ea2c7]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePayment}
                  className="mt-6 w-full rounded-[18px] bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] px-6 py-4 text-[17px] font-bold text-white shadow-[0_16px_35px_rgba(168,85,247,0.35)] transition hover:scale-[1.01]"
                >
                  Pay $9.99
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[#9ca8d8]">
                  <Lock size={16} />
                  Secure Payment
                </div>
              </div>
            </section>

            <aside className="rounded-[32px] border border-white/10 bg-[rgba(44,45,95,0.94)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <h2 className="mb-6 text-[24px] font-extrabold text-white">
                Order Summary
              </h2>

              <div className="mb-6 rounded-[24px] border border-[#a855f7]/20 bg-[rgba(168,85,247,0.08)] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] text-white">
                    <Crown size={20} />
                  </div>

                  <div>
                    <h3 className="text-[18px] font-extrabold text-white">
                      Premium Monthly
                    </h3>
                    <p className="text-[14px] text-[#b9c0ea]">
                      Billed monthly
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-[15px] text-[#d8ddf6]">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>Unlimited job applications</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>AI CV analysis and scoring</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>Detailed AI match insights</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>Priority application status</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-[#7dd3fc]" />
                  <h3 className="text-[18px] font-extrabold text-white">
                    Secure Checkout
                  </h3>
                </div>

                <p className="text-[15px] leading-7 text-[#b9c0ea]">
                  Your payment details are protected in this secure checkout
                  flow.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <div className="mb-4 flex items-center justify-between text-[15px] text-[#b9c0ea]">
                  <span>Plan</span>
                  <span className="font-semibold text-white">
                    Premium Monthly
                  </span>
                </div>

                <div className="mb-4 flex items-center justify-between text-[15px] text-[#b9c0ea]">
                  <span>Billing</span>
                  <span className="font-semibold text-white">Every month</span>
                </div>

                <div className="mb-4 flex items-center justify-between text-[15px] text-[#b9c0ea]">
                  <span>Status</span>
                  <span className="font-semibold text-emerald-300">
                    Active after payment
                  </span>
                </div>

                <div className="mb-4 h-px bg-white/10" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[14px] text-[#b9c0ea]">Total</p>
                    <h3 className="mt-1 text-[30px] font-extrabold text-white">
                      $9.99
                    </h3>
                  </div>

                  <p className="text-[14px] text-[#aeb4d6]">/ month</p>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="mx-auto max-w-[760px] rounded-[32px] border border-white/10 bg-[rgba(44,45,95,0.94)] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
            <div className="mx-auto mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#22c55e] to-[#14b8a6] text-white shadow-[0_18px_40px_rgba(34,197,94,0.28)]">
              <CheckCircle2 size={38} />
            </div>

            <h1 className="text-[36px] font-extrabold text-white">
              Payment Successful 🎉
            </h1>

            <p className="mx-auto mt-3 max-w-[520px] text-[17px] leading-8 text-[#b9c0ea]">
              Your account has been upgraded to Premium successfully. You can
              now enjoy unlimited applications and premium AI features.
            </p>

            <div className="mx-auto mt-8 max-w-[420px] rounded-[24px] border border-[#22c55e]/20 bg-[#22c55e]/10 p-5 text-left">
              <p className="text-[14px] text-[#b9c0ea]">Activated Plan</p>
              <h2 className="mt-1 text-[24px] font-extrabold text-white">
                Premium Monthly
              </h2>
              <p className="mt-2 text-[15px] text-[#d8ddf6]">
                Total paid: $9.99
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/candidate-dashboard")}
              className="mt-8 rounded-[18px] bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] px-8 py-4 text-[16px] font-bold text-white shadow-[0_16px_35px_rgba(168,85,247,0.35)] transition hover:scale-[1.01]"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentPage;