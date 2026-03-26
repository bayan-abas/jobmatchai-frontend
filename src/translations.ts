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
    },

    registerPage: {
      badge: "Create Account • JobMatchAI",
      title1: "Start with",
      title2: "JobMatchAI",
      subtitle: "Create your profile and begin your journey.",
      enterFullName: "Enter your full name",
      enterCompanyName: "Enter company name",
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
    },

    registerPage: {
      badge: "إنشاء حساب • JobMatchAI",
      title1: "ابدأ مع",
      title2: "JobMatchAI",
      subtitle: "أنشئ ملفك الشخصي وابدأ رحلتك.",
      enterFullName: "أدخل اسمك الكامل",
      enterCompanyName: "أدخل اسم الشركة",
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
    },

    registerPage: {
      badge: "יצירת חשבון • JobMatchAI",
      title1: "התחל עם",
      title2: "JobMatchAI",
      subtitle: "צור את הפרופיל שלך והתחל את הדרך שלך.",
      enterFullName: "הזן את שמך המלא",
      enterCompanyName: "הזן את שם החברה",
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
  },
};