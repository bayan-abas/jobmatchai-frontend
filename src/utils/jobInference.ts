// Keyword-based inference used to give jobs an industry/seniority/experience label when the
// backend doesn't provide one as structured data. Mirrors the logic already used for internal
// jobs in JobMatches.tsx, generalized here so ExternalJobsPage can reuse it without duplicating
// the internal jobs page (left untouched to avoid any risk of regressing it).

export type InferableJob = {
  title?: string;
  description?: string;
  requirements?: string;
  skills?: string;
  type?: string;
};

const normalize = (value?: string) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function inferIndustry(job: InferableJob): string {
  const text = normalize(
    `${job.title || ""} ${job.description || ""} ${job.requirements || ""} ${job.skills || ""} ${job.type || ""}`
  );

  if (
    text.includes("react") ||
    text.includes("java") ||
    text.includes("python") ||
    text.includes("javascript") ||
    text.includes("typescript") ||
    text.includes("developer") ||
    text.includes("programmer") ||
    text.includes("software") ||
    text.includes("frontend") ||
    text.includes("backend") ||
    text.includes("full stack") ||
    text.includes("data") ||
    text.includes("it") ||
    text.includes("cyber") ||
    text.includes("cloud") ||
    text.includes("network") ||
    text.includes("devops") ||
    text.includes("qa") ||
    text.includes("ui") ||
    text.includes("ux")
  ) {
    return "technology";
  }

  if (
    text.includes("engineer") ||
    text.includes("engineering") ||
    text.includes("autocad") ||
    text.includes("infrastructure") ||
    text.includes("civil") ||
    text.includes("mechanical") ||
    text.includes("electrical") ||
    text.includes("industrial") ||
    text.includes("chemical") ||
    text.includes("architect") ||
    text.includes("architecture")
  ) {
    return "engineering";
  }

  if (
    text.includes("medical") ||
    text.includes("health") ||
    text.includes("doctor") ||
    text.includes("nurse") ||
    text.includes("nursing") ||
    text.includes("hospital") ||
    text.includes("clinic") ||
    text.includes("pharmacy") ||
    text.includes("pharmacist") ||
    text.includes("dentist") ||
    text.includes("lab") ||
    text.includes("laboratory") ||
    text.includes("psychology")
  ) {
    return "healthcare";
  }

  if (
    text.includes("teacher") ||
    text.includes("teaching") ||
    text.includes("education") ||
    text.includes("learning") ||
    text.includes("school") ||
    text.includes("tutor") ||
    text.includes("professor") ||
    text.includes("lecturer")
  ) {
    return "education";
  }

  if (
    text.includes("account") ||
    text.includes("accounting") ||
    text.includes("finance") ||
    text.includes("financial") ||
    text.includes("bank") ||
    text.includes("banking") ||
    text.includes("tax") ||
    text.includes("insurance") ||
    text.includes("auditor") ||
    text.includes("economics")
  ) {
    return "finance";
  }

  if (
    text.includes("marketing") ||
    text.includes("seo") ||
    text.includes("content") ||
    text.includes("social media") ||
    text.includes("copywriter") ||
    text.includes("digital marketing") ||
    text.includes("advertising") ||
    text.includes("campaign")
  ) {
    return "marketing";
  }

  if (
    text.includes("retail") ||
    text.includes("store") ||
    text.includes("shop") ||
    text.includes("cashier") ||
    text.includes("supermarket") ||
    text.includes("pos") ||
    text.includes("sales associate")
  ) {
    return "retail";
  }

  if (
    text.includes("sales") ||
    text.includes("salesperson") ||
    text.includes("sales manager") ||
    text.includes("business development")
  ) {
    return "sales";
  }

  if (
    text.includes("customer service") ||
    text.includes("customer support") ||
    text.includes("call center") ||
    text.includes("support representative") ||
    text.includes("service representative")
  ) {
    return "customerService";
  }

  if (
    text.includes("hotel") ||
    text.includes("hospitality") ||
    text.includes("tourism") ||
    text.includes("guest")
  ) {
    return "hospitality";
  }

  if (
    text.includes("restaurant") ||
    text.includes("chef") ||
    text.includes("waiter") ||
    text.includes("barista") ||
    text.includes("kitchen") ||
    text.includes("cook") ||
    text.includes("food service") ||
    text.includes("baking")
  ) {
    return "restaurants";
  }

  if (
    text.includes("logistics") ||
    text.includes("shipping") ||
    text.includes("supply") ||
    text.includes("warehouse") ||
    text.includes("delivery") ||
    text.includes("driver") ||
    text.includes("transportation") ||
    text.includes("truck")
  ) {
    return "logistics";
  }

  if (
    text.includes("construction") ||
    text.includes("builder") ||
    text.includes("building") ||
    text.includes("plumbing") ||
    text.includes("carpentry") ||
    text.includes("electrician") ||
    text.includes("maintenance")
  ) {
    return "construction";
  }

  if (
    text.includes("factory") ||
    text.includes("manufacturing") ||
    text.includes("production") ||
    text.includes("machine operator") ||
    text.includes("packaging")
  ) {
    return "factory";
  }

  if (
    text.includes("security") ||
    text.includes("guard") ||
    text.includes("police") ||
    text.includes("military") ||
    text.includes("fire safety")
  ) {
    return "security";
  }

  if (
    text.includes("legal") ||
    text.includes("lawyer") ||
    text.includes("attorney") ||
    text.includes("law")
  ) {
    return "legal";
  }

  if (
    text.includes("office") ||
    text.includes("administration") ||
    text.includes("secretary") ||
    text.includes("secretarial") ||
    text.includes("assistant")
  ) {
    return "administration";
  }

  if (
    text.includes("hr") ||
    text.includes("human resources") ||
    text.includes("recruiter") ||
    text.includes("recruitment")
  ) {
    return "humanResources";
  }

  if (
    text.includes("real estate") ||
    text.includes("property") ||
    text.includes("broker")
  ) {
    return "realEstate";
  }

  if (
    text.includes("beauty") ||
    text.includes("makeup") ||
    text.includes("hairdresser") ||
    text.includes("nail")
  ) {
    return "beauty";
  }

  if (
    text.includes("cleaning") ||
    text.includes("housekeeping") ||
    text.includes("janitor") ||
    text.includes("laundry")
  ) {
    return "cleaning";
  }

  if (
    text.includes("agriculture") ||
    text.includes("farm") ||
    text.includes("farming")
  ) {
    return "agriculture";
  }

  if (
    text.includes("media") ||
    text.includes("journalism") ||
    text.includes("photography") ||
    text.includes("video editing") ||
    text.includes("animation")
  ) {
    return "media";
  }

  if (
    text.includes("design") ||
    text.includes("graphic") ||
    text.includes("interior design")
  ) {
    return "design";
  }

  if (text.includes("translation") || text.includes("translator")) {
    return "translation";
  }

  if (text.includes("writing") || text.includes("writer")) {
    return "writing";
  }

  return "general";
}

export function inferLevel(job: InferableJob): string {
  const text = normalize(`${job.title || ""} ${job.description || ""} ${job.requirements || ""}`);

  if (text.includes("lead") || text.includes("principal")) return "Lead";
  if (text.includes("senior") || text.includes("5+")) return "Senior";
  if (text.includes("junior") || text.includes("entry") || text.includes("0-1")) return "Entry";
  return "Mid";
}

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

export function getRingColor(status: "scored" | "loading" | "noAnalysis" | "noScore", percent: number): string {
  if (status !== "scored") return "#5f648a";
  if (percent >= 80) return "#c084fc"; // purple/lilac — strong match (matches app's AI-insights accent)
  if (percent >= 50) return "#7c88ff"; // blue — moderate match (matches app's primary blue accent)
  return "#fb923c"; // orange — weak match
}

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
