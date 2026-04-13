import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  User,
  Bell,
  Users,
  Building2,
} from "lucide-react";

type MobileNavProps = {
  role: "candidate" | "company";
};

function MobileNav({ role }: MobileNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const t = translations[language];

  const candidateItems = [
    { label: t.sidebar.dashboard, path: "/candidate-dashboard", icon: LayoutDashboard },
    { label: t.sidebar.jobMatches, path: "/job-matches", icon: BriefcaseBusiness },
    { label: t.sidebar.applications, path: "/applications", icon: FileText },
    { label: t.sidebar.myProfile, path: "/profile", icon: User },
    { label: t.sidebar.notifications, path: "/notifications", icon: Bell },
  ];

  const companyItems = [
    { label: t.companySidebar.dashboard, path: "/company-dashboard", icon: LayoutDashboard },
    { label: t.companySidebar.jobPostings, path: "/company-job-postings", icon: BriefcaseBusiness },
    { label: t.companySidebar.candidates, path: "/company-candidates", icon: Users },
    { label: t.companySidebar.companyProfile, path: "/company-profile", icon: Building2 },
    { label: t.companySidebar.notifications, path: "/company-notifications", icon: Bell },
  ];

  const items = role === "candidate" ? candidateItems : companyItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 hidden border-t border-white/10 bg-[rgba(10,14,50,0.96)] backdrop-blur-[14px] max-[980px]:flex">
      <div className="flex w-full items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-[14px] px-1 py-2 transition ${
                active
                  ? "text-[#8ea2ff]"
                  : "text-[#6b7495] hover:text-[#9ca3c5]"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 2}
                className={active ? "text-[#8ea2ff]" : ""}
              />
              <span className="max-w-[58px] truncate text-center text-[10px] font-semibold leading-tight">
                {item.label}
              </span>
              {active && (
                <span className="h-1 w-1 rounded-full bg-[#8ea2ff]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;
