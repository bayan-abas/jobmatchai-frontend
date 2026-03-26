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

    heroBadge:
      "AI-Powered Recruitment Platform • Smart Matching • Better Hiring",
    heroTitle1: "The future of hiring",
    heroTitle2: "starts with",
    heroTitle3: " smarter matching.",
    heroDescription:
      "JobMatchAI is a modern recruitment platform prototype designed to help candidates and companies connect through an intelligent, professional, and user-friendly experience. It transforms the hiring journey into a faster, clearer, and more efficient digital process.",
    heroPrimary: "Start Your Journey",
    heroSecondary: "Learn More",

    stat1: "Matching Accuracy",
    stat2: "Candidate Profiles",
    stat3: "Company Accounts",

    dashboardTitle: "AI Matching Dashboard",
    fitLabel: "Candidate Fit Score",
    skillsLabel: "Top Skills",
    statusLabel: "Status",
    matched: "Matched",
    matchedText: "Company review in progress",
    insightLabel: "Platform Insight",
    insightText:
      "Smart analysis helps companies identify strong candidates faster and enables candidates to discover the most relevant opportunities.",

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
    featuresTitle: "Why JobMatchAI stands out",
    feature1Title: "Professional user experience",
    feature1Text:
      "A modern interface with a clean structure helps users navigate the platform easily and confidently.",
    feature2Title: "Smart Match Logic",
    feature2Text:
      "Matching is based on profile data, job requirements, and relevant skills.",
    feature3Title: "Candidate Insights",
    feature3Text:
      "Employers get clearer visibility into candidate suitability and profile strength.",
    feature4Title: "Company Efficiency",
    feature4Text:
      "Recruiters can save time by focusing on more relevant candidates from the start.",
    feature5Title: "Guided Experience",
    feature5Text:
      "The system supports both sides with a smoother step-by-step process.",

    contactTag: "Contact",
    contactTitle: "Let’s build a smarter hiring experience",
    contactText:
      "JobMatchAI is a professional prototype that demonstrates how design, structure, and smart matching concepts can improve the hiring process for both job seekers and employers.",
    contactPrimary: "Contact Us",
    contactSecondary: "Learn More",

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

    heroBadge: "منصة توظيف ذكية • مطابقة أذكى • توظيف أفضل",
    heroTitle1: "مستقبل التوظيف",
    heroTitle2: "يبدأ مع",
    heroTitle3: " مطابقة أذكى.",
    heroDescription:
      "JobMatchAI هو نموذج أولي حديث لمنصة توظيف ذكية، صُمم لمساعدة المرشحين والشركات على التواصل من خلال تجربة احترافية، سهلة، وذكية. المنصة تجعل رحلة التوظيف أسرع، أوضح، وأكثر كفاءة.",
    heroPrimary: "ابدأ رحلتك",
    heroSecondary: "اعرف أكثر",

    stat1: "دقة المطابقة",
    stat2: "ملفات المرشحين",
    stat3: "حسابات الشركات",

    dashboardTitle: "لوحة المطابقة الذكية",
    fitLabel: "نسبة توافق المرشح",
    skillsLabel: "أهم المهارات",
    statusLabel: "الحالة",
    matched: "تمت المطابقة",
    matchedText: "مراجعة الشركة قيد التقدم",
    insightLabel: "تحليل المنصة",
    insightText:
      "يساعد التحليل الذكي الشركات على اكتشاف المرشحين المناسبين بسرعة أكبر، كما يساعد المرشحين في الوصول إلى الفرص الأكثر ملاءمة.",

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
    featuresTitle: "لماذا تتميز JobMatchAI",
    feature1Title: "تجربة استخدام احترافية",
    feature1Text:
      "واجهة حديثة وبنية واضحة تساعد المستخدمين على التنقل في المنصة بسهولة وثقة.",
    feature2Title: "منطق مطابقة ذكي",
    feature2Text:
      "تعتمد المطابقة على بيانات الملف الشخصي ومتطلبات الوظيفة والمهارات ذات الصلة.",
    feature3Title: "رؤى عن المرشحين",
    feature3Text:
      "يحصل أصحاب العمل على رؤية أوضح حول ملاءمة المرشح وقوة ملفه الشخصي.",
    feature4Title: "كفاءة أعلى للشركات",
    feature4Text:
      "يمكن للمجندين توفير الوقت من خلال التركيز على المرشحين الأكثر صلة منذ البداية.",
    feature5Title: "تجربة موجهة",
    feature5Text:
      "يدعم النظام الطرفين من خلال عملية أكثر سلاسة خطوة بخطوة.",

    contactTag: "تواصل",
    contactTitle: "لنصنع تجربة توظيف أذكى",
    contactText:
      "JobMatchAI هو نموذج أولي احترافي يوضح كيف يمكن للتصميم والتنظيم ومفاهيم المطابقة الذكية أن تحسن عملية التوظيف للباحثين عن عمل وأصحاب العمل.",
    contactPrimary: "تواصل معنا",
    contactSecondary: "اعرف أكثر",

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

    heroBadge: "פלטפורמת גיוס חכמה • התאמה חכמה • גיוס טוב יותר",
    heroTitle1: "עתיד הגיוס",
    heroTitle2: "מתחיל עם",
    heroTitle3: " התאמה חכמה יותר.",
    heroDescription:
      "JobMatchAI הוא אבטיפוס מודרני לפלטפורמת גיוס חכמה, שנועדה לחבר בין מועמדים וחברות באמצעות חוויה מקצועית, נוחה וידידותית. הפלטפורמה הופכת את תהליך הגיוס למהיר יותר, ברור יותר ויעיל יותר.",
    heroPrimary: "התחל את המסע שלך",
    heroSecondary: "למד עוד",

    stat1: "דיוק התאמה",
    stat2: "פרופילי מועמדים",
    stat3: "חשבונות חברות",

    dashboardTitle: "לוח התאמה חכם",
    fitLabel: "ציון התאמת מועמד",
    skillsLabel: "כישורים מובילים",
    statusLabel: "סטטוס",
    matched: "בוצעה התאמה",
    matchedText: "בדיקת החברה בתהליך",
    insightLabel: "תובנת פלטפורמה",
    insightText:
      "הניתוח החכם מסייע לחברות לזהות מועמדים חזקים מהר יותר ומאפשר למועמדים לגלות הזדמנויות מתאימות יותר.",

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
    featuresTitle: "למה JobMatchAI בולטת",
    feature1Title: "חוויית משתמש מקצועית",
    feature1Text:
      "ממשק מודרני עם מבנה נקי מסייע למשתמשים לנווט בפלטפורמה בקלות ובביטחון.",
    feature2Title: "לוגיקת התאמה חכמה",
    feature2Text:
      "ההתאמה מבוססת על נתוני פרופיל, דרישות משרה וכישורים רלוונטיים.",
    feature3Title: "תובנות על מועמדים",
    feature3Text:
      "מעסיקים מקבלים תמונה ברורה יותר לגבי התאמת המועמד וחוזק הפרופיל שלו.",
    feature4Title: "יעילות לחברות",
    feature4Text:
      "מגייסים יכולים לחסוך זמן על ידי התמקדות במועמדים הרלוונטיים ביותר כבר מההתחלה.",
    feature5Title: "חוויה מודרכת",
    feature5Text:
      "המערכת תומכת בשני הצדדים בתהליך חלק יותר, שלב אחר שלב.",

    contactTag: "צור קשר",
    contactTitle: "בואו נבנה חוויית גיוס חכמה יותר",
    contactText:
      "JobMatchAI הוא אבטיפוס מקצועי שמדגים כיצד עיצוב, מבנה ורעיונות של התאמה חכמה יכולים לשפר את תהליך הגיוס עבור מחפשי עבודה ומעסיקים.",
    contactPrimary: "צור קשר",
    contactSecondary: "למד עוד",

    modalTitle: "צור קשר",
    modalPlaceholder: "כתבו את ההודעה שלכם כאן...",
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
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const sectionTextAlign = isRTL ? "text-right" : "text-left";
  const sectionDir = isRTL ? "rtl" : "ltr";

  const handleSendMessage = () => {
    if (!message.trim()) return;
    alert(t.modalSuccess);
    setMessage("");
    setIsContactOpen(false);
  };

  return (
    <div
      dir={sectionDir}
      className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)] text-white"
    >
      <div className="pointer-events-none fixed left-[-80px] top-[60px] z-0 h-[320px] w-[320px] rounded-full bg-[rgba(105,66,255,0.18)] blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[40px] right-[-100px] z-0 h-[360px] w-[360px] rounded-full bg-[rgba(36,122,255,0.14)] blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:linear-gradient(to_bottom,rgba(255,255,255,0.7),transparent)]" />

      <nav className="sticky top-0 z-50 flex h-[84px] items-center justify-between border-b border-white/10 bg-[rgba(5,10,20,0.7)] px-16 backdrop-blur-[18px] max-[900px]:h-auto max-[900px]:flex-col max-[900px]:gap-4 max-[900px]:px-5 max-[900px]:py-[18px]">
        <div className="flex items-center gap-3">
          <div className="h-[14px] w-[14px] rounded-full bg-gradient-to-br from-[#38bdf8] to-[#8b5cf6] shadow-[0_0_18px_rgba(56,189,248,0.6)]" />
          <span className="text-2xl font-extrabold tracking-[-0.5px]">
            JobMatchAI
          </span>
        </div>

        <div className="flex gap-2 max-[900px]:flex-wrap max-[900px]:justify-center">
          {[
            ["home", t.home],
            ["about", t.about],
            ["how-it-works", t.how],
            ["features", t.features],
            ["contact", t.contact],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="h-[42px] rounded-xl px-4 text-sm font-medium text-[#d8e5ff] transition hover:bg-white/5 hover:text-white"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-[10px] max-[900px]:flex-wrap max-[900px]:justify-center">
          <div className="flex items-center gap-[6px] rounded-[14px] bg-white/5 p-1">
            {(["en", "ar", "he"] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`h-[34px] min-w-[44px] rounded-[10px] px-[10px] text-xs font-bold transition ${
                  language === lang
                    ? "bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-white"
                    : "bg-transparent text-[#d8e5ff] hover:bg-white/10 hover:text-white"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            className="h-[42px] rounded-xl px-4 text-sm font-medium text-[#d8e5ff] transition hover:bg-white/5 hover:text-white"
            onClick={() => navigate("/login")}
          >
            {t.login}
          </button>

          <button
            className="h-[44px] whitespace-nowrap rounded-[14px] bg-gradient-to-r from-[#38bdf8] to-[#6366f1] px-[18px] text-sm font-bold text-white shadow-[0_12px_28px_rgba(56,189,248,0.25)] transition hover:-translate-y-0.5"
            onClick={() => navigate("/register")}
          >
            {t.started}
          </button>
        </div>
      </nav>

      <section
        id="home"
        className="relative z-10 flex min-h-[calc(100vh-84px)] items-center justify-between gap-14 px-16 pb-10 pt-[70px] max-[1200px]:flex-col max-[1200px]:items-start max-[900px]:px-5 max-[900px]:pt-10"
      >
        <div className={`max-w-[720px] flex-1 ${sectionTextAlign}`}>
          <div className="mb-6 inline-flex min-h-[42px] items-center rounded-full border border-[rgba(125,211,252,0.22)] bg-[rgba(125,211,252,0.12)] px-4 text-[13px] font-semibold text-[#9bdcff]">
            {t.heroBadge}
          </div>

          <h1 className="mb-6 text-[72px] font-extrabold leading-[1.03] tracking-[-2.6px] max-[900px]:text-5xl max-[900px]:tracking-[-1.4px]">
            {t.heroTitle1}
            <br />
            {t.heroTitle2}
            <span className="bg-gradient-to-r from-[#7dd3fc] to-[#a78bfa] bg-clip-text text-transparent">
              {t.heroTitle3}
            </span>
          </h1>

          <p className="mb-[34px] max-w-[640px] text-[17px] leading-[1.95] text-[#c9d6ed]">
            {t.heroDescription}
          </p>

          <div className="mb-[38px] flex flex-wrap gap-4">
            <button
              className="min-h-[52px] rounded-2xl bg-gradient-to-r from-[#38bdf8] to-[#6366f1] px-6 text-[15px] font-bold text-white shadow-[0_14px_30px_rgba(56,189,248,0.22)] transition hover:-translate-y-0.5"
              onClick={() => navigate("/register")}
            >
              {t.heroPrimary}
            </button>

            <button
              className="min-h-[52px] rounded-2xl border border-white/15 bg-white/[0.03] px-6 text-[15px] font-bold text-white transition hover:bg-white/[0.07]"
              onClick={() => scrollToSection("about")}
            >
              {t.heroSecondary}
            </button>
          </div>

          <div className="flex flex-wrap gap-[18px]">
            {[
              ["92%", t.stat1],
              ["1200+", t.stat2],
              ["350+", t.stat3],
            ].map(([value, label]) => (
              <div
                key={value}
                className="min-w-[160px] rounded-[20px] border border-white/[0.06] bg-white/[0.045] px-5 py-[18px]"
              >
                <h3 className="mb-2 text-[28px] font-extrabold text-[#9bdcff]">
                  {value}
                </h3>
                <p className="text-[13px] leading-[1.6] text-[#d6e1f6]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 justify-center max-[1200px]:w-full">
          <div className="w-full max-w-[520px] rounded-[30px] border border-white/[0.09] bg-white/[0.055] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.3)] backdrop-blur-[20px] max-[1200px]:max-w-full">
            <div className="mb-[22px] flex items-center justify-between">
              <div className="flex gap-2">
                <span className="h-[10px] w-[10px] rounded-full bg-[#fb7185]" />
                <span className="h-[10px] w-[10px] rounded-full bg-[#facc15]" />
                <span className="h-[10px] w-[10px] rounded-full bg-[#4ade80]" />
              </div>
              <p className="text-sm font-semibold text-[#d3def5]">
                {t.dashboardTitle}
              </p>
            </div>

            <div className="mb-[18px] flex items-center justify-between rounded-[24px] border border-white/[0.07] bg-white/[0.045] p-6">
              <div>
                <span className="mb-[10px] block text-[13px] font-medium text-[#9fb2d4]">
                  {t.fitLabel}
                </span>
                <h2 className="m-0 text-[44px] font-extrabold">94%</h2>
              </div>
              <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-gradient-to-br from-[#38bdf8] to-[#8b5cf6] text-[22px] font-extrabold shadow-[0_10px_30px_rgba(56,189,248,0.2)]">
                AI
              </div>
            </div>

            <div className="mb-[18px] grid grid-cols-2 gap-[18px] max-[900px]:grid-cols-1">
              <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.045] p-5">
                <span className="mb-[10px] block text-[13px] font-medium text-[#9fb2d4]">
                  {t.skillsLabel}
                </span>
                <ul
                  className={`${isRTL ? "pr-[18px]" : "pl-[18px]"} m-0 text-sm leading-[1.9] text-[#e8f0ff]`}
                >
                  <li>Java</li>
                  <li>Python</li>
                  <li>SQL</li>
                </ul>
              </div>

              <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.045] p-5">
                <span className="mb-[10px] block text-[13px] font-medium text-[#9fb2d4]">
                  {t.statusLabel}
                </span>
                <h4 className="mb-[10px] text-[22px] font-bold">
                  {t.matched}
                </h4>
                <p className="text-sm leading-[1.8] text-[#c9d6ed]">
                  {t.matchedText}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.045] p-[22px]">
              <span className="mb-[10px] block text-[13px] font-medium text-[#9fb2d4]">
                {t.insightLabel}
              </span>
              <p className="text-sm leading-[1.9] text-[#d0dbf1]">
                {t.insightText}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 px-16 py-[110px] max-[900px]:px-5">
        <div className="mx-auto mb-14 max-w-[860px] text-center">
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[1.5px] text-[#7dd3fc]">
            {t.aboutTag}
          </p>
          <h2 className="text-[42px] font-extrabold leading-[1.35] tracking-[-1px] max-[900px]:text-[30px]">
            {t.aboutTitle}
          </h2>
          <span className="mt-[18px] inline-block h-1 w-[90px] rounded-full bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6]" />
        </div>

        <div className="grid grid-cols-3 gap-6 max-[1200px]:grid-cols-2 max-[900px]:grid-cols-1">
          {[
            ["01", t.about1Title, t.about1Text],
            ["02", t.about2Title, t.about2Text],
            ["03", t.about3Title, t.about3Text],
          ].map(([num, title, text]) => (
            <div
              key={num}
              className={`rounded-[28px] border border-white/[0.075] bg-white/[0.045] p-[30px] transition hover:-translate-y-1.5 hover:bg-white/[0.06] ${sectionTextAlign}`}
            >
              <div className="mb-[18px] flex h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-gradient-to-br from-[#38bdf8] to-[#8b5cf6] text-[18px] font-extrabold">
                {num}
              </div>
              <h3 className="mb-[14px] text-[22px] font-bold">{title}</h3>
              <p className="text-[15px] leading-[1.95] text-[#d4def2]">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative z-10 px-16 py-[110px] max-[900px]:px-5"
      >
        <div className="mx-auto mb-14 max-w-[860px] text-center">
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[1.5px] text-[#7dd3fc]">
            {t.howTag}
          </p>
          <h2 className="text-[42px] font-extrabold leading-[1.35] tracking-[-1px] max-[900px]:text-[30px]">
            {t.howTitle}
          </h2>
          <span className="mt-[18px] inline-block h-1 w-[90px] rounded-full bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6]" />
        </div>

        <div className="mx-auto grid max-w-[980px] gap-5">
          {[
            ["01", t.step1Title, t.step1Text],
            ["02", t.step2Title, t.step2Text],
            ["03", t.step3Title, t.step3Text],
            ["04", t.step4Title, t.step4Text],
          ].map(([num, title, text]) => (
            <div
              key={num}
              className={`flex gap-[18px] rounded-[24px] border border-white/[0.075] bg-white/[0.045] px-[26px] py-6 max-[900px]:flex-col ${sectionTextAlign}`}
            >
              <div className="flex h-[62px] min-w-[62px] items-center justify-center rounded-[20px] bg-gradient-to-br from-[#38bdf8] to-[#8b5cf6] text-[18px] font-extrabold">
                {num}
              </div>
              <div>
                <h3 className="mb-[10px] mt-1 text-[22px] font-bold">
                  {title}
                </h3>
                <p className="text-[15px] leading-[1.9] text-[#d2dcf0]">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="relative z-10 px-16 py-[110px] max-[900px]:px-5">
        <div className="mx-auto mb-14 max-w-[860px] text-center">
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[1.5px] text-[#7dd3fc]">
            {t.featuresTag}
          </p>
          <h2 className="text-[42px] font-extrabold leading-[1.35] tracking-[-1px] max-[900px]:text-[30px]">
            {t.featuresTitle}
          </h2>
          <span className="mt-[18px] inline-block h-1 w-[90px] rounded-full bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6]" />
        </div>

        <div className="grid grid-cols-3 gap-[22px] max-[1200px]:grid-cols-2 max-[900px]:grid-cols-1">
          <div
            className={`col-span-2 flex min-h-[220px] flex-col justify-center rounded-[24px] border border-white/[0.075] bg-white/[0.045] p-7 max-[900px]:col-span-1 ${sectionTextAlign}`}
          >
            <h3 className="mb-[14px] text-[21px] font-bold">
              {t.feature1Title}
            </h3>
            <p className="text-[15px] leading-[1.9] text-[#d4def2]">
              {t.feature1Text}
            </p>
          </div>

          {[
            [t.feature2Title, t.feature2Text],
            [t.feature3Title, t.feature3Text],
            [t.feature4Title, t.feature4Text],
            [t.feature5Title, t.feature5Text],
          ].map(([title, text]) => (
            <div
              key={title}
              className={`rounded-[24px] border border-white/[0.075] bg-white/[0.045] p-7 ${sectionTextAlign}`}
            >
              <h3 className="mb-[14px] text-[21px] font-bold">{title}</h3>
              <p className="text-[15px] leading-[1.9] text-[#d4def2]">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="relative z-10 px-16 pb-[100px] pt-10 max-[900px]:px-5">
        <div className="mx-auto max-w-[900px] rounded-[32px] border border-white/[0.08] bg-white/[0.05] px-[30px] py-[42px] text-center">
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[1.5px] text-[#7dd3fc]">
            {t.contactTag}
          </p>
          <h2 className="mb-[18px] text-[40px] font-extrabold leading-[1.3] tracking-[-1px] max-[900px]:text-[30px]">
            {t.contactTitle}
          </h2>
          <p className="mx-auto mb-7 max-w-[700px] text-base leading-[1.95] text-[#d1dcef]">
            {t.contactText}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              className="min-h-[52px] rounded-2xl bg-gradient-to-r from-[#38bdf8] to-[#6366f1] px-6 text-[15px] font-bold text-white shadow-[0_14px_30px_rgba(56,189,248,0.22)] transition hover:-translate-y-0.5"
              onClick={() => setIsContactOpen(true)}
            >
              {t.contactPrimary}
            </button>

            <button
              className="min-h-[52px] rounded-2xl border border-white/15 bg-white/[0.03] px-6 text-[15px] font-bold text-white transition hover:bg-white/[0.07]"
              onClick={() => scrollToSection("about")}
            >
              {t.contactSecondary}
            </button>
          </div>
        </div>
      </section>

      {isContactOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-[520px] rounded-[28px] border border-white/10 bg-[#0f172a] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] ${
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

            <div className={`mt-5 flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
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