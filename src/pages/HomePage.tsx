import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

type Language = "en" | "ar" | "he";

const translations = {
  en: {
    home: "Home",
    about: "About",
    how: "How It Works",
    features: "Features",
    contact: "Contact",
    login: "Login",
    started: "Get Started",

    heroBadge: "AI-Powered Job Matching for the Israeli Market",
    heroTitle1: "Find Your Perfect Career",
    heroTitle2: "",
    heroTitle3: " Match",
    heroDescription:
      "Let AI analyze your skills and experience to connect you with opportunities that truly fit in the Israeli job market.",
    heroPrimary: "Get Started",
    heroSecondary: "Learn More",
    heroContact: "Contact Us",

    stat1: "Match Accuracy",
    stat2: "Active Jobs",
    stat3: "Candidates",
    stat4: "Companies",

    aboutTag: "About The Platform",
    aboutTitle: "Built to improve the recruitment experience for everyone",
    about1Title: "For Candidates",
    about1Text:
      "Candidates can create professional profiles, upload CVs, view job opportunities, and receive smart matching suggestions based on their skills and qualifications.",
    about2Title: "For Companies",
    about2Text:
      "Companies can publish job openings, define requirements, review suitable candidates, and simplify the decision-making process through a clean and structured interface.",
    about3Title: "AI Assistance",
    about3Text:
      "The platform introduces intelligent support features to improve recruitment quality, strengthen recommendations, and make the experience smarter for both sides.",

    howTag: "How It Works",
    howTitle: "A simple and intelligent hiring flow",
    step1Title: "Create an Account",
    step1Text:
      "Users sign up as candidates or companies and access the platform’s personalized workflow.",
    step2Title: "Complete Your Profile",
    step2Text:
      "Candidates upload their resume and skills, while companies add job requirements and role details.",
    step3Title: "Receive Smart Matches",
    step3Text:
      "The system analyzes data and recommends suitable candidates or job opportunities using AI-based concepts.",
    step4Title: "Connect and Move Forward",
    step4Text:
      "Both sides review relevant details, compare options, and proceed through a smoother digital recruitment journey.",

    featuresTag: "Features",
    featuresTitle: "Powered by Artificial Intelligence",
    feature1Title: "AI-Powered Matching",
    feature1Text:
      "Smart algorithms analyze skills, experience, and preferences for perfect matches.",
    feature2Title: "Smart Match Analysis",
    feature2Text:
      "See exactly why jobs match your profile with skill alignment breakdowns.",
    feature3Title: "Pre-Interview Module",
    feature3Text:
      "AI-driven pre-screening helps evaluate candidates faster and smarter.",
    feature4Title: "Resume Scoring",
    feature4Text:
      "Get actionable feedback to optimize your resume for better results.",

    ctaTitle: "Ready to Transform Your Career?",
    ctaText:
      "Join thousands of professionals in Israel who have found their perfect match.",
    ctaCandidate: "I'm a Candidate",
    ctaHiring: "I'm Hiring",

    modalTitle: "Contact Us",
    modalPlaceholder: "Write your message here...",
    modalSend: "Send Message",
    modalClose: "Close",
    modalSuccess: "Message sent successfully!",
  },

  ar: {
    home: "الرئيسية",
    about: "من نحن",
    how: "كيف يعمل",
    features: "المميزات",
    contact: "تواصل",
    login: "تسجيل الدخول",
    started: "ابدأ الآن",

    heroBadge: "مطابقة وظائف ذكية مدعومة بالذكاء الاصطناعي للسوق الإسرائيلي",
    heroTitle1: "ابحث عن",
    heroTitle2: "",
    heroTitle3: " الوظيفة المثالية",
    heroDescription:
      "دع الذكاء الاصطناعي يحلل مهاراتك وخبراتك ليربطك بفرص تناسبك فعلًا في سوق العمل الإسرائيلي.",
    heroPrimary: "ابدأ الآن",
    heroSecondary: "اعرف أكثر",
    heroContact: "تواصل معنا",

    stat1: "دقة المطابقة",
    stat2: "وظائف نشطة",
    stat3: "مرشحون",
    stat4: "شركات",

    aboutTag: "عن المنصة",
    aboutTitle: "منصة بُنيت لتحسين تجربة التوظيف للجميع",
    about1Title: "للمرشحين",
    about1Text:
      "يمكن للمرشحين إنشاء ملفات شخصية احترافية، رفع السيرة الذاتية، استعراض الوظائف المناسبة، والحصول على اقتراحات ذكية بناءً على مهاراتهم ومؤهلاتهم.",
    about2Title: "للشركات",
    about2Text:
      "يمكن للشركات نشر الوظائف، تحديد المتطلبات، مراجعة المرشحين المناسبين، وتبسيط عملية اتخاذ القرار من خلال واجهة واضحة ومنظمة.",
    about3Title: "مساعدة ذكية",
    about3Text:
      "تقدم المنصة خصائص دعم ذكية لتحسين جودة التوظيف وتقوية التوصيات وجعل التجربة أكثر ذكاءً للطرفين.",

    howTag: "كيف يعمل",
    howTitle: "رحلة توظيف بسيطة وذكية",
    step1Title: "إنشاء حساب",
    step1Text:
      "يقوم المستخدمون بالتسجيل كمرشحين أو كشركات للوصول إلى مسار عمل مخصص داخل المنصة.",
    step2Title: "إكمال الملف الشخصي",
    step2Text:
      "يقوم المرشحون برفع السيرة والمهارات، بينما تضيف الشركات متطلبات الوظيفة وتفاصيل الدور.",
    step3Title: "الحصول على مطابقات ذكية",
    step3Text:
      "يقوم النظام بتحليل البيانات واقتراح الوظائف أو المرشحين المناسبين باستخدام مفاهيم تعتمد على الذكاء الاصطناعي.",
    step4Title: "التواصل والتقدم",
    step4Text:
      "يستطيع الطرفان مراجعة التفاصيل المهمة ومقارنة الخيارات والمتابعة ضمن رحلة توظيف رقمية أكثر سلاسة.",

    featuresTag: "المميزات",
    featuresTitle: "مدعوم بالذكاء الاصطناعي",
    feature1Title: "مطابقة ذكية",
    feature1Text:
      "خوارزميات ذكية تحلل المهارات والخبرة والتفضيلات للوصول إلى أفضل تطابق.",
    feature2Title: "تحليل التطابق الذكي",
    feature2Text:
      "شاهد بوضوح لماذا تناسبك الوظائف من خلال تحليل توافق المهارات.",
    feature3Title: "وحدة ما قبل المقابلة",
    feature3Text:
      "فحص أولي بالذكاء الاصطناعي يساعد على تقييم المرشحين بشكل أسرع وأذكى.",
    feature4Title: "تقييم السيرة الذاتية",
    feature4Text:
      "احصل على ملاحظات عملية لتحسين سيرتك الذاتية وتحقيق نتائج أفضل.",

    ctaTitle: "جاهزة لتطوير مسارك المهني؟",
    ctaText: "انضم لآلاف الأشخاص الذين وجدوا الفرصة المناسبة لهم.",
    ctaCandidate: "مرشح",
    ctaHiring: "شركه",

    modalTitle: "تواصل معنا",
    modalPlaceholder: "اكتب رسالتك هنا...",
    modalSend: "إرسال الرسالة",
    modalClose: "إغلاق",
    modalSuccess: "تم إرسال الرسالة بنجاح!",
  },

  he: {
    home: "בית",
    about: "אודות",
    how: "איך זה עובד",
    features: "תכונות",
    contact: "צור קשר",
    login: "התחברות",
    started: "התחל עכשיו",

    heroBadge: "התאמת משרות חכמה מבוססת בינה מלאכותית לשוק הישראלי",
    heroTitle1: "מצא את",
    heroTitle2: "",
    heroTitle3: " המשרה המושלמת",
    heroDescription:
      "תני ל-AI לנתח את הכישורים והניסיון שלך ולחבר אותך להזדמנויות שבאמת מתאימות לך בשוק העבודה הישראלי.",
    heroPrimary: "התחיל עכשיו",
    heroSecondary: "למד עוד",
    heroContact: "צור קשר",

    stat1: "דיוק התאמה",
    stat2: "משרות פעילות",
    stat3: "מועמדים",
    stat4: "חברות",

    aboutTag: "אודות הפלטפורמה",
    aboutTitle: "נבנתה כדי לשפר את חוויית הגיוס לכולם",
    about1Title: "למועמדים",
    about1Text:
      "מועמדים יכולים ליצור פרופילים מקצועיים, להעלות קורות חיים, לצפות במשרות מתאימות ולקבל הצעות חכמות לפי הכישורים והיכולות שלהם.",
    about2Title: "לחברות",
    about2Text:
      "חברות יכולות לפרסם משרות, להגדיר דרישות, לבדוק מועמדים מתאימים ולפשט את תהליך קבלת ההחלטות דרך ממשק ברור ומסודר.",
    about3Title: "סיוע חכם",
    about3Text:
      "הפלטפורמה מציעה יכולות תמיכה חכמות לשיפור איכות הגיוס, חיזוק ההמלצות והפיכת החוויה לחכמה יותר עבור שני הצדדים.",

    howTag: "איך זה עובד",
    howTitle: "תהליך גיוס פשוט וחכם",
    step1Title: "יצירת חשבון",
    step1Text:
      "המשתמשים נרשמים כמועמדים או כחברות ונכנסים לתהליך עבודה מותאם אישית בפלטפורמה.",
    step2Title: "השלמת הפרופיל",
    step2Text:
      "מועמדים מעלים קורות חיים וכישורים, בעוד שחברות מוסיפות דרישות משרה ופרטי תפקיד.",
    step3Title: "קבלת התאמות חכמות",
    step3Text:
      "המערכת מנתחת נתונים וממליצה על משרות או מועמדים מתאימים באמצעות עקרונות מבוססי AI.",
    step4Title: "התקדמות וחיבור",
    step4Text:
      "שני הצדדים יכולים לעיין בפרטים הרלוונטיים, להשוות אפשרויות ולהתקדם בתהליך גיוס דיגיטלי חלק יותר.",

    featuresTag: "תכונות",
    featuresTitle: "מופעל על ידי בינה מלאכותית",
    feature1Title: "התאמה מבוססת AI",
    feature1Text:
      "אלגוריתמים חכמים מנתחים כישורים, ניסיון והעדפות כדי ליצור התאמות מדויקות.",
    feature2Title: "ניתוח התאמה חכם",
    feature2Text:
      "ראה בדיוק למה משרות מתאימות לפרופיל שלך עם פירוט של התאמת כישורים.",
    feature3Title: "מודול טרום-ראיון",
    feature3Text:
      "סינון מוקדם בעזרת AI מסייע להעריך מועמדים מהר יותר ובצורה חכמה יותר.",
    feature4Title: "ציון לקורות חיים",
    feature4Text:
      "קבל משוב מעשי כדי לשפר את קורות החיים שלך ולהשיג תוצאות טובות יותר.",

    ctaTitle: "מוכן לשדרג את הקריירה שלך?",
    ctaText: "הצטרף לאלפי אנשים שכבר מצאו את ההתאמה הנכונה עבורם.",
    ctaCandidate: " מועמד",
    ctaHiring: " מגייס",

    modalTitle: "צור קשר",
    modalPlaceholder: "כתוב כאן את ההודעה שלך...",
    modalSend: "שלח הודעה",
    modalClose: "סגור",
    modalSuccess: "ההודעה נשלחה בהצלחה!",
  },
};

function HomePage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const t = translations[language as Language];
  const isRTL = language === "ar" || language === "he";

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [message, setMessage] = useState("");

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    alert(t.modalSuccess);
    setMessage("");
    setIsContactOpen(false);
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(76,70,255,0.18),transparent_28%),linear-gradient(135deg,#090b3a_0%,#15145a_45%,#0f1f59_100%)] text-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(115,73,255,0.18),transparent_22%),radial-gradient(circle_at_80%_85%,rgba(0,153,255,0.16),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25 [mask-image:linear-gradient(to_bottom,rgba(255,255,255,0.75),transparent)]" />

      <nav className="relative z-30 flex items-center justify-between px-8 py-6 max-[900px]:flex-col max-[900px]:gap-4 max-[900px]:px-5">
        <div className="flex items-center gap-3">
          <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-[#42d4ff] to-[#8b5cf6] shadow-[0_0_18px_rgba(66,212,255,0.7)]" />
          <span className="text-[26px] font-extrabold tracking-[-0.6px]">
            JobMatchAI
          </span>
        </div>

        <div className="flex items-center gap-3 max-[900px]:flex-wrap max-[900px]:justify-center">
          <div className="flex items-center gap-1 rounded-[18px] border border-white/10 bg-white/[0.05] p-1 backdrop-blur-md">
            {(["he", "ar", "en"] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`rounded-[14px] px-4 py-2 text-sm font-semibold transition ${
                  language === lang
                    ? "bg-white/10 text-white shadow-[0_8px_20px_rgba(255,255,255,0.08)]"
                    : "text-[#c9d6ed] hover:bg-white/5 hover:text-white"
                }`}
              >
                {lang === "en"
                  ? "GB English"
                  : lang === "ar"
                    ? "العربية"
                    : "עברית"}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/login")}
            className="rounded-[16px] px-5 py-3 text-sm font-bold text-[#dce7ff] transition hover:bg-white/5 hover:text-white"
          >
            {t.login}
          </button>

          <button
            onClick={() => scrollToSection("career-cta")}
            className="rounded-[16px] bg-gradient-to-r from-[#6d7cff] via-[#7c5cff] to-[#a855f7] px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_35px_rgba(124,92,255,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(124,92,255,0.35)]"
          >
            {t.started}
          </button>
        </div>
      </nav>

      <section
        id="home"
        className="relative z-20 flex min-h-[calc(100vh-96px)] flex-col items-center justify-center px-6 pb-20 pt-6 text-center"
      >
        <div className="mb-8 inline-flex items-center rounded-full border border-[#7c7cff]/30 bg-[#5d5cff]/15 px-6 py-3 text-[15px] font-medium text-[#c8d3ff] shadow-[0_8px_30px_rgba(93,92,255,0.15)] backdrop-blur-md">
          ✧ {t.heroBadge}
        </div>

        <h1 className="max-w-[1100px] text-[92px] font-extrabold leading-[0.96] tracking-[-3px] text-white max-[1200px]:text-[76px] max-[900px]:text-[52px] max-[900px]:tracking-[-1.6px]">
          {t.heroTitle1}
          {t.heroTitle2 && (
            <>
              <br />
              {t.heroTitle2}
            </>
          )}
          <br />
          <span className="bg-gradient-to-r from-[#b38cff] via-[#8e7dff] to-[#3ec9ff] bg-clip-text text-transparent">
            {t.heroTitle3}
          </span>
        </h1>

        <p className="mt-8 max-w-[900px] text-[20px] leading-[1.75] text-[#bfcbe3] max-[900px]:text-[17px]">
          {t.heroDescription}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            className="min-h-[64px] rounded-[18px] bg-gradient-to-r from-[#38bdf8] via-[#4f8cff] to-[#6366f1] px-10 text-[22px] font-extrabold text-white shadow-[0_14px_35px_rgba(79,140,255,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(79,140,255,0.35)] max-[900px]:text-[18px]"
            onClick={() => scrollToSection("about")}
          >
            {t.heroSecondary}
          </button>

          <button
            className="min-h-[64px] rounded-[18px] border border-[#7f8cff]/30 bg-[rgba(103,109,255,0.10)] px-10 text-[22px] font-extrabold text-[#eef2ff] shadow-[0_10px_30px_rgba(103,109,255,0.15)] transition duration-300 hover:-translate-y-1 hover:bg-[rgba(103,109,255,0.18)] max-[900px]:text-[18px]"
            onClick={() => setIsContactOpen(true)}
          >
            {t.heroContact}
          </button>
        </div>

        <div className="mt-20 flex max-w-[1180px] flex-wrap justify-center gap-5">
          {[
            ["95%", t.stat1],
            ["10K+", t.stat2],
            ["50K+", t.stat3],
            ["500+", t.stat4],
          ].map(([value, label]) => (
            <div
              key={value}
              className="min-w-[230px] rounded-[28px] border border-white/10 bg-white/[0.045] px-9 py-8 text-center shadow-[0_16px_45px_rgba(0,0,0,0.16)] backdrop-blur-[12px]"
            >
              <h3 className="mb-2 text-[42px] font-extrabold text-white">
                {value}
              </h3>
              <p className="text-[16px] text-[#c9d6ed]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="features"
        className="relative z-20 px-8 py-[90px] max-[900px]:px-5"
      >
        <div className="mx-auto mb-14 max-w-[950px] text-center">
          <h2 className="text-[52px] font-extrabold leading-[1.2] tracking-[-1.4px] max-[900px]:text-[34px]">
            {t.featuresTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-[760px] text-[18px] leading-[1.8] text-[#bfcbe3] max-[900px]:text-[16px]">
            {language === "en" &&
              "Our smart algorithms analyze multiple data points to create the most accurate matches between candidates and opportunities."}
            {language === "ar" &&
              "تحلل خوارزمياتنا الذكية عدة نقاط بيانات لإنشاء أكثر التطابقات دقة بين المرشحين والفرص."}
            {language === "he" &&
              "האלגוריתמים החכמים שלנו מנתחים נקודות מידע רבות כדי ליצור את ההתאמות המדויקות ביותר בין מועמדים להזדמנויות."}
          </p>
        </div>

        <div className="mx-auto grid max-w-[1520px] grid-cols-4 gap-6 max-[1300px]:grid-cols-2 max-[700px]:grid-cols-1">
          {[
            [t.feature1Title, t.feature1Text, "🧠"],
            [t.feature2Title, t.feature2Text, "🎯"],
            [t.feature3Title, t.feature3Text, "⚡"],
            [t.feature4Title, t.feature4Text, "🛡️"],
          ].map(([title, text, icon]) => (
            <div
              key={title}
              className={`rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_16px_45px_rgba(0,0,0,0.12)] backdrop-blur-[10px] ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <div className="mb-6 flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-[#6e59ff]/25 text-[22px]">
                {icon}
              </div>
              <h3 className="mb-3 text-[20px] font-bold text-white">{title}</h3>
              <p className="text-[16px] leading-[1.8] text-[#c5d0e8]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="about"
        className="relative z-20 px-8 py-[90px] max-[900px]:px-5"
      >
        <div className="mx-auto mb-14 max-w-[900px] text-center">
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[1.6px] text-[#7dd3fc]">
            {t.aboutTag}
          </p>
          <h2 className="text-[42px] font-extrabold leading-[1.3] tracking-[-1px] max-[900px]:text-[30px]">
            {t.aboutTitle}
          </h2>
          <span className="mt-5 inline-block h-1 w-[90px] rounded-full bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6]" />
        </div>

        <div className="mx-auto grid max-w-[1320px] grid-cols-3 gap-6 max-[1200px]:grid-cols-2 max-[800px]:grid-cols-1">
          {[
            ["01", t.about1Title, t.about1Text],
            ["02", t.about2Title, t.about2Text],
            ["03", t.about3Title, t.about3Text],
          ].map(([num, title, text]) => (
            <div
              key={num}
              className={`rounded-[28px] border border-white/[0.08] bg-white/[0.045] p-8 shadow-[0_16px_45px_rgba(0,0,0,0.12)] transition hover:-translate-y-1 hover:bg-white/[0.06] ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <div className="mb-5 flex h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-gradient-to-br from-[#38bdf8] to-[#8b5cf6] text-[18px] font-extrabold text-white">
                {num}
              </div>
              <h3 className="mb-4 text-[22px] font-bold text-white">{title}</h3>
              <p className="text-[15px] leading-[1.95] text-[#d4def2]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative z-20 px-8 pb-[90px] pt-[90px] max-[900px]:px-5"
      >
        <div className="mx-auto mb-14 max-w-[900px] text-center">
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[1.6px] text-[#7dd3fc]">
            {t.howTag}
          </p>
          <h2 className="text-[42px] font-extrabold leading-[1.3] tracking-[-1px] max-[900px]:text-[30px]">
            {t.howTitle}
          </h2>
          <span className="mt-5 inline-block h-1 w-[90px] rounded-full bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6]" />
        </div>

        <div className="mx-auto grid max-w-[1080px] gap-5">
          {[
            ["01", t.step1Title, t.step1Text],
            ["02", t.step2Title, t.step2Text],
            ["03", t.step3Title, t.step3Text],
            ["04", t.step4Title, t.step4Text],
          ].map(([num, title, text]) => (
            <div
              key={num}
              className={`flex gap-5 rounded-[24px] border border-white/[0.08] bg-white/[0.045] px-7 py-6 shadow-[0_16px_45px_rgba(0,0,0,0.1)] max-[900px]:flex-col ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <div className="flex h-[62px] min-w-[62px] items-center justify-center rounded-[20px] bg-gradient-to-br from-[#38bdf8] to-[#8b5cf6] text-[18px] font-extrabold text-white">
                {num}
              </div>
              <div>
                <h3 className="mb-2 mt-1 text-[22px] font-bold text-white">
                  {title}
                </h3>
                <p className="text-[15px] leading-[1.9] text-[#d2dcf0]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="career-cta"
        className="relative z-20 px-8 pb-[120px] pt-[20px] max-[900px]:px-5"
      >
        <div className="mx-auto max-w-[1500px] rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(35,32,90,0.9),rgba(32,59,104,0.82))] px-8 py-14 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-[10px] max-[900px]:px-5">
          <div className="mx-auto max-w-[900px] text-center">
            <h2 className="text-[48px] font-extrabold tracking-[-1.4px] text-white max-[900px]:text-[32px]">
              {t.ctaTitle}
            </h2>

            <p className="mt-4 text-[18px] leading-[1.8] text-[#bfcbe3] max-[900px]:text-[16px]">
              {t.ctaText}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate("/register/candidate")}
                className="min-w-[220px] rounded-[16px] bg-gradient-to-r from-[#22c1ee] to-[#2979ff] px-7 py-4 text-[17px] font-bold text-white shadow-[0_14px_35px_rgba(41,121,255,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(41,121,255,0.34)]"
              >
                {t.ctaCandidate}
              </button>

              <button
                onClick={() => navigate("/register/company")}
                className="min-w-[220px] rounded-[16px] bg-gradient-to-r from-[#7c3aed] to-[#5b5cf0] px-7 py-4 text-[17px] font-bold text-white shadow-[0_14px_35px_rgba(124,58,237,0.26)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(124,58,237,0.34)]"
              >
                {t.ctaHiring}
              </button>
            </div>
          </div>
        </div>
      </section>

      {isContactOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-5 backdrop-blur-[8px]">
          <div
            className={`w-full max-w-[560px] rounded-[30px] border border-white/10 bg-[rgba(15,23,42,0.96)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[24px] font-bold text-white">
                {t.modalTitle}
              </h2>
              <button
                type="button"
                onClick={() => setIsContactOpen(false)}
                className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.modalPlaceholder}
              className="min-h-[150px] w-full resize-none rounded-[18px] border border-white/10 bg-white/[0.04] p-4 text-[15px] text-white outline-none placeholder:text-[#92a1bf]"
            />

            <div
              className={`mt-5 flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <button
                type="button"
                onClick={handleSendMessage}
                className="flex-1 rounded-[16px] bg-gradient-to-r from-[#38bdf8] to-[#6366f1] px-5 py-3 text-[15px] font-bold text-white shadow-[0_14px_30px_rgba(56,189,248,0.22)] transition hover:-translate-y-0.5"
              >
                {t.modalSend}
              </button>

              <button
                type="button"
                onClick={() => setIsContactOpen(false)}
                className="rounded-[16px] border border-white/15 bg-white/[0.03] px-5 py-3 text-[15px] font-bold text-white transition hover:bg-white/[0.07]"
              >
                {t.modalClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;