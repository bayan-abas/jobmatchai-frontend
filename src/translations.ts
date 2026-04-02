import type { Language } from "./context/LanguageContext";

export const translations: Record<Language, any> = {
  en: {
    common: {
      back: "Back",
      login: "Sign In",
      register: "Register",
      createAccount: "Create New Account",
      alreadyHaveAccount: "Already Have an Account?",
      forgotPassword: "Forgot password?",
      rememberMe: "Remember me",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      companyName: "Company Name",
      enterEmail: "Enter your email",
      enterPassword: "Enter your password",
      createPassword: "Create your password",
      confirmYourPassword: "Confirm your password",
      candidate: "Candidate",
      company: "Company",
      english: "EN",
      arabic: "AR",
      hebrew: "HE",
      logout: "Logout",
    },

    loginPage: {
      badge: "Secure Login • JobMatchAI",
      title1: "Welcome back to",
      title2: "JobMatchAI",
      subtitle: "Sign in to continue your smart hiring journey.",

      secureAccess: "Secure Access",
      heroTitle: "Welcome back to your smarter hiring space.",
      heroText:
        "Sign in to continue your journey on JobMatchAI and access your personalized dashboard with a clean and modern experience.",
      workspaceTitle: "Access your workspace",
      candidateAccess: "Candidate dashboard access",
      companyAccess: "Company dashboard access",
      secureSignin: "Secure sign-in experience",
      createCandidate: "Create Candidate Account",
      createCompany: "Create Company Account",

      errors: {
        emailRequired: "Please enter your email.",
        passwordRequired: "Please enter your password.",
        noAccount: "No account found with this email.",
        wrongPassword: "Incorrect password.",
      },
    },

    registerPage: {
      badge: "Create Account • JobMatchAI",
      title1: "Start with",
      title2: "JobMatchAI",
      subtitle: "Create your profile and begin your journey.",
      enterFullName: "Enter your full name",
      enterCompanyName: "Enter company name",
    },

    candidateRegisterPage: {
      badge: "Candidate Portal",
      heroTitle: "Create your profile and discover smarter opportunities.",
      heroText:
        "Build your candidate account to showcase your skills, experience, and career goals in one clean and modern space.",
      whyTitle: "Why candidates use JobMatchAI",
      why1: "Build a professional profile",
      why2: "Highlight your skills and strengths",
      why3: "Get matched with better opportunities",
      title: "Create Candidate Account",
      subtitle: "Enter your details to start your journey.",
      phone: "Phone Number",
      location: "Location",
      selectTitle: "Select Current Title",
      experience: "Years of Experience",
      skills: "Skills",
      selectSkill: "Select a skill",
      addSkill: "Add",
      summaryPlaceholder:
        "Write a short summary about yourself, your background, your goals, and what kind of opportunities you are looking for...",
      uploadResume: "Upload Resume (Optional)",
      noFile: "No file selected",
      resumeFormats: "PDF, DOC, or DOCX — optional",
      chooseFile: "Choose File",
      removeFile: "Remove file",
      createAccount: "Create Candidate Account",
      switchCompany: "Switch to Company Registration",
      defaultSummary:
        "Passionate professional looking for great opportunities and continuous growth.",
      success: "Candidate account created successfully!",
      errors: {
        requiredFields: "Please fill in all required fields.",
        invalidEmail: "Please enter a valid email address.",
        passwordLength: "Password must be at least 6 characters.",
        passwordMismatch: "Passwords do not match.",
        emailExists: "This email is already registered.",
      },
    },

    sidebar: {
      dashboard: "Dashboard",
      jobMatches: "Job Matches",
      applications: "Applications",
      myProfile: "My Profile",
      myResume: "My Resume",
      notifications: "Notifications",
      brandSubtitle: "AI-Powered Recruitment",
    },

    dashboard: {
      searchPlaceholder: "Search jobs, companies...",
      welcome: "Welcome",
      welcomeBack: "Welcome back",
      subtitle: "Here's what’s happening with your job search today",

      stats: {
        jobMatches: "Job Matches",
        applications: "Applications",
        interviews: "Interviews",
        profileScore: "Profile Score",
      },

      topMatches: {
        title: "Top Job Matches",
        subtitle: "Based on your profile",
        viewAll: "View All",
      },

      applications: {
        title: "Applications",
        subtitle: "Recent Activity",
        viewAll: "View All Applications",
        underReview: "Under Review",
        aiScreening: "AI Screening",
        daysAgo2: "2 days ago",
        daysAgo5: "5 days ago",
      },

      profileBox: {
        title: "Complete Your Profile",
        subtitle: "Add more details to improve your match score",
        uploadResume: "Upload Resume",
        editProfile: "Edit Profile",
      },

      notifications: {
        title: "Notifications",
        newCount: "3 new",
        item1: "A new job match was added for you",
        item2: "Your application to Fiverr is under review",
        item3: "Your profile score improved to 78%",
      },

      roles: {
        candidate: "Candidate",
        company: "Company",
      },
    },

    jobMatches: {
      title: "Job Matches",
      subtitle: "Find jobs tailored to your profile",

      smartFilters: "Smart Filters",
      activeFilters: "active filters",
      clearAll: "Clear all",

      industry: "Industry",
      seniorityLevel: "Seniority Level",
      minSalary: "Min Salary",
      minMatch: "Min Match",

      allIndustries: "All industries",
      allLevels: "All levels",

      entry: "Entry Level",
      mid: "Mid Level",
      senior: "Senior",
      lead: "Lead / Manager",

      tech: "Technology",
      finance: "Finance",
      healthcare: "Healthcare",
      marketing: "Marketing",
      education: "Education",
      engineering: "Engineering",
      retail: "Retail",
      hospitality: "Hospitality",
      logistics: "Logistics",

      remote: "Remote",
      statusActive: "Active",
      noScore: "No score",

      jobsMatchCriteria: "jobs match your criteria",

      fairMatchingTitle: "Fair AI Matching:",
      fairMatchingText:
        "Matches are based solely on skills, experience, and qualifications.",
    },
  },

  ar: {
    common: {
      back: "رجوع",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      createAccount: "إنشاء حساب جديد",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      forgotPassword: "هل نسيت كلمة المرور؟",
      rememberMe: "تذكرني",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      fullName: "الاسم الكامل",
      companyName: "اسم الشركة",
      enterEmail: "أدخل بريدك الإلكتروني",
      enterPassword: "أدخل كلمة المرور",
      createPassword: "أنشئ كلمة المرور",
      confirmYourPassword: "أكد كلمة المرور",
      candidate: "مرشح",
      company: "شركة",
      english: "EN",
      arabic: "AR",
      hebrew: "HE",
      logout: "تسجيل الخروج",
    },

    loginPage: {
      badge: "تسجيل دخول آمن • JobMatchAI",
      title1: "مرحبًا بعودتك إلى",
      title2: "JobMatchAI",
      subtitle: "سجّل الدخول للمتابعة في رحلتك الذكية في التوظيف.",

      secureAccess: "دخول آمن",
      heroTitle: "مرحباً بعودتك إلى منصة التوظيف الذكية الخاصة بك",
      heroText:
        "سجّل الدخول لمتابعة رحلتك في JobMatchAI والوصول إلى لوحة التحكم الخاصة بك بتجربة حديثة ونظيفة.",
      workspaceTitle: "الوصول إلى حسابك",
      candidateAccess: "الدخول كمرشح",
      companyAccess: "الدخول كشركة",
      secureSignin: "تسجيل دخول آمن",
      createCandidate: "إنشاء حساب مرشح",
      createCompany: "إنشاء حساب شركة",

      errors: {
        emailRequired: "الرجاء إدخال البريد الإلكتروني.",
        passwordRequired: "الرجاء إدخال كلمة المرور.",
        noAccount: "لا يوجد حساب بهذا البريد الإلكتروني.",
        wrongPassword: "كلمة المرور غير صحيحة.",
      },
    },

    registerPage: {
      badge: "إنشاء حساب • JobMatchAI",
      title1: "ابدأ مع",
      title2: "JobMatchAI",
      subtitle: "أنشئ ملفك الشخصي وابدأ رحلتك.",
      enterFullName: "أدخل اسمك الكامل",
      enterCompanyName: "أدخل اسم الشركة",
    },

    candidateRegisterPage: {
      badge: "بوابة المرشح",
      heroTitle: "أنشئ ملفك الشخصي واكتشف فرصًا أذكى.",
      heroText:
        "أنشئ حسابك كمرشح لعرض مهاراتك وخبراتك وأهدافك المهنية في مكان واحد بتصميم حديث ومرتب.",
      whyTitle: "لماذا يستخدم المرشحون JobMatchAI",
      why1: "أنشئ ملفًا شخصيًا احترافيًا",
      why2: "أبرز مهاراتك ونقاط قوتك",
      why3: "احصل على فرص أفضل تناسبك",
      title: "إنشاء حساب مرشح",
      subtitle: "أدخل تفاصيلك لبدء رحلتك.",
      phone: "رقم الهاتف",
      location: "الموقع",
      selectTitle: "اختر المسمى الحالي",
      experience: "سنوات الخبرة",
      skills: "المهارات",
      selectSkill: "اختر مهارة",
      addSkill: "إضافة",
      summaryPlaceholder:
        "اكتب نبذة قصيرة عن نفسك، خلفيتك، أهدافك، ونوع الفرص التي تبحث عنها...",
      uploadResume: "رفع السيرة الذاتية (اختياري)",
      noFile: "لم يتم اختيار ملف",
      resumeFormats: "PDF أو DOC أو DOCX — اختياري",
      chooseFile: "اختيار ملف",
      removeFile: "حذف الملف",
      createAccount: "إنشاء حساب مرشح",
      switchCompany: "الانتقال إلى تسجيل شركة",
      defaultSummary:
        "شخص طموح يبحث عن فرص رائعة ونمو مستمر.",
      success: "تم إنشاء حساب المرشح بنجاح!",
      errors: {
        requiredFields: "الرجاء تعبئة جميع الحقول المطلوبة.",
        invalidEmail: "الرجاء إدخال بريد إلكتروني صحيح.",
        passwordLength: "يجب أن تكون كلمة المرور 6 أحرف على الأقل.",
        passwordMismatch: "كلمتا المرور غير متطابقتين.",
        emailExists: "هذا البريد الإلكتروني مسجل بالفعل.",
      },
    },

    sidebar: {
      dashboard: "لوحة التحكم",
      jobMatches: "الوظائف المطابقة",
      applications: "الطلبات",
      myProfile: "ملفي الشخصي",
      myResume: "سيرتي الذاتية",
      notifications: "الإشعارات",
      brandSubtitle: "توظيف مدعوم بالذكاء الاصطناعي",
    },

    dashboard: {
      searchPlaceholder: "ابحث عن وظائف أو شركات...",
      welcome: "مرحبًا",
      welcomeBack: "مرحبًا بعودتك",
      subtitle: "إليك آخر ما يحدث في رحلة البحث عن عمل اليوم",

      stats: {
        jobMatches: "الوظائف المطابقة",
        applications: "الطلبات",
        interviews: "المقابلات",
        profileScore: "درجة الملف الشخصي",
      },

      topMatches: {
        title: "أفضل الوظائف المطابقة",
        subtitle: "بناءً على ملفك الشخصي",
        viewAll: "عرض الكل",
      },

      applications: {
        title: "الطلبات",
        subtitle: "آخر النشاطات",
        viewAll: "عرض كل الطلبات",
        underReview: "قيد المراجعة",
        aiScreening: "فحص الذكاء الاصطناعي",
        daysAgo2: "قبل يومين",
        daysAgo5: "قبل 5 أيام",
      },

      profileBox: {
        title: "أكمل ملفك الشخصي",
        subtitle: "أضف تفاصيل أكثر لتحسين نسبة المطابقة",
        uploadResume: "رفع السيرة الذاتية",
        editProfile: "تعديل الملف الشخصي",
      },

      notifications: {
        title: "الإشعارات",
        newCount: "3 جديدة",
        item1: "تمت إضافة وظيفة مطابقة جديدة لك",
        item2: "طلبك إلى Fiverr قيد المراجعة",
        item3: "تحسنت درجة ملفك الشخصي إلى 78%",
      },

      roles: {
        candidate: "مرشح",
        company: "شركة",
      },
    },

    jobMatches: {
      title: "الوظائف المطابقة",
      subtitle: "اعثر على وظائف مناسبة لك",

      smartFilters: "فلاتر ذكية",
      activeFilters: "فلاتر مفعلة",
      clearAll: "مسح الكل",

      industry: "المجال",
      seniorityLevel: "المستوى المهني",
      minSalary: "أقل راتب",
      minMatch: "أقل تطابق",

      allIndustries: "كل المجالات",
      allLevels: "كل المستويات",

      entry: "مبتدئ",
      mid: "متوسط",
      senior: "خبير",
      lead: "مدير",

      tech: "تكنولوجيا",
      finance: "مالية",
      healthcare: "صحة",
      marketing: "تسويق",
      education: "تعليم",
      engineering: "هندسة",
      retail: "تجزئة",
      hospitality: "ضيافة",
      logistics: "لوجستيات",

      remote: "عن بعد",
      statusActive: "نشط",
      noScore: "بدون تقييم",

      jobsMatchCriteria: "وظيفة مطابقة",

      fairMatchingTitle: "مطابقة عادلة:",
      fairMatchingText: "تعتمد فقط على المهارات والخبرة.",
    },
  },

  he: {
    common: {
      back: "חזרה",
      login: "התחברות",
      register: "הרשמה",
      createAccount: "צור חשבון חדש",
      alreadyHaveAccount: "כבר יש לך חשבון?",
      forgotPassword: "שכחת סיסמה?",
      rememberMe: "זכור אותי",
      email: "כתובת אימייל",
      password: "סיסמה",
      confirmPassword: "אימות סיסמה",
      fullName: "שם מלא",
      companyName: "שם החברה",
      enterEmail: "הזן את האימייל שלך",
      enterPassword: "הזן את הסיסמה שלך",
      createPassword: "צור סיסמה",
      confirmYourPassword: "אשר את הסיסמה שלך",
      candidate: "מועמד",
      company: "חברה",
      english: "EN",
      arabic: "AR",
      hebrew: "HE",
      logout: "התנתקות",
    },

    loginPage: {
      badge: "התחברות מאובטחת • JobMatchAI",
      title1: "ברוך שובך אל",
      title2: "JobMatchAI",
      subtitle: "התחבר כדי להמשיך במסע הגיוס החכם שלך.",

      secureAccess: "גישה מאובטחת",
      heroTitle: "ברוך שובך למערכת הגיוס החכמה שלך",
      heroText:
        "התחבר כדי להמשיך את המסע שלך ב-JobMatchAI ולגשת ללוח הבקרה שלך עם חוויית משתמש מודרנית ונקייה.",
      workspaceTitle: "גישה לחשבון שלך",
      candidateAccess: "כניסה כמועמד",
      companyAccess: "כניסה כחברה",
      secureSignin: "התחברות מאובטחת",
      createCandidate: "יצירת חשבון מועמד",
      createCompany: "יצירת חשבון חברה",

      errors: {
        emailRequired: "נא להזין אימייל.",
        passwordRequired: "נא להזין סיסמה.",
        noAccount: "לא נמצא חשבון עם האימייל הזה.",
        wrongPassword: "סיסמה שגויה.",
      },
    },

    registerPage: {
      badge: "יצירת חשבון • JobMatchAI",
      title1: "התחל עם",
      title2: "JobMatchAI",
      subtitle: "צור את הפרופיל שלך והתחל את הדרך שלך.",
      enterFullName: "הזן את שמך המלא",
      enterCompanyName: "הזן את שם החברה",
    },

    candidateRegisterPage: {
      badge: "פורטל מועמדים",
      heroTitle: "צור את הפרופיל שלך וגלה הזדמנויות חכמות יותר.",
      heroText:
        "בנה חשבון מועמד כדי להציג את הכישורים, הניסיון והמטרות המקצועיות שלך במקום אחד, נקי ומודרני.",
      whyTitle: "למה מועמדים משתמשים ב-JobMatchAI",
      why1: "בנה פרופיל מקצועי",
      why2: "הדגש את הכישורים והחוזקות שלך",
      why3: "קבל התאמה להזדמנויות טובות יותר",
      title: "יצירת חשבון מועמד",
      subtitle: "הזן את הפרטים שלך כדי להתחיל את הדרך שלך.",
      phone: "מספר טלפון",
      location: "מיקום",
      selectTitle: "בחר תפקיד נוכחי",
      experience: "שנות ניסיון",
      skills: "כישורים",
      selectSkill: "בחר מיומנות",
      addSkill: "הוסף",
      summaryPlaceholder:
        "כתוב תקציר קצר על עצמך, הרקע שלך, המטרות שלך ואיזה סוג הזדמנויות אתה מחפש...",
      uploadResume: "העלאת קורות חיים (אופציונלי)",
      noFile: "לא נבחר קובץ",
      resumeFormats: "PDF, DOC או DOCX — אופציונלי",
      chooseFile: "בחר קובץ",
      removeFile: "הסר קובץ",
      createAccount: "יצירת חשבון מועמד",
      switchCompany: "מעבר לרישום חברה",
      defaultSummary:
        "איש מקצוע בעל מוטיבציה שמחפש הזדמנויות מצוינות וצמיחה מתמשכת.",
      success: "חשבון המועמד נוצר בהצלחה!",
      errors: {
        requiredFields: "נא למלא את כל השדות החובה.",
        invalidEmail: "נא להזין כתובת אימייל תקינה.",
        passwordLength: "הסיסמה חייבת להכיל לפחות 6 תווים.",
        passwordMismatch: "הסיסמאות אינן תואמות.",
        emailExists: "כתובת האימייל הזו כבר רשומה.",
      },
    },

    sidebar: {
      dashboard: "לוח בקרה",
      jobMatches: "משרות מתאימות",
      applications: "הגשות",
      myProfile: "הפרופיל שלי",
      myResume: "קורות החיים שלי",
      notifications: "התראות",
      brandSubtitle: "גיוס מבוסס בינה מלאכותית",
    },

    dashboard: {
      searchPlaceholder: "חפש משרות או חברות...",
      welcome: "ברוך הבא",
      welcomeBack: "ברוך שובך",
      subtitle: "הנה מה שקורה היום בחיפוש העבודה שלך",

      stats: {
        jobMatches: "משרות מתאימות",
        applications: "הגשות",
        interviews: "ראיונות",
        profileScore: "ציון פרופיל",
      },

      topMatches: {
        title: "המשרות המתאימות ביותר",
        subtitle: "בהתבסס על הפרופיל שלך",
        viewAll: "צפה בהכול",
      },

      applications: {
        title: "הגשות",
        subtitle: "פעילות אחרונה",
        viewAll: "צפה בכל ההגשות",
        underReview: "בבדיקה",
        aiScreening: "סינון AI",
        daysAgo2: "לפני יומיים",
        daysAgo5: "לפני 5 ימים",
      },

      profileBox: {
        title: "השלם את הפרופיל שלך",
        subtitle: "הוסף עוד פרטים כדי לשפר את ציון ההתאמה",
        uploadResume: "העלה קורות חיים",
        editProfile: "ערוך פרופיל",
      },

      notifications: {
        title: "התראות",
        newCount: "3 חדשות",
        item1: "נוספה עבורך משרה מתאימה חדשה",
        item2: "ההגשה שלך ל-Fiverr נמצאת בבדיקה",
        item3: "ציון הפרופיל שלך השתפר ל-78%",
      },

      roles: {
        candidate: "מועמד",
        company: "חברה",
      },
    },

    jobMatches: {
      title: "משרות מתאימות",
      subtitle: "מצא משרות שמתאימות לך",

      smartFilters: "סינון חכם",
      activeFilters: "פילטרים פעילים",
      clearAll: "נקה הכל",

      industry: "תחום",
      seniorityLevel: "רמת ותק",
      minSalary: "שכר מינימלי",
      minMatch: "התאמה מינימלית",

      allIndustries: "כל התחומים",
      allLevels: "כל הרמות",

      entry: "ג׳וניור",
      mid: "ביניים",
      senior: "סניור",
      lead: "מנהל",

      tech: "טכנולוגיה",
      finance: "פיננסים",
      healthcare: "בריאות",
      marketing: "שיווק",
      education: "חינוך",
      engineering: "הנדסה",
      retail: "קמעונאות",
      hospitality: "אירוח",
      logistics: "לוגיסטיקה",

      remote: "מרחוק",
      statusActive: "פעיל",
      noScore: "ללא ציון",

      jobsMatchCriteria: "משרות תואמות",

      fairMatchingTitle: "התאמה הוגנת:",
      fairMatchingText: "מבוסס רק על כישורים וניסיון.",
    },
  },
};