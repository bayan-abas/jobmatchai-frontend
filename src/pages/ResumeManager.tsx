import { useEffect, useRef, useState } from "react";
import {
  FileText,
  UploadCloud,
  Trash2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Brain,
  BadgeCheck,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

type AnalysisResult = {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  atsReadiness: string;
};

function ResumeManager() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("resumeFileName");
    const savedAnalysis = localStorage.getItem("resumeAnalysis");

    if (saved) setFileName(saved);
    if (savedAnalysis) setAnalysis(JSON.parse(savedAnalysis));
  }, []);

  const handleChoose = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setAnalysis(null);
    setIsAnalyzing(false);
    setProgress(0);
    setAnalysisStep("");

    localStorage.setItem("resumeFileName", file.name);
    localStorage.removeItem("resumeScore");
    localStorage.removeItem("resumeAnalysis");
  };

  const handleDelete = () => {
    setFileName("");
    setAnalysis(null);
    setIsAnalyzing(false);
    setProgress(0);
    setAnalysisStep("");
    localStorage.removeItem("resumeFileName");
    localStorage.removeItem("resumeScore");
    localStorage.removeItem("resumeAnalysis");
  };

  const buildFakeAnalysis = (finalScore: number): AnalysisResult => {
    if (finalScore >= 90) {
      return {
        score: finalScore,
        summary:
          "Your resume looks highly competitive. It presents a strong profile with relevant skills, a clear structure, and good role alignment.",
        strengths: [
          "Clear and professional resume structure",
          "Strong alignment between skills and target job roles",
          "Projects and experience add credibility",
        ],
        improvements: [
          "Add more measurable achievements using numbers",
          "Strengthen action verbs in experience descriptions",
          "Customize the summary for each role you apply to",
        ],
        missingKeywords: ["Leadership", "Problem Solving", "Team Collaboration"],
        atsReadiness: "Excellent",
      };
    }

    if (finalScore >= 80) {
      return {
        score: finalScore,
        summary:
          "Your resume is strong overall and shows good potential. A few improvements can make it more polished and more ATS-friendly.",
        strengths: [
          "Relevant technical background is visible",
          "Resume structure is readable and organized",
          "Skills section supports your target role",
        ],
        improvements: [
          "Add stronger project impact descriptions",
          "Use more job-specific keywords",
          "Improve consistency in formatting and spacing",
        ],
        missingKeywords: ["SQL", "Communication", "Analytical Thinking"],
        atsReadiness: "Good",
      };
    }

    return {
      score: finalScore,
      summary:
        "Your resume has a good foundation, but it needs improvement to become more competitive and realistic for stronger job matching.",
      strengths: [
        "Basic information is present",
        "Resume has a usable starting structure",
        "Some relevant skills are already included",
      ],
      improvements: [
        "Add more projects and hands-on experience",
        "Rewrite sections to sound more professional",
        "Include clearer technical keywords and stronger role targeting",
      ],
      missingKeywords: ["JavaScript", "Teamwork", "Project Experience"],
      atsReadiness: "Moderate",
    };
  };

  const handleAnalyze = () => {
    if (!fileName || isAnalyzing) return;

    setAnalysis(null);
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisStep("Uploading and preparing file...");

    const steps = [
      { progress: 16, text: "Reading CV structure..." },
      { progress: 33, text: "Scanning skills and keywords..." },
      { progress: 51, text: "Checking formatting and clarity..." },
      { progress: 72, text: "Comparing content to job expectations..." },
      { progress: 89, text: "Generating AI feedback and suggestions..." },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setProgress(step.progress);
        setAnalysisStep(step.text);
      }, (index + 1) * 700);
    });

    setTimeout(() => {
      const finalScore = Math.floor(78 + Math.random() * 18);
      const fakeAnalysis = buildFakeAnalysis(finalScore);

      setProgress(100);
      setAnalysisStep("Analysis complete");
      setAnalysis(fakeAnalysis);
      setIsAnalyzing(false);

      localStorage.setItem("resumeScore", finalScore.toString());
      localStorage.setItem("resumeAnalysis", JSON.stringify(fakeAnalysis));
    }, 4300);
  };

  return (
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
                {t.resumeManagerPage.title}
              </h1>
              <p className="mt-2 text-[17px] text-[#aeb4d6]">
                {t.resumeManagerPage.subtitle}
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
                    {t.resumeManagerPage.yourResumeHub}
                  </h3>
                  <p className="mt-1 text-[15px] text-[#aeb4d6]">
                    {t.resumeManagerPage.hubSubtitle ||
                      "Upload your CV, keep it updated, and check your AI resume score"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleChoose}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7f4cff] to-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02]"
                >
                  <UploadCloud size={16} />
                  {t.resumeManagerPage.chooseFile}
                </button>

                {fileName && (
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAnalyzing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    {isAnalyzing ? "Analyzing..." : t.resumeManagerPage.analyze}
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
                {t.resumeManagerPage.uploadResume}
              </h2>

              <p className="mt-4 max-w-[620px] text-[18px] leading-8 text-[#b8bddb]">
                {t.resumeManagerPage.uploadText}
              </p>

              {!fileName && (
                <button
                  onClick={handleChoose}
                  className="mt-8 rounded-full bg-gradient-to-r from-[#7f4cff] to-[#6366f1] px-8 py-3 font-semibold text-white transition hover:scale-[1.03]"
                >
                  {t.resumeManagerPage.chooseFile}
                </button>
              )}

              <p className="mt-6 text-sm text-[#8f96c2]">
                {t.resumeManagerPage.supportedFormats}
              </p>
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
                        {t.resumeManagerPage.resumeUploaded}
                      </h2>

                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                        {t.resumeManagerPage.activeFile}
                      </span>
                    </div>

                    <p className="break-all text-[16px] text-[#c4cae9]">
                      {fileName}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAnalyzing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    {isAnalyzing ? "Analyzing..." : t.resumeManagerPage.analyze}
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-5 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    {t.common.delete}
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
                  AI Resume Analysis
                </p>

                <h3 className="mt-3 text-[28px] font-extrabold text-white">
                  Analyzing your CV...
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
              <article className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-7 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5e66ff1f] text-[#7c88ff] shadow-[0_0_35px_rgba(127,76,255,0.18)]">
                    <Sparkles size={28} />
                  </div>

                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#9da7da]">
                    {t.resumeManagerPage.aiResumeScore}
                  </p>

                  <h3 className="mt-4 bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-[54px] font-extrabold text-transparent">
                    {analysis.score}%
                  </h3>

                  <p className="mt-3 max-w-[620px] text-[16px] leading-7 text-[#b8bddb]">
                    {analysis.summary}
                  </p>

                  <div className="mt-5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                    ATS Readiness: {analysis.atsReadiness}
                  </div>
                </div>
              </article>

              <div className="grid gap-5 lg:grid-cols-2">
                <article className="rounded-[28px] border border-emerald-400/15 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <BadgeCheck size={22} />
                    </div>
                    <h3 className="text-xl font-bold text-white">AI Strengths</h3>
                  </div>

                  <div className="space-y-3">
                    {analysis.strengths.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-[15px] text-[#d6dcff]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-[28px] border border-amber-400/15 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                      <TrendingUp size={22} />
                    </div>
                    <h3 className="text-xl font-bold text-white">AI Improvements</h3>
                  </div>

                  <div className="space-y-3">
                    {analysis.improvements.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-[15px] text-[#d6dcff]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </article>
              </div>

              <article className="rounded-[28px] border border-cyan-400/15 bg-[rgba(44,45,95,0.9)] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <AlertCircle size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Suggested Keywords to Add
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
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default ResumeManager;