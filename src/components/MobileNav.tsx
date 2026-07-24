import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  User,
  Bell,
  Building2,
  Globe2,
  Bookmark,
  FileBadge,
  LogOut,
  MoreHorizontal,
  X,
} from "lucide-react";

type MobileNavProps = {
  role: "candidate" | "company";
};

// Below the 980px breakpoint the full sidebar (CandidateSidebar/CompanySidebar) is hidden
// entirely - this bottom bar is the ONLY navigation on phones/tablets in that range. The
// sidebar has more menu items than comfortably fit in a 5-6 icon bottom bar (8 for candidates),
// AND it's the sidebar - not this bar - that normally hosts the language switcher/logout button.
// Without the "More" sheet below, a candidate on mobile would have no way at all to reach
// External Jobs/Favorites/My Resume, and NO ONE on mobile could log out or change language -
// existing functionality would silently disappear on small screens.
function MobileNav({ role }: MobileNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const { logout } = useAuth();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";
  const [moreOpen, setMoreOpen] = useState(false);

  const candidatePrimary = [
    { label: t.sidebar.dashboard, path: "/candidate-dashboard", icon: LayoutDashboard },
    { label: t.sidebar.jobMatches, path: "/job-matches", icon: BriefcaseBusiness },
    { label: t.sidebar.applications, path: "/applications", icon: FileText },
    { label: t.sidebar.myProfile, path: "/profile", icon: User },
  ];

  const candidateOverflow = [
    { label: t.sidebar.externalJobs, path: "/external-jobs", icon: Globe2 },
    { label: t.sidebar.favorites, path: "/favorites", icon: Bookmark },
    { label: t.sidebar.myResume, path: "/resume-manager", icon: FileBadge },
    { label: t.sidebar.notifications, path: "/notifications", icon: Bell },
  ];

  const companyPrimary = [
    { label: t.companySidebar.dashboard, path: "/company-dashboard", icon: LayoutDashboard },
    { label: t.companySidebar.jobPostings, path: "/company-job-postings", icon: BriefcaseBusiness },
    { label: t.companySidebar.applications, path: "/company-applications", icon: FileText },
    { label: t.companySidebar.companyProfile, path: "/company-profile", icon: Building2 },
  ];

  const companyOverflow = [
    { label: t.companySidebar.notifications, path: "/company-notifications", icon: Bell },
  ];

  const primaryItems = role === "candidate" ? candidatePrimary : companyPrimary;
  const overflowItems = role === "candidate" ? candidateOverflow : companyOverflow;
  const moreLabel = role === "candidate" ? t.sidebar.more : t.companySidebar.more;
  const isMoreActive = overflowItems.some((item) => item.path === location.pathname);

  const handleNavigate = (path: string) => {
    setMoreOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMoreOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <div className="fixed inset-0 z-[60] hidden max-[980px]:block">
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setMoreOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={moreLabel}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className={`absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto rounded-t-[24px] border-t border-white/10 bg-[#111340] px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 shadow-floating ${isRTL ? "text-right" : "text-left"}`}
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/15" />
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[15px] font-bold text-white">{moreLabel}</span>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  aria-label={t.common.close}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {overflowItems.map((item) => {
                  const active = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleNavigate(item.path)}
                      className={`flex w-full items-center gap-4 rounded-[16px] px-4 py-3.5 transition-colors ${
                        active ? "bg-brand-500/25 text-white" : "text-ink-300 hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon size={20} strokeWidth={2.1} />
                      <span className="text-[15px] font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="my-3 h-px bg-white/10" />

              <div className="mb-3 flex rounded-[16px] border border-white/10 bg-white/[0.03] p-1">
                {[
                  { key: "he", label: "עברית" },
                  { key: "ar", label: "العربية" },
                  { key: "en", label: "English" },
                ].map((lang) => (
                  <button
                    key={lang.key}
                    type="button"
                    onClick={() => setLanguage(lang.key as "en" | "ar" | "he")}
                    className={`flex-1 rounded-[12px] px-2 py-2.5 text-[13px] font-semibold transition-colors ${
                      language === lang.key ? "bg-brand-500/45 text-white" : "text-ink-500"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-danger-300 transition-colors hover:bg-white/[0.06]"
              >
                <LogOut size={20} />
                {t.common.logout}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 hidden border-t border-white/10 bg-[rgba(10,14,50,0.96)] pb-[env(safe-area-inset-bottom)] backdrop-blur-[14px] max-[980px]:flex">
        <div className="flex w-full items-center justify-around px-1 py-2">
          {primaryItems.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[14px] px-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                  active ? "text-brand-300" : "text-ink-600 hover:text-ink-500"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                <span className="max-w-[58px] truncate text-center text-[10px] font-semibold leading-tight">
                  {item.label}
                </span>
                {active && <span className="h-1 w-1 rounded-full bg-brand-300" />}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[14px] px-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
              isMoreActive ? "text-brand-300" : "text-ink-600 hover:text-ink-500"
            }`}
          >
            <MoreHorizontal size={22} strokeWidth={isMoreActive ? 2.4 : 2} />
            <span className="max-w-[58px] truncate text-center text-[10px] font-semibold leading-tight">
              {moreLabel}
            </span>
            {isMoreActive && <span className="h-1 w-1 rounded-full bg-brand-300" />}
          </button>
        </div>
      </nav>
    </>
  );
}

export default MobileNav;
