import React from "react";
import { useNavigate } from "react-router-dom";

type CompanySidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

function CompanySidebar({
  isCollapsed,
  setIsCollapsed,
}: CompanySidebarProps) {
  const navigate = useNavigate();

  return (
    <aside
      className={`fixed top-0 z-50 h-screen border-r border-white/10 bg-[rgba(10,14,50,0.96)] backdrop-blur-[14px] transition-all duration-300 ${
        isCollapsed ? "w-[96px]" : "w-[320px]"
      }`}
    >
      <div className="flex h-[78px] items-center justify-between border-b border-white/10 px-6">
        {!isCollapsed && (
          <div>
            <h2 className="text-[20px] font-bold text-white">JobMatch</h2>
            <p className="text-[13px] text-[#aeb4d6]">AI-Powered Recruitment</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white/70 transition hover:text-white"
        >
          {isCollapsed ? "›" : "‹"}
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <button
          className="rounded-[16px] px-4 py-3 text-left text-white hover:bg-white/10"
          onClick={() => navigate("/company-dashboard")}
        >
          Dashboard
        </button>

        <button
          className="rounded-[16px] px-4 py-3 text-left text-white hover:bg-white/10"
          onClick={() => navigate("/candidates")}
        >
          Candidates
        </button>

        <button
          className="rounded-[16px] px-4 py-3 text-left text-white hover:bg-white/10"
          onClick={() => navigate("/company-applications")}
        >
          Applications
        </button>

        <button
          className="rounded-[16px] px-4 py-3 text-left text-white hover:bg-white/10"
          onClick={() => navigate("/company-profile")}
        >
          Company Profile
        </button>

        <button
          className="rounded-[16px] px-4 py-3 text-left text-white hover:bg-white/10"
          onClick={() => navigate("/notifications")}
        >
          Notifications
        </button>
      </div>
    </aside>
  );
}

export default CompanySidebar;