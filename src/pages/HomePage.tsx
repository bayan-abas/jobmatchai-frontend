import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

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
  },
};

function HomePage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [language, isRTL]);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`page ${isRTL ? "rtl" : "ltr"}`}>
      <div className="background-blur blur-one"></div>
      <div className="background-blur blur-two"></div>
      <div className="background-grid"></div>

      <nav className="navbar">
        <div className="logo-area">
          <div className="logo-dot"></div>
          <span className="logo-text">JobMatchAI</span>
        </div>

        <div className="nav-links">
          <button onClick={() => scrollToSection("home")}>{t.home}</button>
          <button onClick={() => scrollToSection("about")}>{t.about}</button>
          <button onClick={() => scrollToSection("how-it-works")}>{t.how}</button>
          <button onClick={() => scrollToSection("features")}>{t.features}</button>
          <button onClick={() => scrollToSection("contact")}>{t.contact}</button>
        </div>

        <div className="nav-actions">
          <div className="language-switcher">
            <button
              className={language === "en" ? "active-lang" : ""}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
            <button
              className={language === "ar" ? "active-lang" : ""}
              onClick={() => setLanguage("ar")}
            >
              AR
            </button>
            <button
              className={language === "he" ? "active-lang" : ""}
              onClick={() => setLanguage("he")}
            >
              HE
            </button>
          </div>

          <button className="nav-login" onClick={() => navigate("/login")}>
            {t.login}
          </button>
          <button className="nav-started" onClick={() => navigate("/register")}>
            {t.started}
          </button>
        </div>
      </nav>

      <section id="home" className="hero-section">
        <div className="hero-left">
          <div className="hero-badge">{t.heroBadge}</div>

          <h1 className="hero-title">
            {t.heroTitle1}
            <br />
            {t.heroTitle2}
            <span>{t.heroTitle3}</span>
          </h1>

          <p className="hero-description">{t.heroDescription}</p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => navigate("/register")}>
              {t.heroPrimary}
            </button>
            <button
              className="secondary-btn"
              onClick={() => scrollToSection("about")}
            >
              {t.heroSecondary}
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <h3>92%</h3>
              <p>{t.stat1}</p>
            </div>
            <div className="hero-stat">
              <h3>1200+</h3>
              <p>{t.stat2}</p>
            </div>
            <div className="hero-stat">
              <h3>350+</h3>
              <p>{t.stat3}</p>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="dashboard-card">
            <div className="dashboard-top">
              <div className="dashboard-lights">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>{t.dashboardTitle}</p>
            </div>

            <div className="dashboard-panel main-panel">
              <div>
                <span className="panel-label">{t.fitLabel}</span>
                <h2>94%</h2>
              </div>
              <div className="score-ring">AI</div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-panel small-panel">
                <span className="panel-label">{t.skillsLabel}</span>
                <ul>
                  <li>Java</li>
                  <li>Python</li>
                  <li>SQL</li>
                </ul>
              </div>

              <div className="dashboard-panel small-panel">
                <span className="panel-label">{t.statusLabel}</span>
                <h4>{t.matched}</h4>
                <p>{t.matchedText}</p>
              </div>
            </div>

            <div className="dashboard-panel bottom-panel">
              <span className="panel-label">{t.insightLabel}</span>
              <p>{t.insightText}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section">
        <div className="section-heading">
          <p className="section-tag">{t.aboutTag}</p>
          <h2>{t.aboutTitle}</h2>
          <span className="section-line"></span>
        </div>

        <div className="about-grid">
          <div className="glass-card">
            <div className="card-icon">01</div>
            <h3>{t.about1Title}</h3>
            <p>{t.about1Text}</p>
          </div>

          <div className="glass-card">
            <div className="card-icon">02</div>
            <h3>{t.about2Title}</h3>
            <p>{t.about2Text}</p>
          </div>

          <div className="glass-card">
            <div className="card-icon">03</div>
            <h3>{t.about3Title}</h3>
            <p>{t.about3Text}</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section">
        <div className="section-heading">
          <p className="section-tag">{t.howTag}</p>
          <h2>{t.howTitle}</h2>
          <span className="section-line"></span>
        </div>

        <div className="timeline">
          <div className="timeline-card">
            <div className="timeline-number">01</div>
            <div>
              <h3>{t.step1Title}</h3>
              <p>{t.step1Text}</p>
            </div>
          </div>

          <div className="timeline-card">
            <div className="timeline-number">02</div>
            <div>
              <h3>{t.step2Title}</h3>
              <p>{t.step2Text}</p>
            </div>
          </div>

          <div className="timeline-card">
            <div className="timeline-number">03</div>
            <div>
              <h3>{t.step3Title}</h3>
              <p>{t.step3Text}</p>
            </div>
          </div>

          <div className="timeline-card">
            <div className="timeline-number">04</div>
            <div>
              <h3>{t.step4Title}</h3>
              <p>{t.step4Text}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="section-heading">
          <p className="section-tag">{t.featuresTag}</p>
          <h2>{t.featuresTitle}</h2>
          <span className="section-line"></span>
        </div>

        <div className="features-grid">
          <div className="feature-card wide-feature">
            <h3>{t.feature1Title}</h3>
            <p>{t.feature1Text}</p>
          </div>

          <div className="feature-card">
            <h3>{t.feature2Title}</h3>
            <p>{t.feature2Text}</p>
          </div>

          <div className="feature-card">
            <h3>{t.feature3Title}</h3>
            <p>{t.feature3Text}</p>
          </div>

          <div className="feature-card">
            <h3>{t.feature4Title}</h3>
            <p>{t.feature4Text}</p>
          </div>

          <div className="feature-card">
            <h3>{t.feature5Title}</h3>
            <p>{t.feature5Text}</p>
          </div>
        </div>
      </section>

      <section id="contact" className="section contact-section">
        <div className="contact-box">
          <p className="section-tag">{t.contactTag}</p>
          <h2>{t.contactTitle}</h2>
          <p className="contact-text">{t.contactText}</p>

          <div className="contact-buttons">
            <button className="primary-btn">{t.contactPrimary}</button>
            <button
              className="secondary-btn"
              onClick={() => scrollToSection("about")}
            >
              {t.contactSecondary}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;