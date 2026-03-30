import { useNavigate } from "react-router-dom";

export default function CompanySidebar() {
  const navigate = useNavigate();

  return (
    <div className="candidate-sidebar"> {/* نفس الكلاس تبعك */}
      
      {/* Logo */}
      <div className="candidate-logo">
        <h2>JobMatch</h2>
        <p>AI-Powered Recruitment</p>
      </div>

      {/* Menu */}
      <div className="candidate-sidebar-menu">

        <button
          className="candidate-menu-item"
          onClick={() => navigate("/company-dashboard")}
        >
          <span>◫</span>
          Dashboard
        </button>

        <button
          className="candidate-menu-item"
          onClick={() => navigate("/candidates")}
        >
          <span>👥</span>
          Candidates
        </button>

        <button
          className="candidate-menu-item"
          onClick={() => navigate("/company-applications")}
        >
          <span>📄</span>
          Applications
        </button>

        <button
          className="candidate-menu-item"
          onClick={() => navigate("/company-profile")}
        >
          <span>👤</span>
          Company Profile
        </button>

        <button
          className="candidate-menu-item"
          onClick={() => navigate("/notifications")}
        >
          <span>🔔</span>
          Notifications
        </button>

      </div>

      {/* Logout */}
      <div className="candidate-logout">
        <button onClick={() => navigate("/")}>
          Logout
        </button>
      </div>
    </div>
  );
}