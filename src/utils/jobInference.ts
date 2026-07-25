export type InferableJob = {
  title?: string;
  description?: string;
  requirements?: string;
  skills?: string;
  type?: string;

  industry?: string | null;
};

export const INDUSTRY_KEYS = [
  "technology", "engineering", "healthcare", "education", "finance", "marketing",
  "retail", "sales", "customerService", "hospitality", "restaurants", "logistics",
  "construction", "factory", "security", "legal", "administration", "humanResources",
  "realEstate", "beauty", "cleaning", "agriculture", "media", "design", "translation",
  "writing", "general",
] as const;

const normalize = (value?: string) =>
  String(value || "")
    .toLowerCase()

    .replace(/[^\w\s+#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const INDUSTRY_BUCKETS: [string, string[]][] = [
  ["technology", [
    "react", "java", "python", "javascript", "typescript", "developer", "programmer",
    "software", "frontend", "backend", "full stack", "data", "it", "cyber", "cloud",
    "network", "devops", "qa", "ui", "ux",
  ]],
  ["engineering", [
    "engineer", "engineering", "autocad", "infrastructure", "civil", "mechanical",
    "electrical", "industrial", "chemical", "architect", "architecture",
  ]],
  ["healthcare", [
    "medical", "health", "doctor", "nurse", "nursing", "hospital", "clinic", "pharmacy",
    "pharmacist", "dentist", "lab", "laboratory", "psychology", "psychologist",
  ]],
  ["education", [
    "teacher", "teaching", "education", "learning", "school", "tutor", "tutoring", "professor",
    "lecturer",
  ]],
  ["finance", [
    "account", "accountant", "accounting", "finance", "financial", "bank", "banking", "tax",
    "insurance", "auditor", "economics",
  ]],
  ["marketing", [
    "marketing", "seo", "content", "social media", "copywriter", "digital marketing",
    "advertising", "campaign",
  ]],
  ["retail", [
    "retail", "store", "shop", "cashier", "supermarket", "pos", "sales associate",
  ]],
  ["sales", ["sales", "salesperson", "sales manager", "business development"]],
  ["customerService", [
    "customer service", "customer support", "call center", "support representative",
    "service representative",
  ]],
  ["hospitality", ["hotel", "hospitality", "tourism", "guest"]],
  ["restaurants", [
    "restaurant", "chef", "waiter", "waitress", "barista", "kitchen", "cook", "food service",
    "baking",
  ]],
  ["logistics", [
    "logistics", "shipping", "supply", "warehouse", "delivery", "driver", "transportation",
    "truck",
  ]],
  ["construction", [
    "construction", "builder", "building", "plumbing", "carpentry", "electrician",
    "maintenance",
  ]],
  ["factory", ["factory", "manufacturing", "production", "machine operator", "packaging"]],
  ["security", ["security", "guard", "police", "military", "fire safety"]],
  ["legal", ["legal", "lawyer", "attorney", "law", "paralegal"]],

  ["administration", ["administration", "administrator", "secretary", "secretarial", "assistant"]],
  ["humanResources", ["hr", "human resources", "recruiter", "recruitment"]],
  ["realEstate", ["real estate", "property", "broker"]],
  ["beauty", ["beauty", "makeup", "hairdresser", "nail"]],
  ["cleaning", ["cleaning", "cleaner", "housekeeping", "janitor", "laundry"]],
  ["agriculture", ["agriculture", "farm", "farmer", "farming"]],
  ["media", [
    "media", "journalism", "journalist", "photography", "photographer", "video editing",
    "animation",
  ]],
  ["design", ["design", "designer", "graphic", "interior design"]],
  ["translation", ["translation", "translator"]],
  ["writing", ["writing", "writer"]],
];

// סופר כמה מילות מפתח מהרשימה מופיעות בטקסט, ומשקלל לפי אורך הביטוי (ביטוי ארוך = התאמה חזקה יותר)
const scoreBucket = (paddedText: string, keywords: string[]) =>
  keywords.reduce((score, keyword) => {
    if (!paddedText.includes(` ${keyword} `)) {
      return score;
    }
    return score + keyword.trim().split(/\s+/).length;
  }, 0);

// בודק את כל התעשיות מול הטקסט ומחזיר את זו עם ניקוד מילות המפתח הגבוה ביותר
const bestBucket = (paddedText: string): string | null => {
  let bestIndustry: string | null = null;
  let bestScore = 0;

  for (const [industry, keywords] of INDUSTRY_BUCKETS) {
    const score = scoreBucket(paddedText, keywords);

    if (score > bestScore) {
      bestScore = score;
      bestIndustry = industry;
    }
  }

  return bestIndustry;
};

// מנחש את התעשייה של המשרה - קודם לפי הכותרת בלבד, ואם לא נמצא כלום אז לפי כל הטקסט (תיאור, דרישות, כישורים)
export function inferIndustry(job: InferableJob): string {
  if (job.industry && (INDUSTRY_KEYS as readonly string[]).includes(job.industry)) {
    return job.industry;
  }

  const titleOnly = ` ${normalize(job.title || "")} `;
  const titleIndustry = bestBucket(titleOnly);
  if (titleIndustry !== null) {
    return titleIndustry;
  }

  const withSupportingSignal = ` ${normalize(
    `${job.title || ""} ${job.description || ""} ${job.requirements || ""} ${job.skills || ""}`
  )} `;
  const supportedIndustry = bestBucket(withSupportingSignal);
  if (supportedIndustry !== null) {
    return supportedIndustry;
  }

  return "general";
}

// מנחש את רמת הבכירות של המשרה (Entry/Mid/Senior/Lead) לפי מילות מפתח בכותרת ובתיאור
export function inferLevel(job: InferableJob): string {
  const text = normalize(`${job.title || ""} ${job.description || ""} ${job.requirements || ""}`);
  const padded = ` ${text} `;

  if (scoreBucket(padded, ["lead", "principal"]) > 0) return "Lead";
  if (scoreBucket(padded, ["senior", "5+"]) > 0) return "Senior";
  if (scoreBucket(padded, ["junior", "entry", "0-1"]) > 0) return "Entry";
  return "Mid";
}

// מנחש כמה שנות ניסיון נדרשות - מחפש מספר מפורש בטקסט, ואם אין אז נגזר מרמת הבכירות
export function inferExperience(job: InferableJob): string {
  const text = `${job.title || ""} ${job.description || ""} ${job.requirements || ""}`;
  const match = text.match(/(\d+)\+?\s*(years|year|yrs|yr)/i);

  if (match) return `${match[1]}+ years`;

  const level = inferLevel(job);
  if (level === "Entry") return "1+ years";
  if (level === "Senior") return "5+ years";
  if (level === "Lead") return "7+ years";
  return "2+ years";
}

export const REGION_KEYS = ["north", "center", "south", "sharon"] as const;
export type RegionKey = (typeof REGION_KEYS)[number];

const REGION_BUCKETS: [RegionKey, string[]][] = [
  ["sharon", [
    "netanya", "נתניה", "kfar saba", "כפר סבא", "raanana", "ra'anana", "רעננה",
    "hod hasharon", "הוד השרון", "herzliya", "הרצליה", "ramat hasharon", "רמת השרון",
    "even yehuda", "אבן יהודה", "kadima", "קדימה", "tzoran", "צורן", "tira", "טירה",
    "kfar yona", "כפר יונה", "sharon", "שרון",
  ]],
  ["north", [
    "haifa", "חיפה", "nahariya", "נהריה", "karmiel", "כרמיאל", "afula", "עפולה",
    "nazareth", "נצרת", "tiberias", "טבריה", "safed", "tzfat", "צפת",
    "kiryat shmona", "קריית שמונה", "acre", "akko", "עכו", "golan", "גולן",
    "galilee", "galil", "גליל", "migdal haemek", "מגדל העמק", "yokneam", "יקנעם",
    "katzrin", "קצרין", "kiryat ata", "קריית אתא", "kiryat motzkin", "קריית מוצקין",
    "kiryat bialik", "קריית ביאליק", "kiryat yam", "קריית ים", "hadera", "חדרה",
    "zichron yaakov", "זכרון יעקב", "beit shean", "בית שאן", "north", "צפון",
  ]],
  ["south", [
    "beer sheva", "beersheba", "באר שבע", "ashdod", "אשדוד", "ashkelon", "אשקלון",
    "eilat", "אילת", "dimona", "דימונה", "arad", "ערד", "sderot", "שדרות",
    "netivot", "נתיבות", "kiryat gat", "קריית גת", "ofakim", "אופקים",
    "yeruham", "ירוחם", "mitzpe ramon", "מצפה רמון", "rahat", "רהט",
    "negev", "נגב", "arava", "ערבה", "south", "דרום",
  ]],
  ["center", [
    "tel aviv", "תל אביב", "yafo", "jaffa", "יפו", "jerusalem", "ירושלים",
    "ramat gan", "רמת גן", "givatayim", "גבעתיים", "petah tikva", "petach tikva",
    "פתח תקווה", "rishon lezion", "ראשון לציון", "holon", "חולון", "bat yam",
    "בת ים", "bnei brak", "בני ברק", "rehovot", "רחובות", "ness ziona",
    "נס ציונה", "modiin", "מודיעין", "beit shemesh", "בית שמש", "lod", "לוד",
    "ramla", "רמלה", "yavne", "יבנה", "rosh haayin", "ראש העין", "shoham",
    "שוהם", "gedera", "גדרה", "center", "merkaz", "מרכז",
  ]],
];

// מנחש את האזור בארץ (צפון/מרכז/דרום/שרון) לפי שם עיר או מילת מפתח בטקסט המיקום, בעברית או באנגלית
export function inferRegion(location?: string | null): RegionKey | null {
  const text = String(location || "").toLowerCase().trim();
  if (!text) return null;

  for (const [region, keywords] of REGION_BUCKETS) {
    if (keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
      return region;
    }
  }
  return null;
}

// קובע את צבע הטבעת של ציון ההתאמה בממשק - צבע לפי סטטוס, ובמצב "scored" גם לפי גובה האחוז
export function getRingColor(status: "scored" | "loading" | "noAnalysis" | "noScore" | "error" | "insufficientData", percent: number): string {
  if (status === "error") return "#f59e0b";
  if (status !== "scored") return "#5f648a";
  if (percent >= 80) return "#c084fc";
  if (percent >= 50) return "#7c88ff";
  return "#fb923c";
}

// שולף מטקסט שכר חופשי (כולל מטבעות, "k" וכו') את המספר הגבוה ביותר, לצורך מיון/סינון לפי שכר
export function extractSalaryNumber(salary?: string): number {
  if (!salary) return 0;

  const normalized = String(salary)
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/\$/g, "")
    .replace(/₪/g, "")
    .replace(/nis/g, "")
    .replace(/ils/g, "")
    .replace(/shekel/g, "")
    .replace(/שח/g, "")
    .replace(/שקל/g, "")
    .replace(/k/g, "000");

  const numbers = normalized.match(/\d+/g);

  if (!numbers || numbers.length === 0) return 0;

  return Math.max(...numbers.map((num) => Number(num)));
}
