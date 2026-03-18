import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Auth.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("candidate");

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
          <div className="auth-badge">Create Account • JobMatchAI</div>

          <h1 className="auth-title">
            Start with <span>JobMatchAI</span>
          </h1>

          <p className="auth-subtitle">
            Create your profile and begin your journey.
          </p>

          <div className="role-switch">
            <button
              type="button"
              className={role === "candidate" ? "role-btn active-role" : "role-btn"}
              onClick={() => setRole("candidate")}
            >
              Candidate
            </button>

            <button
              type="button"
              className={role === "company" ? "role-btn active-role" : "role-btn"}
              onClick={() => setRole("company")}
            >
              Company
            </button>
          </div>

          <form className="auth-form">
            <label>{role === "candidate" ? "Full Name" : "Company Name"}</label>
            <input
              type="text"
              placeholder={
                role === "candidate" ? "Enter your full name" : "Enter company name"
              }
            />

            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" />

            <label>Password</label>
            <input type="password" placeholder="Create your password" />

            <label>Confirm Password</label>
            <input type="password" placeholder="Confirm your password" />

            <button type="submit" className="auth-primary-btn">
              Register
            </button>

            <button
              type="button"
              className="auth-secondary-btn"
              onClick={() => navigate("/login")}
            >
              Already Have an Account?
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;