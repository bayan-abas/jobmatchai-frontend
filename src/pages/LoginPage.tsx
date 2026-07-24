import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  Building2,
  UserRound,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth, normalizeRole } from "../context/AuthContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";
import { Button, FormField, Input, useToast } from "../components/ui";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setFieldErrors({});

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const errors: { email?: string; password?: string } = {};
    if (!normalizedEmail) {
      errors.email = t?.loginPage?.errors?.emailRequired || "Please enter your email.";
    }
    if (!normalizedPassword) {
      errors.password = t?.loginPage?.errors?.passwordRequired || "Please enter your password.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiFetch("/api/users/login", {
        method: "POST",
        body: JSON.stringify({
          email: normalizedEmail,
          password: normalizedPassword,
          rememberMe,
        }),
      });

      if (!data.success) {
        toast.error(data.message || t?.feedback?.somethingWentWrong || "Login failed.");
        return;
      }

      const foundUser = data.user;
      const role = normalizeRole(foundUser.role);

      login(data.token, foundUser, rememberMe);

      if (role === "candidate") {
        navigate("/candidate-dashboard");
        return;
      }

      if (role === "company") {
        navigate("/company-dashboard");
        return;
      }

      toast.error(t?.feedback?.somethingWentWrong || "Unknown user role.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof ApiError ? error.message : t?.feedback?.somethingWentWrong || "Server connection failed.");
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
        <div className="grid lg:min-h-[760px] lg:grid-cols-2">
          <div className="relative hidden overflow-hidden lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.22),transparent_30%)]" />
            <div className="relative z-10 flex w-full flex-col justify-between p-10">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
                  <ShieldCheck size={16} />
                  {t?.loginPage?.secureAccess || "Secure Access"}
                </div>

                <h1 className="max-w-md text-4xl font-extrabold leading-tight text-white">
                  {t?.loginPage?.heroTitle ||
                    "Welcome back to your smarter hiring space."}
                </h1>

                <p className="mt-5 max-w-lg text-[16px] leading-7 text-white/70">
                  {t?.loginPage?.heroText ||
                    "Sign in to continue your journey on JobMatchAI and access your personalized dashboard with a clean and modern experience."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-white/50">
                    {t?.loginPage?.workspaceTitle || "Access your workspace"}
                  </p>

                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-white/80">
                      <UserRound size={18} className="text-cyan-300" />
                      {t?.loginPage?.candidateAccess ||
                        "Candidate dashboard access"}
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-white/80">
                      <Building2 size={18} className="text-cyan-300" />
                      {t?.loginPage?.companyAccess ||
                        "Company dashboard access"}
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-white/80">
                      <ShieldCheck size={18} className="text-cyan-300" />
                      {t?.loginPage?.secureSignin ||
                        "Secure sign-in experience"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center justify-between gap-3">
              <Button variant="secondary" size="sm" onClick={() => navigate("/")}>
                {t?.common?.back || "Back"}
              </Button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    language === "en"
                      ? "bg-cyan-400 text-[#0f172a]"
                      : "bg-white/5 text-white/75 hover:bg-white/10"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("ar")}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    language === "ar"
                      ? "bg-cyan-400 text-[#0f172a]"
                      : "bg-white/5 text-white/75 hover:bg-white/10"
                  }`}
                >
                  AR
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("he")}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    language === "he"
                      ? "bg-cyan-400 text-[#0f172a]"
                      : "bg-white/5 text-white/75 hover:bg-white/10"
                  }`}
                >
                  HE
                </button>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white">
                {t?.common?.login || "Sign In"}
              </h2>
              <p className="mt-2 text-white/60">
                {t?.loginPage?.subtitle ||
                  "Enter your email and password to continue."}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              <div className="space-y-5">
                <FormField label={t?.common?.email || "Email Address"} htmlFor="login-email" error={fieldErrors.email}>
                  <Input
                    id="login-email"
                    type="email"
                    icon={<Mail size={18} />}
                    placeholder={t?.common?.enterEmail || "Enter your email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    hasError={!!fieldErrors.email}
                  />
                </FormField>

                <FormField label={t?.common?.password || "Password"} htmlFor="login-password" error={fieldErrors.password}>
                  <Input
                    id="login-password"
                    type="password"
                    icon={<Lock size={18} />}
                    placeholder={t?.common?.enterPassword || "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    hasError={!!fieldErrors.password}
                  />
                </FormField>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-white/70">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  {t?.common?.rememberMe || "Remember me"}
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                >
                  {t?.common?.forgotPassword || "Forgot password?"}
                </button>
              </div>

              <Button type="submit" fullWidth loading={isSubmitting}>
                {isSubmitting
                  ? t?.common?.signingIn || "Signing in..."
                  : t?.common?.login || "Sign In"}
              </Button>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/register/candidate")}
                >
                  {t?.loginPage?.createCandidate ||
                    "Create Candidate Account"}
                </Button>

                <button
                  type="button"
                  onClick={() => navigate("/register/company")}
                  className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-3.5 font-semibold text-cyan-100 transition hover:bg-cyan-400/10"
                >
                  {t?.loginPage?.createCompany || "Create Company Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
