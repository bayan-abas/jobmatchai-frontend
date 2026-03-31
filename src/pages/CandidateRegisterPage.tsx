import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  Lock,
  Phone,
  MapPin,
  Briefcase,
  Sparkles,
  X,
  FileText,
  Upload,
} from "lucide-react";

function CandidateRegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    currentTitle: "",
    experience: "",
    summary: "",
  });

  const [selectedSkill, setSelectedSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [resumeName, setResumeName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const jobTitles = [
    "Student",
    "Software Developer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "UI/UX Designer",
    "Product Designer",
    "Graphic Designer",
    "Data Analyst",
    "Business Analyst",
    "System Analyst",
    "Project Manager",
    "Product Manager",
    "QA Engineer",
    "DevOps Engineer",
    "Cyber Security Analyst",
    "Cloud Engineer",
    "Network Engineer",
    "Database Administrator",
    "Machine Learning Engineer",
    "AI Engineer",
    "HR Specialist",
    "Recruiter",
    "Marketing Specialist",
    "Digital Marketer",
    "Sales Representative",
    "Customer Support",
    "Teacher",
    "Accountant",
    "Financial Analyst",
    "Lawyer",
    "Doctor",
    "Nurse",
    "Pharmacist",
    "Architect",
    "Civil Engineer",
    "Mechanical Engineer",
    "Electrical Engineer",
    "Content Creator",
    "Social Media Manager",
    "Photographer",
    "Video Editor",
    "Translator",
    "Administrative Assistant",
    "Operations Manager",
    "Other",
  ];

  const experienceOptions = [
    "No experience",
    "Less than 1 year",
    "1 year",
    "2 years",
    "3 years",
    "4 years",
    "5 years",
    "6 years",
    "7 years",
    "8 years",
    "9 years",
    "10+ years",
  ];

  const allSkills = [
    "Communication",
    "Teamwork",
    "Leadership",
    "Problem Solving",
    "Critical Thinking",
    "Time Management",
    "Creativity",
    "Adaptability",
    "Presentation Skills",
    "Negotiation",
    "Sales",
    "Customer Service",
    "Project Management",
    "Marketing",
    "Digital Marketing",
    "SEO",
    "Content Writing",
    "Copywriting",
    "Social Media",
    "Branding",
    "Recruitment",
    "HR Management",
    "Accounting",
    "Bookkeeping",
    "Financial Analysis",
    "Excel",
    "Word",
    "PowerPoint",
    "Data Entry",
    "Research",
    "Teaching",
    "Training",
    "Coaching",
    "Public Speaking",
    "Translation",
    "Arabic",
    "Hebrew",
    "English",
    "French",
    "German",
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "C",
    "C++",
    "C#",
    "PHP",
    "Kotlin",
    "Swift",
    "Go",
    "Rust",
    "SQL",
    "HTML",
    "CSS",
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Express.js",
    "Spring Boot",
    "Django",
    "Flask",
    "Laravel",
    "REST APIs",
    "GraphQL",
    "Git",
    "GitHub",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "Google Cloud",
    "Linux",
    "Networking",
    "Cybersecurity",
    "Penetration Testing",
    "Machine Learning",
    "Deep Learning",
    "Data Analysis",
    "Data Visualization",
    "Power BI",
    "Tableau",
    "Figma",
    "Adobe Photoshop",
    "Illustrator",
    "Video Editing",
    "Photography",
    "AutoCAD",
    "SAP",
    "CRM",
    "ERP",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeName(file.name);
  };

  const removeResume = () => {
    setResumeName("");
  };

  const addSkill = () => {
    if (!selectedSkill) return;
    if (skills.includes(selectedSkill)) return;
    setSkills((prev) => [...prev, selectedSkill]);
    setSelectedSkill("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const {
      fullName,
      email,
      password,
      confirmPassword,
      phone,
      location,
      currentTitle,
      experience,
      summary,
    } = formData;

    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      !location ||
      !currentTitle ||
      !experience
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const existingCandidates = JSON.parse(
      localStorage.getItem("candidates") || "[]"
    );

    const emailExists = existingCandidates.some(
      (candidate: any) => candidate.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      setError("This email is already registered.");
      return;
    }

    const candidateSummary =
      summary.trim() ||
      "Passionate professional looking for great opportunities and continuous growth.";

    const newCandidate = {
      name: fullName,
      email,
      password,
      role: "candidate",
      phone,
      location,
      currentTitle,
      experience,
      skills,
      summary: candidateSummary,
      resumeName,
      createdAt: new Date().toISOString(),
    };

    existingCandidates.push(newCandidate);
    localStorage.setItem("candidates", JSON.stringify(existingCandidates));

    localStorage.setItem("registeredUser", JSON.stringify(newCandidate));
    localStorage.setItem("name", fullName);
    localStorage.setItem("email", email);
    localStorage.setItem("role", "candidate");
    localStorage.setItem("phone", phone);
    localStorage.setItem("location", location);
    localStorage.setItem("currentTitle", currentTitle);
    localStorage.setItem("experience", experience);
    localStorage.setItem("skills", JSON.stringify(skills));
    localStorage.setItem("summary", candidateSummary);
    localStorage.setItem("resumeName", resumeName);
    localStorage.setItem("isFirstLogin", "true");

    setSuccess("Candidate account created successfully!");

    setTimeout(() => {
      navigate("/candidate-dashboard");
    }, 1200);
  };

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3.5 text-white placeholder:text-white/40 outline-none transition focus:border-cyan-400/60 focus:bg-white/10";

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="grid min-h-[760px] lg:grid-cols-2">
          <div className="relative hidden overflow-hidden lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.22),transparent_30%)]" />
            <div className="relative z-10 flex w-full flex-col justify-between p-10">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
                  <UserRound size={16} />
                  Candidate Portal
                </div>

                <h1 className="max-w-md text-4xl font-extrabold leading-tight text-white">
                  Create your profile and discover smarter opportunities.
                </h1>

                <p className="mt-5 max-w-lg text-[16px] leading-7 text-white/70">
                  Build your candidate account to showcase your skills,
                  experience, and career goals in one clean and modern space.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-white/50">
                    Why candidates use JobMatchAI
                  </p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-white/80">
                      Build a professional profile
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-white/80">
                      Highlight your skills and strengths
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-white/80">
                      Get matched with better opportunities
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <button
              onClick={() => navigate(-1)}
              className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              ← Back
            </button>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white">
                Create Candidate Account
              </h2>
              <p className="mt-2 text-white/60">
                Enter your details to start your journey.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="relative">
                  <UserRound
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    size={18}
                  />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    size={18}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    size={18}
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    size={18}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    size={18}
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    size={18}
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Briefcase
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    size={18}
                  />
                  <select
                    name="currentTitle"
                    value={formData.currentTitle}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="" className="text-black">
                      Select Current Title
                    </option>
                    {jobTitles.map((title) => (
                      <option key={title} value={title} className="text-black">
                        {title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Sparkles
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    size={18}
                  />
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="" className="text-black">
                      Years of Experience
                    </option>
                    {experienceOptions.map((exp) => (
                      <option key={exp} value={exp} className="text-black">
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-white/75">
                    Skills
                  </label>

                  <div className="flex gap-3 max-md:flex-col">
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition focus:border-cyan-400/60 focus:bg-white/10"
                    >
                      <option value="" className="text-black">
                        Select a skill
                      </option>
                      {allSkills.map((skill) => (
                        <option
                          key={skill}
                          value={skill}
                          className="text-black"
                        >
                          {skill}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={addSkill}
                      className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 font-bold text-white shadow-[0_12px_30px_rgba(34,211,238,0.25)] transition hover:scale-[1.01]"
                    >
                      Add
                    </button>
                  </div>

                  {skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-white/60 transition hover:text-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative md:col-span-2">
                  <FileText
                    className="absolute left-4 top-5 text-white/40"
                    size={18}
                  />
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Write a short summary about yourself, your background, your goals, and what kind of opportunities you are looking for..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3.5 text-white placeholder:text-white/40 outline-none transition resize-none focus:border-cyan-400/60 focus:bg-white/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-white/75">
                    Upload Resume (Optional)
                  </label>

                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                          <Upload size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-white">
                            {resumeName || "No file selected"}
                          </p>
                          <p className="text-xs text-white/50">
                            PDF, DOC, or DOCX — optional
                          </p>
                        </div>
                      </div>

                      <label className="cursor-pointer rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(34,211,238,0.25)] transition hover:scale-[1.01]">
                        Choose File
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {resumeName && (
                      <button
                        type="button"
                        onClick={removeResume}
                        className="mt-3 text-sm font-medium text-red-300 transition hover:text-red-200"
                      >
                        Remove file
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-4 text-base font-bold text-white shadow-[0_12px_30px_rgba(34,211,238,0.25)] transition hover:scale-[1.01]"
              >
                Create Candidate Account
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-2xl border border-white/15 bg-white/[0.03] px-5 py-3.5 font-semibold text-[#dce7ff] transition hover:bg-white/[0.06]"
                >
                  Already have an account?
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/register/company")}
                  className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-3.5 font-semibold text-cyan-100 transition hover:bg-cyan-400/10"
                >
                  Switch to Company Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateRegisterPage;