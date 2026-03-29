import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import { X } from "lucide-react";

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("candidate");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const [error, setError] = useState("");

  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

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

  const addSkill = () => {
    if (!selectedSkill) return;
    if (skills.includes(selectedSkill)) return;
    setSkills([...skills, selectedSkill]);
    setSelectedSkill("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError(
        role === "candidate"
          ? "Please enter your full name."
          : "Please enter your company name."
      );
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const savedUserRaw = localStorage.getItem("registeredUser");
    if (savedUserRaw) {
      const savedUser = JSON.parse(savedUserRaw);
      if (savedUser.email === email) {
        setError("This email is already registered. Please log in.");
        return;
      }
    }

    const registeredUser = {
      name: fullName,
      email,
      password,
      role,
      phone,
      location,
      currentTitle,
      experience,
      skills,
      summary:
        "Passionate professional looking for great opportunities and continuous growth.",
    };

    localStorage.setItem("registeredUser", JSON.stringify(registeredUser));
    localStorage.setItem("name", fullName);
    localStorage.setItem("email", email);
    localStorage.setItem("role", role);
    localStorage.setItem("phone", phone);
    localStorage.setItem("location", location);
    localStorage.setItem("currentTitle", currentTitle);
    localStorage.setItem("experience", experience);
    localStorage.setItem("skills", JSON.stringify(skills));
    localStorage.setItem(
      "summary",
      "Passionate professional looking for great opportunities and continuous growth."
    );
    localStorage.setItem("isFirstLogin", "true");

    if (role === "candidate") {
      navigate("/candidate-dashboard");
    } else {
      navigate("/company-dashboard");
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#050a14_0%,#0b1220_100%)] text-white"
    >
      <div className="pointer-events-none fixed left-[-80px] top-[60px] z-0 h-[320px] w-[320px] rounded-full bg-[rgba(0,183,255,0.16)] blur-[120px]" />
      <div className="pointer-events-none fixed right-[-100px] top-[120px] z-0 h-[360px] w-[360px] rounded-full bg-[rgba(124,58,237,0.16)] blur-[120px]" />

      <div
        className={`absolute top-6 z-30 flex gap-2 ${
          isRTL ? "left-6" : "right-6"
        }`}
      >
        {["en", "ar", "he"].map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang as "en" | "ar" | "he")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              language === lang
                ? "bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-white shadow"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-10">
        <div className="mb-3 w-full max-w-[560px]">
          <button
            type="button"
            onClick={() => navigate("/")}
            className={`h-[38px] rounded-[12px] border border-white/10 bg-white/[0.04] px-3 text-sm text-[#d8e5ff] transition hover:bg-white/[0.08] ${
              isRTL ? "self-end" : "self-start"
            }`}
          >
            ← {t.common.back}
          </button>
        </div>

        <div className="w-full max-w-[560px] rounded-[30px] border border-white/[0.08] bg-white/[0.055] px-[30px] py-[34px] backdrop-blur-[20px]">
          <div className="mb-5 flex gap-3">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`h-12 flex-1 rounded-[14px] font-semibold ${
                role === "candidate"
                  ? "bg-gradient-to-r from-[#38bdf8] to-[#6366f1]"
                  : "bg-white/[0.04]"
              }`}
            >
              {t.common.candidate}
            </button>

            <button
              type="button"
              onClick={() => setRole("company")}
              className={`h-12 flex-1 rounded-[14px] font-semibold ${
                role === "company"
                  ? "bg-gradient-to-r from-[#38bdf8] to-[#6366f1]"
                  : "bg-white/[0.04]"
              }`}
            >
              {t.common.company}
            </button>
          </div>

          <form className="flex flex-col gap-3" onSubmit={handleRegister}>
            <label>
              {role === "candidate"
                ? t.common.fullName
                : t.common.companyName}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={
                role === "candidate"
                  ? t.registerPage.enterFullName
                  : t.registerPage.enterCompanyName
              }
              className="h-[52px] rounded-2xl bg-white/[0.05] px-4 outline-none"
            />

            <label>{t.common.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.common.enterEmail}
              className="h-[52px] rounded-2xl bg-white/[0.05] px-4 outline-none"
            />

            <label>{t.common.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.common.createPassword}
              className="h-[52px] rounded-2xl bg-white/[0.05] px-4 outline-none"
            />

            <label>{t.common.confirmPassword}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.common.confirmYourPassword}
              className="h-[52px] rounded-2xl bg-white/[0.05] px-4 outline-none"
            />

            <label>Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="h-[52px] rounded-2xl bg-white/[0.05] px-4 outline-none"
            />

            <label>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location"
              className="h-[52px] rounded-2xl bg-white/[0.05] px-4 outline-none"
            />

            <label>Current Title</label>
            <select
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              className="h-[52px] rounded-2xl bg-white/[0.05] px-4 outline-none"
            >
              <option value="" className="text-black">
                Select your title
              </option>
              {jobTitles.map((title) => (
                <option key={title} value={title} className="text-black">
                  {title}
                </option>
              ))}
            </select>

            <label>Years of Experience</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="h-[52px] rounded-2xl bg-white/[0.05] px-4 outline-none"
            >
              <option value="" className="text-black">
                Select your experience
              </option>
              {experienceOptions.map((exp) => (
                <option key={exp} value={exp} className="text-black">
                  {exp}
                </option>
              ))}
            </select>

            <label>Skills</label>
            <div className="flex gap-2">
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="h-[52px] flex-1 rounded-2xl bg-white/[0.05] px-4 outline-none"
              >
                <option value="" className="text-black">
                  Select a skill
                </option>
                {allSkills.map((skill) => (
                  <option key={skill} value={skill} className="text-black">
                    {skill}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={addSkill}
                className="rounded-2xl bg-gradient-to-r from-[#38bdf8] to-[#6366f1] px-5 font-semibold"
              >
                Add
              </button>
            </div>

            {skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2 text-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-white/80 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="mt-2 h-[52px] rounded-2xl bg-gradient-to-r from-[#38bdf8] to-[#6366f1] font-semibold"
            >
              {t.common.register}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="h-[52px] rounded-2xl border border-white/20"
            >
              {t.common.alreadyHaveAccount}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;