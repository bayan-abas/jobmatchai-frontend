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
  // Resolved server-side from a provider's own category/occupation data when available (see
  // backend ExternalJobData.industry) - a real classification, not a keyword guess, so
  // inferIndustry() below trusts it outright instead of re-deriving anything. Absent for
  // internal (company-posted) jobs and for providers with no such data, in which case
  // classification falls back to title/description keyword inference.
  industry?: string | null;
};

// The complete, authoritative set of values inferIndustry() can ever return (see INDUSTRY_BUCKETS
// below) - every "industry" filter UI must build its option list from this array rather than
// hand-rolling its own, otherwise a filter option with no matching inferIndustry() return value
// is guaranteed to show zero results forever, regardless of what data exists.
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
    // Periods are deliberately NOT preserved (unlike +/#/- , kept for tokens like "5+", "0-1",
    // "c#"): a sentence-ending period glued to the last word ("...at our supermarket.") used to
    // leave that word as "supermarket." in the normalized text, which the exact-token keyword
    // matching below (paddedText.includes(" keyword ")) would never match against the keyword
    // "supermarket" - silently losing real matches to whatever run-on sentence a job posting
    // happened to end with.
    .replace(/[^\w\s+#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Every industry's keyword list, in the same order as INDUSTRY_KEYS (minus "general", which is
// the fallback when nothing scores). Keeping this as a plain ordered list (rather than 26
// separate if-blocks) is what makes inferIndustry() below able to score every bucket instead of
// stopping at the first one that matches at all - see that function for why that matters.
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
  // "office" was deliberately dropped from this list - too generic/weak a signal (shows up in
  // "Office Cleaner", "Post Office", "Home Office" etc. that have nothing to do with
  // administration), and it caused exactly that kind of job to tie with - and sometimes beat -
  // its real industry's own, more specific keyword.
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

// A handful of keywords above are unavoidably generic (a single common word, not a distinctive
// phrase) and show up incidentally across many industries' job text - "data" in "data-driven
// marketing", "qa" in a factory's quality-assurance postings, "network" in a sales role's
// "networking events", "it" referenced in passing by almost any office job. Counting every
// keyword as equally strong evidence meant a job could be yanked into "technology" by one
// incidental mention of "data", even though its actual industry (marketing, healthcare,
// whatever) had five or six of ITS OWN keywords also present. Weighting a match by how many
// words are in the keyword (a specific two-word phrase like "customer service" or "full stack"
// is far less ambiguous than a bare single word) and scoring every bucket instead of stopping
// at the first hit is what makes a genuinely strong, multi-signal match for the RIGHT industry
// win over one weak, incidental word borrowed by the wrong bucket.
const scoreBucket = (paddedText: string, keywords: string[]) =>
  keywords.reduce((score, keyword) => {
    if (!paddedText.includes(` ${keyword} `)) {
      return score;
    }
    return score + keyword.trim().split(/\s+/).length;
  }, 0);

// Highest-scoring bucket for this text, or null if nothing scored at all - null (not "general")
// matters here, since it's what lets inferIndustry() below tell "no signal in the title yet,
// keep looking at the description" apart from "genuinely nothing matched anywhere, give up".
const bestBucket = (paddedText: string): string | null => {
  let bestIndustry: string | null = null;
  let bestScore = 0;

  for (const [industry, keywords] of INDUSTRY_BUCKETS) {
    const score = scoreBucket(paddedText, keywords);
    // Strict ">" (not ">=") means an earlier bucket in INDUSTRY_BUCKETS keeps its win on a tie -
    // preserves the bucket list's order as a tiebreaker without needing a separate rule.
    if (score > bestScore) {
      bestScore = score;
      bestIndustry = industry;
    }
  }

  return bestIndustry;
};

// Classification priority, matching how professional job platforms (Drushim, AllJobs, etc.)
// categorize listings rather than guessing from free-text alone:
//   1-2. Trust the provider's own category/occupation data outright when we have it (resolved
//        server-side into job.industry - see ExternalJobData.industry on the backend) - this is
//        a real classification from the source, not an inference, so nothing below even runs.
//   3. Otherwise classify from the TITLE first - by far the most reliable free-text signal
//      ("Software Engineer", "Registered Nurse", "Corporate Lawyer" are unambiguous on their
//      own), and immune to a description that happens to namedrop an unrelated domain in
//      passing.
//   4. Only if the title alone gives no confident signal, widen the net to description/
//      requirements/skills as supporting evidence.
//   5. If nothing confidently matches even then, the job goes to "general" (Other/General)
//      rather than being forced into an arbitrary bucket - an honest "we don't know" instead of
//      a guess that pollutes some other industry's filter results.
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

export function inferLevel(job: InferableJob): string {
  const text = normalize(`${job.title || ""} ${job.description || ""} ${job.requirements || ""}`);
  const padded = ` ${text} `;

  if (scoreBucket(padded, ["lead", "principal"]) > 0) return "Lead";
  if (scoreBucket(padded, ["senior", "5+"]) > 0) return "Senior";
  if (scoreBucket(padded, ["junior", "entry", "0-1"]) > 0) return "Entry";
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

export function getRingColor(status: "scored" | "loading" | "noAnalysis" | "noScore" | "error", percent: number): string {
  if (status === "error") return "#f59e0b"; // amber — computation failed, distinct from a real "not a match" verdict
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
