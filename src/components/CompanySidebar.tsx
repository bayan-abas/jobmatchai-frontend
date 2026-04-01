import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  FileText,
  Building2,
  Bell,
  LogOut,
  Sparkles,
  ChevronLeft,
} from "lucide-react";

type CompanySidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

function CompanySidebar({
  isCollapsed,
  setIsCollapsed,
}: CompanySidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const menuItems = [
    {
      label: "Dashboard",
      path: "/company-dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Job Postings",
      path: "/company-job-postings",
      icon: BriefcaseBusiness,
    },
    {
      label: "Candidates",
      path: "/company-candidates",
      icon: Users,
    },
    {
      label: "Applications",
      path: "/company-applications",
      icon: FileText,
    },
    {
      label: "Company Profile",
      path: "/company-profile",
      icon: Building2,
    },
    {
      label: "Notifications",
      path: "/company-notifications",
      icon: Bell,
    },
  ];

  return (
    <aside
      className={`fixed top-0 z-50 flex h-screen flex-col justify-between overflow-hidden border-white/10 bg-[linear-gradient(180deg,#15184c_0%,#111444_60%,#0d1038_100%)] text-white transition-all duration-300 ${
        isCollapsed ? "w-[96px]" : "w-[320px]"
      } ${isRTL ? "right-0 border-l" : "left-0 border-r"} max-[980px]:hidden`}
    >
      <div>
        {/* TOP SECTION */}
        <div
          className={`flex items-center justify-between border-b border-white/10 px-5 pb-5 pt-5 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => navigate("/company-dashboard")}
            className={`flex items-center transition hover:opacity-90 ${
              isCollapsed
                ? "justify-center"
                : `gap-4 ${isRTL ? "flex-row-reverse" : ""}`
            }`}
          >
            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[16px] bg-gradient-to-br from-[#7c4dff] to-[#a855f7] shadow-[0_12px_28px_rgba(124,77,255,0.35)]">
              <Sparkles size={20} />
            </div>

            {!isCollapsed && (
              <div className={isRTL ? "text-right" : "text-left"}>
                <h2 className="text-[23px] font-extrabold leading-none">
                  JobMatch
                </h2>
                <p className="mt-2 text-[14px] text-[#8ea2ff]">
                  AI-Powered Recruitment
                </p>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className={`rounded-full p-2 text-[#8a8fbe] transition hover:bg-white/10 hover:text-white ${
              isCollapsed ? "rotate-180" : "rotate-0"
            }`}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* MENU ITEMS */}
        <div className="px-3 pt-5">
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  title={isCollapsed ? item.label : ""}
                  className={`flex w-full items-center rounded-[22px] transition ${
                    isCollapsed
                      ? "justify-center px-3 py-4"
                      : `justify-between px-5 py-4 ${
                          isRTL ? "text-right flex-row-reverse" : "text-left"
                        }`
                  } ${
                    active
                      ? "bg-[rgba(99,102,241,0.28)] text-white"
                      : "bg-transparent text-[#9ca3c5] hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      isCollapsed
                        ? "justify-center"
                        : `gap-4 ${isRTL ? "flex-row-reverse" : ""}`
                    }`}
                  >
                    <Icon size={22} strokeWidth={2.1} />
                    {!isCollapsed && (
                      <span className="text-[17px] font-semibold">
                        {item.label}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && active && (
                    <span className="h-2.5 w-2.5 rounded-full bg-[#8ea2ff]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="border-t border-white/10 px-3 pb-5 pt-4">
        {!isCollapsed && (
          <div className="mb-4 flex rounded-[18px] border border-white/10 bg-white/[0.03] p-1">
            {[
              { key: "he", label: "עברית IL" },
              { key: "ar", label: "العربية IL" },
              { key: "en", label: "GB English" },
            ].map((lang) => (
              <button
                key={lang.key}
                type="button"
                onClick={() => setLanguage(lang.key as "en" | "ar" | "he")}
                className={`flex-1 rounded-[14px] px-3 py-2.5 text-[13px] font-semibold transition ${
                  language === lang.key
                    ? "bg-[rgba(99,102,241,0.45)] text-[#dce3ff]"
                    : "text-[#9ca3c5]"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          title={isCollapsed ? t.common.logout : ""}
          className={`flex w-full items-center rounded-[18px] text-[17px] font-semibold text-[#b7bddb] transition hover:bg-white/[0.04] hover:text-white ${
            isCollapsed
              ? "justify-center px-3 py-3"
              : `gap-3 px-4 py-3 ${
                  isRTL ? "text-right flex-row-reverse" : "text-left"
                }`
          }`}
        >
          <LogOut size={21} />
          {!isCollapsed && t.common.logout}
        </button>
      </div>
    </aside>
  );
}

export default CompanySidebar;