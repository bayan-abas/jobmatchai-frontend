import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  Clock3,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import AIChatButton from "../components/AIChatButton";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  level: string;
  description: string;
  skills: string[];
};

function PublicJobsPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const publicJobs: Job[] = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "TechNova",
      location: "Tel Aviv",
      type: "Full-time",
      level: "Mid-Level",
      description:
        "Build modern user interfaces using React and TypeScript in a fast-growing product team.",
      skills: ["React", "TypeScript", "CSS"],
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "PixelCore",
      location: "Haifa",
      type: "Full-time",
      level: "Junior",
      description:
        "Design intuitive and engaging user experiences for web and mobile platforms.",
      skills: ["Figma", "UI Design", "UX Research"],
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "CloudEdge",
      location: "Remote",
      type: "Remote",
      level: "Senior",
      description:
        "Work across frontend and backend to deliver scalable web solutions.",
      skills: ["React", "Node.js", "MongoDB"],
    },
    {
      id: 4,
      title: "Product Designer",
      company: "VisionSoft",
      location: "Jerusalem",
      type: "Part-time",
      level: "Mid-Level",
      description:
        "Create product experiences that balance user needs and business goals.",
      skills: ["Product Design", "Wireframing", "Prototyping"],
    },
    {
      id: 5,
      title: "Backend Developer",
      company: "DataNova",
      location: "Tel Aviv",
      type: "Full-time",
      level: "Senior",
      description:
        "Develop scalable APIs and backend services for high-performance applications.",
      skills: ["Node.js", "Express", "PostgreSQL"],
    },
    {
      id: 6,
      title: "QA Engineer",
      company: "BrightSoft",
      location: "Haifa",
      type: "Part-time",
      level: "Junior",
      description:
        "Support product quality through manual and automated testing processes.",
      skills: ["Testing", "Automation", "Cypress"],
    },
  ];

  const filteredJobs = useMemo(() => {
    return publicJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.join(" ").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation =
        locationFilter === "All Locations" || job.location === locationFilter;

      const matchesType =
        typeFilter === "All Types" || job.type === typeFilter;

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [searchTerm, locationFilter, typeFilter]);

  const handleProtectedAction = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(76,70,255,0.18),transparent_28%),linear-gradient(135deg,#090b3a_0%,#15145a_45%,#0f1f59_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(115,73,255,0.18),transparent_22%),radial-gradient(circle_at_80%_85%,rgba(0,153,255,0.16),transparent_24%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(7,11,36,0.82)] backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-[1400px] items-center px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_10px_30px_rgba(139,92,246,0.35)]">
              <Sparkles size={20} />
            </div>

            <div className="text-left">
              <h1 className="text-2xl font-extrabold leading-none">
                JobMatchAI
              </h1>
              <p className="mt-1 text-sm text-white/60">
                AI-Powered Recruitment
              </p>
            </div>
          </button>

          <div className="absolute left-1/2 hidden -translate-x-1/2 md:flex items-center gap-1 rounded-[18px] border border-white/10 bg-white/[0.05] p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-[14px] px-5 py-2 text-sm font-semibold text-[#c9d6ed] transition hover:bg-white/10 hover:text-white"
            >
              Home
            </button>

            <button
              type="button"
              className="rounded-[14px] px-5 py-2 text-sm font-semibold text-white"
            >
              Jobs
            </button>
          </div>

          <div className="ml-auto hidden items-center gap-4 md:flex">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-bold text-white shadow-[0_10px_25px_rgba(99,102,241,0.35)] transition hover:scale-[1.02]"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1400px] px-6 pb-12 pt-10">
        <section className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="max-w-[760px]">
            <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-sm font-semibold text-cyan-300">
              Public Job Explorer
            </span>

            <h2 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl">
              Explore Smart Job Opportunities
            </h2>

            <p className="mt-4 text-base leading-7 text-white/65 md:text-lg">
              Browse available jobs, discover companies, and preview
              opportunities powered by JobMatchAI before creating an account.
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
          <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr_1fr]">
            <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3">
              <Search size={20} className="text-white/45" />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35"
              />
            </div>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-[20px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] text-white outline-none"
            >
              <option className="text-black">All Locations</option>
              <option className="text-black">Tel Aviv</option>
              <option className="text-black">Haifa</option>
              <option className="text-black">Jerusalem</option>
              <option className="text-black">Remote</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-[20px] border border-white/10 bg-[rgba(17,24,74,0.75)] px-4 py-3 text-[15px] text-white outline-none"
            >
              <option className="text-black">All Types</option>
              <option className="text-black">Full-time</option>
              <option className="text-black">Part-time</option>
              <option className="text-black">Remote</option>
            </select>
          </div>
        </section>

        <section className="grid gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.16)] transition hover:bg-white/[0.06]"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300">
                      {job.level}
                    </span>
                    <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">
                      AI Opportunity
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white">{job.title}</h3>
                  <p className="mt-2 text-lg text-white/70">{job.company}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/55">
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={16} />
                      {job.location}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <BriefcaseBusiness size={16} />
                      {job.type}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={16} />
                      Open Position
                    </span>
                  </div>

                  <p className="mt-5 max-w-[850px] text-[15px] leading-7 text-white/65">
                    {job.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col justify-center gap-3 lg:w-[220px]">
                  <button
                    type="button"
                    onClick={handleProtectedAction}
                    className="rounded-[16px] bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(99,102,241,0.28)] transition hover:scale-[1.02]"
                  >
                    Apply Now
                  </button>

                  <button
                    type="button"
                    onClick={handleProtectedAction}
                    className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
                  >
                    View Details
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-white/65">
              No jobs matched your search.
            </div>
          )}
        </section>
      </main>

      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4">
          <div className="w-full max-w-[520px] rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#171b55_0%,#10153f_100%)] p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    Unlock the full JobMatchAI experience
                  </h3>
                  <p className="mt-1 text-sm text-white/60">
                    Login or create an account to continue.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-6 text-[15px] leading-7 text-white/70">
              To apply for jobs, save opportunities, and access AI-powered match
              insights, please log in or create your account first.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex-1 rounded-[16px] border border-white/10 bg-white/[0.05] px-4 py-3 font-semibold text-white transition hover:bg-white/[0.09]"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="flex-1 rounded-[16px] bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-3 font-bold text-white shadow-[0_12px_28px_rgba(99,102,241,0.28)] transition hover:scale-[1.02]"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      <AIChatButton />
    </div>
  );
}

export default PublicJobsPage;