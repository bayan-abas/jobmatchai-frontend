import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Lock,
  LogOut,
  X,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";
import { Input, useToast } from "../components/ui";

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
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, refreshUser, logout } = useAuth();
  const t = translations[language];
  const c = t.companyProfilePage;
  const isRTL = language === "ar" || language === "he";
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
      toast.success(t.feedback.savedSuccessfully);
    } catch {
      toast.error(
        c.saveError || "Could not save your changes. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setChangePasswordError("");
    setChangePasswordSuccess(false);
  };

  const handleChangePassword = async () => {
    setChangePasswordError("");

    if (!currentPassword) {
      setChangePasswordError(c.currentPasswordRequired || "Please enter your current password.");
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError(c.passwordLength || "New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError(c.passwordsDontMatch || "New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setChangePasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setChangePasswordError(
        err instanceof ApiError ? err.message : c.changePasswordError || "Could not change your password. Please try again."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteConfirmText("");
    setDeleteError("");
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    setDeleteError("");

    if (!deletePassword) {
      setDeleteError(c.deletePasswordRequired || "Please enter your current password.");
      return;
    }

    if (deleteConfirmText !== "DELETE") {
      setDeleteError(c.deleteConfirmTextMismatch || "Please type DELETE to confirm.");
      return;
    }

    setIsDeleting(true);

    try {
      await apiFetch(`/api/users/${user.id}`, {
        method: "DELETE",
        body: JSON.stringify({ currentPassword: deletePassword }),
      });
      logout();
      navigate("/login");
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : c.deleteError || "Could not delete your account. Please try again."
      );
      setIsDeleting(false);
    }
  };

  return (
    <>
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

              <div className="mt-8 grid w-full grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <Input
                    type="text"
                    name="companyName"
                    value={companyData.companyName}
                    onChange={handleChange}
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
                  <Input
                    type="text"
                    name="industry"
                    value={companyData.industry}
                    onChange={handleChange}
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
                  <Input
                    type="text"
                    name="companySize"
                    value={companyData.companySize}
                    onChange={handleChange}
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
                  <Input
                    type="text"
                    name="location"
                    value={companyData.location}
                    onChange={handleChange}
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
                  <Input
                    type="text"
                    name="website"
                    value={companyData.website}
                    onChange={handleChange}
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
                  <Input
                    type="text"
                    name="linkedin"
                    value={companyData.linkedin}
                    onChange={handleChange}
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
                  <Input
                    type="text"
                    name="github"
                    value={companyData.github}
                    onChange={handleChange}
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
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    name="founded"
                    value={companyData.founded}
                    onChange={handleChange}
                    placeholder="2022"
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

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <h3 className="mb-6 text-2xl font-bold">{c.accountSettings || "Account Settings"}</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Mail size={16} />
                {c.accountEmail || "Email"}
              </div>
              <p className="break-all text-lg font-medium">{user?.email || ""}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Lock size={16} />
                {c.changePassword || "Change Password"}
              </div>
              <button
                type="button"
                onClick={() => {
                  setChangePasswordError("");
                  setChangePasswordSuccess(false);
                  setShowChangePasswordModal(true);
                }}
                className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
              >
                {c.changePassword || "Change Password"}
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={handleLogout}
              className={`inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <LogOut size={16} />
              {t.common.logout}
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-rose-500/30 bg-rose-500/[0.04] p-8 shadow-2xl backdrop-blur-xl">
          <div className={`mb-4 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <AlertTriangle size={22} className="text-rose-400" />
            <h3 className="text-2xl font-bold text-rose-300">{c.dangerZone || "Danger Zone"}</h3>
          </div>

          <p className="mb-6 text-base leading-7 text-white/70">
            {c.dangerZoneWarning ||
              "Permanently delete your company account and all associated data. This action cannot be undone."}
          </p>

          <button
            type="button"
            onClick={() => {
              setDeleteError("");
              setDeletePassword("");
              setDeleteConfirmText("");
              setShowDeleteModal(true);
            }}
            className={`inline-flex items-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Trash2 size={16} />
            {c.deleteAccount || "Delete My Account"}
          </button>
        </div>
      </div>
    </div>

    {showChangePasswordModal && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(1,4,19,0.72)] px-4 backdrop-blur-md"
        onClick={() => !isChangingPassword && closeChangePasswordModal()}
      >
        <div
          className="relative w-full max-w-[480px] rounded-[28px] border border-white/10 bg-[#181b4a] p-8 text-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {!isChangingPassword && (
            <button
              type="button"
              onClick={closeChangePasswordModal}
              className={`absolute top-5 text-white/50 transition hover:text-white ${
                isRTL ? "left-5" : "right-5"
              }`}
            >
              <X size={22} />
            </button>
          )}

          <div className="mb-5 flex justify-center">
            <div className="flex h-[70px] w-[70px] items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <Lock size={30} />
            </div>
          </div>

          <h2 className="mb-2 text-center text-2xl font-bold">
            {c.changePassword || "Change Password"}
          </h2>

          {changePasswordSuccess ? (
            <>
              <p className="mb-6 text-center text-white/70">
                {c.changePasswordSuccess || "Your password has been updated."}
              </p>
              <button
                type="button"
                onClick={closeChangePasswordModal}
                className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-base font-bold text-white transition hover:opacity-90"
              >
                {t.common.close || "Close"}
              </button>
            </>
          ) : (
            <>
              <p className="mb-6 text-center text-white/70">
                {c.changePasswordSubtitle || "Enter your current password and choose a new one."}
              </p>

              <div className="mb-4 space-y-4">
                <Input
                  type="password"
                  icon={<Lock size={18} />}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={c.currentPassword || "Current Password"}
                  disabled={isChangingPassword}
                />
                <Input
                  type="password"
                  icon={<Lock size={18} />}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={c.newPassword || "New Password"}
                  disabled={isChangingPassword}
                />
                <Input
                  type="password"
                  icon={<Lock size={18} />}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder={c.confirmNewPassword || "Confirm New Password"}
                  disabled={isChangingPassword}
                />
              </div>

              {changePasswordError && (
                <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {changePasswordError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 max-[420px]:grid-cols-1">
                <button
                  type="button"
                  onClick={closeChangePasswordModal}
                  disabled={isChangingPassword}
                  className="rounded-xl border border-white/15 bg-transparent px-5 py-3 text-base font-bold text-white transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t.common.cancel || "Cancel"}
                </button>

                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-base font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isChangingPassword
                    ? c.changingPassword || "Changing..."
                    : c.saveChanges || "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}

    {showDeleteModal && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(1,4,19,0.72)] px-4 backdrop-blur-md"
        onClick={() => !isDeleting && closeDeleteModal()}
      >
        <div
          className="relative w-full max-w-[520px] rounded-[28px] border border-rose-500/30 bg-[#181b4a] p-8 text-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {!isDeleting && (
            <button
              type="button"
              onClick={closeDeleteModal}
              className={`absolute top-5 text-white/50 transition hover:text-white ${
                isRTL ? "left-5" : "right-5"
              }`}
            >
              <X size={22} />
            </button>
          )}

          <div className="mb-5 flex justify-center">
            <div className="flex h-[70px] w-[70px] items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30">
              <Trash2 size={30} />
            </div>
          </div>

          <h2 className="mb-3 text-center text-2xl font-bold text-rose-300">
            {c.deleteConfirmTitle || "Delete your company account?"}
          </h2>

          <p className="mb-6 text-center text-sm leading-6 text-white/70">
            {c.deleteConfirmExplanation ||
              "This will permanently delete your company profile, every job you've posted, and every application submitted to those jobs. Candidate accounts and their other applications are not affected. This action cannot be undone."}
          </p>

          <div className="mb-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-white/60">
                {c.currentPassword || "Current Password"}
              </label>
              <Input
                type="password"
                icon={<Lock size={18} />}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder={c.currentPassword || "Current Password"}
                disabled={isDeleting}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">
                {c.deleteConfirmTypeLabel || "Type DELETE to confirm"}
              </label>
              <Input
                type="text"
                hasError
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                disabled={isDeleting}
              />
            </div>
          </div>

          {deleteError && (
            <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {deleteError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 max-[420px]:grid-cols-1">
            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={isDeleting}
              className="rounded-xl border border-white/15 bg-transparent px-5 py-3 text-base font-bold text-white transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t.common.cancel || "Cancel"}
            </button>

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmText !== "DELETE" || !deletePassword}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-3 text-base font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isDeleting ? c.deleting || "Deleting..." : c.permanentlyDeleteAccount || "Permanently Delete Account"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default CompanyProfile;
