import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, Lock, Phone, MapPin, Globe, Briefcase, Users, FileText } from "lucide-react";

function CompanyRegisterPage() {
  const navigate = useNavigate();

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

    if (
      !companyName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      !location ||
      !industry ||
      !companySize
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const existingCompanies = JSON.parse(localStorage.getItem("companies") || "[]");

    const emailExists = existingCompanies.some(
      (company: any) => company.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      setError("This email is already registered.");
      return;
    }

    const newCompany = {
      companyName,
      email,
      password,
      phone,
      location,
      industry,
      companySize,
      website,
      description,
      role: "company",
      createdAt: new Date().toISOString(),
    };

    existingCompanies.push(newCompany);
    localStorage.setItem("companies", JSON.stringify(existingCompanies));

    setSuccess("Company account created successfully!");

    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3.5 text-white placeholder:text-white/40 outline-none transition focus:border-cyan-400/60 focus:bg-white/10";

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="grid min-h-[760px] lg:grid-cols-2">
          {/* Left Side */}
          <div className="relative hidden overflow-hidden lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.22),transparent_30%)]" />
            <div className="relative z-10 flex w-full flex-col justify-between p-10">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
                  <Building2 size={16} />
                  Company Portal
                </div>

                <h1 className="max-w-md text-4xl font-extrabold leading-tight text-white">
                  Build your team with smarter hiring.
                </h1>

                <p className="mt-5 max-w-lg text-[16px] leading-7 text-white/70">
                  Create your company account to publish opportunities, discover matching candidates,
                  and manage your recruitment flow in one modern dashboard.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-white/50">Why companies use JobMatchAI</p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-white/80">
                      Smart candidate matching
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-white/80">
                      Clean hiring workflow
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-white/80">
                      Faster screening experience
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="p-6 sm:p-8 lg:p-10">
            <button
              onClick={() => navigate(-1)}
              className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              ← Back
            </button>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white">Create Company Account</h2>
              <p className="mt-2 text-white/60">
                Enter your company details to get started.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Company Email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
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
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
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
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
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
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
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
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="" className="text-black">
                      Select Industry
                    </option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry} className="text-black">
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="" className="text-black">
                      Company Size
                    </option>
                    {companySizes.map((size) => (
                      <option key={size} value={size} className="text-black">
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative md:col-span-2">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="text"
                    name="website"
                    placeholder="Website (optional)"
                    value={formData.website}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="relative md:col-span-2">
                  <FileText className="absolute left-4 top-5 text-white/40" size={18} />
                  <textarea
                    name="description"
                    placeholder="Company Description (optional)"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3.5 text-white placeholder:text-white/40 outline-none transition focus:border-cyan-400/60 focus:bg-white/10 resize-none"
                  />
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
                Create Company Account
              </button>

              <p className="text-center text-sm text-white/55">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                >
                  Sign In
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