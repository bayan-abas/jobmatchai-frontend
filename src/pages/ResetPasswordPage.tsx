import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";
import { Button, FormField, Input, useToast } from "../components/ui";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";
  const toast = useToast();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const content = {
    en: {
      note: "Secure Password Recovery",
      title: "Choose a new password.",
      subtitle:
        "This link is valid for a limited time. Once you set a new password you'll be able to sign in right away.",
      formTitle: "Reset Your Password",
      formSubtitle: "Enter a new password for your account.",
      newPasswordLabel: "New Password",
      newPasswordPlaceholder: "New password",
      confirmPasswordLabel: "Confirm New Password",
      confirmPasswordPlaceholder: "Confirm new password",
      submitBtn: "Reset Password",
      successTitle: "Password Updated",
      successText: "Your password has been reset. You can now sign in with your new password.",
      errInvalidLink: "This reset link is invalid or has expired.",
      errTooShort: "Password must be at least 6 characters.",
      errNeedsLetterNumber: "Password must contain both letters and numbers.",
      errMismatch: "Passwords do not match.",
    },
    ar: {
      note: "استرداد آمن لكلمة المرور",
      title: "اختر كلمة مرور جديدة.",
      subtitle: "هذا الرابط صالح لفترة محدودة. بمجرد تعيين كلمة مرور جديدة، ستتمكن من تسجيل الدخول فوراً.",
      formTitle: "إعادة تعيين كلمة المرور",
      formSubtitle: "أدخل كلمة مرور جديدة لحسابك.",
      newPasswordLabel: "كلمة المرور الجديدة",
      newPasswordPlaceholder: "كلمة المرور الجديدة",
      confirmPasswordLabel: "تأكيد كلمة المرور الجديدة",
      confirmPasswordPlaceholder: "تأكيد كلمة المرور الجديدة",
      submitBtn: "إعادة تعيين كلمة المرور",
      successTitle: "تم تحديث كلمة المرور",
      successText: "تم إعادة تعيين كلمة المرور الخاصة بك. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.",
      errInvalidLink: "رابط إعادة التعيين هذا غير صالح أو منتهي الصلاحية.",
      errTooShort: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
      errNeedsLetterNumber: "يجب أن تحتوي كلمة المرور على أحرف وأرقام.",
      errMismatch: "كلمتا المرور غير متطابقتين.",
    },
    he: {
      note: "שחזור סיסמה מאובטח",
      title: "בחר סיסמה חדשה.",
      subtitle: "הקישור תקף לזמן מוגבל. לאחר הגדרת סיסמה חדשה תוכל להתחבר מיד.",
      formTitle: "איפוס סיסמה",
      formSubtitle: "הזן סיסמה חדשה עבור החשבון שלך.",
      newPasswordLabel: "סיסמה חדשה",
      newPasswordPlaceholder: "סיסמה חדשה",
      confirmPasswordLabel: "אימות סיסמה חדשה",
      confirmPasswordPlaceholder: "אימות סיסמה חדשה",
      submitBtn: "איפוס סיסמה",
      successTitle: "הסיסמה עודכנה",
      successText: "הסיסמה שלך אופסה. כעת תוכל להתחבר עם הסיסמה החדשה.",
      errInvalidLink: "קישור האיפוס אינו תקין או שפג תוקפו.",
      errTooShort: "הסיסמה חייבת להכיל לפחות 6 תווים.",
      errNeedsLetterNumber: "הסיסמה חייבת להכיל גם אותיות וגם ספרות.",
      errMismatch: "הסיסמאות אינן תואמות.",
    },
  };

  const c = content[language];

  // מאמת את הסיסמה החדשה ושולח אותה לשרת יחד עם הטוקן מהלינק כדי לעדכן את הסיסמה בפועל
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setFieldErrors({});

    if (!token) {
      toast.error(c.errInvalidLink);
      return;
    }

    if (newPassword.length < 6) {
      setFieldErrors({ newPassword: c.errTooShort });
      return;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setFieldErrors({ newPassword: c.errNeedsLetterNumber });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: c.errMismatch });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });

      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t?.feedback?.somethingWentWrong || "Server connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)] px-4 py-10"
    >
      <div className="mx-auto max-w-6xl overflow-hidden rounded-panel border border-white/10 bg-white/5 shadow-elevated backdrop-blur-xl">
        <div className="grid lg:min-h-[640px] lg:grid-cols-2">
          <div className="relative hidden overflow-hidden lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.22),transparent_30%)]" />
            <div className="relative z-10 flex w-full flex-col justify-between p-10">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
                  <ShieldCheck size={16} />
                  {c.note}
                </div>
                <h1 className="max-w-md text-4xl font-extrabold leading-tight text-white">
                  {c.title}
                </h1>
                <p className="mt-5 max-w-lg text-[16px] leading-7 text-white/70">
                  {c.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                icon={<ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />}
                onClick={() => navigate("/login")}
              >
                {t?.common?.back || "Back"}
              </Button>

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
                  <h2 className="text-3xl font-extrabold text-white">{c.formTitle}</h2>
                  <p className="mt-2 text-white/60">{c.formSubtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <FormField label={c.newPasswordLabel} htmlFor="reset-new-password" error={fieldErrors.newPassword}>
                    <Input
                      id="reset-new-password"
                      type="password"
                      icon={<Lock size={18} />}
                      placeholder={c.newPasswordPlaceholder}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isSubmitting}
                      hasError={!!fieldErrors.newPassword}
                    />
                  </FormField>

                  <FormField
                    label={c.confirmPasswordLabel}
                    htmlFor="reset-confirm-password"
                    error={fieldErrors.confirmPassword}
                  >
                    <Input
                      id="reset-confirm-password"
                      type="password"
                      icon={<Lock size={18} />}
                      placeholder={c.confirmPasswordPlaceholder}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                      hasError={!!fieldErrors.confirmPassword}
                    />
                  </FormField>

                  <Button type="submit" fullWidth loading={isSubmitting}>
                    {c.submitBtn}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-500/15">
                  <CheckCircle2 size={40} className="text-success-400" />
                </div>
                <h2 className="text-2xl font-extrabold text-white">{c.successTitle}</h2>
                <p className="mt-3 max-w-sm text-white/60">
                  {c.successText}
                </p>
                <Button className="mt-8" onClick={() => navigate("/login")}>
                  {t?.common?.login || "Sign In"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
