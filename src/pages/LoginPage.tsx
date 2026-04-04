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
import { translations } from "../translations";

function LoginPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail) {
      setError(
        t?.loginPage?.errors?.emailRequired || "Please enter your email."
      );
      return;
    }

    if (!normalizedPassword) {
      setError(
        t?.loginPage?.errors?.passwordRequired || "Please enter your password."
      );
      return;
    }

    const candidates = [
      ...JSON.parse(localStorage.getItem("candidates") || "[]"),
      ...JSON.parse(localStorage.getItem("users") || "[]"),
    ];

    const companies = JSON.parse(localStorage.getItem("companies") || "[]");

    const foundCandidate = candidates.find(
      (candidate: any) =>
        candidate?.email?.trim().toLowerCase() === normalizedEmail
    );

    const foundCompany = companies.find(
      (company: any) =>
        company?.email?.trim().toLowerCase() === normalizedEmail
    );

    const foundUser = foundCandidate || foundCompany;

    console.log("LOGIN DEBUG");
    console.log("typed email:", normalizedEmail);
    console.log("candidates:", candidates);
    console.log("companies:", companies);
    console.log("foundCandidate:", foundCandidate);
    console.log("foundCompany:", foundCompany);

    if (!foundUser) {
      setError(
        t?.loginPage?.errors?.noAccount ||
          "No account found with this email."
      );
      return;
    }

    if ((foundUser.password || "").trim() !== normalizedPassword) {
      setError(
        t?.loginPage?.errors?.wrongPassword || "Incorrect password."
      );
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(foundUser));
    localStorage.setItem("registeredUser", JSON.stringify(foundUser));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("name", foundUser.name || foundUser.companyName || "");
    localStorage.setItem("email", foundUser.email || "");
    localStorage.setItem("role", foundUser.role || "");
    localStorage.setItem("phone", foundUser.phone || "");
    localStorage.setItem("location", foundUser.location || "");

    if (foundUser.role === "candidate") {
      localStorage.setItem("currentTitle", foundUser.currentTitle || "");
      localStorage.setItem("experience", foundUser.experience || "");
      localStorage.setItem("skills", JSON.stringify(foundUser.skills || []));
      localStorage.setItem(
        "summary",
        foundUser.summary ||
          "Passionate professional looking for great opportunities and continuous growth."
      );
      localStorage.setItem("resumeName", foundUser.resumeName || "");
      localStorage.setItem("isFirstLogin", "false");
      navigate("/candidate-dashboard");
      return;
    }

    if (foundUser.role === "company") {
      localStorage.setItem("currentCompany", JSON.stringify(foundUser));
      localStorage.setItem("industry", foundUser.industry || "");
      localStorage.setItem("companySize", foundUser.companySize || "");
      localStorage.setItem("website", foundUser.website || "");
      localStorage.setItem("description", foundUser.description || "");
      localStorage.setItem("isFirstLogin", "false");
      navigate("/company-dashboard");
      return;
    }

    setError("Something went wrong.");
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
        <div className="grid min-h-[760px] lg:grid-cols-2">
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
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                {t?.common?.back || "Back"}
              </button>

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

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-5">
                <div className="relative">
                  <Mail
                    className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${
                      isRTL ? "right-4" : "left-4"
                    }`}
                    size={18}
                  />
                  <input
                    type="email"
                    placeholder={t?.common?.email || "Email Address"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder={t?.common?.password || "Password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-white/70">
                  <input type="checkbox" className="h-4 w-4" />
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

              {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-4 text-base font-bold text-white shadow-[0_12px_30px_rgba(34,211,238,0.25)] transition hover:scale-[1.01]"
              >
                {t?.common?.login || "Sign In"}
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigate("/register/candidate")}
                  className="rounded-2xl border border-white/15 bg-white/[0.03] px-5 py-3.5 font-semibold text-[#dce7ff] transition hover:bg-white/[0.06]"
                >
                  {t?.loginPage?.createCandidate ||
                    "Create Candidate Account"}
                </button>

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