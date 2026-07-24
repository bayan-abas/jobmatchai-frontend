import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Loader2, Sparkles, User, Briefcase, TrendingUp, AlertTriangle, ClipboardCheck, Target, X } from "lucide-react";
import { apiFetch } from "../utils/api";
import { getMatchTier } from "../utils/matchScore";
import AiDisclaimer from "./AiDisclaimer";

type CandidateSummaryData = {
  hasAnalysis: boolean;
  professionalBackground?: string;
  keySkills?: string[];
  yearsOfExperience?: string;
  strengths?: string;
  weaknesses?: string;
  overallSuitability?: string;
  matchScore?: number;
  matchLabel?: string;
  // Fixed-vocabulary hiring-decision category ("accept"/"consider"/"reject") computed once by
  // the backend from matchScore - see CandidateSummaryService.SummaryResult. This component and
  // its consumers only ever display it (mapped to a localized label); never re-derive it.
  recommendation?: string;
  message?: string;
};

type CandidateAiSummaryModalProps = {
  applicationId: number;
  candidateName: string;
  jobTitle: string;
  language: string;
  t: any;
  isRTL: boolean;
  onClose: () => void;
  onScoreReady?: (matchScore: number, matchLabel: string, recommendation: string) => void;
};

// Keyed by `${applicationId}:${language}` so re-opening the modal for the same candidate in the
// SAME language reuses the already-fetched summary instead of calling the backend (and OpenAI)
// again - but switching the UI language always falls through to a fresh fetch instead of
// silently showing the previous language's cached text (the backend itself caches per-language,
// so that fetch is cheap - see CandidateSummaryService - this is just the frontend's OWN memo,
// which must not short-circuit before the language-aware fetch it's memoizing ever runs again).
const summaryCache = new Map<string, CandidateSummaryData>();

// Tracks a fetch that's still in flight. If the modal is closed and reopened for
// the same candidate+language before the first request finishes (the AI call can take a
// few seconds), we must await the SAME promise instead of firing a second POST —
// otherwise the backend could see two overlapping "no cached row yet" requests.
const pendingFetches = new Map<string, Promise<CandidateSummaryData>>();

function summaryCacheKey(applicationId: number, language: string): string {
  return `${applicationId}:${language}`;
}

function fetchSummary(applicationId: number, language: string): Promise<CandidateSummaryData> {
  const cacheKey = summaryCacheKey(applicationId, language);
  const existing = pendingFetches.get(cacheKey);
  if (existing) {
    return existing;
  }

  const promise = apiFetch(`/api/applications/${applicationId}/ai-summary?language=${language}`, {
    method: "POST",
  }).finally(() => {
    pendingFetches.delete(cacheKey);
  });

  pendingFetches.set(cacheKey, promise);
  return promise;
}

function CandidateAiSummaryModal({
  applicationId,
  candidateName,
  jobTitle,
  language,
  t,
  isRTL,
  onClose,
  onScoreReady,
}: CandidateAiSummaryModalProps) {
  const s = t.companyApplicationsPage?.aiSummaryModal || {};
  const cacheKey = summaryCacheKey(applicationId, language);
  const [data, setData] = useState<CandidateSummaryData | null>(summaryCache.get(cacheKey) || null);
  const [loading, setLoading] = useState(!summaryCache.has(cacheKey));
  const [error, setError] = useState(false);

  useEffect(() => {
    const key = summaryCacheKey(applicationId, language);

    if (summaryCache.has(key)) {
      setData(summaryCache.get(key) || null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchSummary(applicationId, language)
      .then((result: CandidateSummaryData) => {
        if (cancelled) return;
        summaryCache.set(key, result);
        setData(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applicationId, language]);

  // Propagate the saved score back to the candidate list as soon as it's known,
  // whether it just came from OpenAI or was served from the cache. Deliberately
  // keyed only on `data` (not `onScoreReady`, which is a fresh inline function
  // on every parent render) so this fires once per result, not once per render.
  useEffect(() => {
    if (data && data.hasAnalysis && typeof data.matchScore === "number") {
      onScoreReady?.(data.matchScore, data.matchLabel || "", data.recommendation || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-ai-summary-modal-title"
        dir={isRTL ? "rtl" : "ltr"}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-[620px] overflow-y-auto rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.96)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.55)] max-[480px]:rounded-[22px] max-[480px]:p-5"
      >
        <div className={`mb-6 flex items-start justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={`flex min-w-0 items-center gap-3 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
              <Sparkles size={20} />
            </div>
            <div className="min-w-0">
              <h2 id="candidate-ai-summary-modal-title" className="break-words text-[20px] font-extrabold text-white max-[480px]:text-[18px]">{candidateName}</h2>
              <p className="text-sm text-white/50">{s.subtitle || "AI-generated candidate briefing"} · {jobTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common?.close || "Close"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition hover:bg-white/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <X size={18} />
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <Loader2 size={28} className="animate-spin text-violet-300" />
            <p className="text-sm text-[#c4cae9]">{s.generating || "Generating AI summary..."}</p>
          </div>
        )}

        {!loading && (error || !data) && (
          <p className="text-sm text-[#c4cae9]">{s.loadError || "Could not generate the AI summary. Please try again."}</p>
        )}

        {!loading && !error && data && !data.hasAnalysis && (
          <p className="text-sm text-[#c4cae9]">
            {data.message || s.noAnalysis || "This candidate has not completed a CV analysis yet, so an AI summary is not available."}
          </p>
        )}

        {!loading && !error && data && data.hasAnalysis && <AiDisclaimer className="mb-5" />}

        {!loading && !error && data && data.hasAnalysis && typeof data.matchScore === "number" && (() => {
          const tier = getMatchTier(data.matchScore);
          return (
            <div className={`mb-5 rounded-2xl border ${tier.border} ${tier.bg} p-5`}>
              <div className={`mb-3 flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                <h3 className={`flex items-center gap-2 text-[15px] font-bold text-white ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Target size={17} className={tier.text} />
                  {s.aiMatchScore || "AI Match Score"}
                </h3>
                <span className={`flex items-center gap-2 text-2xl font-extrabold ${tier.text}`}>
                  <span>{tier.emoji}</span>
                  {data.matchScore}%
                </span>
              </div>
              <p className={`mb-3 text-sm font-semibold ${tier.text}`}>
                {data.matchLabel || ""}
              </p>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${tier.bar} transition-all`}
                  style={{ width: `${Math.max(0, Math.min(100, data.matchScore))}%` }}
                />
              </div>
            </div>
          );
        })()}

        {!loading && !error && data && data.hasAnalysis && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
              <h3 className={`mb-2 flex items-center gap-2 text-[15px] font-bold text-white ${isRTL ? "flex-row-reverse" : ""}`}>
                <User size={17} className="text-[#7c88ff]" />
                {s.professionalBackground || "Professional Background"}
              </h3>
              <p className="text-sm leading-6 text-[#c4cae9]">{data.professionalBackground}</p>
            </div>

            {!!data.keySkills?.length && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <h3 className={`mb-3 flex items-center gap-2 text-[15px] font-bold text-white ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Briefcase size={17} className="text-cyan-300" />
                  {s.keySkills || "Key Technical Skills"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.keySkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
              <h3 className={`mb-2 flex items-center gap-2 text-[15px] font-bold text-white ${isRTL ? "flex-row-reverse" : ""}`}>
                <ClipboardCheck size={17} className="text-emerald-300" />
                {s.yearsOfExperience || "Years of Experience"}
              </h3>
              <p className="text-sm leading-6 text-[#c4cae9]">{data.yearsOfExperience}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
              <h3 className={`mb-2 flex items-center gap-2 text-[15px] font-bold text-white ${isRTL ? "flex-row-reverse" : ""}`}>
                <TrendingUp size={17} className="text-emerald-300" />
                {s.strengths || "Main Strengths"}
              </h3>
              <p className="text-sm leading-6 text-[#c4cae9]">{data.strengths}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
              <h3 className={`mb-2 flex items-center gap-2 text-[15px] font-bold text-white ${isRTL ? "flex-row-reverse" : ""}`}>
                <AlertTriangle size={17} className="text-amber-300" />
                {s.weaknesses || "Potential Weaknesses / Missing Skills"}
              </h3>
              <p className="text-sm leading-6 text-[#c4cae9]">{data.weaknesses}</p>
            </div>

            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-5">
              <h3 className={`mb-2 flex items-center gap-2 text-[15px] font-bold text-white ${isRTL ? "flex-row-reverse" : ""}`}>
                <Sparkles size={17} className="text-violet-300" />
                {s.overallSuitability || "Overall Suitability"}
              </h3>
              <p className="text-sm leading-6 text-[#e4e6ff]">{data.overallSuitability}</p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default CandidateAiSummaryModal;
