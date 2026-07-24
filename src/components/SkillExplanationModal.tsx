import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { X, Lightbulb, MapPinned, GraduationCap, ListChecks } from "lucide-react";
import { apiFetch } from "../utils/api";

type SkillExplanationData = {
  skillName: string;
  whyImportant: string;
  whereUsed: string[];
  recommendedResources: string[];
  learningTips: string[];
};

type SkillExplanationModalProps = {
  skillName: string;
  jobTitle?: string;
  language: string;
  t: any;
  isRTL: boolean;
  onClose: () => void;
};

function SkillExplanationModal({ skillName, jobTitle, language, t, isRTL, onClose }: SkillExplanationModalProps) {
  const s = t.jobDetails.skillModal;
  const [data, setData] = useState<SkillExplanationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    apiFetch(`/api/skills/explain`, {
      method: "POST",
      body: JSON.stringify({ skillName, jobTitle, language }),
    })
      .then((result: SkillExplanationData) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [skillName, jobTitle, language]);

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
        aria-labelledby="skill-explanation-modal-title"
        dir={isRTL ? "rtl" : "ltr"}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.96)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.55)] max-[480px]:rounded-[22px] max-[480px]:p-5"
      >
        <div className={`mb-6 flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <h2
            id="skill-explanation-modal-title"
            className="min-w-0 break-words text-[22px] font-extrabold text-white max-[480px]:text-[19px]"
          >
            {skillName}
          </h2>
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
          <div className="space-y-4">
            <div className="h-4 w-full animate-pulse rounded bg-white/10" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-white/10" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-white/10" />
          </div>
        )}

        {!loading && !data && (
          <p className="text-sm text-[#c4cae9]">{s.loadError}</p>
        )}

        {!loading && data && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
              <h3 className={`mb-2 flex items-center gap-2 text-[15px] font-bold text-white ${isRTL ? "flex-row-reverse" : ""}`}>
                <Lightbulb size={17} className="text-[#facc15]" />
                {s.whyImportant}
              </h3>
              <p className="text-sm leading-6 text-[#c4cae9]">{data.whyImportant}</p>
            </div>

            {data.whereUsed.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <h3 className={`mb-3 flex items-center gap-2 text-[15px] font-bold text-white ${isRTL ? "flex-row-reverse" : ""}`}>
                  <MapPinned size={17} className="text-[#7c88ff]" />
                  {s.whereUsed}
                </h3>
                <ul className="space-y-2 text-sm text-[#c4cae9]">
                  {data.whereUsed.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7c88ff]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.recommendedResources.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <h3 className={`mb-3 flex items-center gap-2 text-[15px] font-bold text-white ${isRTL ? "flex-row-reverse" : ""}`}>
                  <GraduationCap size={17} className="text-[#c084fc]" />
                  {s.recommendedResources}
                </h3>
                <ul className="space-y-2 text-sm text-[#c4cae9]">
                  {data.recommendedResources.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c084fc]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.learningTips.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <h3 className={`mb-3 flex items-center gap-2 text-[15px] font-bold text-white ${isRTL ? "flex-row-reverse" : ""}`}>
                  <ListChecks size={17} className="text-emerald-300" />
                  {s.learningTips}
                </h3>
                <ul className="space-y-2 text-sm text-[#c4cae9]">
                  {data.learningTips.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default SkillExplanationModal;
