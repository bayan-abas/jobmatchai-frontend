import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "./CandidateSidebar";
import AIChatButton from "./AIChatButton";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import { ArrowLeft, Search, Bell } from "lucide-react";

type CandidateLayoutProps = {
  children: ReactNode;
};

function CandidateLayout({ children }: CandidateLayoutProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const userName = localStorage.getItem("name") || "User";
  const savedRole = localStorage.getItem("role") || "candidate";
  const userRole =
    savedRole === "company"
      ? t.dashboard.roles.company
      : t.dashboard.roles.candidate;

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)]">
      <CandidateSidebar />

      <div
        className={`min-h-screen ${
          isRTL ? "mr-[200px]" : "ml-[200px]"
        } max-[980px]:mr-0 max-[980px]:ml-0`}
      >
        <header
          className={`fixed top-0 z-40 flex h-[78px] items-center justify-between border-b border-white/10 bg-[rgba(10,14,50,0.88)] px-6 backdrop-blur-[14px] ${
            isRTL
              ? "right-[320px] left-0 flex-row-reverse"
              : "left-[320px] right-0"
          } max-[980px]:left-0 max-[980px]:right-0`}
        >
          <div
            className={`flex items-center gap-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#cfd3f6] transition hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
            </button>

            <div
              className={`flex h-[46px] w-[430px] max-w-full items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] px-4 text-[#8d94bd] transition focus-within:border-[#7f4cff] focus-within:bg-white/[0.06] ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Search size={18} />
              <input
                type="text"
                placeholder={t.dashboard.searchPlaceholder}
                className={`w-full bg-transparent text-[15px] text-white outline-none placeholder:text-[#8d94bd] ${
                  isRTL ? "text-right" : "text-left"
                }`}
              />
            </div>
          </div>

          <div
            className={`flex items-center gap-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => navigate("/notifications")}
              className="relative flex h-[44px] w-[44px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#e2e6ff] transition hover:bg-white/[0.08] hover:text-white"
            >
              <Bell size={20} />
              <span
                className={`absolute -top-1 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#ff4b8b] text-[11px] font-bold text-white shadow-lg ${
                  isRTL ? "-left-1" : "-right-1"
                }`}
              >
                3
              </span>
            </button>

            <div className="h-9 w-px bg-white/10" />

            <div
              className={`flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-[16px] font-bold text-white shadow-[0_8px_18px_rgba(127,76,255,0.35)]">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-[14px] font-semibold text-white">
                  {userName}
                </p>
                <p className="text-[12px] text-[#aeb4d6]">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-[78px]">{children}</main>
      </div>

      <AIChatButton />
    </div>
  );
}

export default CandidateLayout;