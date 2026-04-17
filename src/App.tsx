import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import RegisterPage from "./pages/CandidateRegisterPage";
import CompanyRegisterPage from "./pages/CompanyRegisterPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import JobMatches from "./pages/JobMatches";
import Applications from "./pages/Applications";
import ProfilePage from "./pages/ProfilePage";
import ResumeManager from "./pages/ResumeManager";
import CompanyJobPostings from "./pages/CompanyJobPostings";
import PostJob from "./pages/PostJob";
import CompanyCandidates from "./pages/CompanyCandidates";
import CompanyApplications from "./pages/CompanyApplications";
import CompanyProfile from "./pages/CompanyProfile";
import CompanyNotifications from "./pages/CompanyNotifications";
import PublicJobsPage from "./pages/PublicJobsPage";

import ScrollToTop from "./components/ScrollToTop";
import CandidateLayout from "./components/CandidateLayout";
import CompanyLayout from "./components/CompanyLayout";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<PublicJobsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/candidate" element={<RegisterPage />} />
        <Route path="/register/company" element={<CompanyRegisterPage />} />

        {/* Candidate */}
        <Route path="/candidate-dashboard" element={<CandidateLayout><CandidateDashboard /></CandidateLayout>} />
        <Route path="/job-matches"         element={<CandidateLayout><JobMatches /></CandidateLayout>} />
        <Route path="/applications"        element={<CandidateLayout><Applications /></CandidateLayout>} />
        <Route path="/profile"             element={<CandidateLayout><ProfilePage /></CandidateLayout>} />
        <Route path="/resume-manager"      element={<CandidateLayout><ResumeManager /></CandidateLayout>} />
        <Route path="/notifications"       element={<CandidateLayout><NotificationsPage /></CandidateLayout>} />

        {/* Company */}
        <Route path="/company-dashboard"      element={<CompanyLayout><CompanyDashboard /></CompanyLayout>} />
        <Route path="/company-job-postings"   element={<CompanyLayout><CompanyJobPostings /></CompanyLayout>} />
        <Route path="/post-job"               element={<CompanyLayout><PostJob /></CompanyLayout>} />
        <Route path="/company-candidates"     element={<CompanyLayout><CompanyCandidates /></CompanyLayout>} />
        <Route path="/company-applications"   element={<CompanyLayout><CompanyApplications /></CompanyLayout>} />
        <Route path="/company-profile"        element={<CompanyLayout><CompanyProfile /></CompanyLayout>} />
        <Route path="/company-notifications"  element={<CompanyLayout><CompanyNotifications /></CompanyLayout>} />
      </Routes>
    </>
  );
}

export default App;
