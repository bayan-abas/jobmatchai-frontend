import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useLanguage } from "./context/LanguageContext";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import JobMatches from "./pages/JobMatches";
import Applications from "./pages/Applications";
import ProfilePage from "./pages/ProfilePage";
import ResumeManager from "./pages/ResumeManager";

import CandidateLayout from "./components/CandidateLayout";

function App() {
  const { language } = useLanguage();

  useEffect(() => {
    const isRTL = language === "ar" || language === "he";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Candidate Pages with Layout */}
      <Route
        path="/candidate-dashboard"
        element={
          <CandidateLayout>
            <CandidateDashboard />
          </CandidateLayout>
        }
      />

      <Route
        path="/notifications"
        element={
          <CandidateLayout>
            <NotificationsPage />
          </CandidateLayout>
        }
      />

      <Route
        path="/job-matches"
        element={
          <CandidateLayout>
            <JobMatches />
          </CandidateLayout>
        }
      />

      <Route
        path="/applications"
        element={
          <CandidateLayout>
            <Applications />
          </CandidateLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <CandidateLayout>
            <ProfilePage />
          </CandidateLayout>
        }
      />

      <Route
        path="/resume"
        element={
          <CandidateLayout>
            <ResumeManager />
          </CandidateLayout>
        }
      />
    </Routes>
  );
}

export default App;