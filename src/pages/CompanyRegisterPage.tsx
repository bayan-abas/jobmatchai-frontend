import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
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
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";
import EmailVerificationModal from "../components/EmailVerificationModal";
import { Button, FormField, Input, useToast } from "../components/ui";

type FieldErrors = Partial<
  Record<
    "companyName" | "email" | "password" | "confirmPassword" | "phone" | "location" | "industry" | "companySize",
    string
  >
>;

function CompanyRegisterPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { login } = useAuth();
  const toast = useToast();

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

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pendingRegistration, setPendingRegistration] = useState<null | {
    companyName: string;
    email: string;
    password: string;
    phone: string;
    location: string;
    industry: string;
    companySize: string;
    website: string;
    description: string;
  }>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setFieldErrors({});

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

    const requiredMessage = t?.common?.required || "Required";
    const missing: FieldErrors = {};
    if (!cleanCompanyName) missing.companyName = requiredMessage;
    if (!cleanEmail) missing.email = requiredMessage;
    if (!cleanPassword) missing.password = requiredMessage;
    if (!cleanConfirmPassword) missing.confirmPassword = requiredMessage;
    if (!cleanPhone) missing.phone = requiredMessage;
    if (!cleanLocation) missing.location = requiredMessage;
    if (!industry) missing.industry = requiredMessage;
    if (!companySize) missing.companySize = requiredMessage;

    if (Object.keys(missing).length > 0) {
      setFieldErrors(missing);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      setFieldErrors({ email: tr.errors.invalidEmail });
      return;
    }

    if (cleanPassword.length < 6) {
      setFieldErrors({ password: tr.errors.passwordLength });
      return;
    }

    if (!/[A-Za-z]/.test(cleanPassword) || !/\d/.test(cleanPassword)) {
      setFieldErrors({ password: tr.errors.passwordComplexity });
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setFieldErrors({ confirmPassword: tr.errors.passwordMismatch });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch("/api/auth/send-verification-code", {
        method: "POST",
        body: JSON.stringify({ email: cleanEmail }),
      });

      setPendingRegistration({
        companyName: cleanCompanyName,
        email: cleanEmail,
        password: cleanPassword,
        phone: cleanPhone,
        location: cleanLocation,
        industry,
        companySize,
        website: cleanWebsite,
        description: cleanDescription,
      });
      setShowVerificationModal(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof ApiError
          ? error.message
          : t?.verificationModal?.sendCodeFailed || "Couldn't send a verification code. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndRegister = async (code: string) => {
    if (!pendingRegistration) return;
    const { companyName, email, password, phone, location, industry, companySize, website, description } =
      pendingRegistration;

    const data = await apiFetch("/api/users/register", {
      method: "POST",
      body: JSON.stringify({
        name: companyName,
        email,
        password,
        role: "company",
        phone,
        verificationCode: code,
      }),
    });

    if (!data.success) {
      throw new Error(data.message || "Registration failed.");
    }

    const loginData = await apiFetch("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!loginData.success) {
      throw new Error(
        loginData.message || "Registration succeeded, but automatic login failed. Please log in."
      );
    }

    login(loginData.token, loginData.user);

    try {
      await apiFetch(`/api/users/${loginData.user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          phone,
          location,
          industry,
          companySize,
          website,
          companyDescription: description,
        }),
      });
    } catch (profileError) {
      console.error(profileError);
    }

    setShowVerificationModal(false);
    toast.success(tr.success);

    setTimeout(() => {
      navigate("/company-dashboard");
    }, 900);
  };

  const handleResendCode = async () => {
    if (!pendingRegistration) return;
    await apiFetch("/api/auth/send-verification-code", {
      method: "POST",
      body: JSON.stringify({ email: pendingRegistration.email }),
    });
  };

  const selectClass = (hasError?: boolean) =>
    `w-full appearance-none rounded-control border bg-white/5 py-3.5 text-white outline-none transition placeholder:text-white/40 focus:bg-white/10 ${
      hasError ? "border-danger-400/60 focus:border-danger-400" : "border-white/10 focus:border-brand-400/60"
    } ${isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"}`;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)] px-4 py-10"
    >
      <div className="mx-auto max-w-6xl overflow-hidden rounded-panel border border-white/10 bg-white/5 shadow-elevated backdrop-blur-xl">
        <div className="grid lg:min-h-[760px] lg:grid-cols-2">
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
              <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
                {t.common.back}
              </Button>

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

            <form onSubmit={handleRegister} className="space-y-5" noValidate>
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label={t.common.companyName} htmlFor="company-name" error={fieldErrors.companyName}>
                  <Input
                    id="company-name"
                    type="text"
                    name="companyName"
                    icon={<Building2 size={18} />}
                    placeholder={t.common.companyName}
                    value={formData.companyName}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    hasError={!!fieldErrors.companyName}
                  />
                </FormField>

                <FormField label={t.common.email} htmlFor="company-email" error={fieldErrors.email}>
                  <Input
                    id="company-email"
                    type="email"
                    name="email"
                    icon={<Mail size={18} />}
                    placeholder={t.common.email}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    hasError={!!fieldErrors.email}
                  />
                </FormField>

                <FormField label={t.common.password} htmlFor="company-password" error={fieldErrors.password}>
                  <Input
                    id="company-password"
                    type="password"
                    name="password"
                    icon={<Lock size={18} />}
                    placeholder={t.common.password}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    hasError={!!fieldErrors.password}
                  />
                </FormField>

                <FormField
                  label={t.common.confirmPassword}
                  htmlFor="company-confirmPassword"
                  error={fieldErrors.confirmPassword}
                >
                  <Input
                    id="company-confirmPassword"
                    type="password"
                    name="confirmPassword"
                    icon={<Lock size={18} />}
                    placeholder={t.common.confirmPassword}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    hasError={!!fieldErrors.confirmPassword}
                  />
                </FormField>

                <FormField label={t.candidateRegisterPage.phone} htmlFor="company-phone" error={fieldErrors.phone}>
                  <Input
                    id="company-phone"
                    type="text"
                    name="phone"
                    icon={<Phone size={18} />}
                    placeholder={t.candidateRegisterPage.phone}
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    hasError={!!fieldErrors.phone}
                  />
                </FormField>

                <FormField label={tr.companyLocation} htmlFor="company-location" error={fieldErrors.location}>
                  <Input
                    id="company-location"
                    type="text"
                    name="location"
                    icon={<MapPin size={18} />}
                    placeholder={tr.companyLocation}
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    hasError={!!fieldErrors.location}
                  />
                </FormField>

                <FormField label={tr.industry} htmlFor="company-industry" error={fieldErrors.industry}>
                  <div className="relative">
                    <Briefcase
                      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-white/40 ${isRTL ? "right-4" : "left-4"}`}
                      size={18}
                    />
                    <select
                      id="company-industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={selectClass(!!fieldErrors.industry)}
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
                </FormField>

                <FormField label={tr.companySize} htmlFor="company-size" error={fieldErrors.companySize}>
                  <div className="relative">
                    <Users
                      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-white/40 ${isRTL ? "right-4" : "left-4"}`}
                      size={18}
                    />
                    <select
                      id="company-size"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={selectClass(!!fieldErrors.companySize)}
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
                </FormField>

                <div className="md:col-span-2">
                  <FormField label={tr.website} htmlFor="company-website">
                    <Input
                      id="company-website"
                      type="text"
                      name="website"
                      icon={<Globe size={18} />}
                      placeholder={tr.website}
                      value={formData.website}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label={tr.aboutCompany} htmlFor="company-description">
                    <div className="relative">
                      <FileText
                        className={`pointer-events-none absolute top-5 text-white/40 ${isRTL ? "right-4" : "left-4"}`}
                        size={18}
                      />
                      <textarea
                        id="company-description"
                        name="description"
                        placeholder={tr.aboutPlaceholder}
                        value={formData.description}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        rows={5}
                        className={`w-full rounded-control border border-white/10 bg-white/5 ${
                          isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"
                        } py-3.5 text-white placeholder:text-white/40 outline-none transition focus:border-brand-400/60 focus:bg-white/10 resize-none`}
                      />
                    </div>
                  </FormField>
                </div>
              </div>

              <Button type="submit" fullWidth loading={isSubmitting}>
                {tr.createAccount}
              </Button>

              <p className="text-sm text-white/55 text-center">
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

      <AnimatePresence>
        {showVerificationModal && pendingRegistration && (
          <EmailVerificationModal
            email={pendingRegistration.email}
            t={t}
            isRTL={isRTL}
            onVerify={handleVerifyAndRegister}
            onResend={handleResendCode}
            onClose={() => setShowVerificationModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default CompanyRegisterPage;
