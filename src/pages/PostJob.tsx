import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ChevronDown,
  Save,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";
import { Button, FormField, Input, useToast } from "../components/ui";

function PostJob() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language];
  const p = t.postJobPage;
  const isRTL = language === "ar" || language === "he";
  const toast = useToast();

  const [skills, setSkills] = useState(["React", "TypeScript"]);
  const [skillInput, setSkillInput] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [remoteWork, setRemoteWork] = useState(false);
  const [seniorityLevel, setSeniorityLevel] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [minExperience, setMinExperience] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    toast.info(p.jobSavedAsDraft);
  };

  // "" (not yet entered) parses to null - only a value the user actually typed is validated;
  // a genuinely negative number is only possible via paste/autofill since the number inputs
  // below already block typing "-" as the onChange handler's first character.
  const parseOptionalNumber = (value: string): number | null => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handlePostJob = async () => {
    if (isSubmitting) return;

    if (!jobTitle.trim() || !description.trim()) {
      toast.error(p.fillTitleAndDescription);
      return;
    }

    const companyEmail = user?.email;
    const companyName =
      localStorage.getItem("companyName") ||
      user?.name ||
      "Company";

    if (!companyEmail) {
      toast.error(p.companyEmailNotFound);
      return;
    }

    const minSalaryNum = parseOptionalNumber(minSalary);
    const maxSalaryNum = parseOptionalNumber(maxSalary);
    const minExperienceNum = parseOptionalNumber(minExperience);

    // Defense in depth: the number inputs already block typing/pasting a leading "-", and
    // `min={0}` covers the spinner arrows, but neither stops a pasted or autofilled negative
    // value from ever reaching this state - this is the real gate. The backend independently
    // re-validates the same rules (see JobCreateRequest) in case this check is ever bypassed.
    if (
      [minSalaryNum, maxSalaryNum, minExperienceNum].some(
        (value) => value !== null && value < 0
      )
    ) {
      toast.error(p.negativeValueNotAllowed);
      return;
    }

    if (minSalaryNum !== null && maxSalaryNum !== null && maxSalaryNum < minSalaryNum) {
      toast.error(p.maxSalaryLessThanMinError);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiFetch("/api/jobs/add", {
        method: "POST",
        body: JSON.stringify({
          title: jobTitle,
          companyName,
          companyEmail,
          location: remoteWork ? `${location || "Remote"} / Remote` : location,
          type: employmentType,
          salary:
            minSalary || maxSalary
              ? `${minSalary || "0"} - ${maxSalary || "Open"}`
              : "Not specified",
          description,
          requirements: [
            seniorityLevel ? `Seniority: ${seniorityLevel}` : "",
            minExperience ? `Experience: ${minExperience}+ years` : "",
          ]
            .filter(Boolean)
            .join(" | "),
          skills: skills.join(", "),
          minSalary: minSalaryNum,
          maxSalary: maxSalaryNum,
          minExperienceYears: minExperienceNum,
        }),
      });

      if (!data.success) {
        toast.error(data.message || p.failedToPostJob);
        setIsSubmitting(false);
        return;
      }

      toast.success(p.jobPostedSuccessfully);

      setTimeout(() => {
        navigate("/company-job-postings");
      }, 1200);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof ApiError ? error.message : p.serverConnectionFailed);
      setIsSubmitting(false);
    }
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
          className="mb-10 inline-flex items-center gap-3 rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-6 py-3 text-[16px] font-semibold text-white/85 backdrop-blur-[8px] transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
        >
          <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          {p.backToJobs}
        </button>

        <div className="mb-10 flex items-center gap-5">
          <div className="flex h-[62px] w-[62px] items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#7b61ff,#b13dff)] shadow-[0_12px_30px_rgba(139,92,246,0.28)]">
            <BriefcaseBusiness size={30} className="text-white" />
          </div>

          <div>
            <h1 className="text-[42px] font-extrabold leading-none text-white max-[900px]:text-[32px]">
              {p.createNewJob}
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-[1020px] space-y-8">
          <div className="rounded-[28px] border border-white/10 bg-[rgba(48,46,108,0.72)] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur-[10px]">
            <h2 className="mb-8 text-[22px] font-extrabold text-white">
              {p.basicInformation}
            </h2>

            <div className="space-y-6">
              <FormField label={p.jobTitleRequired} htmlFor="post-job-title" required>
                <Input
                  id="post-job-title"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder={p.jobTitlePlaceholder}
                  className="h-14 text-[17px]"
                />
              </FormField>

              <div>
                <label className="mb-3 block text-[16px] font-medium text-white/75">
                  {p.descriptionRequired}
                </label>
                <textarea
                  rows={7}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={p.descriptionPlaceholder}
                  className="w-full rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 py-4 text-[17px] text-white placeholder:text-white/28 outline-none transition focus:border-[#7f6bff]"
                />
              </div>

              <div
                className={`grid gap-6 md:grid-cols-[1.3fr_0.9fr] ${
                  isRTL ? "md:[direction:rtl]" : ""
                }`}
              >
                <FormField label={p.location} htmlFor="post-job-location">
                  <Input
                    id="post-job-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={p.locationPlaceholder}
                    className="h-14 text-[17px]"
                  />
                </FormField>

                <div className="flex items-end">
                  <label className="flex items-center gap-4 text-[16px] font-medium text-white/75">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={remoteWork}
                        onChange={(e) => setRemoteWork(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="h-8 w-14 rounded-full bg-white/25 transition peer-checked:bg-[#7f6bff]" />
                      <div
                        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                          isRTL
                            ? "right-1 peer-checked:-translate-x-6"
                            : "left-1 peer-checked:translate-x-6"
                        }`}
                      />
                    </div>
                    <span>{p.remoteWorkAvailable}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[rgba(48,46,108,0.72)] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur-[10px]">
            <h2 className="mb-8 text-[22px] font-extrabold text-white">
              {p.requirements}
            </h2>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-3 block text-[16px] font-medium text-white/75">
                    {p.seniorityLevel}
                  </label>
                  <div className="relative">
                    <select
                      value={seniorityLevel}
                      onChange={(e) => setSeniorityLevel(e.target.value)}
                      className="h-14 w-full appearance-none rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 text-[17px] text-white outline-none transition focus:border-[#7f6bff]"
                    >
                      {[
                        { value: "", label: p.selectLevel },
                        { value: "Junior", label: p.levelJunior },
                        { value: "Mid-Level", label: p.levelMidLevel },
                        { value: "Senior", label: p.levelSenior },
                        { value: "Lead", label: p.levelLead },
                      ].map((level) => (
                        <option
                          key={level.value || "empty"}
                          value={level.value}
                          style={{
                            backgroundColor: "#2f2d68",
                            color: "white",
                          }}
                        >
                          {level.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-white/45 ${
                        isRTL ? "left-4" : "right-4"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-[16px] font-medium text-white/75">
                    {p.employmentType}
                  </label>
                  <div className="relative">
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="h-14 w-full appearance-none rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 text-[17px] text-white outline-none transition focus:border-[#7f6bff]"
                    >
                      {[
                        { value: "Full-time", label: p.fullTime },
                        { value: "Part-time", label: p.partTime },
                        { value: "Contract", label: p.contract },
                        { value: "Internship", label: p.internship },
                      ].map((type) => (
                        <option
                          key={type.value}
                          value={type.value}
                          style={{
                            backgroundColor: "#2f2d68",
                            color: "white",
                          }}
                        >
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-white/45 ${
                        isRTL ? "left-4" : "right-4"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-3 block text-[16px] font-medium text-white/75">
                    {p.minExperienceYears}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={minExperience}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || Number(value) >= 0) setMinExperience(value);
                    }}
                    placeholder={p.experiencePlaceholder}
                    className="h-14 text-[17px]"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-[16px] font-medium text-white/75">
                    {p.salaryRange}
                  </label>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <Input
                      type="number"
                      min={0}
                      value={minSalary}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || Number(value) >= 0) setMinSalary(value);
                      }}
                      placeholder={p.min}
                      className="h-14 text-[17px]"
                    />
                    <span className="text-white/40">-</span>
                    <Input
                      type="number"
                      min={0}
                      value={maxSalary}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || Number(value) >= 0) setMaxSalary(value);
                      }}
                      placeholder={p.max}
                      className="h-14 text-[17px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-[16px] font-medium text-white/75">
                  {p.requiredSkills}
                </label>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder={p.addSkillPlaceholder}
                      className="h-14 text-[17px]"
                    />
                  </div>

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
            className={`flex flex-col-reverse items-stretch justify-end gap-4 sm:flex-row sm:items-center sm:gap-5 ${
              isRTL ? "sm:justify-start" : ""
            }`}
          >
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="inline-flex h-14 items-center justify-center rounded-[14px] bg-white px-8 text-[16px] font-bold text-[#2a265f] shadow-[0_10px_24px_rgba(255,255,255,0.12)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {p.saveAsDraft}
            </button>

            <Button
              type="button"
              variant="primary"
              size="lg"
              icon={<Save size={18} />}
              loading={isSubmitting}
              onClick={handlePostJob}
            >
              {isSubmitting ? p.posting : p.postJob}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PostJob;