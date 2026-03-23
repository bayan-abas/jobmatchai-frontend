import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Auth.css";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("candidate");
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  return (
    <div className="auth-page">
      <div className="background-blur blur-one"></div>
      <div className="background-blur blur-two"></div>
      <div className="background-grid"></div>

      <div className="language-switcher">
        <button
          type="button"
          className={language === "en" ? "lang-btn active-lang" : "lang-btn"}
          onClick={() => setLanguage("en")}
        >
          {t.common.english}
        </button>

        <button
          type="button"
          className={language === "ar" ? "lang-btn active-lang" : "lang-btn"}
          onClick={() => setLanguage("ar")}
        >
          {t.common.arabic}
        </button>

        <button
          type="button"
          className={language === "he" ? "lang-btn active-lang" : "lang-btn"}
          onClick={() => setLanguage("he")}
        >
          {t.common.hebrew}
        </button>
      </div>

      <div className="auth-container">
        <button className="auth-back" onClick={() => navigate(-1)}>
          ← {t.common.back}
        </button>

        <div className="auth-card">
          <div className="auth-badge">{t.registerPage.badge}</div>

          <h1 className="auth-title">
            {t.registerPage.title1} <span>{t.registerPage.title2}</span>
          </h1>

          <p className="auth-subtitle">{t.registerPage.subtitle}</p>

          <div className="role-switch">
            <button
              type="button"
              className={role === "candidate" ? "role-btn active-role" : "role-btn"}
              onClick={() => setRole("candidate")}
            >
              {t.common.candidate}
            </button>

            <button
              type="button"
              className={role === "company" ? "role-btn active-role" : "role-btn"}
              onClick={() => setRole("company")}
            >
              {t.common.company}
            </button>
          </div>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();

              if (role === "candidate") {
                navigate("/candidate-dashboard");
              } else {
                navigate("/candidate-dashboard");
              }
            }}
          >
            <label>
              {role === "candidate" ? t.common.fullName : t.common.companyName}
            </label>

            <input
              type="text"
              placeholder={
                role === "candidate"
                  ? t.registerPage.enterFullName
                  : t.registerPage.enterCompanyName
              }
            />

            <label>{t.common.email}</label>
            <input type="email" placeholder={t.common.enterEmail} />

            <label>{t.common.password}</label>
            <input type="password" placeholder={t.common.createPassword} />

            <label>{t.common.confirmPassword}</label>
            <input type="password" placeholder={t.common.confirmYourPassword} />

            <button type="submit" className="auth-primary-btn">
              {t.common.register}
            </button>

            <button
              type="button"
              className="auth-secondary-btn"
              onClick={() => navigate("/login")}
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