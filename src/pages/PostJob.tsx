import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ChevronDown,
  Save,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function PostJob() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === "ar" || language === "he";

  const [skills, setSkills] = useState(["React", "TypeScript"]);
  const [skillInput, setSkillInput] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [remoteWork, setRemoteWork] = useState(false);
  const [seniorityLevel, setSeniorityLevel] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [minExperience, setMinExperience] = useState("");
  const [maxExperience, setMaxExperience] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) return;
    setSkills([...skills, trimmed]);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSaveDraft = () => {
    alert("Job saved as draft!");
  };

  const handlePostJob = () => {
    if (!jobTitle.trim() || !description.trim()) {
      alert("Please fill in Job Title and Description.");
      return;
    }

    const newJob = {
      id: Date.now(),
      title: jobTitle,
      description,
      location,
      remoteWork,
      seniorityLevel,
      employmentType,
      minExperience,
      maxExperience,
      minSalary,
      maxSalary,
      skills,
      status: "Active",
      postedDate: new Date().toLocaleDateString(),
    };

    const existingJobs = JSON.parse(localStorage.getItem("postedJobs") || "[]");
    const updatedJobs = [newJob, ...existingJobs];

    localStorage.setItem("postedJobs", JSON.stringify(updatedJobs));

    alert("Job posted successfully!");
    navigate("/company-job-postings");
  };

  return (
    <section
      className={`relative min-h-[calc(100vh-78px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(87,57,255,0.24),transparent_24%),linear-gradient(90deg,#15124a_0%,#161354_38%,#121a58_100%)] text-white ${
        isRTL ? "text-right" : "text-left"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(0,194,255,0.10),transparent_10%),radial-gradient(circle_at_62%_80%,rgba(116,80,255,0.10),transparent_18%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 w-full px-8 pb-12 pt-10 max-[700px]:px-4 xl:px-10 2xl:px-12">
        <button
          type="button"
          onClick={() => navigate("/company-job-postings")}
          className={`mb-10 inline-flex items-center gap-3 rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-6 py-3 text-[16px] font-semibold text-white/85 backdrop-blur-[8px] transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white`}
        >
          <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          Back to Jobs
        </button>

        <div
          className={`mb-10 flex items-center gap-5`}
        >
          <div className="flex h-[62px] w-[62px] items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#7b61ff,#b13dff)] shadow-[0_12px_30px_rgba(139,92,246,0.28)]">
            <BriefcaseBusiness size={30} className="text-white" />
          </div>

          <div>
            <h1 className="text-[42px] font-extrabold leading-none text-white max-[900px]:text-[32px]">
              Create New Job
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-[1020px] space-y-8">
          <div className="rounded-[28px] border border-white/10 bg-[rgba(48,46,108,0.72)] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur-[10px]">
            <h2 className="mb-8 text-[22px] font-extrabold text-white">
              Basic Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-[16px] font-medium text-white/75">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Frontend Developer"
                  className="h-14 w-full rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 text-[17px] text-white placeholder:text-white/28 outline-none transition focus:border-[#7f6bff]"
                />
              </div>

              <div>
                <label className="mb-3 block text-[16px] font-medium text-white/75">
                  Description *
                </label>
                <textarea
                  rows={7}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role and responsibilities..."
                  className="w-full rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 py-4 text-[17px] text-white placeholder:text-white/28 outline-none transition focus:border-[#7f6bff]"
                />
              </div>

              <div
                className={`grid gap-6 md:grid-cols-[1.3fr_0.9fr] ${
                  isRTL ? "md:[direction:rtl]" : ""
                }`}
              >
                <div>
                  <label className="mb-3 block text-[16px] font-medium text-white/75">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    className="h-14 w-full rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 text-[17px] text-white placeholder:text-white/28 outline-none transition focus:border-[#7f6bff]"
                  />
                </div>

                <div className="flex items-end">
                  <label
                    className={`flex items-center gap-4 text-[16px] font-medium text-white/75`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={remoteWork}
                        onChange={(e) => setRemoteWork(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="h-8 w-14 rounded-full bg-white/25 transition peer-checked:bg-[#7f6bff]" />
                      <div className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition peer-checked:translate-x-6" />
                    </div>
                    <span>Remote Work Available</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[rgba(48,46,108,0.72)] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur-[10px]">
            <h2 className="mb-8 text-[22px] font-extrabold text-white">
              Requirements
            </h2>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-3 block text-[16px] font-medium text-white/75">
                    Seniority Level
                  </label>
                  <div className="relative">
                    <select
                      value={seniorityLevel}
                      onChange={(e) => setSeniorityLevel(e.target.value)}
                      className="h-14 w-full appearance-none rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 text-[17px] text-white outline-none transition focus:border-[#7f6bff]"
                    >
                      <option
                        value=""
                        style={{ backgroundColor: "#2f2d68", color: "white" }}
                      >
                        Select level
                      </option>
                      <option
                        value="Junior"
                        style={{ backgroundColor: "#2f2d68", color: "white" }}
                      >
                        Junior
                      </option>
                      <option
                        value="Mid-Level"
                        style={{ backgroundColor: "#2f2d68", color: "white" }}
                      >
                        Mid-Level
                      </option>
                      <option
                        value="Senior"
                        style={{ backgroundColor: "#2f2d68", color: "white" }}
                      >
                        Senior
                      </option>
                      <option
                        value="Lead"
                        style={{ backgroundColor: "#2f2d68", color: "white" }}
                      >
                        Lead
                      </option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" />
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-[16px] font-medium text-white/75">
                    Employment Type
                  </label>
                  <div className="relative">
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="h-14 w-full appearance-none rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 text-[17px] text-white outline-none transition focus:border-[#7f6bff]"
                    >
                      <option
                        value="Full-time"
                        style={{ backgroundColor: "#2f2d68", color: "white" }}
                      >
                        Full-time
                      </option>
                      <option
                        value="Part-time"
                        style={{ backgroundColor: "#2f2d68", color: "white" }}
                      >
                        Part-time
                      </option>
                      <option
                        value="Contract"
                        style={{ backgroundColor: "#2f2d68", color: "white" }}
                      >
                        Contract
                      </option>
                      <option
                        value="Internship"
                        style={{ backgroundColor: "#2f2d68", color: "white" }}
                      >
                        Internship
                      </option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-3 block text-[16px] font-medium text-white/75">
                    Experience (years)
                  </label>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <input
                      type="number"
                      value={minExperience}
                      onChange={(e) => setMinExperience(e.target.value)}
                      placeholder="Min"
                      className="h-14 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 text-[17px] text-white placeholder:text-white/28 outline-none transition focus:border-[#7f6bff]"
                    />
                    <span className="text-white/40">-</span>
                    <input
                      type="number"
                      value={maxExperience}
                      onChange={(e) => setMaxExperience(e.target.value)}
                      placeholder="Max"
                      className="h-14 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 text-[17px] text-white placeholder:text-white/28 outline-none transition focus:border-[#7f6bff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-[16px] font-medium text-white/75">
                    Salary Range (USD)
                  </label>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <input
                      type="number"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                      placeholder="Min"
                      className="h-14 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 text-[17px] text-white placeholder:text-white/28 outline-none transition focus:border-[#7f6bff]"
                    />
                    <span className="text-white/40">-</span>
                    <input
                      type="number"
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(e.target.value)}
                      placeholder="Max"
                      className="h-14 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 text-[17px] text-white placeholder:text-white/28 outline-none transition focus:border-[#7f6bff]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-[16px] font-medium text-white/75">
                  Required Skills
                </label>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Add a skill..."
                    className="h-14 flex-1 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 text-[17px] text-white placeholder:text-white/28 outline-none transition focus:border-[#7f6bff]"
                  />

                  <button
                    type="button"
                    onClick={addSkill}
                    className="h-14 min-w-[72px] rounded-[14px] bg-white text-[24px] font-bold text-[#26235f] transition hover:opacity-90"
                  >
                    +
                  </button>
                </div>

                {skills.length > 0 && (
                  <div
                    className={`mt-4 flex flex-wrap gap-3 ${
                      isRTL ? "justify-end" : ""
                    }`}
                  >
                    {skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[14px] font-medium text-white transition hover:bg-white/15"
                      >
                        {skill} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className={`flex items-center justify-end gap-5 ${
              isRTL ? "justify-start" : ""
            }`}
          >
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex h-14 items-center justify-center rounded-[14px] bg-white px-8 text-[16px] font-bold text-[#2a265f] shadow-[0_10px_24px_rgba(255,255,255,0.12)] transition hover:opacity-90"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={handlePostJob}
              className={`inline-flex h-14 items-center gap-3 rounded-[14px] bg-[linear-gradient(135deg,#7f6bff,#9b3ff5)] px-8 text-[16px] font-bold text-white shadow-[0_14px_30px_rgba(139,92,246,0.25)] transition hover:scale-[1.02]`}
            >
              <Save size={18} />
              Post Job
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PostJob;