import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const content = {
    en: {
      title: "Reset Your Password",
      subtitle: "Enter your email and we'll send you a reset link.",
      emailLabel: "Email Address",
      emailPlaceholder: "Enter your email",
      submitBtn: "Send Reset Link",
      successTitle: "Check Your Email",
      successText:
        "If an account with that email exists, a password reset link has been sent. Check your inbox.",
      backToLogin: "Back to Login",
      noAccount: "No account found with this email.",
      note: "Secure Password Recovery",
    },
    ar: {
      title: "إعادة تعيين كلمة المرور",
      subtitle: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "أدخل بريدك الإلكتروني",
      submitBtn: "إرسال رابط الاسترداد",
      successTitle: "تحقق من بريدك",
      successText:
        "إذا كان هناك حساب بهذا البريد، فقد تم إرسال رابط إعادة تعيين كلمة المرور. تحقق من صندوق الوارد.",
      backToLogin: "العودة لتسجيل الدخول",
      noAccount: "لا يوجد حساب بهذا البريد الإلكتروني.",
      note: "استرداد آمن لكلمة المرور",
    },
    he: {
      title: "איפוס סיסמה",
      subtitle: "הזן את האימייל שלך ונשלח לך קישור לאיפוס.",
      emailLabel: "כתובת אימייל",
      emailPlaceholder: "הזן את האימייל שלך",
      submitBtn: "שלח קישור לאיפוס",
      successTitle: "בדוק את האימייל שלך",
      successText:
        "אם קיים חשבון עם האימייל הזה, נשלח קישור לאיפוס סיסמה. בדוק את תיבת הדואר הנכנס.",
      backToLogin: "חזרה להתחברות",
      noAccount: "לא נמצא חשבון עם האימייל הזה.",
      note: "שחזור סיסמה מאובטח",
    },
  };

  const c = content[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError(t?.loginPage?.errors?.emailRequired || "Please enter your email.");
      return;
    }

    const candidates = [
      ...JSON.parse(localStorage.getItem("candidates") || "[]"),
      ...JSON.parse(localStorage.getItem("users") || "[]"),
    ];
    const companies = JSON.parse(localStorage.getItem("companies") || "[]");

    const found =
      candidates.find((u: any) => u?.email?.trim().toLowerCase() === normalizedEmail) ||
      companies.find((u: any) => u?.email?.trim().toLowerCase() === normalizedEmail);

    if (!found) {
      setError(c.noAccount);
      return;
    }

    setSubmitted(true);
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)] px-4 py-10"
    >
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="grid min-h-[640px] lg:grid-cols-2">
          {/* LEFT PANEL */}
          <div className="relative hidden overflow-hidden lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.22),transparent_30%)]" />
            <div className="relative z-10 flex w-full flex-col justify-between p-10">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
                  <ShieldCheck size={16} />
                  {c.note}
                </div>
                <h1 className="max-w-md text-4xl font-extrabold leading-tight text-white">
                  {language === "en" && "We'll help you get back into your account."}
                  {language === "ar" && "سنساعدك على الوصول إلى حسابك مجدداً."}
                  {language === "he" && "נעזור לך לחזור לחשבון שלך."}
                </h1>
                <p className="mt-5 max-w-lg text-[16px] leading-7 text-white/70">
                  {language === "en" &&
                    "Enter the email address associated with your account, and we'll send you a link to reset your password."}
                  {language === "ar" &&
                    "أدخل البريد الإلكتروني المرتبط بحسابك وسنرسل لك رابطاً لإعادة تعيين كلمة المرور."}
                  {language === "he" &&
                    "הזן את כתובת האימייל המשויכת לחשבון שלך ונשלח לך קישור לאיפוס הסיסמה."}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-white/80">
                  <ShieldCheck size={18} className="text-cyan-300" />
                  {language === "en" && "Your account remains secure throughout this process"}
                  {language === "ar" && "حسابك يبقى آمناً خلال هذه العملية"}
                  {language === "he" && "החשבון שלך נשאר מאובטח לאורך כל התהליך"}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Top Nav */}
            <div className="mb-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft size={16} />
                {c.backToLogin}
              </button>

              <div className="flex items-center gap-2">
                {(["en", "ar", "he"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      language === lang
                        ? "bg-cyan-400 text-[#0f172a]"
                        : "bg-white/5 text-white/75 hover:bg-white/10"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {!submitted ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-extrabold text-white">{c.title}</h2>
                  <p className="mt-2 text-white/60">{c.subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative">
                    <Mail
                      className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${
                        isRTL ? "right-4" : "left-4"
                      }`}
                      size={18}
                    />
                    <input
                      type="email"
                      placeholder={c.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 text-white outline-none placeholder:text-white/40 transition focus:border-cyan-400/60 focus:bg-white/10 ${
                        isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"
                      }`}
                    />
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-4 text-base font-bold text-white shadow-[0_12px_30px_rgba(34,211,238,0.25)] transition hover:scale-[1.01]"
                  >
                    {c.submitBtn}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
                  <CheckCircle2 size={40} className="text-green-400" />
                </div>
                <h2 className="text-2xl font-extrabold text-white">{c.successTitle}</h2>
                <p className="mt-3 max-w-sm text-white/60">{c.successText}</p>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-8 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3.5 font-bold text-white shadow-[0_12px_30px_rgba(34,211,238,0.25)] transition hover:scale-[1.01]"
                >
                  {c.backToLogin}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
