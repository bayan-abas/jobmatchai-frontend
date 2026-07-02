import { useEffect, useState } from "react";
import { X, Lightbulb, MapPinned, GraduationCap, ListChecks } from "lucide-react";

const API_BASE_URL = "http://localhost:8080";

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

    fetch(`${API_BASE_URL}/api/skills/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillName, jobTitle, language }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load skill explanation");
        return res.json();
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.96)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.55)]"
      >
        <div className={`mb-6 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
          <h2 className="text-[24px] font-extrabold text-white">{skillName}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition hover:bg-white/[0.12] hover:text-white"
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
      </div>
    </div>
  );
}

export default SkillExplanationModal;
