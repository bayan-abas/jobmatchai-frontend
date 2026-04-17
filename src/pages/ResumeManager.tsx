import { useEffect, useRef, useState } from "react";
import {
  FileText,
  UploadCloud,
  Trash2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

function ResumeManager() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar" || language === "he";

  const [fileName, setFileName] = useState("");
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("resumeFileName");
    const savedScore = localStorage.getItem("resumeScore");

    if (saved) setFileName(saved);
    if (savedScore) setScore(Number(savedScore));
  }, []);

  const handleChoose = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setScore(null);

    localStorage.setItem("resumeFileName", file.name);
    localStorage.removeItem("resumeScore");
  };

  const handleDelete = () => {
    setFileName("");
    setScore(null);
    localStorage.removeItem("resumeFileName");
    localStorage.removeItem("resumeScore");
  };

  const handleAnalyze = () => {
    const fakeScore = Math.floor(70 + Math.random() * 25);
    setScore(fakeScore);
    localStorage.setItem("resumeScore", fakeScore.toString());
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-7 lg:px-8 ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="mx-auto w-full max-w-[1080px]">
        <div
          className={`mb-5 flex items-center ${
            isRTL ? "justify-start" : "justify-start"
          }`}
        >
          <button
            onClick={() => window.history.back()}
            className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white`}
          >
            <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
            <span>{t.common.back}</span>
          </button>
        </div>

        <section className="mb-8">
          <div
            className={`mb-6 flex items-start gap-4`}
          >
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
            <div
              className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${
                isRTL ? "" : ""
              }`}
            >
              <div
                className={`flex items-center gap-4`}
              >
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

              <div
                className={`flex flex-wrap items-center gap-3 ${
                  isRTL ? "self-start md:self-auto" : ""
                }`}
              >
                <button
                  onClick={handleChoose}
                  className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7f4cff] to-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02]`}
                >
                  <UploadCloud size={16} />
                  {t.resumeManagerPage.chooseFile}
                </button>

                {fileName && (
                  <button
                    onClick={handleAnalyze}
                    className={`inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15`}
                  >
                    <Sparkles size={16} />
                    {t.resumeManagerPage.analyze}
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
                  className="mt-8 rounded-full bg-gradient-to-r from-[#7f4cff] to-[#6366f1] px-8 py-3 text-white font-semibold transition hover:scale-[1.03]"
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
              <div
                className={`flex flex-col gap-5 md:flex-row md:items-center md:justify-between ${
                  isRTL ? "" : ""
                }`}
              >
                <div
                  className={`flex items-start gap-4`}
                >
                  <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                    <CheckCircle2 size={24} />
                  </div>

                  <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                    <div
                      className={`mb-2 flex flex-wrap items-center gap-3`}
                    >
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

                <div
                  className={`flex flex-wrap items-center gap-3`}
                >
                  <button
                    onClick={handleAnalyze}
                    className={`inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15`}
                  >
                    <Sparkles size={16} />
                    {t.resumeManagerPage.analyze}
                  </button>

                  <button
                    onClick={handleDelete}
                    className={`inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-5 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/15`}
                  >
                    <Trash2 size={16} />
                    {t.common.delete}
                  </button>
                </div>
              </div>
            </article>
          )}

          {score !== null && (
            <article className="rounded-[30px] border border-white/10 bg-[rgba(44,45,95,0.9)] px-7 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5e66ff1f] text-[#7c88ff]">
                  <Sparkles size={28} />
                </div>

                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#9da7da]">
                  {t.resumeManagerPage.aiResumeScore}
                </p>

                <h3 className="mt-4 text-[54px] font-extrabold text-white">
                  {score}%
                </h3>

                <p className="mt-3 max-w-[520px] text-[16px] leading-7 text-[#b8bddb]">
                  {t.resumeManagerPage.scoreDescription ||
                    "Your resume looks promising. Keep refining your skills, keywords, and project experience to improve matching results even more."}
                </p>
              </div>
            </article>
          )}
        </section>
      </div>
    </div>
  );
}

export default ResumeManager;