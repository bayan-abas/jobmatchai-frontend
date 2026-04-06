import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Filter,
  MapPin,
  BriefcaseBusiness,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Target,
  Award,
  SlidersHorizontal,
  Mail,
  Phone,
  Send,
  Calendar,
  Download,
  Brain,
  FileText,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
} from "lucide-react";

type Candidate = {
  id: number;
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  experience: string;
  experienceYears: number;
  education: string;
  university: string;
  skills: string[];
  industry: string;
  seniority: "Junior" | "Mid-Level" | "Senior" | "Lead";
  expectedSalary: number;
  match: number;
  resumeScore: number;
  preInterview: number;
  technical: number;
  communication: number;
  overall: number;
  fit: "High Fit" | "Medium Fit" | "Low Fit";
  summary: string;
  recommendationTitle: string;
  recommendationText: string;
  preInterviewSummary: string;
};

function CompanyCandidates() {
  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [savedScrollY, setSavedScrollY] = useState(0);

  const [industry, setIndustry] = useState("All");
  const [seniority, setSeniority] = useState("All");
  const [recommendation, setRecommendation] = useState("All");
  const [minSalary, setMinSalary] = useState(0);
  const [minMatch, setMinMatch] = useState(0);
  const [minPreInterview, setMinPreInterview] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [messageText, setMessageText] = useState("");

  //Schedule Interview
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewType, setInterviewType] = useState("Online");
  const [interviewNotes, setInterviewNotes] = useState("");

  const candidates: Candidate[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Frontend Developer",
      location: "Tel Aviv",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 234-5678",
      experience: "7 years experience",
      experienceYears: 7,
      education: "Master's in Computer Science",
      university: "Stanford University",
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Python", "Docker"],
      industry: "Software",
      seniority: "Senior",
      expectedSalary: 150,
      match: 95,
      resumeScore: 85,
      preInterview: 88,
      technical: 90,
      communication: 85,
      overall: 88,
      fit: "High Fit",
      summary:
        "Passionate frontend developer with 7+ years of experience building scalable web applications. Led multiple teams and delivered enterprise-level products.",
      recommendationTitle: "Highly Recommended",
      recommendationText:
        "This candidate shows strong alignment with job requirements and performed well in the pre-interview assessment.",
      preInterviewSummary:
        "Strong candidate with excellent technical skills and clear communication. Highly recommended for senior positions.",
    },
    {
      id: 2,
      name: "Jessica Martinez",
      title: "Frontend Lead",
      location: "Haifa",
      email: "jessica.martinez@email.com",
      phone: "+1 (555) 678-1122",
      experience: "8 years experience",
      experienceYears: 8,
      education: "Master's in Software Engineering",
      university: "MIT",
      skills: ["React", "Vue", "TypeScript", "Team Leadership", "Architecture", "AWS"],
      industry: "Software",
      seniority: "Lead",
      expectedSalary: 170,
      match: 94,
      resumeScore: 89,
      preInterview: 92,
      technical: 95,
      communication: 90,
      overall: 92,
      fit: "High Fit",
      summary:
        "Experienced frontend lead with a strong background in architecture and mentoring teams to deliver modern products.",
      recommendationTitle: "Highly Recommended",
      recommendationText:
        "Excellent fit for leadership-oriented frontend roles with strong architecture and communication skills.",
      preInterviewSummary:
        "Outstanding leadership potential with excellent technical depth and team communication.",
    },
    {
      id: 3,
      name: "Michael Chen",
      title: "Full Stack Engineer",
      location: "Herzliya",
      email: "michael.chen@email.com",
      phone: "+1 (555) 456-8899",
      experience: "5 years experience",
      experienceYears: 5,
      education: "Bachelor's in Software Engineering",
      university: "UC Berkeley",
      skills: ["React", "Python", "PostgreSQL", "Docker", "Kubernetes"],
      industry: "Cloud",
      seniority: "Mid-Level",
      expectedSalary: 130,
      match: 91,
      resumeScore: 84,
      preInterview: 82,
      technical: 85,
      communication: 80,
      overall: 82,
      fit: "High Fit",
      summary:
        "Full stack engineer with strong backend and deployment skills, experienced in cloud-native environments.",
      recommendationTitle: "Recommended",
      recommendationText:
        "Very good technical fit with strong backend and infrastructure knowledge.",
      preInterviewSummary:
        "Solid candidate with strong full stack capabilities and good problem-solving approach.",
    },
    {
      id: 4,
      name: "Emily Davis",
      title: "React Specialist",
      location: "Nazareth",
      email: "emily.davis@email.com",
      phone: "+1 (555) 992-1144",
      experience: "4 years experience",
      experienceYears: 4,
      education: "Bachelor's in Computer Science",
      university: "University of Texas",
      skills: ["React", "JavaScript", "CSS", "Testing", "Agile"],
      industry: "Frontend",
      seniority: "Mid-Level",
      expectedSalary: 95,
      match: 88,
      resumeScore: 80,
      preInterview: 75,
      technical: 78,
      communication: 75,
      overall: 75,
      fit: "Medium Fit",
      summary:
        "Frontend-focused developer with good React experience and solid understanding of testing and UI delivery.",
      recommendationTitle: "Consider for Interview",
      recommendationText:
        "Good frontend fit, though more suitable for mid-level roles than senior positions.",
      preInterviewSummary:
        "Good candidate overall, with room for growth in advanced technical discussions.",
    },
    {
      id: 5,
      name: "David Wilson",
      title: "Software Engineer",
      location: "Acre",
      email: "david.wilson@email.com",
      phone: "+1 (555) 301-7788",
      experience: "3 years experience",
      experienceYears: 3,
      education: "Bachelor's in Information Technology",
      university: "University of Washington",
      skills: ["JavaScript", "React", "Node.js", "MongoDB"],
      industry: "Software",
      seniority: "Junior",
      expectedSalary: 80,
      match: 82,
      resumeScore: 74,
      preInterview: 70,
      technical: 74,
      communication: 72,
      overall: 72,
      fit: "Medium Fit",
      summary:
        "Junior software engineer with solid fundamentals and a strong willingness to learn and improve.",
      recommendationTitle: "Potential Fit",
      recommendationText:
        "May fit junior roles well, especially with mentorship and structured onboarding.",
      preInterviewSummary:
        "Promising candidate for entry-level roles with room to improve depth and confidence.",
    },
  ];

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const industryMatch =
        industry === "All" || candidate.industry === industry;

      const seniorityMatch =
        seniority === "All" || candidate.seniority === seniority;

      const recommendationMatch =
        recommendation === "All" || candidate.fit === recommendation;

      const salaryMatch = candidate.expectedSalary >= minSalary;
      const matchScore = candidate.match >= minMatch;
      const preInterviewScore = candidate.preInterview >= minPreInterview;

      return (
        industryMatch &&
        seniorityMatch &&
        recommendationMatch &&
        salaryMatch &&
        matchScore &&
        preInterviewScore
      );
    });
  }, [
    candidates,
    industry,
    seniority,
    recommendation,
    minSalary,
    minMatch,
    minPreInterview,
  ]);

  const getFitStyles = (fit: Candidate["fit"]) => {
    if (fit === "High Fit") {
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20";
    }
    if (fit === "Medium Fit") {
      return "bg-amber-500/15 text-amber-300 border border-amber-400/20";
    }
    return "bg-red-500/15 text-red-300 border border-red-400/20";
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(91,77,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.10),transparent_25%),linear-gradient(135deg,#151748_0%,#141755_45%,#0f143f_100%)] px-6 pb-10 pt-8 md:px-10 text-white">
      <div className="mx-auto max-w-5xl">
        {!selectedCandidate ? (
          <>
            <button
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[15px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300 shadow-[0_10px_30px_rgba(34,211,238,0.15)]">
                <Users size={28} />
              </div>

              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white">
                  Find Candidates
                </h1>
                <p className="mt-2 text-[18px] text-white/60">
                  AI-matched candidates for your job openings
                </p>
              </div>
            </div>

            <div className="mb-7 rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-5">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                    <Filter size={22} />
                  </div>

                  <div>
                    <p className="text-[22px] font-bold text-white">Smart Filters</p>
                    <p className="text-sm text-white/50">Refine your search</p>
                  </div>
                </div>

                {showFilters ? (
                  <ChevronDown size={22} className="rotate-180 text-white/40" />
                ) : (
                  <ChevronDown size={22} className="text-white/40" />
                )}
              </button>

              {showFilters && (
                <div className="mt-5 border-t border-white/10 pt-5">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <FilterSelect
                      icon={<BriefcaseBusiness size={16} />}
                      label="Industry"
                      value={industry}
                      onChange={setIndustry}
                      options={["All", "Software", "Cloud", "Frontend"]}
                    />

                    <FilterSelect
                      icon={<TrendingUp size={16} />}
                      label="Seniority Level"
                      value={seniority}
                      onChange={setSeniority}
                      options={["All", "Junior", "Mid-Level", "Senior", "Lead"]}
                    />

                    <RangeFilter
                      icon={<DollarSign size={16} />}
                      label={`Min Salary: $${minSalary}k`}
                      value={minSalary}
                      onChange={setMinSalary}
                      min={0}
                      max={200}
                    />

                    <RangeFilter
                      icon={<Target size={16} />}
                      label={`Min Match: ${minMatch}%`}
                      value={minMatch}
                      onChange={setMinMatch}
                      min={0}
                      max={100}
                    />

                    <RangeFilter
                      icon={<SlidersHorizontal size={16} />}
                      label={`Min Pre-Interview Score: ${minPreInterview}%`}
                      value={minPreInterview}
                      onChange={setMinPreInterview}
                      min={0}
                      max={100}
                    />

                    <FilterSelect
                      icon={<Award size={16} />}
                      label="Recommendation"
                      value={recommendation}
                      onChange={setRecommendation}
                      options={["All", "High Fit", "Medium Fit", "Low Fit"]}
                    />
                  </div>
                </div>
              )}
            </div>

            <p className="mb-5 text-lg text-white/55">
              {filteredCandidates.length} candidates match your criteria
            </p>

            <div className="space-y-5">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => {
                    setSavedScrollY(window.scrollY);
                    setSelectedCandidate(candidate);
                    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
                  }}
                  className="cursor-pointer rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm transition hover:bg-white/[0.055]"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex flex-1 gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#7b61ff] to-[#a855f7] text-3xl font-extrabold text-white shadow-[0_12px_28px_rgba(124,77,255,0.28)]">
                        {getInitial(candidate.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-3">
                          <h2 className="text-[30px] font-extrabold leading-tight text-white">
                            {candidate.name}
                          </h2>

                          <span
                            className={`rounded-full px-4 py-2 text-sm font-bold ${getFitStyles(
                              candidate.fit
                            )}`}
                          >
                            {candidate.fit}
                          </span>
                        </div>

                        <p className="text-[22px] text-white/70">{candidate.title}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] text-white/55">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{candidate.location}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <BriefcaseBusiness size={16} />
                            <span>{candidate.experience}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <GraduationCap size={16} />
                            <span>{candidate.education}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {candidate.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/75"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="self-start rounded-full p-2 text-white/35 transition hover:bg-white/10 hover:text-white">
                      <ChevronRight size={22} />
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[160px_1fr]">
                    <div className="flex flex-col items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-5 text-center">
                      <div className="relative mb-3 flex h-[78px] w-[78px] items-center justify-center rounded-full border-[5px] border-emerald-400 text-[18px] font-extrabold text-white">
                        {candidate.match}%
                        <span className="absolute -bottom-5 text-xs font-medium text-white/60">
                          Match
                        </span>
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-5 py-5">
                      <div className="mb-5">
                        <p className="text-sm text-white/45">Pre-Interview Score</p>
                        <p className="mt-1 text-[18px] font-bold text-white">
                          {candidate.preInterview}%
                        </p>
                      </div>

                      <div className="space-y-4">
                        <ScoreBar label="Technical" value={candidate.technical} />
                        <ScoreBar
                          label="Communication"
                          value={candidate.communication}
                        />
                        <ScoreBar label="Overall Fit" value={candidate.overall} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredCandidates.length === 0 && (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-center text-white/65">
                  No candidates match the selected filters.
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setSelectedCandidate(null);
                setTimeout(() => {
                  window.scrollTo({
                    top: savedScrollY,
                    left: 0,
                    behavior: "instant" as ScrollBehavior,
                  });
                }, 0);
              }}
              className="mb-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[15px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex flex-1 gap-5">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#7b61ff] to-[#a855f7] text-5xl font-extrabold text-white shadow-[0_12px_28px_rgba(124,77,255,0.28)]">
                    {getInitial(selectedCandidate.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h1 className="text-[26px] font-extrabold text-white md:text-[40px]">
                        {selectedCandidate.name}
                      </h1>
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-bold ${getFitStyles(
                          selectedCandidate.fit
                        )}`}
                      >
                        {selectedCandidate.fit}
                      </span>
                    </div>

                    <p className="mb-4 text-[18px] text-white/70 md:text-[28px]">
                      {selectedCandidate.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px] text-white/60">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{selectedCandidate.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{selectedCandidate.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        <span>{selectedCandidate.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness size={16} />
                        <span>{selectedCandidate.experience}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-[15px] text-white/60">
                      <GraduationCap size={16} />
                      <span>
                        {selectedCandidate.education}, {selectedCandidate.university}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 xl:w-[260px]">
                  <button
                    onClick={() => {
                      setMessageText(
                        `Hi ${selectedCandidate.name}, we would like to contact you regarding your profile.`
                      );
                      setShowContactModal(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#7f6bff,#9b3ff5)] px-5 py-3.5 text-[15px] font-bold text-white transition hover:opacity-95"
                  >
                    <Send size={17} />
                    Contact Candidate
                  </button>

                  <button
                    onClick={() => {
                      setInterviewDate("");
                      setInterviewTime("");
                      setInterviewType("Online");
                      setInterviewNotes("");
                      setShowInterviewModal(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-[14px] border border-white/15 bg-white/[0.03] px-5 py-3.5 text-[15px] font-semibold text-[#b8c4ff] transition hover:bg-white/[0.06]"
                  >
                    <Calendar size={17} />
                    Schedule Interview
                  </button>

                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = "/resume.pdf";
                      link.download = "Resume.pdf";
                      link.click();
                    }}
                    className="flex items-center justify-center gap-2 rounded-[14px] border border-cyan-400/30 bg-cyan-400/10 px-5 py-3.5 text-[15px] font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                  >
                    <Download size={17} />
                    Download Resume
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.9fr_0.95fr]">
              <div className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                      <Brain size={20} />
                    </div>
                    <div>
                      <h2 className="text-[20px] font-extrabold">AI Decision Panel</h2>
                      <p className="text-sm text-white/50">Smart hiring recommendation</p>
                    </div>
                  </div>

                  <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <StatCard
                      icon={<Target size={20} />}
                      value={`${selectedCandidate.match}%`}
                      label="Match Score"
                    />
                    <StatCard
                      icon={<FileText size={20} />}
                      value={`${selectedCandidate.resumeScore}%`}
                      label="Resume"
                    />
                    <StatCard
                      icon={<MessageSquare size={20} />}
                      value={`${selectedCandidate.preInterview}%`}
                      label="Pre-Interview"
                    />
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                    <h3 className="mb-4 text-[20px] font-bold">Confidence Meter</h3>
                    <div className="space-y-4">
                      <ScoreBar
                        label="Technical"
                        value={selectedCandidate.technical}
                        gradient="from-violet-400 to-fuchsia-500"
                      />
                      <ScoreBar
                        label="Communication"
                        value={selectedCandidate.communication}
                        gradient="from-cyan-400 to-blue-500"
                      />
                      <ScoreBar
                        label="Overall Fit"
                        value={selectedCandidate.overall}
                        gradient="from-emerald-400 to-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="mt-6 rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 p-5">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                        <ThumbsUp size={22} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-violet-300">
                          AI Recommendation
                        </p>
                        <h3 className="text-[18px] font-extrabold text-emerald-300">
                          {selectedCandidate.recommendationTitle}
                        </h3>
                        <p className="mt-2 max-w-2xl text-[15px] leading-7 text-white/70">
                          {selectedCandidate.recommendationText}
                        </p>
                      </div>
                    </div>

                    <button className="mt-3 flex items-center gap-2 rounded-full bg-emerald-500/20 px-5 py-3 text-sm font-bold text-emerald-300">
                      <CheckCircle2 size={16} />
                      Proceed to Interview
                    </button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <h2 className="mb-4 text-[20px] font-extrabold">Pre-Interview Summary</h2>
                  <p className="text-[18px] leading-8 text-white/75">
                    {selectedCandidate.preInterviewSummary}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <h2 className="mb-5 text-[20px] font-extrabold">Skills</h2>
                  <div className="flex flex-wrap gap-3">
                    {selectedCandidate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <h2 className="mb-4 text-[20px] font-extrabold">Summary</h2>
                  <p className="text-[16px] leading-8 text-white/75">
                    {selectedCandidate.summary}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        {showContactModal && selectedCandidate && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-[560px] rounded-[28px] border border-white/10 bg-[#1b1d57] p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)]">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-[24px] font-extrabold">
                    Contact {selectedCandidate.name}
                  </h2>
                  <p className="text-sm text-white/55">
                    {selectedCandidate.email}
                  </p>
                </div>

                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={5}
                className="w-full mb-4 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 rounded bg-white/10"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    alert("Message sent!");
                    setShowContactModal(false);
                  }}
                  className="px-4 py-2 rounded bg-purple-500"
                >
                  Send
                </button>
              </div>

            </div>
          </div>
        )}
        {showInterviewModal && selectedCandidate && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-[560px] rounded-[28px] border border-white/10 bg-[#1b1d57] p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-[24px] font-extrabold">
                    Schedule Interview
                  </h2>
                  <p className="text-sm text-white/55">
                    With {selectedCandidate.name}
                  </p>
                </div>

                <button
                  onClick={() => setShowInterviewModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/70">Date</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">Time</label>
                  <input
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-white/70">Interview Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                >
                  <option value="Online" className="bg-[#1d2258] text-white">Online</option>
                  <option value="In Person" className="bg-[#1d2258] text-white">In Person</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-white/70">Notes</label>
                <textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  placeholder="Add interview notes..."
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 rounded bg-white/10"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    alert(`Interview scheduled with ${selectedCandidate.name}`);
                    setShowInterviewModal(false);
                  }}
                  className="flex items-center gap-2 rounded bg-purple-500 px-4 py-2 text-white"
                >
                  <Calendar size={16} />
                  Confirm Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-[15px] text-white/70">
        <span className="text-white/60">{icon}</span>
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#1d2258] text-white">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function RangeFilter({
  icon,
  label,
  value,
  onChange,
  min,
  max,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <label className="mb-3 flex items-center gap-2 text-[15px] text-white/70">
        <span className="text-white/60">{icon}</span>
        {label}
      </label>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-400"
      />
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-5 text-center">
      <div className="mb-3 flex justify-center text-cyan-300">{icon}</div>
      <div className="text-[20px] font-extrabold text-white">{value}</div>
      <div className="text-sm text-white/50">{label}</div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  gradient,
}: {
  label: string;
  value: number;
  gradient?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-white/70">{label}</span>
        <span className="font-semibold text-white/85">{value}%</span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${
            gradient
              ? `bg-gradient-to-r ${gradient}`
              : "bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default CompanyCandidates;