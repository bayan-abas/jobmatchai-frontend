import { useNavigate } from "react-router-dom";
import { Building2, MapPin, BriefcaseBusiness, Wallet, ExternalLink, CalendarDays, Sparkles, Bookmark, UploadCloud } from "lucide-react";
import { getRingColor } from "../utils/jobInference";
import { formatSalary } from "../utils/formatSalary";

export type ExternalJobData = {
  id: number;
  title?: string;
  companyName?: string;
  location?: string;
  country?: string;
  city?: string;
  type?: string;
  salary?: string;
  description?: string;
  requirements?: string;
  skills?: string;
  // Resolved server-side from the provider's own category/occupation data when available (see
  // backend ExternalJobData.industry) - one of jobInference.ts's INDUSTRY_KEYS, or absent when
  // the provider gave no such signal, in which case inferIndustry() falls back to title-based
  // classification.
  industry?: string;
  sourceName?: string;
  sourceUrl?: string;
  applyUrl?: string;
  externalJobId?: string;
  importedAt?: string;
};

// "error" = the AI couldn't compute this job's match at all (a transient failure, never
// cached by the backend) - distinct from "noScore", which is a real AI verdict.
export type MatchStatus = "loggedOut" | "loading" | "noAnalysis" | "scored" | "noScore" | "error";

export type MatchInfo = {
  status: MatchStatus;
  percent: number;
  reason?: string;
};

type ExternalJobCardProps = {
  job: ExternalJobData;
  matchInfo: MatchInfo;
  t: any;
  isRTL: boolean;
  onViewDetails?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
};

function ExternalJobCard({ job, matchInfo, t, isRTL, onViewDetails, isSaved, onToggleSave }: ExternalJobCardProps) {
  const navigate = useNavigate();
  const p = t.externalJobsPage;
  const ringColor = getRingColor(
    matchInfo.status === "scored" || matchInfo.status === "noScore" || matchInfo.status === "error"
      ? matchInfo.status
      : "noAnalysis",
    matchInfo.percent
  );
  const numeric = matchInfo.status === "scored" ? matchInfo.percent : 0;

  const skills = (job.skills || "")
    .split(/[,;|]/)
    .map((skill) => skill.trim())
    .filter(Boolean);

  const importedDate = job.importedAt
    ? new Date(job.importedAt).toLocaleDateString()
    : null;

  const handleApply = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.16)] transition hover:bg-white/[0.06]">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex flex-col items-center justify-center md:justify-start">
          <div
            className="relative h-[88px] w-[88px] shrink-0"
            title={matchInfo.status === "noScore" || matchInfo.status === "error" ? matchInfo.reason : undefined}
          >
            <div
              className={`h-full w-full rounded-full transition-all duration-[1800ms] ease-out ${
                matchInfo.status === "loading" ? "animate-pulse" : ""
              }`}
              style={{
                background:
                  matchInfo.status === "scored"
                    ? `conic-gradient(${ringColor} ${numeric * 3.6}deg, #2a2c5a 0deg)`
                    : matchInfo.status === "error"
                      ? `conic-gradient(${ringColor} 360deg, #2a2c5a 0deg)`
                      : "conic-gradient(#5f648a 360deg, #2a2c5a 0deg)",
                boxShadow:
                  matchInfo.status === "scored" || matchInfo.status === "error"
                    ? `0 0 24px ${ringColor}22`
                    : "0 0 0 rgba(0,0,0,0)",
              }}
            />
            <div className="absolute inset-[8px] flex items-center justify-center rounded-full bg-[#252654] text-[18px] font-extrabold text-white shadow-inner">
              {matchInfo.status === "scored"
                ? `${matchInfo.percent}%`
                : matchInfo.status === "loading"
                  ? ""
                  : matchInfo.status === "error"
                    ? "!"
                    : matchInfo.status === "noScore"
                      ? "—"
                      : "?"}
            </div>
          </div>

          {matchInfo.status === "loggedOut" && (
            <span className="mt-2 max-w-[120px] text-center text-[11px] font-medium text-white/40">
              {p.loginToSeeMatch}
            </span>
          )}

          {matchInfo.status === "error" && (
            <span className="mt-2 max-w-[110px] text-center text-[11px] font-medium text-amber-300/80">
              {p.matchScoreErrorRetry || "Couldn't compute - refresh to retry"}
            </span>
          )}

          {/* No CVAnalysis for this candidate - the backend already refuses to compute or
              show a percentage in this case (hasAnalysis=false), so this is purely making
              that existing, correct "no score without a CV" behavior visible instead of a
              bare "?" with no explanation - same message + CTA pattern already used on the
              internal Job Matches page and the job details page. */}
          {matchInfo.status === "noAnalysis" && (
            <div className="mt-2 flex max-w-[150px] flex-col items-center gap-2 text-center">
              <span className="text-[11px] font-medium text-white/50">{p.noAnalysisMessage}</span>
              <button
                type="button"
                onClick={() => navigate("/resume-manager")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#7c88ff]/30 bg-[#7c88ff]/15 px-3 py-1.5 text-[11px] font-semibold text-[#c4b5fd] transition hover:bg-[#7c88ff]/25"
              >
                <UploadCloud size={13} />
                {p.uploadCvButton}
              </button>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className={`mb-3 flex flex-wrap items-center gap-3 ${isRTL ? "md:flex-row-reverse" : ""}`}>
            <h3 className="min-w-0 break-words text-2xl font-bold text-white">{job.title || "Untitled Job"}</h3>
            {job.type && (
              <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300">
                {job.type}
              </span>
            )}
          </div>

          <div className={`mb-3 flex items-center gap-2 text-white/70 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Building2 size={16} />
            <span className="text-[15px]">{job.companyName || "Unknown Company"}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-white/55">
            {job.location && (
              <span className={`inline-flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <MapPin size={16} />
                {job.location}
              </span>
            )}
            {job.type && (
              <span className={`inline-flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <BriefcaseBusiness size={16} />
                {job.type}
              </span>
            )}
            <span className={`inline-flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Wallet size={16} />
              {formatSalary(job.salary) || p.salaryNotSpecified}
            </span>
          </div>

          {job.description && (
            <p className="mt-4 line-clamp-3 max-w-[850px] text-[15px] leading-7 text-white/65">
              {job.description}
            </p>
          )}

          {skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/80"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <div className={`mt-5 flex flex-wrap items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">
              {p.externalJobBadge}
            </span>
            <span className="text-xs font-medium text-white/45">
              {p.sourceLabel}: {job.sourceName || "External"}
            </span>
            {importedDate && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium text-white/35 ${isRTL ? "flex-row-reverse" : ""}`}>
                <CalendarDays size={13} />
                {p.importedLabel}: {importedDate}
              </span>
            )}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col justify-center gap-2 md:w-[200px]">
          {onViewDetails && (
            <button
              type="button"
              onClick={onViewDetails}
              className={`inline-flex items-center justify-center gap-2 rounded-[16px] border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/85 transition hover:bg-white/[0.1] ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Sparkles size={16} />
              {p.viewDetails || "View Details"}
            </button>
          )}
          {onToggleSave && (
            <button
              type="button"
              onClick={onToggleSave}
              className={`inline-flex items-center justify-center gap-2 rounded-[16px] border px-4 py-3 text-sm font-bold transition ${
                isSaved
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-white/15 bg-white/[0.06] text-white/85 hover:bg-white/[0.1]"
              } ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
              {isSaved ? p.saved || "Saved" : p.saveJob || "Save Job"}
            </button>
          )}
          <button
            type="button"
            onClick={handleApply}
            disabled={!job.applyUrl}
            className={`inline-flex items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(99,102,241,0.28)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            {p.applyNow}
            <ExternalLink size={16} />
          </button>
          <p className="text-center text-[11px] leading-4 text-white/40">{p.applyDisclaimer}</p>
        </div>
      </div>
    </article>
  );
}

export default ExternalJobCard;
