import { useState } from "react";
import {
  Building2,
  Users,
  MapPin,
  Globe,
  Mail,
  Pencil,
  ArrowLeft,
  BriefcaseBusiness,
  FileText,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

function CompanyProfile() {
  const { language } = useLanguage();
  const t = translations[language];
  const c = t.companyProfilePage;
  const isRTL = language === "ar" || language === "he";

  const getStoredValue = (keys: string[], fallback: string) => {
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value && value.trim() !== "") return value;
    }
    return fallback;
  };

  const [isEditing, setIsEditing] = useState(false);

  const [companyData, setCompanyData] = useState({
    companyName: getStoredValue(
      ["companyName", "name", "fullName", "registerCompanyName"],
      c.defaultCompanyName
    ),
    industry: getStoredValue(
      ["companyIndustry", "industry", "registerIndustry"],
      c.defaultIndustry
    ),
    companySize: getStoredValue(
      ["companySize", "size", "registerCompanySize"],
      c.defaultCompanySize
    ),
    location: getStoredValue(
      ["companyLocation", "location", "registerLocation"],
      c.defaultLocation
    ),
    website: getStoredValue(
      ["companyWebsite", "website", "registerWebsite"],
      c.defaultWebsite
    ),
    email: getStoredValue(
      ["companyEmail", "email", "userEmail", "registerEmail"],
      c.defaultEmail
    ),
    description: getStoredValue(
      ["companyDescription", "description", "registerDescription"],
      c.defaultDescription
    ),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    localStorage.setItem("companyName", companyData.companyName);
    localStorage.setItem("companyIndustry", companyData.industry);
    localStorage.setItem("companySize", companyData.companySize);
    localStorage.setItem("companyLocation", companyData.location);
    localStorage.setItem("companyWebsite", companyData.website);
    localStorage.setItem("companyEmail", companyData.email);
    localStorage.setItem("companyDescription", companyData.description);

    setIsEditing(false);
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`w-full min-h-screen px-6 md:px-10 lg:px-14 py-8 text-white ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="mx-auto max-w-[1500px]">
        <button
          onClick={() => window.history.back()}
          className={`mb-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          {t.common.back}
        </button>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
              <Building2 size={26} />
            </div>

            <div className={isRTL ? "text-right" : "text-left"}>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {c.title}
              </h1>
              <p className="mt-1 text-sm md:text-base text-white/60">
                {c.subtitle}
              </p>
            </div>
          </div>

            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition ${
                isRTL ? "flex-row-reverse" : ""
              } ${
                isEditing
                  ? "rounded-lg bg-green-500 hover:bg-green-600 shadow-md"
                  : "rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/20 hover:scale-[1.02]"
              }`}
            >
              <Pencil size={16} />
              {isEditing ? c.saveChanges : c.editProfile}
            </button>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[440px_1fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-[30px] bg-gradient-to-br from-violet-500 to-purple-600 text-5xl font-bold shadow-lg shadow-violet-500/30">
                {companyData.companyName.charAt(0).toUpperCase()}
              </div>

              {isEditing ? (
                <input
                  type="text"
                  name="companyName"
                  value={companyData.companyName}
                  onChange={handleChange}
                  className="mb-3 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center text-2xl font-bold text-white outline-none"
                />
              ) : (
                <h2 className="text-3xl font-bold">{companyData.companyName}</h2>
              )}

              {isEditing ? (
                <input
                  type="text"
                  name="industry"
                  value={companyData.industry}
                  onChange={handleChange}
                  className="mt-3 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center text-white outline-none"
                />
              ) : (
                <p className="mt-3 text-lg text-white/70">{companyData.industry}</p>
              )}

              <div className={`mt-8 w-full space-y-4 ${isRTL ? "text-right" : "text-left"}`}>
                <div className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white/80 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <MapPin size={18} className="text-violet-300" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={companyData.location}
                      onChange={handleChange}
                      className="w-full bg-transparent outline-none"
                    />
                  ) : (
                    <span>{companyData.location}</span>
                  )}
                </div>

                <div className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white/80 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Users size={18} className="text-violet-300" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="companySize"
                      value={companyData.companySize}
                      onChange={handleChange}
                      className="w-full bg-transparent outline-none"
                    />
                  ) : (
                    <span>{companyData.companySize}</span>
                  )}
                </div>

                <div className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white/80 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Mail size={18} className="text-violet-300" />
                  <span className="break-all">{companyData.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 md:p-10 shadow-2xl backdrop-blur-xl">
            <h3 className="mb-8 text-2xl font-bold">{c.companyInformation}</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Building2 size={16} />
                  {c.companyName}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="companyName"
                    value={companyData.companyName}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none"
                  />
                ) : (
                  <p className="text-lg font-medium">{companyData.companyName}</p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <BriefcaseBusiness size={16} />
                  {c.industry}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="industry"
                    value={companyData.industry}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none"
                  />
                ) : (
                  <p className="text-lg font-medium">{companyData.industry}</p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Users size={16} />
                  {c.companySize}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="companySize"
                    value={companyData.companySize}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none"
                  />
                ) : (
                  <p className="text-lg font-medium">{companyData.companySize}</p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <MapPin size={16} />
                  {c.location}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={companyData.location}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none"
                  />
                ) : (
                  <p className="text-lg font-medium">{companyData.location}</p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Globe size={16} />
                  {c.website}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="website"
                    value={companyData.website}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none"
                  />
                ) : (
                  <p className="break-all text-lg font-medium">{companyData.website}</p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Mail size={16} />
                  {c.contactEmail}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="email"
                    value={companyData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none"
                  />
                ) : (
                  <p className="break-all text-lg font-medium">{companyData.email}</p>
                )}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className={`mb-3 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                <FileText size={16} />
                {c.companyDescription}
              </div>
              {isEditing ? (
                <textarea
                  name="description"
                  value={companyData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full rounded-2xl bg-white/10 px-4 py-4 text-white outline-none"
                />
              ) : (
                <p className="text-lg leading-8 text-white/85">
                  {companyData.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;
