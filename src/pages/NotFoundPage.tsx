import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

function NotFoundPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === "ar" || language === "he";

  const content = {
    en: {
      code: "404",
      title: "Page Not Found",
      subtitle: "The page you're looking for doesn't exist or has been moved.",
      home: "Go to Home",
      back: "Go Back",
    },
    ar: {
      code: "404",
      title: "الصفحة غير موجودة",
      subtitle: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
      home: "الصفحة الرئيسية",
      back: "رجوع",
    },
    he: {
      code: "404",
      title: "הדף לא נמצא",
      subtitle: "הדף שחיפשת לא קיים או הועבר.",
      home: "לדף הבית",
      back: "חזרה",
    },
  };

  const c = content[language];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)] px-6 text-center text-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center rounded-panel border border-white/10 bg-white/[0.03] px-8 py-12 shadow-elevated max-[480px]:px-5 max-[480px]:py-9"
      >
        <div className="mb-4 bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-[120px] font-extrabold leading-none tracking-[-4px] text-transparent max-[420px]:text-[84px]">
          {c.code}
        </div>

        <h1 className="mb-3 text-[32px] font-extrabold text-white">{c.title}</h1>

        <p className="mb-10 max-w-[420px] text-[17px] leading-7 text-ink-300">
          {c.subtitle}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-control bg-gradient-to-r from-brand-500 to-brand-400 px-8 py-3.5 font-bold text-white shadow-brand-glow transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d2e]"
          >
            {c.home}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-control border border-white/15 bg-white/5 px-8 py-3.5 font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d2e]"
          >
            {c.back}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;
