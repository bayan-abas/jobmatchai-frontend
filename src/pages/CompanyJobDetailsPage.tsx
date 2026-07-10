import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Wallet,
  BriefcaseBusiness,
  CalendarDays,
  Users,
  Target,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";
import { formatSalaryRange } from "../utils/formatSalary";
import { getMatchTier } from "../utils/matchScore";

type JobCompanyDetails = {
  id: number;
  title: string;
  companyName?: string;
  companyEmail?: string;
  location?: string;
  type?: string;
  salary?: string;
  description?: string;
  requirements?: string;
  skills?: string;
  createdAt?: string | null;
  applicantsCount: number;
  averageMatchScore: number | null;
  status: string;
};

function splitList(value?: string): string[] {
  return (value || "")
    .split(/[,;|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatFullDate(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function CompanyJobDetailsPage() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const d = t.companyJobDetailsPage || {};
  const isRTL = language === "ar" || language === "he";

  const [job, setJob] = useState<JobCompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) return;

    setLoading(true);
    setError("");
    setNotFound(false);

    apiFetch(`/api/jobs/${jobId}/company-details`)
      .then((data: JobCompanyDetails) => {
        setJob(data);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(d.loadError || "Failed to load job details.");
        }
      })
      .finally(() => setLoading(false));
  }, [jobId, d.loadError]);

  const requirements = splitList(job?.requirements);
  const skills = splitList(job?.skills);
  const matchTier =
    job?.averageMatchScore != null ? getMatchTier(job.averageMatchScore) : null;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-7 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[860px]">
        <div className={`mb-6 flex items-center ${isRTL ? "justify-end" : "justify-start"}`}>
          <button
            type="button"
            onClick={() => navigate("/company-job-postings")}
            className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
            <span>{d.back || "Back to Job Postings"}</span>
          </button>
        </div>

        {loading && (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-white/65">
            {d.loading || "Loading job details..."}
          </div>
        )}

        {!loading && notFound && (
          <div className="rounded-[24px] border border-rose-400/30 bg-rose-400/10 px-6 py-12 text-center text-rose-200">
            {d.jobNotFound || "Job not found."}
          </div>
        )}

        {!loading && !notFound && error && (
          <div className="rounded-[24px] border border-rose-400/30 bg-rose-400/10 px-6 py-12 text-center text-rose-200">
            {error}
          </div>
        )}

        {!loading && !notFound && !error && job && (
          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.94)] px-7 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <div className={`mb-4 flex flex-wrap items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                <h1 className="text-[28px] font-extrabold text-white lg:text-[34px]">
                  {job.title || d.untitledJob || "Untitled Job"}
                </h1>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-sm font-semibold text-emerald-300">
                  {job.status}
                </span>
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
                    {formatSalaryRange(job.salary) || d.salaryNotSpecified || "Salary not specified"}
                  </span>
                </div>
                {job.createdAt && (
                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} />
                    <span>
                      {d.posted || "Posted"} {formatFullDate(job.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6 text-center">
                <div className="mb-2 flex items-center justify-center gap-2 text-white/50">
                  <Users size={18} />
                  <span className="text-[13px] font-semibold uppercase tracking-wide">
                    {d.applicants || "Applicants"}
                  </span>
                </div>
                <div className="text-[32px] font-extrabold text-white">{job.applicantsCount}</div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6 text-center">
                <div className="mb-2 flex items-center justify-center gap-2 text-white/50">
                  <Target size={18} />
                  <span className="text-[13px] font-semibold uppercase tracking-wide">
                    {d.avgMatchScore || "Avg Match Score"}
                  </span>
                </div>
                <div className={`text-[32px] font-extrabold ${matchTier ? matchTier.text : "text-white/45"}`}>
                  {job.applicantsCount === 0
                    ? d.noApplicants || "No applicants"
                    : job.averageMatchScore != null
                    ? `${job.averageMatchScore}%`
                    : d.notScoredYet || "Not scored yet"}
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
              <h2 className="mb-4 flex items-center gap-2 text-[22px] font-extrabold text-white">
                <ClipboardList size={20} className="text-[#facc15]" />
                {d.description || "Description"}
              </h2>
              <p className="whitespace-pre-line leading-7 text-[#c4cae9]">
                {job.description || "-"}
              </p>
            </div>

            {requirements.length > 0 && (
              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                <h2 className="mb-4 flex items-center gap-2 text-[22px] font-extrabold text-white">
                  <CheckCircle2 size={20} className="text-emerald-300" />
                  {d.experienceLevel || "Requirements / Experience Level"}
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
                <h2 className="mb-4 text-[22px] font-extrabold text-white">
                  {d.requiredSkills || "Required Skills"}
                </h2>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {skills.map((skill) => (
                    <div
                      key={skill}
                      className={`flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm font-medium text-white/80 ${
                        isRTL ? "flex-row-reverse text-right" : ""
                      }`}
                    >
                      <span className="truncate">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyJobDetailsPage;
