import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Users,
  FileText,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

function CompanyRegisterPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  const t = translations[language];
  const tr = t.companyRegisterPage;
  const isRTL = language === "ar" || language === "he";

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    industry: "",
    companySize: "",
    website: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Marketing",
    "Retail",
    "Construction",
    "Hospitality",
    "Media",
    "Telecommunications",
    "Logistics",
    "Manufacturing",
    "Legal Services",
    "Consulting",
    "Human Resources",
    "Real Estate",
    "E-commerce",
    "Government",
    "NGO / Nonprofit",
    "Other",
  ];

  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const {
      companyName,
      email,
      password,
      confirmPassword,
      phone,
      location,
      industry,
      companySize,
      website,
      description,
    } = formData;

    const cleanCompanyName = companyName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();
    const cleanPhone = phone.trim();
    const cleanLocation = location.trim();
    const cleanWebsite = website.trim();
    const cleanDescription = description.trim();

    if (
      !cleanCompanyName ||
      !cleanEmail ||
      !cleanPassword ||
      !cleanConfirmPassword ||
      !cleanPhone ||
      !cleanLocation ||
      !industry ||
      !companySize
    ) {
      setError(tr.errors.requiredFields);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      setError(tr.errors.invalidEmail);
      return;
    }

    if (cleanPassword.length < 6) {
      setError(tr.errors.passwordLength);
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setError(tr.errors.passwordMismatch);
      return;
    }

    const existingCompanies = JSON.parse(localStorage.getItem("companies") || "[]");

    const emailExists = existingCompanies.some(
      (company: any) => company.email?.trim().toLowerCase() === cleanEmail
    );

    if (emailExists) {
      setError(tr.errors.emailExists);
      return;
    }

    const newCompany = {
      companyName: cleanCompanyName,
      email: cleanEmail,
      password: cleanPassword,
      phone: cleanPhone,
      location: cleanLocation,
      industry,
      companySize,
      website: cleanWebsite,
      description: cleanDescription,
      role: "company",
      createdAt: new Date().toISOString(),
    };

    existingCompanies.push(newCompany);
    localStorage.setItem("companies", JSON.stringify(existingCompanies));

    localStorage.setItem("currentUser", JSON.stringify(newCompany));
    localStorage.setItem("currentCompany", JSON.stringify(newCompany));
    localStorage.setItem("registeredUser", JSON.stringify(newCompany));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("role", "company");
    localStorage.setItem("name", newCompany.companyName);
    localStorage.setItem("email", newCompany.email);
    localStorage.setItem("phone", newCompany.phone);
    localStorage.setItem("location", newCompany.location);
    localStorage.setItem("industry", newCompany.industry);
    localStorage.setItem("companySize", newCompany.companySize);
    localStorage.setItem("website", newCompany.website);
    localStorage.setItem("description", newCompany.description);
    localStorage.setItem("isFirstLogin", "false");

    setSuccess(tr.success);

    setTimeout(() => {
      navigate("/company-dashboard");
    }, 900);
  };

  const inputClass = `w-full rounded-2xl border border-white/10 bg-white/5 ${
    isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"
  } py-3.5 text-white placeholder:text-white/40 outline-none transition focus:border-cyan-400/60 focus:bg-white/10`;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)] px-4 py-10"
    >
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="grid min-h-[760px] lg:grid-cols-2">
          <div className="relative hidden overflow-hidden lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.22),transparent_30%)]" />
            <div className="relative z-10 flex w-full flex-col justify-between p-10">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
                  <Building2 size={16} />
                  {tr.badge}
                </div>

                <h1 className="max-w-md text-4xl font-extrabold leading-tight text-white">
                  {tr.heroTitle}
                </h1>

                <p className="mt-5 max-w-lg text-[16px] leading-7 text-white/70">
                  {tr.heroText}
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-white/50">{tr.whyTitle}</p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-white/80">
                      {tr.why1}
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-white/80">
                      {tr.why2}
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-white/80">
                      {tr.why3}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                {t.common.back}
              </button>

              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                    language === "en"
                      ? "bg-cyan-400 text-slate-950"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("ar")}
                  className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                    language === "ar"
                      ? "bg-cyan-400 text-slate-950"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  AR
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("he")}
                  className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                    language === "he"
                      ? "bg-cyan-400 text-slate-950"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  HE
                </button>
              </div>
            </div>

            <div className={isRTL ? "mb-8 text-right" : "mb-8 text-left"}>
              <h2 className="text-3xl font-extrabold text-white">{tr.title}</h2>
              <p className="mt-2 text-white/60">{tr.subtitle}</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="relative">
                  <Building2 className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${isRTL ? "right-4" : "left-4"}`} size={18} />
                  <input
                    type="text"
                    name="companyName"
                    placeholder={t.common.companyName}
                    value={formData.companyName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${isRTL ? "right-4" : "left-4"}`} size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder={t.common.email}
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Lock className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${isRTL ? "right-4" : "left-4"}`} size={18} />
                  <input
                    type="password"
                    name="password"
                    placeholder={t.common.password}
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Lock className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${isRTL ? "right-4" : "left-4"}`} size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder={t.common.confirmPassword}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Phone className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${isRTL ? "right-4" : "left-4"}`} size={18} />
                  <input
                    type="text"
                    name="phone"
                    placeholder={t.candidateRegisterPage.phone}
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <MapPin className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${isRTL ? "right-4" : "left-4"}`} size={18} />
                  <input
                    type="text"
                    name="location"
                    placeholder={tr.companyLocation}
                    value={formData.location}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Briefcase className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${isRTL ? "right-4" : "left-4"}`} size={18} />
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="" className="text-black">
                      {tr.industry}
                    </option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry} className="text-black">
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Users className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${isRTL ? "right-4" : "left-4"}`} size={18} />
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="" className="text-black">
                      {tr.companySize}
                    </option>
                    {companySizes.map((size) => (
                      <option key={size} value={size} className="text-black">
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative md:col-span-2">
                  <Globe className={`absolute top-1/2 -translate-y-1/2 text-white/40 ${isRTL ? "right-4" : "left-4"}`} size={18} />
                  <input
                    type="text"
                    name="website"
                    placeholder={tr.website}
                    value={formData.website}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative md:col-span-2">
                  <FileText className={`absolute top-5 text-white/40 ${isRTL ? "right-4" : "left-4"}`} size={18} />
                  <textarea
                    name="description"
                    placeholder={tr.aboutPlaceholder}
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full rounded-2xl border border-white/10 bg-white/5 ${
                      isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"
                    } py-3.5 text-white placeholder:text-white/40 outline-none transition focus:border-cyan-400/60 focus:bg-white/10 resize-none`}
                  />
                </div>
              </div>

              {error && (
                <div className={`rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 ${isRTL ? "text-right" : "text-left"}`}>
                  {error}
                </div>
              )}

              {success && (
                <div className={`rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 ${isRTL ? "text-right" : "text-left"}`}>
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-4 text-base font-bold text-white shadow-[0_12px_30px_rgba(34,211,238,0.25)] transition hover:scale-[1.01]"
              >
                {tr.createAccount}
              </button>

              <p className={`text-sm text-white/55 ${isRTL ? "text-right" : "text-center"}`}>
                {t.common.alreadyHaveAccount}{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                >
                  {t.common.login}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyRegisterPage;