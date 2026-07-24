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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setFieldErrors({});

    if (!token) {
      toast.error("This reset link is invalid or has expired.");
      return;
    }

    if (newPassword.length < 6) {
      setFieldErrors({ newPassword: "Password must be at least 6 characters." });
      return;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setFieldErrors({ newPassword: "Password must contain both letters and numbers." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
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
                  Secure Password Recovery
                </div>
                <h1 className="max-w-md text-4xl font-extrabold leading-tight text-white">
                  Choose a new password.
                </h1>
                <p className="mt-5 max-w-lg text-[16px] leading-7 text-white/70">
                  This link is valid for a limited time. Once you set a new password you'll be able to sign in right away.
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
                  <h2 className="text-3xl font-extrabold text-white">Reset Your Password</h2>
                  <p className="mt-2 text-white/60">Enter a new password for your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <FormField label="New Password" htmlFor="reset-new-password" error={fieldErrors.newPassword}>
                    <Input
                      id="reset-new-password"
                      type="password"
                      icon={<Lock size={18} />}
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isSubmitting}
                      hasError={!!fieldErrors.newPassword}
                    />
                  </FormField>

                  <FormField
                    label="Confirm New Password"
                    htmlFor="reset-confirm-password"
                    error={fieldErrors.confirmPassword}
                  >
                    <Input
                      id="reset-confirm-password"
                      type="password"
                      icon={<Lock size={18} />}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                      hasError={!!fieldErrors.confirmPassword}
                    />
                  </FormField>

                  <Button type="submit" fullWidth loading={isSubmitting}>
                    Reset Password
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-500/15">
                  <CheckCircle2 size={40} className="text-success-400" />
                </div>
                <h2 className="text-2xl font-extrabold text-white">Password Updated</h2>
                <p className="mt-3 max-w-sm text-white/60">
                  Your password has been reset. You can now sign in with your new password.
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
