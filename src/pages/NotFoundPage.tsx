import { useNavigate } from "react-router-dom";
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
      <div className="mb-4 text-[120px] font-extrabold leading-none tracking-[-4px] text-transparent bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6] bg-clip-text">
        {c.code}
      </div>

      <h1 className="mb-3 text-[32px] font-extrabold text-white">{c.title}</h1>

      <p className="mb-10 max-w-[420px] text-[17px] leading-7 text-white/60">
        {c.subtitle}
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3.5 font-bold text-white shadow-[0_12px_30px_rgba(34,211,238,0.22)] transition hover:scale-[1.02]"
        >
          {c.home}
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-2xl border border-white/15 bg-white/5 px-8 py-3.5 font-bold text-white transition hover:bg-white/10"
        >
          {c.back}
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
