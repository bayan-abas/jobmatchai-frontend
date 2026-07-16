import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../utils/api";
import { FREE_PLAN_LIMIT } from "../utils/applicationLimit";
import { ISRAELI_CITIES } from "../utils/israeliCities";
import { JOB_TITLES, EXPERIENCE_OPTIONS, ALL_SKILLS } from "../utils/candidateOptions";
import SearchableSelect from "../components/SearchableSelect";
import {
  ArrowLeft,
  User,
  Crown,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Code2,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Zap,
  Plus,
  Lock,
  Loader2,
  FileText,
} from "lucide-react";

export type ProfileCompletenessFields = {
  name: string;
  phone: string;
  location: string;
  currentTitle: string;
  experience: string;
  summary: string;
  skills: string[];
  hasResume: boolean;
};

export function computeProfileCompleteness(fields: ProfileCompletenessFields): number {
  const checks = [
    fields.name.trim().length > 0,
    fields.phone.trim().length > 0,
    fields.location.trim().length > 0,
    fields.currentTitle.trim().length > 0,
    fields.experience.trim().length > 0,
    fields.summary.trim().length > 0,
    fields.skills.length > 0,
    fields.hasResume,
  ];

  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

function ProfilePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, refreshUser, logout } = useAuth();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);

  const [userName, setUserName] = useState(user?.name || "");
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [userPhone, setUserPhone] = useState(user?.phone || "");
  const [userLocation, setUserLocation] = useState(user?.location || "");
  const [userTitle, setUserTitle] = useState(user?.currentTitle || "");
  const [userExperience, setUserExperience] = useState(
    user?.yearsOfExperience || ""
  );
  const [userSummary, setUserSummary] = useState(
    user?.professionalSummary || ""
  );
  const [userSkills, setUserSkills] = useState<string[]>(() => {
    if (!user?.skills) return [];
    return user.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
  });
  const [skillDraft, setSkillDraft] = useState("");
  const [hasResume, setHasResume] = useState(false);
  const [resumeStatusLoading, setResumeStatusLoading] = useState(true);
  const [applicationsCount, setApplicationsCount] = useState(0);

  useEffect(() => {
    setUserName(user?.name || "");
    setUserEmail(user?.email || "");
    setUserPhone(user?.phone || "");
    setUserLocation(user?.location || "");
    setUserTitle(user?.currentTitle || "");
    setUserExperience(user?.yearsOfExperience || "");
    setUserSummary(user?.professionalSummary || "");

    const parsedSkills = user?.skills
      ? user.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0)
      : [];
    setUserSkills(parsedSkills);
  }, [user]);

  useEffect(() => {
    if (!userEmail) return;

    apiFetch(`/api/applications/candidate/${encodeURIComponent(userEmail)}`)
      .then((apps) => {
        const list = Array.isArray(apps) ? apps : [];
        const currentMonthPrefix = new Date().toISOString().slice(0, 7);
        const thisMonthCount = list.filter(
          (app: any) =>
            typeof app.appliedDate === "string" && app.appliedDate.startsWith(currentMonthPrefix)
        ).length;
        setApplicationsCount(thisMonthCount);
      })
      .catch(() => setApplicationsCount(0));

    apiFetch(`/api/cv/current`)
      .then((fileName) => setHasResume(Boolean(fileName && fileName.trim())))
      .catch(() => {})
      .finally(() => setResumeStatusLoading(false));
  }, [userEmail]);

  const profileScore = computeProfileCompleteness({
    name: userName,
    phone: userPhone,
    location: userLocation,
    currentTitle: userTitle,
    experience: userExperience,
    summary: userSummary,
    skills: userSkills,
    hasResume,
  });

  const handleAddSkill = (skill: string) => {
    const cleanSkill = skill.trim();
    if (!cleanSkill || userSkills.includes(cleanSkill)) return;
    setUserSkills((prev) => [...prev, cleanSkill]);
    setSkillDraft("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setUserSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const handleSaveChanges = async () => {
    if (!user?.id) return;

    setSaveError("");
    setIsSaving(true);

    try {
      await apiFetch(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: userName,
          phone: userPhone,
          location: userLocation,
          currentTitle: userTitle,
          yearsOfExperience: userExperience,
          skills: userSkills.join(", "),
          professionalSummary: userSummary,
        }),
      });

      await refreshUser();
      setIsEditing(false);
    } catch {
      setSaveError(
        t.profilePage.saveError || "Could not save your changes. Please try again."
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
      setChangePasswordError(
        t.profilePage.currentPasswordRequired || "Please enter your current password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError(
        t.profilePage.passwordLength || "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError(
        t.profilePage.passwordsDontMatch || "New passwords do not match."
      );
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
        err instanceof ApiError
          ? err.message
          : t.profilePage.changePasswordError || "Could not change your password. Please try again."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    setDeleteError("");
    setIsDeleting(true);

    try {
      await apiFetch(`/api/users/${user.id}`, { method: "DELETE" });
      logout();
      navigate("/login");
    } catch {
      setDeleteError(
        t.profilePage.deleteError ||
          "Could not delete your account. Please try again."
      );
      setIsDeleting(false);
    }
  };

  // Borderless inline-edit input (Company Profile's nested field-card input recipe).
  const fieldInputClass = "w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none";
  // Bordered modal input (Company Profile's change-password/delete-account modal recipe).
  const modalInputClass =
    "w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40";

  return (
    <>
      <div
        className={`min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-7 lg:px-8 ${
          isRTL ? "text-right" : "text-left"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="mx-auto w-full max-w-[1080px]">
          <section className="mb-8">
            <div
              className={`mb-5 flex flex-wrap items-center justify-between gap-3`}
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
                <span>{t.common.back}</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  if (isEditing) {
                    handleSaveChanges();
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
                {isSaving
                  ? t.profilePage.saving || "Saving..."
                  : isEditing
                  ? t.profilePage.saveChanges
                  : t.profilePage.editProfile}
              </button>
            </div>

            {saveError && (
              <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {saveError}
              </div>
            )}

            <div
              className={`mb-6 flex items-start gap-4`}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#22d3ee] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
                <User size={26} />
              </div>

              <div className={`min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
                <h1 className="text-[42px] font-extrabold leading-tight text-white">
                  {t.profilePage.title}
                </h1>
                <p className="mt-2 text-[17px] text-[#aeb4d6]">
                  {t.profilePage.subtitle}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
              <div
                className={`flex items-center justify-between gap-6 max-[860px]:flex-col max-[860px]:items-start ${
                  isRTL ? "max-[860px]:items-end" : ""
                }`}
              >
                <div
                  className={`flex min-w-0 items-center gap-4`}
                >
                  <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-white shadow-[0_10px_24px_rgba(127,76,255,0.28)]">
                    <Crown size={22} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-[20px] font-extrabold text-white">
                      {user?.premium
                        ? t.profilePage.currentPlanPremium || "Current Plan: Premium"
                        : t.profilePage.currentPlanFree || "Current Plan: Free"}
                    </h3>

                    <p className="mt-1 text-[15px] text-[#aeb4d6]">
                      {user?.premium
                        ? t.profilePage.unlimitedApplicationsText ||
                          "Unlimited applications and full AI features"
                        : `${applicationsCount} ${t.profilePage.of || "of"} ${FREE_PLAN_LIMIT} ${
                            t.profilePage.applicationsUsedThisMonth || "applications used this month"
                          }`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/payment")}
                  className={`inline-flex shrink-0 items-center gap-3 rounded-[16px] bg-gradient-to-r from-[#a855f7] to-[#7f4cff] px-6 py-3 text-[15px] font-bold text-white transition hover:opacity-90`}
                >
                  <Crown size={18} />
                  {user?.premium
                    ? t.profilePage.manageSubscription || "Manage Subscription"
                    : t.profilePage.upgradePremium || "Upgrade to Premium"}
                </button>
              </div>
            </div>
          </section>

          <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.5fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-[96px] w-[96px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#6f6bff] to-[#a855f7] text-[44px] font-extrabold text-white shadow-[0_16px_30px_rgba(127,76,255,0.28)]">
                  {(userName.charAt(0) || "?").toUpperCase()}
                </div>

                <h2 className="text-[24px] font-extrabold text-white">
                  {userName}
                </h2>

                <p className="mt-2 text-[16px] text-[#b8bfdc]">{userTitle}</p>

                <div className="relative mt-7 mb-6 flex h-[132px] w-[132px] items-center justify-center rounded-full">
                  {resumeStatusLoading ? (
                    <div className="absolute inset-0 animate-pulse rounded-full bg-white/10" />
                  ) : (
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#7c83ff ${profileScore}%, rgba(123,132,255,0.14) ${profileScore}% 100%)`,
                      }}
                    />
                  )}
                  <div className="absolute inset-[12px] rounded-full bg-[#252654]" />
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    {resumeStatusLoading ? (
                      <Loader2 size={22} className="animate-spin text-[#9aa2d6]" />
                    ) : (
                      <span className="text-[22px] font-extrabold text-white">
                        {profileScore}%
                      </span>
                    )}
                    <span className="text-[14px] text-[#b9c0e0]">
                      {t.dashboard.stats.profileScore}
                    </span>
                  </div>
                </div>

                <p className="max-w-[220px] text-[15px] leading-7 text-[#b8bfdc]">
                  {resumeStatusLoading
                    ? t.profilePage.profileHint ||
                      "Complete your profile to improve your match score"
                    : profileScore >= 100
                    ? t.profilePage.profileCompleteHint ||
                      "Your profile is complete! Great work."
                    : t.profilePage.profileHint ||
                      "Complete your profile to improve your match score"}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 md:p-10 shadow-2xl backdrop-blur-xl">
              <h2 className="mb-8 text-2xl font-bold text-white">
                {t.profilePage.personalInfo}
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div
                    className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <User size={16} />
                    {t.common.fullName}
                  </div>
                  {isEditing ? (
                    <input
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className={fieldInputClass}
                    />
                  ) : (
                    <p className="text-lg font-medium text-white">
                      {userName}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div
                    className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <Mail size={16} />
                    {t.common.email}
                  </div>
                  <p className="break-all text-lg font-medium text-white">
                    {userEmail}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div
                    className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <Phone size={16} />
                    {t.candidateRegisterPage.phone}
                  </div>
                  {isEditing ? (
                    <input
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className={fieldInputClass}
                    />
                  ) : (
                    <p className="text-lg font-medium text-white">
                      {userPhone}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div
                    className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <MapPin size={16} />
                    {t.candidateRegisterPage.location}
                  </div>
                  {isEditing ? (
                    <SearchableSelect
                      value={userLocation}
                      onChange={setUserLocation}
                      options={ISRAELI_CITIES}
                      placeholder={t.candidateRegisterPage.location}
                      className={fieldInputClass}
                    />
                  ) : (
                    <p className="text-lg font-medium text-white">
                      {userLocation}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div
                    className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <Briefcase size={16} />
                    {t.profilePage.currentTitle}
                  </div>
                  {isEditing ? (
                    <SearchableSelect
                      value={userTitle}
                      onChange={setUserTitle}
                      options={JOB_TITLES}
                      placeholder={t.profilePage.currentTitle}
                      className={fieldInputClass}
                    />
                  ) : (
                    <p className="text-lg font-medium text-white">
                      {userTitle}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div
                    className={`mb-2 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <Briefcase size={16} />
                    {t.profilePage.experience}
                  </div>
                  {isEditing ? (
                    <SearchableSelect
                      value={userExperience}
                      onChange={setUserExperience}
                      options={EXPERIENCE_OPTIONS}
                      placeholder={t.profilePage.experience}
                      className={fieldInputClass}
                    />
                  ) : (
                    <p className="text-lg font-medium text-white">
                      {userExperience}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
                <div
                  className={`mb-3 flex items-center gap-2 text-sm text-white/60 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <FileText size={16} />
                  {t.profilePage.professionalSummary}
                </div>
                {isEditing ? (
                  <textarea
                    value={userSummary}
                    onChange={(e) => setUserSummary(e.target.value)}
                    rows={6}
                    className="w-full rounded-2xl bg-white/10 px-4 py-4 text-white outline-none"
                  />
                ) : userSummary.trim() ? (
                  <p className="text-lg leading-8 text-white/85">
                    {userSummary}
                  </p>
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-8 text-center">
                    <p className="text-white/50">
                      {t.profilePage.noSummary || "Add a professional summary to help employers get to know you."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
                    >
                      <Plus size={15} />
                      {t.profilePage.addSummary || "Add Summary"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
              <div
                className={`mb-6 flex items-center gap-3`}
              >
                <Code2 size={22} className="text-violet-300" />
                <h2 className="text-2xl font-bold text-white">
                  {t.profilePage.skills}
                </h2>
              </div>

              {isEditing && (
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex-1">
                    <SearchableSelect
                      value={skillDraft}
                      onChange={setSkillDraft}
                      options={ALL_SKILLS.filter((skill) => !userSkills.includes(skill))}
                      placeholder={
                        t.profilePage.skillsPlaceholder || "Type a skill and select or press Add"
                      }
                      className={fieldInputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSkill(skillDraft)}
                    className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {userSkills.length > 0 ? (
                  userSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-emerald-300/70 transition hover:text-emerald-100"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-[#b8bfdc]">
                    {t.profilePage.noSkills || "No skills added yet."}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <Lock size={22} className="text-violet-300" />
                <h2 className="text-2xl font-bold text-white">
                  {t.profilePage.security || "Security"}
                </h2>
              </div>

              <p className="mb-6 text-base leading-7 text-white/70">
                {t.profilePage.securityText ||
                  "Update your password to keep your account secure."}
              </p>

              <button
                type="button"
                onClick={() => {
                  setChangePasswordError("");
                  setChangePasswordSuccess(false);
                  setShowChangePasswordModal(true);
                }}
                className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
              >
                {t.profilePage.changePassword || "Change Password"}
              </button>
            </div>
          </section>

          <section>
            <div className="rounded-[28px] border border-rose-500/30 bg-rose-500/[0.04] p-8 shadow-2xl backdrop-blur-xl">
              <div
                className={`mb-4 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Trash2 size={22} className="text-rose-400" />
                <h2 className="text-2xl font-bold text-rose-300">
                  {t.profilePage.dangerZone || "Danger Zone"}
                </h2>
              </div>

              <p className="mb-6 text-base leading-7 text-white/70">
                {t.profilePage.dangerText ||
                  "Permanently delete your account and all associated data. This action cannot be undone."}
              </p>

              <button
                type="button"
                onClick={() => {
                  setDeleteError("");
                  setShowDeleteModal(true);
                }}
                className={`inline-flex items-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Trash2 size={16} />
                {t.profilePage.deleteAccount || "Delete My Account"}
              </button>
            </div>
          </section>
        </div>
      </div>

      {showPremiumModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(1,4,19,0.72)] px-4 backdrop-blur-md"
          onClick={() => setShowPremiumModal(false)}
        >
          <div
            className="relative w-full max-w-[560px] rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,#09152f_0%,#0d1730_100%)] p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPremiumModal(false)}
              className={`absolute top-5 text-[#9aa4cf] transition hover:text-white ${
                isRTL ? "left-5" : "right-5"
              }`}
            >
              <X size={22} />
            </button>

            <div className="mb-5 flex justify-center">
              <div className="flex h-[78px] w-[78px] items-center justify-center rounded-[24px] bg-gradient-to-br from-[#7f4cff] to-[#a855f7] shadow-[0_18px_40px_rgba(127,76,255,0.35)]">
                <Crown size={34} />
              </div>
            </div>

            <h2 className="mb-2 text-center text-[24px] font-extrabold">
              {t.profilePage.upgradePremium || "Upgrade to Premium"}
            </h2>

            <p className="mb-8 text-center text-[16px] text-[#aeb4d6]">
              {t.profilePage.modalSubtitle ||
                "Unlock the full power of AI-driven job matching"}
            </p>

            <div className="mb-7 grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
              <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-5">
                <p className="mb-2 text-[15px] font-semibold text-[#aeb4d6]">
                  {t.profilePage.basicLabel || "Basic"}
                </p>
                <h3 className="mb-5 text-[20px] font-extrabold text-white">
                  {t.profilePage.freeLabel || "Free"}
                </h3>

                <div className="space-y-3 text-[15px] text-[#d8ddf6]">
                  <div className={`flex items-start gap-2 ${isRTL ? "text-right" : ""}`}>
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>{t.profilePage.basicFeature1 || "Job browsing"}</span>
                  </div>

                  <div className={`flex items-start gap-2 ${isRTL ? "text-right" : ""}`}>
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>{t.profilePage.basicFeature2 || "5 applications/mo"}</span>
                  </div>

                  <div className={`flex items-start gap-2 ${isRTL ? "text-right" : ""}`}>
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>{t.profilePage.basicFeature3 || "Basic profile"}</span>
                  </div>
                </div>
              </div>

              <div className="relative rounded-[20px] border border-[#7f4cff] bg-[rgba(75,46,140,0.18)] p-5 shadow-[0_0_0_1px_rgba(127,76,255,0.12)]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#a855f7] px-3 py-1 text-[12px] font-bold text-white">
                  {t.profilePage.popularLabel || "Popular"}
                </div>

                <p className="mb-2 text-[15px] font-semibold text-[#cdb8ff]">
                  {t.profilePage.premiumLabel || "Premium"}
                </p>

                <h3 className="mb-5 text-[20px] font-extrabold text-white">
                  $9.99<span className="text-[15px] text-[#aeb4d6]">/mo</span>
                </h3>

                <div className="space-y-3 text-[15px] text-[#ece7ff]">
                  <div className={`flex items-start gap-2 ${isRTL ? "text-right" : ""}`}>
                    <Zap
                      size={17}
                      className="mt-[3px] shrink-0 text-[#b97cff]"
                    />
                    <span>{t.profilePage.premiumFeature1 || "AI Pre-Interview Module"}</span>
                  </div>

                  <div className={`flex items-start gap-2 ${isRTL ? "text-right" : ""}`}>
                    <Zap
                      size={17}
                      className="mt-[3px] shrink-0 text-[#b97cff]"
                    />
                    <span>{t.profilePage.premiumFeature2 || "Advanced Resume Scoring"}</span>
                  </div>

                  <div className={`flex items-start gap-2 ${isRTL ? "text-right" : ""}`}>
                    <Zap
                      size={17}
                      className="mt-[3px] shrink-0 text-[#b97cff]"
                    />
                    <span>{t.profilePage.premiumFeature3 || "Detailed AI Match Insights"}</span>
                  </div>

                  <div className={`flex items-start gap-2 ${isRTL ? "text-right" : ""}`}>
                    <Zap
                      size={17}
                      className="mt-[3px] shrink-0 text-[#b97cff]"
                    />
                    <span>{t.profilePage.premiumFeature4 || "Priority Application Status"}</span>
                  </div>

                  <div className={`flex items-start gap-2 ${isRTL ? "text-right" : ""}`}>
                    <Zap
                      size={17}
                      className="mt-[3px] shrink-0 text-[#b97cff]"
                    />
                    <span>{t.profilePage.premiumFeature5 || "Unlimited Job Applications"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
              <button
                type="button"
                onClick={() => setShowPremiumModal(false)}
                className="rounded-[14px] border border-white/15 bg-transparent px-5 py-3 text-[16px] font-bold text-white transition hover:bg-white/[0.05]"
              >
                {t.profilePage.maybeLater || "Maybe Later"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPremiumModal(false);
                  navigate("/payment");
                }}
                className="rounded-[14px] bg-gradient-to-r from-[#a855f7] to-[#6366f1] px-5 py-3 text-[16px] font-bold text-white transition hover:opacity-90"
              >
                {t.profilePage.upgradeNow || "Upgrade Now"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              {t.profilePage.changePassword || "Change Password"}
            </h2>

            {changePasswordSuccess ? (
              <>
                <p className="mb-6 text-center text-white/70">
                  {t.profilePage.changePasswordSuccess || "Your password has been updated."}
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
                  {t.profilePage.changePasswordSubtitle ||
                    "Enter your current password and choose a new one."}
                </p>

                <div className="mb-4 space-y-4">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t.profilePage.currentPassword || "Current password"}
                    className={modalInputClass}
                    disabled={isChangingPassword}
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.profilePage.newPassword || "New password"}
                    className={modalInputClass}
                    disabled={isChangingPassword}
                  />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder={t.profilePage.confirmNewPassword || "Confirm new password"}
                    className={modalInputClass}
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
                      ? t.profilePage.changingPassword || "Changing..."
                      : t.profilePage.changePassword || "Change Password"}
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
          onClick={() => !isDeleting && setShowDeleteModal(false)}
        >
          <div
            className="relative w-full max-w-[520px] rounded-[28px] border border-rose-500/30 bg-[#181b4a] p-8 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {!isDeleting && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
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
              {t.profilePage.deleteConfirmTitle || "Delete your account?"}
            </h2>

            <p className="mb-6 text-center text-sm leading-6 text-white/70">
              {t.profilePage.deleteConfirmText ||
                "This will permanently remove your account and all associated data (applications, saved jobs, CV, notifications). This action cannot be undone."}
            </p>

            {deleteError && (
              <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {deleteError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 max-[420px]:grid-cols-1">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-xl border border-white/15 bg-transparent px-5 py-3 text-base font-bold text-white transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t.common.cancel || "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-3 text-base font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isDeleting
                  ? t.profilePage.deleting || "Deleting..."
                  : t.profilePage.deleteAccount || "Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePage;