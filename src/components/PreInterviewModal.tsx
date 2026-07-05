import { useState } from "react";
import { X, Send } from "lucide-react";
import { PRE_INTERVIEW_QUESTIONS } from "../utils/preInterviewQuestions";

type PreInterviewModalProps = {
  jobTitle?: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (answers: Record<string, string>) => void;
};

function PreInterviewModal({ jobTitle, isSubmitting, onCancel, onSubmit }: PreInterviewModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleChange = (question: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-[560px] rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,#09152f_0%,#0d1730_100%)] p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-5 top-5 text-[#9aa4cf] transition hover:text-white"
        >
          <X size={22} />
        </button>

        <h2 className="mb-2 text-[22px] font-extrabold text-white">
          Before you apply{jobTitle ? ` - ${jobTitle}` : ""}
        </h2>
        <p className="mb-6 text-[15px] text-[#aeb4d6]">
          Answer a few quick questions so the company can review your application faster.
        </p>

        <div className="space-y-5">
          {PRE_INTERVIEW_QUESTIONS.map((question) => (
            <div key={question}>
              <label className="mb-2 block text-[14px] font-semibold text-[#dbe2ff]">
                {question}
              </label>
              <textarea
                value={answers[question] || ""}
                onChange={(e) => handleChange(question, e.target.value)}
                rows={2}
                className="w-full rounded-[14px] border border-white/10 bg-white/[0.05] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#8ea2c7] resize-none focus:border-[#7c88ff]/60"
                placeholder="Your answer..."
              />
            </div>
          ))}
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-[14px] border border-white/15 bg-transparent px-5 py-3 text-[16px] font-bold text-white transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] px-5 py-3 text-[16px] font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} />
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreInterviewModal;
