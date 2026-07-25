import { Info } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

type AiDisclaimerProps = { className?: string };

// מציג הבהרה קבועה שהתוכן הופק ע"י AI ולא בהכרח מדויק במאה אחוז
function AiDisclaimer({ className = "" }: AiDisclaimerProps) {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const isRTL = language === "ar" || language === "he";

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-white/50 ${
        isRTL ? "flex-row-reverse text-right" : "text-left"
      } ${className}`}
    >
      <Info size={14} className="mt-0.5 shrink-0 text-white/35" />
      <p className="text-xs leading-5">{t.common.aiDisclaimer}</p>
    </div>
  );
}

export default AiDisclaimer;
