import type { ReactNode } from "react";
import { useLanguage } from "../context/LanguageContext";
import CandidateSidebar from "./CandidateSidebar";

type Props = {
  children: ReactNode;
};

function CandidateLayout({ children }: Props) {
  const { language } = useLanguage();
  const isRTL = language === "ar" || language === "he";

  return (
    <div className="min-h-screen bg-[#0b1140] text-white overflow-x-hidden">
      <CandidateSidebar />

      <main
        className={`min-h-screen transition-all duration-300 ${
          isRTL ? "mr-[320px]" : "ml-[320px]"
        } max-[980px]:mr-0 max-[980px]:ml-0`}
      >
        {children}
      </main>
    </div>
  );
}

export default CandidateLayout;