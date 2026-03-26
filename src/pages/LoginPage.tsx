import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

function LoginPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#050a14_0%,#0b1220_100%)] text-white"
    >
      <div className="pointer-events-none fixed left-[-80px] top-[60px] z-0 h-[320px] w-[320px] rounded-full bg-[rgba(0,183,255,0.16)] blur-[120px]" />
      <div className="pointer-events-none fixed right-[-100px] top-[120px] z-0 h-[360px] w-[360px] rounded-full bg-[rgba(124,58,237,0.16)] blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:linear-gradient(to_bottom,rgba(255,255,255,0.7),transparent)]" />

      <div
        className={`absolute top-6 z-30 flex gap-[10px] ${
          isRTL ? "left-6" : "right-6"
        } max-[640px]:top-[18px] max-[640px]:gap-2 ${
          isRTL ? "max-[640px]:left-[18px]" : "max-[640px]:right-[18px]"
        }`}
      >
        <button
          type="button"
          className={`rounded-xl border px-[14px] py-2 text-[13px] font-bold backdrop-blur-[10px] transition max-[640px]:px-3 max-[640px]:text-xs ${
            language === "en"
              ? "border-transparent bg-gradient-to-br from-[#7c3aed] to-[#2563eb] text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)]"
              : "border-white/25 bg-white/8 text-white hover:bg-white/16"
          }`}
          onClick={() => setLanguage("en")}
        >
          {t.common.english}
        </button>

        <button
          type="button"
          className={`rounded-xl border px-[14px] py-2 text-[13px] font-bold backdrop-blur-[10px] transition max-[640px]:px-3 max-[640px]:text-xs ${
            language === "ar"
              ? "border-transparent bg-gradient-to-br from-[#7c3aed] to-[#2563eb] text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)]"
              : "border-white/25 bg-white/8 text-white hover:bg-white/16"
          }`}
          onClick={() => setLanguage("ar")}
        >
          {t.common.arabic}
        </button>

        <button
          type="button"
          className={`rounded-xl border px-[14px] py-2 text-[13px] font-bold backdrop-blur-[10px] transition max-[640px]:px-3 max-[640px]:text-xs ${
            language === "he"
              ? "border-transparent bg-gradient-to-br from-[#7c3aed] to-[#2563eb] text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)]"
              : "border-white/25 bg-white/8 text-white hover:bg-white/16"
          }`}
          onClick={() => setLanguage("he")}
        >
          {t.common.hebrew}
        </button>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-10">
        <div className="mb-3 w-full max-w-[480px]">
          <button
            type="button"
            onClick={() => navigate("/")}
            className={`h-[38px] rounded-[12px] border border-white/10 bg-white/[0.04] px-3 text-sm text-[#d8e5ff] transition hover:bg-white/[0.08] ${
              isRTL ? "self-end" : "self-start"
            }`}
          >
            ← {t.common.back}
          </button>
        </div>

        <div
          className={`w-full max-w-[480px] rounded-[30px] border border-white/[0.08] bg-white/[0.055] px-[30px] py-[34px] shadow-[0_22px_70px_rgba(0,0,0,0.3)] backdrop-blur-[20px] max-[640px]:rounded-[24px] max-[640px]:px-[18px] max-[640px]:py-[26px] ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          <div className="mb-[18px] inline-flex min-h-[38px] items-center rounded-full border border-[rgba(125,211,252,0.22)] bg-[rgba(125,211,252,0.12)] px-[14px] text-xs font-semibold text-[#9bdcff]">
            {t.loginPage.badge}
          </div>

          <h1 className="mb-3 text-[38px] font-extrabold leading-[1.15] tracking-[-1.4px] max-[640px]:text-[30px]">
            {t.loginPage.title1}{" "}
            <span className="bg-gradient-to-r from-[#7dd3fc] to-[#a78bfa] bg-clip-text text-transparent">
              {t.loginPage.title2}
            </span>
          </h1>

          <p className="mb-6 text-[15px] leading-[1.8] text-[#c9d6ed]">
            {t.loginPage.subtitle}
          </p>

          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();

              const savedName =
                localStorage.getItem("name") ||
                email.split("@")[0] ||
                "User";

              const savedRole = localStorage.getItem("role") || "candidate";

              localStorage.setItem("name", savedName);
              localStorage.setItem("role", savedRole);
              localStorage.setItem("isFirstLogin", "false");

              if (savedRole === "company") {
                navigate("/company-dashboard");
              } else {
                navigate("/candidate-dashboard");
              }
            }}
          >
            <label className="text-sm font-semibold text-[#dce7fb]">
              {t.common.email}
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.common.enterEmail}
              className="h-[52px] rounded-2xl border border-white/[0.09] bg-white/[0.045] px-4 text-sm text-white outline-none placeholder:text-[#8ea2c7]"
            />

            <label className="text-sm font-semibold text-[#dce7fb]">
              {t.common.password}
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.common.enterPassword}
              className="h-[52px] rounded-2xl border border-white/[0.09] bg-white/[0.045] px-4 text-sm text-white outline-none placeholder:text-[#8ea2c7]"
            />

            <div
              className={`my-[2px] flex items-center justify-between gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <label
                className={`flex items-center gap-2 text-[13px] text-[#d6e2f7] ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <input type="checkbox" className="h-auto w-auto" />
                {t.common.rememberMe}
              </label>

              <button
                type="button"
                className="border-none bg-transparent font-semibold text-[#8fd8ff]"
              >
                {t.common.forgotPassword}
              </button>
            </div>

            <button
              type="submit"
              className="mt-2 min-h-[52px] rounded-2xl bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-[15px] font-bold text-white shadow-[0_14px_30px_rgba(56,189,248,0.22)] transition hover:-translate-y-0.5"
            >
              {t.common.login}
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="min-h-[52px] rounded-2xl border border-white/[0.12] bg-white/[0.03] text-[15px] font-bold text-white transition hover:-translate-y-0.5"
            >
              {t.common.createAccount}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;