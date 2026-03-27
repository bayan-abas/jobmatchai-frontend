import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  MapPin,
  Wallet,
  Clock3,
  ChevronRight,
  SlidersHorizontal,
  Scale,
  Wifi,
  Landmark,
  TrendingUp,
  DollarSign,
  Target,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

type Job = {
  percent: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  experience: string;
  salary: string;
  level: string;
  status: string;
  skills: string[];
  dangerSkills: string[];
  noScore?: boolean;
  industry?: string;
};

function JobMatches() {
  const navigate = useNavigate();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [industry, setIndustry] = useState("");
  const [seniority, setSeniority] = useState("");
  const [minSalary, setMinSalary] = useState(40);
  const [minMatch, setMinMatch] = useState(15);

  const [industryOpen, setIndustryOpen] = useState(false);
  const [seniorityOpen, setSeniorityOpen] = useState(false);

  const industryRef = useRef<HTMLDivElement>(null);
  const seniorityRef = useRef<HTMLDivElement>(null);

  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (industryRef.current && !industryRef.current.contains(target)) {
        setIndustryOpen(false);
      }

      if (seniorityRef.current && !seniorityRef.current.contains(target)) {
        setSeniorityOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const jobs: Job[] = [
    {
      percent: "94%",
      title: "Civil Engineer – Infrastructure",
      company: "Solel Boneh",
      location: "Haifa",
      remote: false,
      experience: "4+ years",
      salary: "$95k - $140k",
      level: "Mid",
      status: "Active",
      skills: ["AutoCAD", "Structural Analysis", "Project Management"],
      dangerSkills: ["Site Supervision"],
      industry: "engineering",
    },
    {
      percent: "93%",
      title: "Junior Accountant",
      company: "Deloitte Israel",
      location: "Ramat Gan",
      remote: false,
      experience: "1+ years",
      salary: "$50k - $72k",
      level: "Entry",
      status: "Active",
      skills: ["Bookkeeping", "Tax Compliance", "SAP"],
      dangerSkills: ["Excel"],
      industry: "finance",
    },
    {
      percent: "91%",
      title: "Digital Marketing Manager",
      company: "Fiverr",
      location: "Tel Aviv",
      remote: true,
      experience: "4+ years",
      salary: "$85k - $120k",
      level: "Senior",
      status: "Active",
      skills: ["SEO", "Social Media Strategy"],
      dangerSkills: ["Google Ads", "Analytics"],
      industry: "marketing",
    },
    {
      percent: "90%",
      title: "E-Learning Content Developer",
      company: "EduTech Israel",
      location: "Tel Aviv",
      remote: true,
      experience: "2+ years",
      salary: "$55k - $80k",
      level: "Mid",
      status: "Active",
      skills: ["Instructional Design", "Video Editing", "Content Writing"],
      dangerSkills: ["LMS Platforms"],
      industry: "education",
    },
    {
      percent: "83%",
      title: "Senior Frontend Developer",
      company: "Check Point",
      location: "Tel Aviv",
      remote: true,
      experience: "5+ years",
      salary: "$120k - $180k",
      level: "Senior",
      status: "Active",
      skills: ["TypeScript", "Node.js"],
      dangerSkills: ["React", "GraphQL"],
      industry: "tech",
    },
    {
      percent: "82%",
      title: "Content Writer & Copywriter",
      company: "Monday.com",
      location: "Tel Aviv",
      remote: true,
      experience: "2+ years",
      salary: "$55k - $80k",
      level: "Mid",
      status: "Active",
      skills: ["Copywriting", "SEO Writing", "Brand Voice"],
      dangerSkills: ["Content Strategy"],
      industry: "marketing",
    },
    {
      percent: "80%",
      title: "Electrical Technician",
      company: "Israel Electric Corporation",
      location: "Hadera",
      remote: false,
      experience: "2+ years",
      salary: "$65k - $90k",
      level: "Mid",
      status: "Active",
      skills: ["Electrical Systems", "Safety Standards"],
      dangerSkills: ["Wiring", "Troubleshooting"],
      industry: "engineering",
    },
    {
      percent: "79%",
      title: "Medical Lab Technician",
      company: "Maccabi Health Services",
      location: "Haifa",
      remote: false,
      experience: "1+ years",
      salary: "$48k - $68k",
      level: "Entry",
      status: "Active",
      skills: ["Lab Analysis", "Blood Tests", "Safety Protocols"],
      dangerSkills: ["Microscopy"],
      industry: "healthcare",
    },
    {
      percent: "79%",
      title: "Retail Store Manager",
      company: "SuperPharm",
      location: "Beer Sheva",
      remote: false,
      experience: "3+ years",
      salary: "$55k - $80k",
      level: "Mid",
      status: "Active",
      skills: ["Team Leadership", "Sales"],
      dangerSkills: ["Inventory Management", "POS Systems"],
      industry: "retail",
    },
    {
      percent: "78%",
      title: "React Developer",
      company: "InnovateLab",
      location: "Austin, TX",
      remote: false,
      experience: "2+ years",
      salary: "$80k - $120k",
      level: "Mid",
      status: "Active",
      skills: ["JavaScript"],
      dangerSkills: ["React", "CSS"],
      industry: "tech",
    },
    {
      percent: "77%",
      title: "High School Mathematics Teacher",
      company: "Jerusalem Academy",
      location: "Jerusalem",
      remote: false,
      experience: "2+ years",
      salary: "$42k - $65k",
      level: "Mid",
      status: "Active",
      skills: ["Mathematics", "Classroom Management"],
      dangerSkills: ["Curriculum Design", "Assessment"],
      industry: "education",
    },
    {
      percent: "74%",
      title: "Financial Analyst",
      company: "Bank Hapoalim",
      location: "Tel Aviv",
      remote: false,
      experience: "3+ years",
      salary: "$90k - $130k",
      level: "Mid",
      status: "Active",
      skills: ["Excel", "Bloomberg", "Risk Analysis"],
      dangerSkills: ["Financial Modeling"],
      industry: "finance",
    },
    {
      percent: "72%",
      title: "Full Stack Engineer",
      company: "Wix",
      location: "Tel Aviv",
      remote: true,
      experience: "3+ years",
      salary: "$100k - $150k",
      level: "Mid",
      status: "Active",
      skills: ["Python", "AWS", "PostgreSQL"],
      dangerSkills: ["React"],
      industry: "tech",
    },
    {
      percent: "72%",
      title: "Graphic Designer",
      company: "Publicis Israel",
      location: "Tel Aviv",
      remote: true,
      experience: "2+ years",
      salary: "$60k - $90k",
      level: "Mid",
      status: "Active",
      skills: ["Adobe Illustrator", "Figma", "Branding"],
      dangerSkills: ["Photoshop"],
      industry: "marketing",
    },
    {
      percent: "70%",
      title: "Hotel Operations Manager",
      company: "Dan Hotels",
      location: "Eilat",
      remote: false,
      experience: "5+ years",
      salary: "$70k - $100k",
      level: "Senior",
      status: "Active",
      skills: ["Staff Training", "Budget Control"],
      dangerSkills: ["Operations Management", "Customer Service"],
      industry: "hospitality",
    },
    {
      percent: "",
      title: "Lead Software Engineer",
      company: "Enterprise Inc",
      location: "Seattle, WA",
      remote: true,
      experience: "8+ years",
      salary: "$160k - $220k",
      level: "Lead",
      status: "Active",
      skills: [],
      dangerSkills: [],
      noScore: true,
      industry: "tech",
    },
    {
      percent: "",
      title: "Junior Frontend Developer",
      company: "GrowthCo",
      location: "Denver, CO",
      remote: true,
      experience: "1+ years",
      salary: "$60k - $85k",
      level: "Entry",
      status: "Active",
      skills: [],
      dangerSkills: [],
      noScore: true,
      industry: "tech",
    },
    {
      percent: "",
      title: "Chef de Partie",
      company: "Norman Hotel",
      location: "Tel Aviv",
      remote: false,
      experience: "3+ years",
      salary: "$55k - $78k",
      level: "Mid",
      status: "Active",
      skills: [],
      dangerSkills: [],
      noScore: true,
      industry: "hospitality",
    },
    {
      percent: "",
      title: "Logistics Coordinator",
      company: "Zim Shipping",
      location: "Haifa",
      remote: false,
      experience: "2+ years",
      salary: "$60k - $85k",
      level: "Mid",
      status: "Active",
      skills: [],
      dangerSkills: [],
      noScore: true,
      industry: "logistics",
    },
  ];

  const industryOptions = [
    "allIndustries",
    "tech",
    "finance",
    "healthcare",
    "marketing",
    "education",
    "engineering",
    "retail",
    "hospitality",
    "logistics",
  ];

  const seniorityOptions = ["allLevels", "entry", "mid", "senior", "lead"];

  const getMinSalaryFromRange = (salary: string) => {
    const match = salary.match(/\$?(\d+)k/i);
    return match ? Number(match[1]) : 0;
  };

  const getNumericMatch = (percent: string, noScore?: boolean) => {
    if (noScore || !percent) return null;
    return Number(percent.replace("%", ""));
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesIndustry = !industry || job.industry === industry;
      const matchesLevel =
        !seniority || job.level.toLowerCase() === seniority.toLowerCase();
      const matchesSalary = getMinSalaryFromRange(job.salary) >= minSalary;

      const numericMatch = getNumericMatch(job.percent, job.noScore);
      const matchesScore = numericMatch === null ? true : numericMatch >= minMatch;

      return matchesIndustry && matchesLevel && matchesSalary && matchesScore;
    });
  }, [industry, seniority, minSalary, minMatch]);

  const activeFiltersCount =
    (industry ? 1 : 0) +
    (seniority ? 1 : 0) +
    (minSalary !== 40 ? 1 : 0) +
    (minMatch !== 15 ? 1 : 0);

  const getRingColor = (job: Job) => {
    if (job.noScore) return "#5f648a";
    const numeric = Number(job.percent.replace("%", ""));
    return numeric >= 80 ? "#49e38d" : "#f5c542";
  };

  const dropdownBase =
    "absolute left-0 right-0 top-full z-[60] mt-3 overflow-hidden rounded-[10px] border border-[#d9d9df] bg-[#f7f7f8] shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition-all duration-200";

  const dropdownAnimationOpen =
    "translate-y-0 opacity-100 scale-100 pointer-events-auto";

  const dropdownAnimationClosed =
    "pointer-events-none -translate-y-1 opacity-0 scale-[0.98]";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-7 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1080px]">
        <section className="mb-8">
          <div
            className={`mb-5 flex items-center ${
              isRTL ? "justify-end" : "justify-start"
            }`}
          >
            <button
              type="button"
              onClick={() => navigate("/candidate-dashboard")}
              className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
              <span>{t.common?.back || "Back"}</span>
            </button>
          </div>

          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
              <BriefcaseBusiness size={26} />
            </div>

            <div>
              <h1 className="text-[42px] font-extrabold leading-tight text-white">
                {t.jobMatches.title}
              </h1>
              <p className="mt-2 text-[17px] text-[#aeb4d6]">
                {t.jobMatches.subtitle}
              </p>
            </div>
          </div>

          <div className="mb-5 overflow-visible rounded-[28px] border border-white/10 bg-white/[0.05] px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
            <div
              className={`flex items-start justify-between gap-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex items-center gap-4 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5e66ff1f] text-[#7c88ff]">
                  <SlidersHorizontal size={24} />
                </div>

                <div className={isRTL ? "text-right" : "text-left"}>
                  <h3 className="text-[20px] font-extrabold text-white">
                    {t.jobMatches.smartFilters}
                  </h3>
                  <p className="mt-1 text-[15px] text-[#aeb4d6]">
                    {activeFiltersCount} {t.jobMatches.activeFilters}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-5 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <button
                  type="button"
                  className="text-[15px] font-semibold text-[#c8ccee] transition hover:text-white"
                  onClick={() => {
                    setIndustry("");
                    setSeniority("");
                    setMinSalary(40);
                    setMinMatch(15);
                  }}
                >
                  {t.jobMatches.clearAll}
                </button>

                <button
                  type="button"
                  onClick={() => setFiltersOpen((prev) => !prev)}
                  className="text-[#aeb4d6] transition hover:text-white"
                >
                  {filtersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>

            {filtersOpen && (
              <>
                <div className="my-5 h-px bg-white/10" />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <div ref={industryRef} className="relative overflow-visible">
                    <label
                      className={`mb-3 flex items-center gap-2 text-[15px] text-[#d7dbf7] ${
                        isRTL ? "flex-row-reverse justify-end" : ""
                      }`}
                    >
                      <Landmark size={17} />
                      <span>{t.jobMatches.industry}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setIndustryOpen((prev) => !prev);
                        setSeniorityOpen(false);
                      }}
                      className={`flex h-[48px] w-full items-center justify-between rounded-[12px] border border-white/10 bg-[#2a2f68] px-4 text-[15px] text-[#d7dbf7] outline-none transition hover:bg-[#313776] ${
                        isRTL ? "flex-row-reverse text-right" : "text-left"
                      }`}
                    >
                      <span className="truncate">
                        {industry
                          ? t.jobMatches[industry]
                          : t.jobMatches.allIndustries}
                      </span>

                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-[#8d94bd] transition ${
                          industryOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`${dropdownBase} ${
                        industryOpen ? dropdownAnimationOpen : dropdownAnimationClosed
                      }`}
                    >
                      <div className="max-h-[330px] overflow-y-auto py-1">
                        {industryOptions.map((item) => {
                          const isSelected =
                            (item === "allIndustries" && !industry) ||
                            industry === item;

                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setIndustry(item === "allIndustries" ? "" : item);
                                setIndustryOpen(false);
                              }}
                              className={`block w-full px-4 py-3 text-[14px] text-[#1f1f1f] transition ${
                                isRTL ? "text-right" : "text-left"
                              } ${
                                isSelected
                                  ? "bg-[#ececec] font-medium"
                                  : "bg-transparent hover:bg-[#ececec]"
                              }`}
                            >
                              {t.jobMatches[item]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div ref={seniorityRef} className="relative overflow-visible">
                    <label
                      className={`mb-3 flex items-center gap-2 text-[15px] text-[#d7dbf7] ${
                        isRTL ? "flex-row-reverse justify-end" : ""
                      }`}
                    >
                      <TrendingUp size={17} />
                      <span>{t.jobMatches.seniorityLevel}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setSeniorityOpen((prev) => !prev);
                        setIndustryOpen(false);
                      }}
                      className={`flex h-[48px] w-full items-center justify-between rounded-[12px] border border-white/10 bg-[#2a2f68] px-4 text-[15px] text-[#d7dbf7] outline-none transition hover:bg-[#313776] ${
                        isRTL ? "flex-row-reverse text-right" : "text-left"
                      }`}
                    >
                      <span className="truncate">
                        {seniority
                          ? t.jobMatches[seniority]
                          : t.jobMatches.allLevels}
                      </span>

                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-[#8d94bd] transition ${
                          seniorityOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`${dropdownBase} ${
                        seniorityOpen ? dropdownAnimationOpen : dropdownAnimationClosed
                      }`}
                    >
                      <div className="max-h-[330px] overflow-y-auto py-1">
                        {seniorityOptions.map((item) => {
                          const isSelected =
                            (item === "allLevels" && !seniority) ||
                            seniority === item;

                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setSeniority(item === "allLevels" ? "" : item);
                                setSeniorityOpen(false);
                              }}
                              className={`block w-full px-4 py-3 text-[14px] text-[#1f1f1f] transition ${
                                isRTL ? "text-right" : "text-left"
                              } ${
                                isSelected
                                  ? "bg-[#ececec] font-medium"
                                  : "bg-transparent hover:bg-[#ececec]"
                              }`}
                            >
                              {t.jobMatches[item]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`mb-3 flex items-center gap-2 text-[15px] text-[#d7dbf7] ${
                        isRTL ? "flex-row-reverse justify-end" : ""
                      }`}
                    >
                      <DollarSign size={17} />
                      <span>
                        {t.jobMatches.minSalary}: ${minSalary}k
                      </span>
                    </label>

                    <input
                      type="range"
                      min={40}
                      max={200}
                      step={5}
                      value={minSalary}
                      onChange={(e) => setMinSalary(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#171a46]"
                    />
                  </div>

                  <div>
                    <label
                      className={`mb-3 flex items-center gap-2 text-[15px] text-[#d7dbf7] ${
                        isRTL ? "flex-row-reverse justify-end" : ""
                      }`}
                    >
                      <Target size={17} />
                      <span>
                        {t.jobMatches.minMatch}: {minMatch}%
                      </span>
                    </label>

                    <input
                      type="range"
                      min={15}
                      max={100}
                      step={1}
                      value={minMatch}
                      onChange={(e) => setMinMatch(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#171a46]"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div
            className={`mb-5 flex items-start gap-3 rounded-2xl border border-[#5e66ff55] bg-[#5e66ff14] px-5 py-4 text-white/80 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Scale size={18} className="mt-0.5 shrink-0 text-[#f6c453]" />
            <p
              className={`text-sm leading-6 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <span className="font-bold text-white">
                {t.jobMatches.fairMatchingTitle}
              </span>{" "}
              {t.jobMatches.fairMatchingText}
            </p>
          </div>

          <p
            className={`text-[15px] text-[#aeb4d6] ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {filteredJobs.length} {t.jobMatches.jobsMatchCriteria}
          </p>
        </section>

        <section className="space-y-5">
          {filteredJobs.map((job, index) => {
            const numeric = job.noScore ? 0 : Number(job.percent.replace("%", ""));
            const ringColor = getRingColor(job);

            return (
              <article
                key={`${job.title}-${index}`}
                className="group rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition hover:border-white/20 hover:bg-[rgba(50,52,108,0.96)]"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="flex flex-col items-center justify-center md:justify-start">
                    <div className="relative h-[98px] w-[98px]">
                      <div
                        className="h-full w-full rounded-full transition-all duration-[1800ms] ease-out"
                        style={{
                          background: job.noScore
                            ? "conic-gradient(#5f648a 360deg, #2a2c5a 0deg)"
                            : `conic-gradient(${ringColor} ${numeric * 3.6}deg, #2a2c5a 0deg)`,
                          boxShadow: job.noScore
                            ? "0 0 0 rgba(0,0,0,0)"
                            : `0 0 24px ${ringColor}22`,
                        }}
                      />

                      <div className="absolute inset-[8px] flex items-center justify-center rounded-full bg-[#252654] text-[22px] font-extrabold text-white shadow-inner">
                        {job.noScore ? "N/A" : job.percent}
                      </div>
                    </div>

                    {job.noScore && (
                      <span className="mt-2 text-[12px] font-medium text-white/40">
                        {t.jobMatches.noScore}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div
                      className={`mb-3 flex flex-wrap items-center gap-3 ${
                        isRTL ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      <h2 className="text-[22px] font-extrabold text-white">
                        {job.title}
                      </h2>

                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                        {t.jobMatches.statusActive}
                      </span>
                    </div>

                    <div
                      className={`mb-3 flex items-center gap-2 text-[#c4cae9] ${
                        isRTL
                          ? "flex-row-reverse justify-end md:justify-start"
                          : ""
                      }`}
                    >
                      <Building2 size={16} />
                      <span className="text-[15px]">{job.company}</span>
                    </div>

                    <div
                      className={`mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[#aeb4d6] ${
                        isRTL ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{job.location}</span>
                      </div>

                      {job.remote && (
                        <div className="flex items-center gap-2 text-cyan-300">
                          <Wifi size={16} />
                          <span>{t.jobMatches.remote}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness size={16} />
                        <span>{job.experience}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Wallet size={16} />
                        <span className="font-semibold text-emerald-300">
                          {job.salary}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3 size={16} />
                        <span>{job.level}</span>
                      </div>

                      {job.industry && (
                        <div className="flex items-center gap-2">
                          <Landmark size={16} />
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-[#d6dcff]">
                            {t.jobMatches[job.industry] || job.industry}
                          </span>
                        </div>
                      )}
                    </div>

                    {(job.skills.length > 0 || job.dangerSkills.length > 0) && (
                      <div
                        className={`flex flex-wrap gap-2 ${
                          isRTL ? "md:flex-row-reverse" : ""
                        }`}
                      >
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300"
                          >
                            {skill}
                          </span>
                        ))}

                        {job.dangerSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-sm font-semibold text-rose-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-full text-white/30 transition group-hover:bg-white/5 group-hover:text-white/70"
                    >
                      <ChevronRight
                        size={22}
                        className={isRTL ? "rotate-180" : ""}
                      />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default JobMatches;