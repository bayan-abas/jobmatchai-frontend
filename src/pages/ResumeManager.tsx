import { useEffect, useRef, useState } from "react";
import { FileText, UploadCloud, Trash2, Sparkles } from "lucide-react";

function ResumeManager() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    const fakeScore = Math.floor(70 + Math.random() * 25); // 70-95
    setScore(fakeScore);
    localStorage.setItem("resumeScore", fakeScore.toString());
  };

  return (
    <div className="w-full px-8 md:px-16 pt-10 pb-14">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <button
          onClick={() => window.history.back()}
          className="mb-8 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 hover:bg-white/10"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <FileText size={30} />
          </div>

          <div>
            <h1 className="text-[40px] font-extrabold text-white">
              Resume Manager
            </h1>
            <p className="text-[#aeb4d6] text-[18px]">
              Manage, upload, and analyze your resume
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-[32px] border border-white/10 bg-[#1b1f4b]/90 p-10 shadow-[0_25px_70px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col items-center justify-center text-center min-h-[480px]">

            {/* Icon */}
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300">
              <UploadCloud size={40} />
            </div>

            {/* Title */}
            <h2 className="text-[30px] font-bold text-white">
              Upload Your Resume
            </h2>

            <p className="mt-4 max-w-[600px] text-[#b8bddb] text-[18px]">
              Keep your resume updated and ready for better job matches
            </p>

            {/* Hidden Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleUpload}
              className="hidden"
            />

            {/* Upload Button */}
            <button
              onClick={handleChoose}
              className="mt-8 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-3 text-white font-semibold hover:scale-[1.03] transition"
            >
              Choose File
            </button>

            {/* File Info */}
            {fileName && (
              <div className="mt-6 w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white">
                <p className="text-sm text-gray-300">Uploaded file</p>
                <p className="font-semibold mt-1">{fileName}</p>
              </div>
            )}

            {/* Buttons */}
            {fileName && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleAnalyze}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2 text-white text-sm font-semibold hover:scale-[1.05]"
                >
                  <Sparkles size={16} />
                  Analyze
                </button>

                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-6 py-2 text-red-300 text-sm hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}

            {/* Score */}
            {score && (
              <div className="mt-8 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-10 py-6 text-center border border-white/10">
                <p className="text-sm text-gray-300 mb-2">
                  AI Resume Score
                </p>
                <p className="text-[42px] font-extrabold text-white">
                  {score}%
                </p>
              </div>
            )}

            <p className="mt-6 text-sm text-[#8f96c2]">
              Supported formats: PDF, DOC, DOCX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeManager;