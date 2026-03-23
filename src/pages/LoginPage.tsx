import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

function LoginPage() {
  const navigate = useNavigate();
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
        <button type="button" className="auth-back" onClick={() => navigate(-1)}>
          ← {t.common.back}
        </button>

        <div className="auth-card">
          <div className="auth-badge">{t.loginPage.badge}</div>

          <h1 className="auth-title">
            {t.loginPage.title1} <span>{t.loginPage.title2}</span>
          </h1>

          <p className="auth-subtitle">{t.loginPage.subtitle}</p>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/candidate-dashboard");
            }}
          >
            <label>{t.common.email}</label>
            <input type="email" placeholder={t.common.enterEmail} />

            <label>{t.common.password}</label>
            <input type="password" placeholder={t.common.enterPassword} />

            <div className="auth-row">
              <label className="remember-box">
                <input type="checkbox" />
                {t.common.rememberMe}
              </label>

              <button type="button" className="auth-text-btn">
                {t.common.forgotPassword}
              </button>
            </div>

            <button type="submit" className="auth-primary-btn">
              {t.common.login}
            </button>

            <button
              type="button"
              className="auth-secondary-btn"
              onClick={() => navigate("/register")}
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