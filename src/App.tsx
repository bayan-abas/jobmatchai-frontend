import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RegisterPage from "./pages/CandidateRegisterPage";
import CompanyRegisterPage from "./pages/CompanyRegisterPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import JobMatches from "./pages/JobMatches";
import ExternalJobsPage from "./pages/ExternalJobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import FavoritesPage from "./pages/FavoritesPage";
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
import ProtectedRoute from "./components/ProtectedRoute";

import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";

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
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/candidate" element={<RegisterPage />} />
        <Route path="/register/company" element={<CompanyRegisterPage />} />

        {/* Candidate */}
        <Route path="/candidate-dashboard" element={<ProtectedRoute requiredRole="candidate"><CandidateLayout><CandidateDashboard /></CandidateLayout></ProtectedRoute>} />
        <Route path="/job-matches"         element={<ProtectedRoute requiredRole="candidate"><CandidateLayout><JobMatches /></CandidateLayout></ProtectedRoute>} />
        <Route path="/external-jobs"       element={<ProtectedRoute requiredRole="candidate"><CandidateLayout><ExternalJobsPage /></CandidateLayout></ProtectedRoute>} />
        <Route path="/job-details/:jobType/:jobId" element={<ProtectedRoute requiredRole="candidate"><CandidateLayout><JobDetailsPage /></CandidateLayout></ProtectedRoute>} />
        <Route path="/favorites"           element={<ProtectedRoute requiredRole="candidate"><CandidateLayout><FavoritesPage /></CandidateLayout></ProtectedRoute>} />
        <Route path="/applications"        element={<ProtectedRoute requiredRole="candidate"><CandidateLayout><Applications /></CandidateLayout></ProtectedRoute>} />
        <Route path="/profile"             element={<ProtectedRoute requiredRole="candidate"><CandidateLayout><ProfilePage /></CandidateLayout></ProtectedRoute>} />
        <Route path="/resume-manager"      element={<ProtectedRoute requiredRole="candidate"><CandidateLayout><ResumeManager /></CandidateLayout></ProtectedRoute>} />
        <Route path="/notifications"       element={<ProtectedRoute requiredRole="candidate"><CandidateLayout><NotificationsPage /></CandidateLayout></ProtectedRoute>} />
        <Route path="/payment"             element={<ProtectedRoute requiredRole="candidate"><PaymentPage /></ProtectedRoute>} />
        <Route path="/payment/success"     element={<ProtectedRoute requiredRole="candidate"><PaymentSuccessPage /></ProtectedRoute>} />
        <Route path="/payment/cancel"      element={<ProtectedRoute requiredRole="candidate"><PaymentCancelPage /></ProtectedRoute>} />

        {/* Company */}
        <Route path="/company-dashboard"      element={<ProtectedRoute requiredRole="company"><CompanyLayout><CompanyDashboard /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company-job-postings"   element={<ProtectedRoute requiredRole="company"><CompanyLayout><CompanyJobPostings /></CompanyLayout></ProtectedRoute>} />
        <Route path="/post-job"               element={<ProtectedRoute requiredRole="company"><CompanyLayout><PostJob /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company-candidates"     element={<ProtectedRoute requiredRole="company"><CompanyLayout><CompanyCandidates /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company-applications"   element={<ProtectedRoute requiredRole="company"><CompanyLayout><CompanyApplications /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company-profile"        element={<ProtectedRoute requiredRole="company"><CompanyLayout><CompanyProfile /></CompanyLayout></ProtectedRoute>} />
        <Route path="/company-notifications"  element={<ProtectedRoute requiredRole="company"><CompanyLayout><CompanyNotifications /></CompanyLayout></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;
