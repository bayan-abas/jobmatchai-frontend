import { MessageCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function AIChatButton() {
  const { language } = useLanguage();
  const isRTL = language === "ar" || language === "he";

  return (
    <button
      type="button"
      className={`
        fixed bottom-6 z-[9999]
        flex h-[68px] w-[68px] items-center justify-center
        rounded-full text-white
        transition duration-300 hover:scale-105
        ${isRTL ? "left-6" : "right-6"}
      `}
      style={{
        background:
          "radial-gradient(circle at 30% 30%, #7c6cff 0%, #8b5cf6 45%, #9333ea 100%)",
        boxShadow:
          "0 12px 30px rgba(124, 58, 237, 0.42), inset 0 1px 8px rgba(255,255,255,0.12)",
      }}
      aria-label="AI Chat"
    >
      <MessageCircle size={30} strokeWidth={2.2} />
    </button>
  );
}

export default AIChatButton;