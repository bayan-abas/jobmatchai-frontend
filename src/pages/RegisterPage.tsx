import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("candidate");
  const [fullName, setFullName] = useState("");

  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#050a14_0%,#0b1220_100%)] text-white"
    >
      {/* الخلفية */}
      <div className="pointer-events-none fixed left-[-80px] top-[60px] z-0 h-[320px] w-[320px] rounded-full bg-[rgba(0,183,255,0.16)] blur-[120px]" />
      <div className="pointer-events-none fixed right-[-100px] top-[120px] z-0 h-[360px] w-[360px] rounded-full bg-[rgba(124,58,237,0.16)] blur-[120px]" />
<div
  className={`absolute top-6 z-30 flex gap-2 ${
    isRTL ? "left-6" : "right-6"
  }`}
>
  {["en", "ar", "he"].map((lang) => (
    <button
      key={lang}
      onClick={() => setLanguage(lang as any)}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
        language === lang
          ? "bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-white shadow"
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {lang.toUpperCase()}
    </button>
  ))}
</div>
 <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-10">
        
        {/* back button*/}
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

        {/* الكارد */}
        <div className="w-full max-w-[480px] rounded-[30px] border border-white/[0.08] bg-white/[0.055] px-[30px] py-[34px] backdrop-blur-[20px]">
          
          {/* اختيار النوع */}
          <div className="mb-5 flex gap-3">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`h-12 flex-1 rounded-[14px] ${
                role === "candidate"
                  ? "bg-gradient-to-r from-[#38bdf8] to-[#6366f1]"
                  : "bg-white/[0.04]"
              }`}
            >
              {t.common.candidate}
            </button>

            <button
              type="button"
              onClick={() => setRole("company")}
              className={`h-12 flex-1 rounded-[14px] ${
                role === "company"
                  ? "bg-gradient-to-r from-[#38bdf8] to-[#6366f1]"
                  : "bg-white/[0.04]"
              }`}
            >
              {t.common.company}
            </button>
          </div>

          {/* الفورم */}
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();

              localStorage.setItem("name", fullName);
              localStorage.setItem("role", role);
              localStorage.setItem("isFirstLogin", "true");

              if (role === "candidate") {
                navigate("/candidate-dashboard");
              } else {
                navigate("/company-dashboard");
              }
            }}
          >
            <label>
              {role === "candidate"
                ? t.common.fullName
                : t.common.companyName}
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={
                role === "candidate"
                  ? t.registerPage.enterFullName
                  : t.registerPage.enterCompanyName
              }
              className="h-[52px] rounded-2xl bg-white/[0.05] px-4"
            />

            <label>{t.common.email}</label>
            <input
              type="email"
              placeholder={t.common.enterEmail}
              className="h-[52px] rounded-2xl bg-white/[0.05] px-4"
            />

            <label>{t.common.password}</label>
            <input
              type="password"
              placeholder={t.common.createPassword}
              className="h-[52px] rounded-2xl bg-white/[0.05] px-4"
            />

            <label>{t.common.confirmPassword}</label>
            <input
              type="password"
              placeholder={t.common.confirmYourPassword}
              className="h-[52px] rounded-2xl bg-white/[0.05] px-4"
            />

            <button
              type="submit"
              className="mt-2 h-[52px] rounded-2xl bg-gradient-to-r from-[#38bdf8] to-[#6366f1]"
            >
              {t.common.register}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="h-[52px] rounded-2xl border border-white/20"
            >
              {t.common.alreadyHaveAccount}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;