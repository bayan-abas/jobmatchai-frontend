import { useEffect, useState } from "react";
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
  Target,
  Plus,
  Link2,
  GitFork,
  CalendarDays,
  Tag,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { apiFetch } from "../utils/api";

type BackendApplicant = {
  matchPercent: number | null;
};

// LinkedIn/GitHub are stored as free text (e.g. "linkedin.com/company/x") - without a
// protocol prefix an <a href> resolves as a relative link on this same site instead of
// actually leaving it, so this adds "https://" only when one isn't already present.
function withProtocol(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function CompanyProfile() {
  const { language } = useLanguage();
  const { user, refreshUser } = useAuth();
  const t = translations[language];
  const c = t.companyProfilePage;
  const isRTL = language === "ar" || language === "he";

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [companyData, setCompanyData] = useState({
    companyName: user?.name || c.defaultCompanyName,
    industry: user?.industry || c.defaultIndustry,
    companySize: user?.companySize || c.defaultCompanySize,
    location: user?.location || c.defaultLocation,
    website: user?.website || c.defaultWebsite,
    // Unlike the other fields, description has no baked-in placeholder value - an empty
    // one gets its own friendly empty state below instead of a fallback string that could
    // get silently saved as the "real" description the moment the user hits Save.
    description: user?.companyDescription || "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
    founded: user?.founded || "",
    companyType: user?.companyType || "",
  });

  const [jobsCount, setJobsCount] = useState<number | null>(null);
  const [applicationsCount, setApplicationsCount] = useState<number | null>(null);
  const [avgMatchScore, setAvgMatchScore] = useState<number | null>(null);

  useEffect(() => {
    setCompanyData({
      companyName: user?.name || c.defaultCompanyName,
      industry: user?.industry || c.defaultIndustry,
      companySize: user?.companySize || c.defaultCompanySize,
      location: user?.location || c.defaultLocation,
      website: user?.website || c.defaultWebsite,
      description: user?.companyDescription || "",
      linkedin: user?.linkedin || "",
      github: user?.github || "",
      founded: user?.founded || "",
      companyType: user?.companyType || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;

    let cancelled = false;

    Promise.all([
      apiFetch(`/api/jobs/company/${user.email}`).catch(() => []),
      apiFetch("/api/applications/company").catch(() => []),
    ]).then(([jobs, apps]) => {
      if (cancelled) return;

      setJobsCount(Array.isArray(jobs) ? jobs.length : 0);

      const applications: BackendApplicant[] = Array.isArray(apps) ? apps : [];
      setApplicationsCount(applications.length);

      const scored = applications.filter((a) => typeof a.matchPercent === "number");
      setAvgMatchScore(
        scored.length > 0
          ? Math.round(scored.reduce((sum, a) => sum + (a.matchPercent as number), 0) / scored.length)
          : null
      );
    });

    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaveError("");
    setIsSaving(true);

    try {
      await apiFetch(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: companyData.companyName,
          location: companyData.location,
          industry: companyData.industry,
          companySize: companyData.companySize,
          website: companyData.website,
          companyDescription: companyData.description,
          linkedin: companyData.linkedin,
          github: companyData.github,
          founded: companyData.founded,
          companyType: companyData.companyType,
        }),
      });

      await refreshUser();
      setIsEditing(false);
    } catch {
      setSaveError(
        c.saveError || "Could not save your changes. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
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

            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              {saveError && (
                <p className="text-sm text-rose-300">{saveError}</p>
              )}
              <button
                disabled={isSaving}
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-60 ${
                  isRTL ? "flex-row-reverse" : ""
                } ${
                  isEditing
                    ? "rounded-lg bg-green-500 hover:bg-green-600 shadow-md"
                    : "rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/20 hover:scale-[1.02]"
                }`}
              >
                <Pencil size={16} />
                {isSaving ? c.saving || "Saving..." : isEditing ? c.saveChanges : c.editProfile}
              </button>
            </div>
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

              <div className="mt-8 grid w-full grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center">
                  <BriefcaseBusiness size={16} className="mx-auto mb-2 text-violet-300" />
                  <p className="text-xl font-bold text-white">{jobsCount ?? "—"}</p>
                  <p className="mt-1 text-[11px] leading-tight text-white/50">{c.statActiveJobs || "Active Jobs"}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center">
                  <FileText size={16} className="mx-auto mb-2 text-violet-300" />
                  <p className="text-xl font-bold text-white">{applicationsCount ?? "—"}</p>
                  <p className="mt-1 text-[11px] leading-tight text-white/50">{c.statTotalApplications || "Total Applications"}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center">
                  <Target size={16} className="mx-auto mb-2 text-violet-300" />
                  <p className="text-xl font-bold text-white">{avgMatchScore !== null ? `${avgMatchScore}%` : "—"}</p>
                  <p className="mt-1 text-[11px] leading-tight text-white/50">{c.statAvgMatchScore || "Avg Match Score"}</p>
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
                {/* Email isn't editable here - changing an account's login email is a
                    separate, more sensitive flow than a general profile update. */}
                <p className="break-all text-lg font-medium">{user?.email || ""}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Link2 size={16} />
                  {c.linkedin || "LinkedIn"}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="linkedin"
                    value={companyData.linkedin}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none"
                  />
                ) : companyData.linkedin.trim() ? (
                  <a
                    href={withProtocol(companyData.linkedin.trim())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-lg font-medium text-violet-300 transition hover:text-violet-200 hover:underline"
                  >
                    {companyData.linkedin}
                  </a>
                ) : (
                  <p className="text-lg font-medium text-white/40">{c.notProvided || "Not provided"}</p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <GitFork size={16} />
                  {c.github || "GitHub"}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="github"
                    value={companyData.github}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none"
                  />
                ) : companyData.github.trim() ? (
                  <a
                    href={withProtocol(companyData.github.trim())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-lg font-medium text-violet-300 transition hover:text-violet-200 hover:underline"
                  >
                    {companyData.github}
                  </a>
                ) : (
                  <p className="text-lg font-medium text-white/40">{c.notProvided || "Not provided"}</p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <CalendarDays size={16} />
                  {c.founded || "Founded"}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    name="founded"
                    value={companyData.founded}
                    onChange={handleChange}
                    placeholder="2022"
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none"
                  />
                ) : (
                  <p className="text-lg font-medium">
                    {companyData.founded.trim() || (
                      <span className="text-white/40">{c.notProvided || "Not provided"}</span>
                    )}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Tag size={16} />
                  {c.companyType || "Company Type"}
                </div>
                {isEditing ? (
                  <select
                    name="companyType"
                    value={companyData.companyType}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none"
                  >
                    <option value="" className="bg-[#1d2258] text-white/50">
                      {c.selectCompanyType || "Select company type"}
                    </option>
                    <option value={c.companyTypeStartup || "Startup"} className="bg-[#1d2258] text-white">
                      {c.companyTypeStartup || "Startup"}
                    </option>
                    <option value={c.companyTypePrivate || "Private Company"} className="bg-[#1d2258] text-white">
                      {c.companyTypePrivate || "Private Company"}
                    </option>
                    <option value={c.companyTypeEnterprise || "Enterprise"} className="bg-[#1d2258] text-white">
                      {c.companyTypeEnterprise || "Enterprise"}
                    </option>
                    <option value={c.companyTypeNonprofit || "Non-profit"} className="bg-[#1d2258] text-white">
                      {c.companyTypeNonprofit || "Non-profit"}
                    </option>
                  </select>
                ) : (
                  <p className="text-lg font-medium">
                    {companyData.companyType.trim() || (
                      <span className="text-white/40">{c.notProvided || "Not provided"}</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className={`mb-3 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                <FileText size={16} />
                {c.aboutCompany || "About Company"}
              </div>
              {isEditing ? (
                <textarea
                  name="description"
                  value={companyData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder={c.noDescriptionText || "Tell candidates about your company, culture and mission."}
                  className="w-full rounded-2xl bg-white/10 px-4 py-4 text-white outline-none"
                />
              ) : companyData.description.trim() ? (
                <p className="text-lg leading-8 text-white/85">
                  {companyData.description}
                </p>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-8 text-center">
                  <p className="text-white/50">
                    {c.noDescriptionText || "Tell candidates about your company, culture and mission."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
                  >
                    <Plus size={15} />
                    {c.addDescription || "Add Description"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;
