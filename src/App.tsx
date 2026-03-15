import './App.css';

function App() {
  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">JobMatchAI</div>
        <nav className="nav-links">
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">How It Works</a>
          <a href="#">Contact</a>
        </nav>
        <div className="nav-buttons">
          <button className="login-btn">Login</button>
          <button className="signup-btn">Sign Up</button>
        </div>
      </header>

      <main className="hero">
        <div className="hero-content">
          <h1>Find the Right Job. Hire the Right Talent.</h1>
          <p>
            JobMatchAI is a smart job matching platform that connects candidates
            and companies through an advanced, modern, AI-inspired experience.
          </p>

          <div className="hero-buttons">
            <button className="candidate-btn">I’m a Candidate</button>
            <button className="company-btn">I’m a Company</button>
          </div>
        </div>
      </main>

      <section className="features">
        <h2>Why JobMatchAI?</h2>
        <div className="feature-cards">
          <div className="card">
            <h3>Smart Matching</h3>
            <p>Match candidates and jobs based on skills and requirements.</p>
          </div>
          <div className="card">
            <h3>AI Guidance</h3>
            <p>Get career tips, skill suggestions, and match explanations.</p>
          </div>
          <div className="card">
            <h3>Easy Hiring Flow</h3>
            <p>Simple and clear journey for both candidates and companies.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <span>1</span>
            <h3>Create Profile</h3>
            <p>Sign up as a candidate or company and complete your profile.</p>
          </div>
          <div className="step">
            <span>2</span>
            <h3>Explore Matches</h3>
            <p>See matching jobs or candidates with a smart recommendation flow.</p>
          </div>
          <div className="step">
            <span>3</span>
            <h3>Connect Faster</h3>
            <p>Apply, review, and communicate in a professional environment.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© 2026 JobMatchAI. All rights reserved.</p>
      </footer>

      <button className="chat-button">AI</button>
    </div>
  );
}

export default App;