import { useEffect, useRef, useState } from "react";
import {
  FileText,
  UploadCloud,
  Trash2,
  Eye,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Brain,
  BadgeCheck,
  AlertCircle,
  TrendingUp,
  Info,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { apiFetch, apiFetchBlob, ApiError } from "../utils/api";

type AnalysisResult = {
  score: number;
  summary: string;
  strengths: string;
  improvements: string;
  evaluationReason: string;
  missingKeywords: string[];
  atsReadiness: string;
  candidateField: string;
};

type Toast = {
  id: number;
  type: "success" | "error" | "info";
  text: string;
};

function ResumeManager() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language];
  const r = t.resumeManagerPage;
  const isRTL = language === "ar" || language === "he";

  const [fileName, setFileName] = useState("");
  const [displayFileName, setDisplayFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounterRef = useRef(0);

  const showToast = (type: Toast["type"], text: string) => {
    const id = ++toastCounterRef.current;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  const getSafeErrorMessage = (errorText: string, fallback: string) => {
    const rawServerError = /\b(JDBC|SQL|Exception|ERROR:|column|java\.|org\.|hibernate)\b/i;
    if (!errorText || rawServerError.test(errorText)) return fallback;
    return errorText;
  };

  const splitText = (value: string | null | undefined) => {
    if (!value) return [];
    return value
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const buildAnalysis = (data: Record<string, string>): AnalysisResult => {
    const score = Number(data.overallScore || 0);
    const atsReadiness =
      score >= 75 ? r.atsStrong : score >= 55 ? r.atsGood : r.atsNeedsImprovement;
    return {
      score,
      summary: data.summary || r.defaultSummary,
      strengths: data.strengths || "",
      improvements: data.missingInformation || "",
      evaluationReason: data.evaluationReason || "",
      missingKeywords: splitText(data.missingSkills),
      atsReadiness,
      candidateField: data.candidateField || "",
    };
  };

  useEffect(() => {
    const fetchCurrentCV = async () => {
      try {
        if (!user) return;

        let currentFileName = "";
        let currentDisplayName = "";
        try {
          const info = await apiFetch(`/api/cv/current-info`);
          currentFileName = (info.fileName || "").trim();
          currentDisplayName = (info.originalFileName || currentFileName).trim();
        } catch (err) {
          if (err instanceof ApiError) {
            setFileName("");
            setDisplayFileName("");
            setAnalysis(null);
            localStorage.removeItem("resumeFileName");
            return;
          }
          throw err;
        }

        if (currentFileName) {
          setFileName(currentFileName);
          setDisplayFileName(currentDisplayName);
          localStorage.setItem("resumeFileName", currentFileName);

          try {
            const data = await apiFetch(`/api/cv/analysis`);
            setAnalysis(buildAnalysis(data));
          } catch {
            // no analysis available yet; keep previous behavior of silently skipping
          }
        } else {
          setFileName("");
          setDisplayFileName("");
          setAnalysis(null);
          localStorage.removeItem("resumeFileName");
        }
      } catch (error) {
        console.error("Failed to fetch current CV:", error);
      }
    };

    fetchCurrentCV();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChoose = () => {
    fileInputRef.current?.click();
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setIsAnalyzing(false);
    setProgress(0);
    setAnalysisStep("");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      if (!user) {
        showToast("error", r.errorEmailNotFound);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);

      const uploadResult = await apiFetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      setFileName(uploadResult.fileName);
      setDisplayFileName(uploadResult.originalFileName || uploadResult.fileName);
      resetAnalysis();
      localStorage.setItem("resumeFileName", uploadResult.fileName);

      showToast("success", r.uploadSuccess);
    } catch (error) {
      console.error("CV upload error:", error);
      if (error instanceof ApiError) {
        showToast("error", getSafeErrorMessage(error.message, r.errorUploadFailed));
      } else {
        showToast("error", r.errorUploadGeneric);
      }
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleViewCV = async () => {
    if (!fileName) return;

    try {
      const blob = await apiFetchBlob(`/api/cv/download/${encodeURIComponent(fileName)}`);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error("CV view error:", error);
      if (error instanceof ApiError) {
        showToast("error", getSafeErrorMessage(error.message, r.errorViewFailed));
      } else {
        showToast("error", r.errorViewFailed);
      }
    }
  };

  const handleDelete = async () => {
    if (!user) {
      showToast("error", r.errorEmailNotFound);
      return;
    }

    try {
      setIsDeleting(true);

      await apiFetch(`/api/cv/delete`, {
        method: "DELETE",
      });

      setFileName("");
      setDisplayFileName("");
      resetAnalysis();
      localStorage.removeItem("resumeFileName");

      showToast("success", r.deleteSuccess);
    } catch (error) {
      console.error("Delete CV error:", error);
      if (error instanceof ApiError) {
        showToast("error", getSafeErrorMessage(error.message, r.errorDeleteFailed));
      } else {
        showToast("error", r.errorDeleteGeneric);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!fileName || isAnalyzing) return;

    if (!user) {
      showToast("error", r.errorEmailNotFound);
      return;
    }

    try {
      setAnalysis(null);
      setIsAnalyzing(true);
      setProgress(20);
      setAnalysisStep(r.analysisStep1);

      const data = await apiFetch(
        `/api/cv/analyze?language=${language}`,
        { method: "POST" }
      );

      setProgress(75);
      setAnalysisStep(r.analysisStep5);

      setProgress(100);
      setAnalysisStep(r.analysisComplete);
      setAnalysis(buildAnalysis(data));

      showToast("success", r.analyzeSuccess);
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError) {
        showToast("error", getSafeErrorMessage(error.message, r.errorAnalyzeFailed));
      } else {
        showToast("error", r.errorAnalyzeGeneric);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={`min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-7 lg:px-8 ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        <div className="mx-auto w-full max-w-[1080px]">
          <div className="mb-5 flex items-center justify-start">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
              <span>{t.common.back}</span>
            </button>
          </div>

          <section className="mb-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
                <FileText size={26} />
              </div>

              <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                <h1 className="text-[42px] font-extrabold leading-tight text-white">
                  {r.title}
                </h1>
                <p className="mt-2 text-[17px] text-[#aeb4d6]">
                  {r.subtitle}
                </p>
              </div>
            </div>

            <div className="overflow-visible rounded-[28px] border border-white/10 bg-white/[0.05] px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#5e66ff1f] text-[#7c88ff]">
                    <UploadCloud size={24} />
                  </div>

                  <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                    <h3 className="text-[20px] font-extrabold text-white">
                      {r.yourResumeHub}
                    </h3>
                    <p className="mt-1 text-[15px] text-[#aeb4d6]">
                      {r.hubSubtitle}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleChoose}
                    disabled={isUploading || isDeleting}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7f4cff] to-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <UploadCloud size={16} />
                    )}
                    {isUploading ? r.uploading : r.chooseFile}
                  </button>

                  {fileName && (
                    <button
                      onClick={handleViewCV}
                      disabled={isAnalyzing || isDeleting}
                      className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-5 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Eye size={16} />
                      {r.viewCV}
                    </button>
                  )}

                  {fileName && (
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || isDeleting}
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isAnalyzing ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      {isAnalyzing ? r.analyzing : r.analyze}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleUpload}
            className="hidden"
          />

          <section className="space-y-5">
            <article className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-7 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#7f4cff33] to-[#38bdf833] text-[#d9dcff] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                  <UploadCloud size={40} />
                </div>

                <h2 className="text-[30px] font-bold text-white">
                  {r.uploadResume}
                </h2>

                <p className="mt-4 max-w-[620px] text-[18px] leading-8 text-[#b8bddb]">
                  {r.uploadText}
                </p>

                {!fileName && (
                  <button
                    onClick={handleChoose}
                    disabled={isUploading}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7f4cff] to-[#6366f1] px-8 py-3 font-semibold text-white transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploading && <Loader2 size={16} className="animate-spin" />}
                    {isUploading ? r.uploading : r.chooseFile}
                  </button>
                )}

                <p className="mt-6 text-sm text-[#8f96c2]">
                  {r.supportedFormats}
                </p>

                {toasts.length > 0 && (
                  <div className="mt-5 flex flex-col gap-2 w-full max-w-[420px]">
                    {toasts.map((toast) => (
                      <div
                        key={toast.id}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.30)] backdrop-blur-md ${
                          toast.type === "success"
                            ? "border-emerald-400/30 bg-[rgba(5,40,25,0.94)] text-emerald-100"
                            : toast.type === "error"
                            ? "border-rose-400/30 bg-[rgba(45,5,15,0.94)] text-rose-100"
                            : "border-cyan-400/30 bg-[rgba(5,20,45,0.94)] text-cyan-100"
                        }`}
                      >
                        {toast.type === "success" ? (
                          <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                        ) : (
                          <AlertCircle
                            size={18}
                            className={`shrink-0 ${toast.type === "error" ? "text-rose-400" : "text-cyan-400"}`}
                          />
                        )}
                        <p className="flex-1 text-sm font-medium leading-5">{toast.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>

            {fileName && (
              <article className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition hover:border-white/20 hover:bg-[rgba(50,52,108,0.96)]">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                      <CheckCircle2 size={24} />
                    </div>

                    <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h2 className="text-[22px] font-extrabold text-white">
                          {r.resumeUploaded}
                        </h2>

                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                          {r.activeFile}
                        </span>
                      </div>

                      <p className="break-all text-[16px] text-[#c4cae9]">
                        {displayFileName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleViewCV}
                      disabled={isAnalyzing || isDeleting}
                      className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-5 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Eye size={16} />
                      {r.viewCV}
                    </button>

                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || isDeleting}
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isAnalyzing ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      {isAnalyzing ? r.analyzing : r.analyze}
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={isAnalyzing || isDeleting}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-5 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeleting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {isDeleting ? r.deleting : t.common.delete}
                    </button>
                  </div>
                </div>
              </article>
            )}

            {isAnalyzing && (
              <article className="rounded-[30px] border border-cyan-400/20 bg-[rgba(32,36,86,0.92)] px-7 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.20)]">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
                    <Brain size={34} className="animate-pulse" />
                  </div>

                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">
                    {r.analysisTitle}
                  </p>

                  <h3 className="mt-3 text-[28px] font-extrabold text-white">
                    {r.analysisRunning}
                  </h3>

                  <p className="mt-3 text-[15px] text-[#b8bddb]">
                    {analysisStep}
                  </p>

                  <div className="mt-6 h-3 w-full max-w-[520px] overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mt-3 text-sm font-semibold text-cyan-200">
                    {progress}%
                  </div>
                </div>
              </article>
            )}

            {analysis && !isAnalyzing && (
              <>
                <div
                  className={`flex items-start gap-3 rounded-[22px] border border-cyan-400/15 bg-cyan-400/5 px-6 py-5 ${
                    isRTL ? "flex-row-reverse text-right" : "text-left"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                    <Info size={18} />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-white">
                      {r.scoreExplanationTitle}
                    </h4>
                    <p className="mt-1 text-[14px] leading-6 text-[#b8bddb]">
                      {r.scoreExplanationText}
                    </p>
                  </div>
                </div>

                <article className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-7 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5e66ff1f] text-[#7c88ff] shadow-[0_0_35px_rgba(127,76,255,0.18)]">
                      <Sparkles size={28} />
                    </div>

                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#9da7da]">
                      {r.aiResumeScore}
                    </p>

                    <h3 className="mt-4 bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-[54px] font-extrabold text-transparent">
                      {analysis.score}%
                    </h3>

                    <p className="mt-3 max-w-[620px] text-[16px] leading-7 text-[#b8bddb]">
                      {analysis.summary}
                    </p>

                    {analysis.evaluationReason && (
                      <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-[#c4cae9] italic">
                        {analysis.evaluationReason}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                        {r.atsReadiness}: {analysis.atsReadiness}
                      </div>
                      {analysis.candidateField && (
                        <div className="rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-300 capitalize">
                          {r.detectedField}: {analysis.candidateField}
                        </div>
                      )}
                    </div>
                  </div>
                </article>

                <div className="grid gap-5 lg:grid-cols-2">
                  <article className="rounded-[28px] border border-emerald-400/15 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                    <div className={`mb-4 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                        <BadgeCheck size={22} />
                      </div>
                      <h3 className="text-xl font-bold text-white">{r.strengthsTitle}</h3>
                    </div>

                    {analysis.strengths ? (
                      <p className="text-[15px] leading-7 text-[#d6dcff]">
                        {analysis.strengths}
                      </p>
                    ) : (
                      <p className="text-[15px] text-[#b8bddb]">
                        {r.strengthsEmpty}
                      </p>
                    )}
                  </article>

                  <article className="rounded-[28px] border border-amber-400/15 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                    <div className={`mb-4 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                        <TrendingUp size={22} />
                      </div>
                      <h3 className="text-xl font-bold text-white">{r.improvementsTitle}</h3>
                    </div>

                    {analysis.improvements ? (
                      <p className="text-[15px] leading-7 text-[#d6dcff]">
                        {analysis.improvements}
                      </p>
                    ) : (
                      <p className="text-[15px] text-[#b8bddb]">
                        {r.improvementsEmpty}
                      </p>
                    )}
                  </article>
                </div>

                {analysis.missingKeywords.length > 0 && (
                  <article className="rounded-[28px] border border-cyan-400/15 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                    <div className={`mb-4 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                        <AlertCircle size={22} />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {r.missingSkillsTitle}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {analysis.missingKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </article>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default ResumeManager;

