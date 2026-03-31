import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useLanguage } from "./context/LanguageContext";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/CandidateRegisterPage";
import CompanyRegisterPage from "./pages/CompanyRegisterPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import JobMatches from "./pages/JobMatches";
import Applications from "./pages/Applications";
import ProfilePage from "./pages/ProfilePage";
import ResumeManager from "./pages/ResumeManager";

import ScrollToTop from "./components/ScrollToTop";
import CandidateLayout from "./components/CandidateLayout";
import CompanyLayout from "./components/CompanyLayout";

function App() {
  const { language } = useLanguage();

  useEffect(() => {
    const isRTL = language === "ar" || language === "he";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/candidate" element={<RegisterPage />} />
        <Route path="/register/company" element={<CompanyRegisterPage />} />

        {/* Candidate Routes */}
        <Route
          path="/candidate-dashboard"
          element={
            <CandidateLayout>
              <CandidateDashboard />
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
          path="/resume-manager"
          element={
            <CandidateLayout>
              <ResumeManager />
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

        {/* Company Routes */}
        <Route
          path="/company-dashboard"
          element={
            <CompanyLayout>
              <CompanyDashboard />
            </CompanyLayout>
          }
        />
      </Routes>
    </>
  );
}

export default App;