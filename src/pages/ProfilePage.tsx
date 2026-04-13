import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import { useState } from "react";
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
  Save,
} from "lucide-react";

function ProfilePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [userName, setUserName] = useState(
    localStorage.getItem("name") || "Alex Johnson"
  );
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("email") || "alex.johnson@email.com"
  );
  const [userPhone, setUserPhone] = useState(
    localStorage.getItem("phone") || "+1 (555) 123-4567"
  );
  const [userLocation, setUserLocation] = useState(
    localStorage.getItem("location") || "Haifa, Israel"
  );
  const [userTitle, setUserTitle] = useState(
    localStorage.getItem("currentTitle") || "Senior Frontend Developer"
  );
  const [userExperience, setUserExperience] = useState(
    localStorage.getItem("experience") || "6 years"
  );
  const [userSummary, setUserSummary] = useState(
    localStorage.getItem("summary") ||
      "Passionate frontend developer with 6+ years of experience building modern web applications. Specialized in React ecosystem and performance optimization."
  );
  const [userSkills, setUserSkills] = useState<string[]>(() => {
    const savedSkills = localStorage.getItem("skills");
    try {
      return savedSkills ? JSON.parse(savedSkills) : ["React", "TypeScript"];
    } catch {
      return ["React", "TypeScript"];
    }
  });
  const [skillsInput, setSkillsInput] = useState(userSkills.join(", "));

  const profileScore = 78;

  const handleSaveChanges = () => {
    const parsedSkills = skillsInput
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    setUserSkills(parsedSkills);

    localStorage.setItem("name", userName);
    localStorage.setItem("email", userEmail);
    localStorage.setItem("phone", userPhone);
    localStorage.setItem("location", userLocation);
    localStorage.setItem("currentTitle", userTitle);
    localStorage.setItem("experience", userExperience);
    localStorage.setItem("summary", userSummary);
    localStorage.setItem("skills", JSON.stringify(parsedSkills));

    const savedRegisteredUser = localStorage.getItem("registeredUser");
    if (savedRegisteredUser) {
      const parsedUser = JSON.parse(savedRegisteredUser);
      parsedUser.name = userName;
      parsedUser.email = userEmail;
      parsedUser.phone = userPhone;
      parsedUser.location = userLocation;
      parsedUser.currentTitle = userTitle;
      parsedUser.experience = userExperience;
      parsedUser.summary = userSummary;
      parsedUser.skills = parsedSkills;
      localStorage.setItem("registeredUser", JSON.stringify(parsedUser));
    }

    setIsEditing(false);
  };

  const inputClass =
    "w-full rounded-[14px] border border-white/10 bg-white/[0.05] px-4 py-3 text-[16px] text-white outline-none placeholder:text-[#8ea2c7]";
  const textareaClass =
    "w-full rounded-[14px] border border-white/10 bg-white/[0.05] px-4 py-3 text-[16px] text-white outline-none placeholder:text-[#8ea2c7] min-h-[130px] resize-none";

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
              className={`mb-5 flex items-center justify-between ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
                <span>{t.common.back}</span>
              </button>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className={`inline-flex items-center gap-2 rounded-[16px] bg-gradient-to-r from-[#7f4cff] to-[#a855f7] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(127,76,255,0.28)] transition hover:opacity-90 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Pencil size={18} />
                  {t.profilePage.editProfile}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className={`inline-flex items-center gap-2 rounded-[16px] bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(34,197,94,0.28)] transition hover:opacity-90 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Save size={18} />
                  {t.profilePage.saveChanges}
                </button>
              )}
            </div>

            <div
              className={`mb-6 flex items-start gap-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#22d3ee] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
                <User size={26} />
              </div>

              <div className={isRTL ? "text-right" : "text-left"}>
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
                  isRTL ? "flex-row-reverse max-[860px]:items-end" : ""
                }`}
              >
                <div
                  className={`flex items-center gap-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[16px] bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-white shadow-[0_10px_24px_rgba(127,76,255,0.28)]">
                    <Crown size={22} />
                  </div>

                  <div>
                    <h3 className="text-[20px] font-extrabold text-white">
                      {t.profilePage.basicPlan || "You're on the Basic Plan"}
                    </h3>
                    <p className="mt-1 text-[15px] text-[#aeb4d6]">
                      {t.profilePage.premiumHint ||
                        "Upgrade to Premium to unlock AI-powered features"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPremiumModal(true)}
                  className={`inline-flex items-center gap-3 rounded-[16px] bg-gradient-to-r from-[#a855f7] to-[#7f4cff] px-6 py-3 text-[15px] font-bold text-white transition hover:opacity-90 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Crown size={18} />
                  {t.profilePage.upgradePremium || "Upgrade to Premium"}
                </button>
              </div>
            </div>
          </section>

          <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.5fr]">
            <div className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-[96px] w-[96px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#6f6bff] to-[#a855f7] text-[44px] font-extrabold text-white shadow-[0_16px_30px_rgba(127,76,255,0.28)]">
                  {userName.charAt(0).toUpperCase()}
                </div>

                <h2 className="text-[24px] font-extrabold text-white">
                  {userName}
                </h2>

                <p className="mt-2 text-[16px] text-[#b8bfdc]">{userTitle}</p>

                <div className="relative mt-7 mb-6 flex h-[132px] w-[132px] items-center justify-center rounded-full">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#7c83ff ${profileScore}%, rgba(123,132,255,0.14) ${profileScore}% 100%)`,
                    }}
                  />
                  <div className="absolute inset-[12px] rounded-full bg-[#252654]" />
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <span className="text-[22px] font-extrabold text-white">
                      {profileScore}%
                    </span>
                    <span className="text-[14px] text-[#b9c0e0]">
                      {t.dashboard.stats.profileScore}
                    </span>
                  </div>
                </div>

                <p className="max-w-[220px] text-[15px] leading-7 text-[#b8bfdc]">
                  {t.profilePage.profileHint ||
                    "Complete your profile to improve your match score"}
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <h2 className="mb-8 text-[24px] font-extrabold text-white">
                {t.profilePage.personalInfo}
              </h2>

              <div className="grid grid-cols-2 gap-x-10 gap-y-8 max-[760px]:grid-cols-1">
                <div>
                  <div
                    className={`mb-2 flex items-center gap-3 text-[#b7bedf] ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <User size={18} />
                    <span className="text-[15px]">{t.common.fullName}</span>
                  </div>
                  {isEditing ? (
                    <input
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <p className="text-[18px] font-semibold text-white">
                      {userName}
                    </p>
                  )}
                </div>

                <div>
                  <div
                    className={`mb-2 flex items-center gap-3 text-[#b7bedf] ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Mail size={18} />
                    <span className="text-[15px]">{t.common.email}</span>
                  </div>
                  {isEditing ? (
                    <input
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <p className="text-[18px] font-semibold text-white">
                      {userEmail}
                    </p>
                  )}
                </div>

                <div>
                  <div
                    className={`mb-2 flex items-center gap-3 text-[#b7bedf] ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Phone size={18} />
                    <span className="text-[15px]">
                      {t.candidateRegisterPage.phone}
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <p className="text-[18px] font-semibold text-white">
                      {userPhone}
                    </p>
                  )}
                </div>

                <div>
                  <div
                    className={`mb-2 flex items-center gap-3 text-[#b7bedf] ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <MapPin size={18} />
                    <span className="text-[15px]">
                      {t.candidateRegisterPage.location}
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      value={userLocation}
                      onChange={(e) => setUserLocation(e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <p className="text-[18px] font-semibold text-white">
                      {userLocation}
                    </p>
                  )}
                </div>

                <div>
                  <div
                    className={`mb-2 flex items-center gap-3 text-[#b7bedf] ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Briefcase size={18} />
                    <span className="text-[15px]">
                      {t.profilePage.currentTitle}
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      value={userTitle}
                      onChange={(e) => setUserTitle(e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <p className="text-[18px] font-semibold text-white">
                      {userTitle}
                    </p>
                  )}
                </div>

                <div>
                  <div
                    className={`mb-2 flex items-center gap-3 text-[#b7bedf] ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Briefcase size={18} />
                    <span className="text-[15px]">
                      {t.profilePage.experience}
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      value={userExperience}
                      onChange={(e) => setUserExperience(e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <p className="text-[18px] font-semibold text-white">
                      {userExperience}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-10">
                <p className="mb-3 text-[15px] text-[#b7bedf]">
                  {t.profilePage.professionalSummary}
                </p>
                {isEditing ? (
                  <textarea
                    value={userSummary}
                    onChange={(e) => setUserSummary(e.target.value)}
                    className={textareaClass}
                  />
                ) : (
                  <p className="max-w-[900px] text-[17px] leading-9 text-[#edf0ff]">
                    {userSummary}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <div
                className={`mb-6 flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Code2 size={22} className="text-[#7f8bff]" />
                <h2 className="text-[24px] font-extrabold text-white">
                  {t.profilePage.skills}
                </h2>
              </div>

              {isEditing ? (
                <textarea
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder={t.profilePage.skillsPlaceholder || "Write skills separated by commas"}
                  className={textareaClass}
                />
              ) : (
                <div className="flex flex-wrap gap-3">
                  {userSkills.length > 0 ? (
                    userSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-[#b8bfdc]">
                      {t.profilePage.noSkills || "No skills added yet."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="rounded-[30px] border border-[rgba(255,88,120,0.26)] bg-[rgba(44,45,95,0.94)] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <div
                className={`mb-4 flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Trash2 size={23} className="text-[#ff6a8d]" />
                <h2 className="text-[24px] font-extrabold text-[#ff7d9d]">
                  {t.profilePage.dangerZone || "Danger Zone"}
                </h2>
              </div>

              <p className="mb-6 text-[16px] leading-8 text-[#c9cde6]">
                {t.profilePage.dangerText ||
                  "Permanently delete your account and all associated data. This action cannot be undone."}
              </p>

              <button
                type="button"
                className="rounded-[16px] border border-[rgba(255,88,120,0.45)] bg-transparent px-6 py-3 text-[15px] font-bold text-[#ff7d9d] transition hover:bg-[rgba(255,88,120,0.08)]"
              >
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
                  <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>{t.profilePage.basicFeature1 || "Job browsing"}</span>
                  </div>

                  <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
                    <CheckCircle2
                      size={18}
                      className="mt-[2px] shrink-0 text-[#31d0aa]"
                    />
                    <span>{t.profilePage.basicFeature2 || "5 applications/mo"}</span>
                  </div>

                  <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
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
                  $19<span className="text-[15px] text-[#aeb4d6]">/mo</span>
                </h3>

                <div className="space-y-3 text-[15px] text-[#ece7ff]">
                  <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
                    <Zap
                      size={17}
                      className="mt-[3px] shrink-0 text-[#b97cff]"
                    />
                    <span>{t.profilePage.premiumFeature1 || "AI Pre-Interview Module"}</span>
                  </div>

                  <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
                    <Zap
                      size={17}
                      className="mt-[3px] shrink-0 text-[#b97cff]"
                    />
                    <span>{t.profilePage.premiumFeature2 || "Advanced Resume Scoring"}</span>
                  </div>

                  <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
                    <Zap
                      size={17}
                      className="mt-[3px] shrink-0 text-[#b97cff]"
                    />
                    <span>{t.profilePage.premiumFeature3 || "Detailed AI Match Insights"}</span>
                  </div>

                  <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
                    <Zap
                      size={17}
                      className="mt-[3px] shrink-0 text-[#b97cff]"
                    />
                    <span>{t.profilePage.premiumFeature4 || "Priority Application Status"}</span>
                  </div>

                  <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
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
                className="rounded-[14px] bg-gradient-to-r from-[#a855f7] to-[#6366f1] px-5 py-3 text-[16px] font-bold text-white transition hover:opacity-90"
              >
                {t.profilePage.upgradeNow || "Upgrade Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePage;