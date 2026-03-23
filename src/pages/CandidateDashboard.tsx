import { useNavigate } from "react-router-dom";
import "../App.css";

function CandidateDashboard() {
  const navigate = useNavigate();

  const topMatches = [
    {
      percent: "92%",
      title: "Senior Frontend Developer",
      company: "Check Point",
      location: "Tel Aviv",
    },
    {
      percent: "87%",
      title: "Full Stack Engineer",
      company: "Wix",
      location: "Tel Aviv",
    },
    {
      percent: "85%",
      title: "React Developer",
      company: "Monday.com",
      location: "Ramat Gan",
    },
  ];

  const applications = [
    {
      title: "Product Designer",
      company: "Fiverr",
      status: "Under Review",
      days: "2 days ago",
      statusClass: "status-yellow",
    },
    {
      title: "UX Engineer",
      company: "IronSource",
      status: "AI Screening",
      days: "5 days ago",
      statusClass: "status-purple",
    },
  ];

  return (
    <div className="candidate-dashboard-page">
      <aside className="candidate-sidebar">
        <div>
          <div className="candidate-logo-box">
            <div className="candidate-logo-icon">✦</div>
            <div>
              <h2>JobMatch</h2>
              <p>AI-Powered Recruitment</p>
            </div>
          </div>

          <div className="candidate-sidebar-menu">
            <button className="candidate-menu-item active">
              <span>◫</span>
              Dashboard
            </button>

            <button className="candidate-menu-item">
              <span>▣</span>
              Job Matches
            </button>

            <button className="candidate-menu-item">
              <span>☰</span>
              Applications
            </button>

            <button className="candidate-menu-item">
              <span>◌</span>
              My Profile
            </button>

            <button className="candidate-menu-item">
              <span>▤</span>
              My Resume
            </button>

            <button className="candidate-menu-item">
              <span>◔</span>
              Notifications
            </button>
          </div>
        </div>

        <div className="candidate-sidebar-bottom">
          <div className="candidate-lang-switch">
            <button>עברית</button>
            <button>العربية</button>
            <button className="active-lang">English</button>
          </div>

          <button
            className="candidate-logout-btn"
            onClick={() => navigate("/login")}
          >
            ⟶ Logout
          </button>
        </div>
      </aside>

      <main className="candidate-main">
        <header className="candidate-topbar">
          <div className="candidate-search">
            <span>⌕</span>
            <input type="text" placeholder="Search..." />
          </div>

          <div className="candidate-topbar-right">
            <div className="candidate-bell">
              🔔
              <span>5</span>
            </div>

            <div className="candidate-user-box">
              <span className="candidate-user-name">Demo User</span>
              <div className="candidate-user-avatar">D</div>
            </div>
          </div>
        </header>

        <section className="candidate-content">
          <div className="candidate-welcome">
            <h1>Welcome back! 👋</h1>
            <p>Here's what's happening with your job search</p>
          </div>

          <section className="candidate-stats-grid">
            <div className="candidate-stat-card">
              <div className="stat-icon purple">▣</div>
              <div className="stat-arrow">›</div>
              <h2>24</h2>
              <p>Job Matches</p>
            </div>

            <div className="candidate-stat-card">
              <div className="stat-icon blue">▤</div>
              <div className="stat-arrow">›</div>
              <h2>8</h2>
              <p>Applications</p>
            </div>

            <div className="candidate-stat-card">
              <div className="stat-icon green">◉</div>
              <div className="stat-arrow">›</div>
              <h2>3</h2>
              <p>Interviews</p>
            </div>

            <div className="candidate-stat-card">
              <div className="stat-icon violet">◎</div>
              <div className="stat-arrow">›</div>
              <h2>78%</h2>
              <p>Profile Score</p>
            </div>
          </section>

          <section className="candidate-middle-grid">
            <div className="candidate-panel big-panel">
              <div className="panel-head">
                <div className="panel-title-wrap">
                  <div className="panel-icon purple">✦</div>
                  <div>
                    <h3>Top Job Matches</h3>
                    <p>Based on your profile</p>
                  </div>
                </div>

                <button className="panel-link-btn">View All →</button>
              </div>

              <div className="top-matches-list">
                {topMatches.map((job, index) => (
                  <div key={index} className="top-match-item">
                    <div className="match-left">
                      <div className="match-circle">{job.percent}</div>

                      <div>
                        <h4>{job.title}</h4>
                        <p>
                          {job.company} • {job.location}
                        </p>
                      </div>
                    </div>

                    <div className="top-match-arrow">›</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="candidate-panel side-panel">
              <div className="panel-head">
                <div className="panel-title-wrap">
                  <div className="panel-icon blue">▤</div>
                  <div>
                    <h3>Applications</h3>
                    <p>Recent Activity</p>
                  </div>
                </div>
              </div>

              <div className="applications-list">
                {applications.map((app, index) => (
                  <div key={index} className="application-item">
                    <h4>{app.title}</h4>
                    <p className="application-company">{app.company}</p>

                    <div className="application-footer">
                      <span className={`application-status ${app.statusClass}`}>
                        {app.status}
                      </span>
                      <span className="application-days">{app.days}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="view-all-applications">
                View All Applications
              </button>
            </div>
          </section>

          <section className="candidate-profile-banner">
            <div className="profile-banner-left">
              <div className="profile-score-circle">78%</div>

              <div>
                <h3>Complete Your Profile</h3>
                <p>Add more details to improve your match score</p>
              </div>
            </div>

            <div className="profile-banner-actions">
              <button className="upload-resume-btn">Upload Resume</button>
              <button className="edit-profile-btn">Edit Profile</button>
            </div>
          </section>
        </section>

        <button className="candidate-chat-btn">◔</button>
      </main>
    </div>
  );
}

export default CandidateDashboard;