import { useNavigate } from "react-router-dom";
import "./Auth.css";

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="background-blur blur-one"></div>
      <div className="background-blur blur-two"></div>
      <div className="background-grid"></div>

      <div className="auth-container">
        <button className="auth-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="auth-card">
          <div className="auth-badge">Secure Login • JobMatchAI</div>

          <h1 className="auth-title">
            Welcome back to <span>JobMatchAI</span>
          </h1>

          <p className="auth-subtitle">
            Sign in to continue your smart hiring journey.
          </p>

          <form className="auth-form">
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" />

            <label>Password</label>
            <input type="password" placeholder="Enter your password" />

            <div className="auth-row">
              <label className="remember-box">
                <input type="checkbox" />
                Remember me
              </label>

              <button type="button" className="auth-text-btn">
                Forgot password?
              </button>
            </div>

            <button type="submit" className="auth-primary-btn">
              Sign In
            </button>

            <button
              type="button"
              className="auth-secondary-btn"
              onClick={() => navigate("/register")}
            >
              Create New Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;