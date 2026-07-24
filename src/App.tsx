import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ToastProvider } from "./components/ui/Toast";
import { ConfirmProvider } from "./components/ui/ConfirmDialog";
import { useLanguage } from "./context/LanguageContext";
import { translations } from "./translations";
import LoadingScreen from "./components/LoadingScreen";
import ErrorBoundary from "./components/ErrorBoundary";

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
const CompanyJobDetailsPage = lazy(() => import("./pages/CompanyJobDetailsPage"));
const PostJob = lazy(() => import("./pages/PostJob"));
const CompanyApplications = lazy(() => import("./pages/CompanyApplications"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile"));
const CompanyNotifications = lazy(() => import("./pages/CompanyNotifications"));
const PublicJobsPage = lazy(() => import("./pages/PublicJobsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const PaymentCancelPage = lazy(() => import("./pages/PaymentCancelPage"));

import ScrollToTop from "./components/ScrollToTop";
import CandidateLayout from "./components/CandidateLayout";
import CompanyLayout from "./components/CompanyLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Same rotating-brain indicator used elsewhere in the app (ProtectedRoute's auth-rehydration
// gate, CandidateDashboard's data-loading state) - shown here whenever a lazy-loaded route's
// chunk hasn't finished downloading yet, so "loading" always looks the same regardless of WHY
// the app is loading. `fullScreen` because this renders before any layout/header exists yet.
function RouteFallback() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return <LoadingScreen fullScreen title={t.common.loading} message="" />;
}

// Subtle, short (220ms) fade+rise transition between routes - kept in its own component so
// AnimatePresence's `key={location.pathname}` cleanly remounts exactly one motion.div per route.
// `mode="wait"` means the outgoing page finishes its exit before the incoming one starts, which
// avoids the brief double-render/layout-jump of overlapping in+out pages. Neither this nor the
// Suspense fallback above can cause a white flash any more: html/body/#root now carry the same
// dark base color every page's own gradient starts from (see index.css), so whatever is behind
// a semi-transparent fading page - or behind the loader while a chunk is still downloading - is
// always dark, never the browser's default white.
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Keyed by pathname so navigating to a different route after a render error
            remounts a fresh boundary instead of staying stuck on the error screen. */}
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<RouteFallback />}>
            <Routes location={location}>
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
              <Route path="/company-job-details/:jobId" element={<ProtectedRoute requiredRole="company"><CompanyLayout><CompanyJobDetailsPage /></CompanyLayout></ProtectedRoute>} />
              <Route path="/post-job"               element={<ProtectedRoute requiredRole="company"><CompanyLayout><PostJob /></CompanyLayout></ProtectedRoute>} />
              <Route path="/company-applications"   element={<ProtectedRoute requiredRole="company"><CompanyLayout><CompanyApplications /></CompanyLayout></ProtectedRoute>} />
              <Route path="/company-profile"        element={<ProtectedRoute requiredRole="company"><CompanyLayout><CompanyProfile /></CompanyLayout></ProtectedRoute>} />
              <Route path="/company-notifications"  element={<ProtectedRoute requiredRole="company"><CompanyLayout><CompanyNotifications /></CompanyLayout></ProtectedRoute>} />

              {/* The Candidates page was removed in favor of Applications - keep this so old
                  bookmarks/links don't land on a dead route. */}
              <Route path="/company-candidates" element={<Navigate to="/company-applications" replace />} />

              {/* Catch-all: any unmatched path gets a real 404 page instead of rendering blank. */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <ConfirmProvider>
          {/* Rendered as a sibling OUTSIDE the animated route tree, deliberately - it already
              correctly restores/resets scroll position via its own POP-navigation-aware effect
              (see ScrollToTop.tsx) and must keep running exactly as before regardless of the
              route-transition animation's mount/unmount timing. */}
          <ScrollToTop />
          <AnimatedRoutes />
        </ConfirmProvider>
      </ToastProvider>
    </MotionConfig>
  );
}

export default App;
