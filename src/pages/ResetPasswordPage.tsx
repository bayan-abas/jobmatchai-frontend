import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Server connection failed.");
    }
  };

  const inputClass = `w-full rounded-2xl border border-white/10 bg-white/5 ${
    isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"
  } py-3.5 text-white placeholder:text-white/40 outline-none transition focus:border-cyan-400/60 focus:bg-white/10`;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)] px-4 py-10"
    >
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="grid min-h-[640px] lg:grid-cols-2">
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
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={`flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
                {t?.common?.back || "Back"}
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
                  <h2 className="text-3xl font-extrabold text-white">Reset Your Password</h2>
                  <p className="mt-2 text-white/60">Enter a new password for your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative">
                    <Lock
                      className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${
                        isRTL ? "right-4" : "left-4"
                      }`}
                      size={18}
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="relative">
                    <Lock
                      className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${
                        isRTL ? "right-4" : "left-4"
                      }`}
                      size={18}
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
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
                    Reset Password
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
                  <CheckCircle2 size={40} className="text-green-400" />
                </div>
                <h2 className="text-2xl font-extrabold text-white">Password Updated</h2>
                <p className="mt-3 max-w-sm text-white/60">
                  Your password has been reset. You can now sign in with your new password.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-8 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3.5 font-bold text-white shadow-[0_12px_30px_rgba(34,211,238,0.25)] transition hover:scale-[1.01]"
                >
                  {t?.common?.login || "Sign In"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
