import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const RegisterPage = lazy(() => import("./pages/CandidateRegisterPage"));
const CompanyRegisterPage = lazy(() => import("./pages/CompanyRegisterPage"));
const CandidateDashboard = lazy(() => import("./pages/CandidateDashboard"));
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const JobMatches = lazy(() => import("./pages/JobMatches"));
const ExternalJobsPage = lazy(() => import("./pages/ExternalJobsPage"));
const JobDetailsPage = lazy(() => import("./pages/JobDetailsPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const Applications = lazy(() => import("./pages/Applications"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ResumeManager = lazy(() => import("./pages/ResumeManager"));
const CompanyJobPostings = lazy(() => import("./pages/CompanyJobPostings"));
const PostJob = lazy(() => import("./pages/PostJob"));
const CompanyCandidates = lazy(() => import("./pages/CompanyCandidates"));
const CompanyApplications = lazy(() => import("./pages/CompanyApplications"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile"));
const CompanyNotifications = lazy(() => import("./pages/CompanyNotifications"));
const PublicJobsPage = lazy(() => import("./pages/PublicJobsPage"));

const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const PaymentCancelPage = lazy(() => import("./pages/PaymentCancelPage"));

import ScrollToTop from "./components/ScrollToTop";
import CandidateLayout from "./components/CandidateLayout";
import CompanyLayout from "./components/CompanyLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-[#7f4cff]" />
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
    </>
  );
}

export default App;
