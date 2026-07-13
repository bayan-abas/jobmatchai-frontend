import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Wallet,
  BriefcaseBusiness,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Target,
  Send,
  ExternalLink,
  Globe2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { getRingColor } from "../utils/jobInference";
import { formatSalary } from "../utils/formatSalary";
import SkillExplanationModal from "../components/SkillExplanationModal";
import PreInterviewModal from "../components/PreInterviewModal";
import ApplicationSuccessModal from "../components/ApplicationSuccessModal";
import { apiFetch } from "../utils/api";

type JobType = "internal" | "external";

type JobData = {
  id: number;
  title?: string;
  companyName?: string;
  location?: string;
  type?: string;
  salary?: string;
  description?: string;
  requirements?: string;
  skills?: string;
  sourceName?: string;
  sourceUrl?: string;
  applyUrl?: string;
};

// AI-generated reformatting of an external job's full description for display only - never a
// match-scoring input (that always reads job.description directly, in full). Every field is ""
// or [] rather than invented when the posting itself doesn't mention it - see
// OpenAICVAnalysisService#summarizeJobDescription on the backend.
type AboutSummary = {
  roleOverview?: string;
  responsibilities?: string[];
  requiredQualifications?: string[];
  preferredQualifications?: string[];
  experienceLevel?: string;
  workArrangement?: string;
  importantConditions?: string[];
};

function isAboutSummaryUsable(summary: AboutSummary | null): boolean {
  if (!summary) return false;
  return Boolean(
    summary.roleOverview ||
      summary.responsibilities?.length ||
      summary.requiredQualifications?.length ||
      summary.preferredQualifications?.length ||
      summary.experienceLevel ||
      summary.workArrangement ||
      summary.importantConditions?.length
  );
}

// "error" = the AI couldn't compute this job's match at all (a transient failure, never
// cached by the backend) - distinct from "noScore", which is a real AI verdict that this
// job isn't a field match.
type MatchStatus = "loggedOut" | "loading" | "noAnalysis" | "scored" | "noScore" | "error";

type MatchDetail = {
  hasAnalysis: boolean;
  matchPercent: number | null;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
  whyGoodMatch: string[];
  whyNotPerfectMatch: string[];
  improvementSuggestions: string[];
  recommendation: string | null;
  shouldApply: boolean | null;
  fieldRelated: boolean | null;
  skillsMatchPercent: number | null;
  experienceMatchPercent: number | null;
  educationMatchPercent: number | null;
  languageMatchPercent: number | null;
  fieldRelevancePercent: number | null;
  certificationMatchPercent: number | null;
  locationMatchPercent: number | null;
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
};

function splitSkills(value?: string): string[] {
  return (value || "")
    .split(/[,;|\n]/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function JobDetailsPage() {
  const navigate = useNavigate();
  const params = useParams<{ jobType: string; jobId: string }>();
  const jobType: JobType = params.jobType === "external" ? "external" : "internal";
  const jobId = params.jobId;

  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language] || translations.en;
  const d = t.jobDetails;
  const isRTL = language === "ar" || language === "he";

  const readCandidateIdentity = () => ({
    email: user?.email || "",
    name: user?.name || "Candidate",
  });

  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [aboutSummary, setAboutSummary] = useState<AboutSummary | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>("loading");
  const [matchDetail, setMatchDetail] = useState<MatchDetail | null>(null);

  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [applying, setApplying] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [showPreInterviewModal, setShowPreInterviewModal] = useState(false);
  const [showApplySuccessModal, setShowApplySuccessModal] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    setLoading(true);
    setFetchError("");
    setAboutSummary(null);

    const url =
      jobType === "external"
        ? `/api/external-jobs/${jobId}?language=${encodeURIComponent(language)}`
        : `/api/jobs/${jobId}`;

    apiFetch(url)
      .then((data: { success: boolean; job?: JobData; aboutSummary?: AboutSummary }) => {
        if (data.success && data.job) {
          setJob(data.job);
          // Only meaningful for external jobs - internal job descriptions are short/curated
          // and keep showing the raw text as-is (see the "About the role" render below).
          setAboutSummary(data.aboutSummary || null);
        } else {
          setJob(null);
          setFetchError(d.jobNotFound);
        }
      })
      .catch(() => {
        setJob(null);
        setFetchError(d.loadError);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobType, jobId, language]);

  useEffect(() => {
    if (!job || !jobId) return;

    const identity = readCandidateIdentity();
    if (!identity.email) return;

    apiFetch(`/api/recently-viewed/track`, {
      method: "POST",
      body: JSON.stringify({
        candidateEmail: identity.email,
        jobId: job.id,
        jobType,
        jobTitle: job.title,
        companyName: job.companyName,
        location: job.location,
      }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job, jobType, jobId]);

  useEffect(() => {
    if (jobType !== "internal" || !jobId) return;

    const identity = readCandidateIdentity();
    if (!identity.email) return;

    apiFetch(`/api/applications/candidate/${encodeURIComponent(identity.email)}`)
      .then((applications) => {
        const ids = Array.isArray(applications)
          ? applications.map((application: any) => Number(application.jobId)).filter((id: number) => !Number.isNaN(id))
          : [];
        setAppliedJobIds(ids);
      })
      .catch(() => setAppliedJobIds([]));
  }, [jobType, jobId]);

  useEffect(() => {
    if (!jobId) return;

    const identity = readCandidateIdentity();
    if (!identity.email) {
      setIsLoggedIn(false);
      setMatchStatus("loggedOut");
      return;
    }

    setIsLoggedIn(true);
    setMatchStatus("loading");

    let cancelled = false;

    const url =
      jobType === "external"
        ? `/api/external-jobs/match-detail`
        : `/api/jobs/match-detail`;

    const body =
      jobType === "external"
        ? { email: identity.email, externalJobId: Number(jobId), language }
        : { email: identity.email, jobId: Number(jobId), language };

    apiFetch(url, {
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((data: MatchDetail) => {
        if (cancelled) return;

        if (!data.hasAnalysis) {
          setMatchStatus("noAnalysis");
          setMatchDetail(null);
          return;
        }

        setMatchDetail(data);
        setMatchStatus(
          data.fieldRelated === null ? "error" : data.fieldRelated === false ? "noScore" : "scored"
        );
      })
      .catch(() => {
        if (!cancelled) {
          setMatchStatus("noAnalysis");
          setMatchDetail(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [jobType, jobId, language]);

  const hasApplied = job ? appliedJobIds.includes(job.id) : false;

  const handleApply = () => {
    if (!job) return;

    if (jobType === "external") {
      if (job.applyUrl) {
        window.open(job.applyUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }

    if (hasApplied) {
      setApplyMessage("You already applied to this job.");
      return;
    }

    const identity = readCandidateIdentity();
    if (!identity.email) {
      setApplyMessage("Please sign in again before applying.");
      return;
    }

    setApplyMessage("");
    setShowPreInterviewModal(true);
  };

  const handleSubmitApplication = (answers: Record<string, string>) => {
    if (!job) return;

    setApplying(true);

    apiFetch(`/api/applications/apply`, {
      method: "POST",
      body: JSON.stringify({
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        preInterviewAnswers: answers,
      }),
    })
      .then((data) => {
        if (data.success) {
          setAppliedJobIds((prev) => [...new Set([...prev, job.id])]);
          setShowApplySuccessModal(true);
        } else {
          setApplyMessage(data.message || "Could not submit application.");
        }
      })
      .catch(() => {
        setApplyMessage("Could not submit application. Make sure the backend is running.");
      })
      .finally(() => {
        setApplying(false);
        setShowPreInterviewModal(false);
      });
  };

  const requirements = splitSkills(job?.requirements);
  const skills = splitSkills(job?.skills);
  // Only meaningful when matchStatus is "scored" - matchDetail.matchPercent is only ever
  // null for "noScore"/"error", where percent is never read for display (no fallback to 0).
  const percent = matchDetail?.matchPercent ?? 0;
  const ringColor =
    matchStatus === "scored"
      ? getRingColor("scored", percent)
      : matchStatus === "error"
        ? getRingColor("error", 0)
        : "#5f648a";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-7 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        <div className={`mb-6 flex items-center ${isRTL ? "justify-end" : "justify-start"}`}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
            <span>{d.back}</span>
          </button>
        </div>

        {loading && (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-white/65">
            {t.externalJobsPage.loading}
          </div>
        )}

        {!loading && fetchError && (
          <div className="rounded-[24px] border border-rose-400/30 bg-rose-400/10 px-6 py-12 text-center text-rose-200">
            {fetchError}
          </div>
        )}

        {!loading && !fetchError && job && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
            {/* Left column */}
            <div className="space-y-6">
              <div className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] px-7 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                <div className={`mb-4 flex flex-wrap items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <h1 className="text-[28px] font-extrabold text-white lg:text-[34px]">
                    {job.title || "Untitled Job"}
                  </h1>
                  <span
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                      jobType === "external"
                        ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                        : "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    }`}
                  >
                    {jobType === "external" ? d.externalJobBadge : d.internalJobBadge}
                  </span>
                </div>

                <div className={`mb-4 flex items-center gap-2 text-[#c4cae9] ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Building2 size={18} />
                  <span className="text-[16px]">{job.companyName || "Unknown Company"}</span>
                </div>

                <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 text-[16px] text-[#aeb4d6] ${isRTL ? "flex-row-reverse" : ""}`}>
                  {job.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={18} />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.type && (
                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness size={18} />
                      <span>{job.type}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Wallet size={18} />
                    <span className="font-semibold text-emerald-300">
                      {formatSalary(job.salary) || d.salaryNotSpecified}
                    </span>
                  </div>
                  {jobType === "external" && job.sourceName && (
                    <div className="flex items-center gap-2">
                      <Globe2 size={18} />
                      <span>
                        {d.source}: {job.sourceName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                <h2 className="mb-4 flex items-center gap-2 text-[22px] font-extrabold text-white">
                  <Zap size={20} className="text-[#facc15]" />
                  {d.aboutRole}
                </h2>
                {jobType === "external" && isAboutSummaryUsable(aboutSummary) ? (
                  <div className="space-y-5">
                    {aboutSummary?.roleOverview && (
                      <p className="whitespace-pre-line leading-7 text-[#c4cae9]">
                        {aboutSummary.roleOverview}
                      </p>
                    )}

                    {(aboutSummary?.experienceLevel || aboutSummary?.workArrangement) && (
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#c4cae9]">
                        {aboutSummary?.experienceLevel && (
                          <span>
                            <span className="font-semibold text-white/80">{d.experienceLevel}:</span>{" "}
                            {aboutSummary.experienceLevel}
                          </span>
                        )}
                        {aboutSummary?.workArrangement && (
                          <span>
                            <span className="font-semibold text-white/80">{d.workArrangement}:</span>{" "}
                            {aboutSummary.workArrangement}
                          </span>
                        )}
                      </div>
                    )}

                    {!!aboutSummary?.responsibilities?.length && (
                      <div>
                        <h3 className="mb-2 text-sm font-bold text-white/80">{d.responsibilities}</h3>
                        <ul className="space-y-2 text-[#c4cae9]">
                          {aboutSummary.responsibilities.map((item) => (
                            <li key={item} className="flex gap-2">
                              <CheckCircle2 size={15} className="mt-1 shrink-0 text-emerald-300" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!!aboutSummary?.requiredQualifications?.length && (
                      <div>
                        <h3 className="mb-2 text-sm font-bold text-white/80">{d.requiredQualifications}</h3>
                        <ul className="space-y-2 text-[#c4cae9]">
                          {aboutSummary.requiredQualifications.map((item) => (
                            <li key={item} className="flex gap-2">
                              <CheckCircle2 size={15} className="mt-1 shrink-0 text-emerald-300" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!!aboutSummary?.preferredQualifications?.length && (
                      <div>
                        <h3 className="mb-2 text-sm font-bold text-white/80">{d.preferredQualifications}</h3>
                        <ul className="space-y-2 text-[#c4cae9]">
                          {aboutSummary.preferredQualifications.map((item) => (
                            <li key={item} className="flex gap-2">
                              <CheckCircle2 size={15} className="mt-1 shrink-0 text-cyan-300" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!!aboutSummary?.importantConditions?.length && (
                      <div>
                        <h3 className="mb-2 text-sm font-bold text-white/80">{d.importantConditions}</h3>
                        <ul className="space-y-2 text-[#c4cae9]">
                          {aboutSummary.importantConditions.map((item) => (
                            <li key={item} className="flex gap-2">
                              <AlertTriangle size={15} className="mt-1 shrink-0 text-amber-300" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-line leading-7 text-[#c4cae9]">
                    {job.description || "-"}
                  </p>
                )}
              </div>

              {requirements.length > 0 && (
                <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-[22px] font-extrabold text-white">
                    <CheckCircle2 size={20} className="text-emerald-300" />
                    {d.requirements}
                  </h2>
                  <ul className="space-y-3 text-[#c4cae9]">
                    {requirements.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 size={17} className="mt-1 shrink-0 text-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {skills.length > 0 && (
                <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                  <h2 className="mb-4 text-[22px] font-extrabold text-white">{d.requiredSkills}</h2>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {skills.map((skill) => {
                      const isMatched = matchStatus === "scored" && matchDetail?.matchedSkills.includes(skill);
                      const isMissing = matchStatus === "scored" && matchDetail?.missingSkills.includes(skill);

                      if (isMissing) {
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => setSelectedSkill(skill)}
                            className={`flex items-center gap-2 rounded-2xl border border-orange-400/20 bg-orange-400/10 px-3 py-2.5 text-sm font-semibold text-orange-300 transition hover:border-orange-400/40 hover:bg-orange-400/20 ${
                              isRTL ? "flex-row-reverse text-right" : "text-left"
                            }`}
                          >
                            <AlertTriangle size={16} className="shrink-0" />
                            <span className="truncate">{skill}</span>
                          </button>
                        );
                      }

                      if (isMatched) {
                        return (
                          <div
                            key={skill}
                            className={`flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2.5 text-sm font-semibold text-emerald-300 ${
                              isRTL ? "flex-row-reverse text-right" : ""
                            }`}
                          >
                            <CheckCircle2 size={16} className="shrink-0" />
                            <span className="truncate">{skill}</span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={skill}
                          className={`flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm font-medium text-white/80 ${
                            isRTL ? "flex-row-reverse text-right" : ""
                          }`}
                        >
                          <span className="truncate">{skill}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {matchStatus === "scored" && matchDetail && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-[18px] font-extrabold text-white">
                      <CheckCircle2 size={18} className="text-emerald-300" />
                      {d.whyGoodMatch}
                    </h2>
                    <ul className="space-y-3 text-sm text-[#c4cae9]">
                      {matchDetail.whyGoodMatch.map((item) => (
                        <li key={item} className="flex gap-2">
                          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-300" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {matchDetail.matchedSkills.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {matchDetail.matchedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-[18px] font-extrabold text-white">
                      <AlertTriangle size={18} className="text-orange-300" />
                      {d.whyNotPerfectMatch}
                    </h2>
                    <ul className="space-y-3 text-sm text-[#c4cae9]">
                      {matchDetail.whyNotPerfectMatch.map((item) => (
                        <li key={item} className="flex gap-2">
                          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-orange-300" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {matchDetail.missingSkills.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {matchDetail.missingSkills.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => setSelectedSkill(skill)}
                            className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs font-semibold text-orange-300 transition hover:border-orange-400/40 hover:bg-orange-400/20"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-[18px] font-extrabold text-white">
                      <Target size={18} className="text-cyan-300" />
                      {d.improvementSuggestions}
                    </h2>
                    <ul className="space-y-3 text-sm text-[#c4cae9]">
                      {matchDetail.improvementSuggestions.map((item) => (
                        <li key={item} className="flex gap-2">
                          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cyan-300" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {matchDetail.recommendation && (
                    <div
                      className={`rounded-[30px] border p-6 ${
                        matchDetail.shouldApply
                          ? "border-[#a855f7]/25 bg-gradient-to-br from-[#7f4cff]/15 to-[#a855f7]/15"
                          : "border-amber-400/25 bg-amber-400/10"
                      }`}
                    >
                      <h2
                        className={`mb-3 flex items-center gap-2 text-[18px] font-extrabold ${
                          matchDetail.shouldApply ? "text-[#e9d5ff]" : "text-amber-200"
                        }`}
                      >
                        {matchDetail.shouldApply ? <ThumbsUp size={18} /> : <ThumbsDown size={18} />}
                        {d.recommendation}
                      </h2>
                      <p className="text-sm leading-6 text-[#e5e7ff]">{matchDetail.recommendation}</p>
                      <p
                        className={`mt-4 text-sm font-bold ${
                          matchDetail.shouldApply ? "text-[#c4b5fd]" : "text-amber-200"
                        }`}
                      >
                        {matchDetail.shouldApply ? d.shouldApplyYes : d.shouldApplyNo}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div className="sticky top-6 rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                <div className="flex flex-col items-center text-center">
                  <div className="relative h-[130px] w-[130px]">
                    <div
                      className={`h-full w-full rounded-full ${matchStatus === "loading" ? "animate-pulse" : ""}`}
                      style={{
                        background:
                          matchStatus === "scored"
                            ? `conic-gradient(${ringColor} ${percent * 3.6}deg, #2a2c5a 0deg)`
                            : matchStatus === "error"
                              ? `conic-gradient(${ringColor} 360deg, #2a2c5a 0deg)`
                              : "conic-gradient(#5f648a 360deg, #2a2c5a 0deg)",
                      }}
                    />
                    <div className="absolute inset-[10px] flex items-center justify-center rounded-full bg-[#252654] text-[32px] font-extrabold text-white">
                      {matchStatus === "scored"
                        ? `${percent}%`
                        : matchStatus === "loading"
                          ? ""
                          : matchStatus === "error"
                            ? "!"
                            : matchStatus === "noScore"
                              ? "—"
                              : "?"}
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[#aeb4d6]">
                    {matchStatus === "scored"
                      ? d.profileMatchScore
                      : matchStatus === "noScore"
                      ? d.differentField
                      : matchStatus === "error"
                      ? "Couldn't compute your match"
                      : matchStatus === "loading"
                      ? d.matchScoreLoading
                      : matchStatus === "loggedOut"
                      ? d.loginToSeeMatch
                      : matchStatus === "noAnalysis"
                      ? d.noAnalysisCaption
                      : d.noScoreAvailable}
                  </p>

                  {(matchStatus === "scored" || matchStatus === "noScore" || matchStatus === "error") &&
                    matchDetail?.matchReason && (
                      <p className="mt-3 text-[13px] leading-6 text-[#c4cae9]">{matchDetail.matchReason}</p>
                    )}

                  {matchStatus === "error" && (
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="mt-4 inline-flex items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/20"
                    >
                      Retry
                    </button>
                  )}

                  {matchStatus === "noAnalysis" && isLoggedIn && (
                    <button
                      type="button"
                      onClick={() => navigate("/resume-manager")}
                      className="mt-4 inline-flex items-center justify-center rounded-full border border-[#7c88ff]/30 bg-[#7c88ff]/15 px-4 py-2 text-sm font-semibold text-[#c4b5fd] transition hover:bg-[#7c88ff]/25"
                    >
                      {d.analyzeCvForScore}
                    </button>
                  )}
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={jobType === "internal" && (hasApplied || applying)}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)] transition ${
                      jobType === "internal" && hasApplied
                        ? "cursor-not-allowed bg-emerald-500/70"
                        : "bg-gradient-to-r from-[#7f4cff] to-[#a855f7] hover:scale-[1.02]"
                    }`}
                  >
                    {jobType === "external" ? <ExternalLink size={18} /> : <Send size={18} />}
                    <span>
                      {jobType === "external"
                        ? d.applyNow
                        : applying
                        ? "Applying..."
                        : hasApplied
                        ? "Applied"
                        : d.applyNow}
                    </span>
                  </button>

                  {jobType === "external" && job.sourceUrl && (
                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-[15px] font-bold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white"
                    >
                      {d.viewOriginalPosting}
                    </a>
                  )}
                </div>

                {applyMessage && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.05] p-3 text-center text-sm font-semibold text-[#dbe2ff]">
                    {applyMessage}
                  </div>
                )}
              </div>

              {matchStatus === "loading" && (
                <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                  <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
                  <div className="mt-4 h-4 w-full animate-pulse rounded bg-white/10" />
                  <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-white/10" />
                </div>
              )}

              {matchStatus === "scored" && matchDetail && (
                <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                  <h2 className="mb-4 text-[18px] font-extrabold text-white">{d.fitBreakdown}</h2>
                  <div className="space-y-4">
                    {[
                      // fieldRelevancePercent carries the single largest weight (25%) in the
                      // actual score - it was missing from this list entirely, while
                      // languageMatchPercent below always has a value (the backend defaults it
                      // to a reasonable score rather than null even with no language
                      // requirement). For a sparse job posting where skills/experience/education/
                      // certification all come back null, that left ONLY the language bar
                      // visible, making the score look language-driven when it never was.
                      { label: d.fieldMatch, value: matchDetail.fieldRelevancePercent },
                      { label: d.skillsMatch, value: matchDetail.skillsMatchPercent },
                      { label: d.experienceMatch, value: matchDetail.experienceMatchPercent },
                      { label: d.educationMatch, value: matchDetail.educationMatchPercent },
                      { label: d.certificationMatch, value: matchDetail.certificationMatchPercent },
                      { label: d.locationMatch, value: matchDetail.locationMatchPercent },
                      { label: d.languageMatch, value: matchDetail.languageMatchPercent },
                    ]
                      // Component rows that weren't applicable to this job (backend leaves them
                      // null and excludes them from the weighted score) are omitted rather than
                      // shown as a misleading 0% - that would look like a gap that hurt the score
                      // when it was actually just excluded and had no effect on it.
                      .filter((row) => row.value !== null)
                      .map((row) => (
                      <div key={row.label}>
                        <div className="mb-1.5 flex items-center justify-between text-[13px] font-semibold text-[#c4cae9]">
                          <span>{row.label}</span>
                          <span className="text-white">{row.value ?? 0}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#2a2c5a]">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${row.value ?? 0}%`,
                              background: getRingColor("scored", row.value ?? 0),
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {selectedSkill && (
        <SkillExplanationModal
          skillName={selectedSkill}
          jobTitle={job?.title}
          language={language}
          t={t}
          isRTL={isRTL}
          onClose={() => setSelectedSkill(null)}
        />
      )}

      {showPreInterviewModal && (
        <PreInterviewModal
          jobTitle={job?.title}
          isSubmitting={applying}
          onCancel={() => setShowPreInterviewModal(false)}
          onSubmit={handleSubmitApplication}
        />
      )}

      {showApplySuccessModal && job && (
        <ApplicationSuccessModal
          jobTitle={job.title || ""}
          companyName={job.companyName || ""}
          copy={d.applySuccessModal}
          isRTL={isRTL}
          onClose={() => setShowApplySuccessModal(false)}
          onViewApplications={() => navigate("/applications")}
        />
      )}
    </div>
  );
}

export default JobDetailsPage;
