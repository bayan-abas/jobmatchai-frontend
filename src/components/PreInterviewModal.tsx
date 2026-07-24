import { useState } from "react";
import { motion } from "motion/react";
import { X, Send } from "lucide-react";
import { PRE_INTERVIEW_QUESTIONS } from "../utils/preInterviewQuestions";
import { Button } from "./ui";

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
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onCancel}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pre-interview-modal-title"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,#09152f_0%,#0d1730_100%)] p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)] max-[480px]:rounded-[22px] max-[480px]:p-5"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="absolute right-5 top-5 rounded-full text-[#9aa4cf] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <X size={22} />
        </button>

        <h2 id="pre-interview-modal-title" className="mb-2 text-[22px] font-extrabold text-white">
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

        <div className="mt-7 grid grid-cols-2 gap-4 max-[420px]:grid-cols-1">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="max-[420px]:order-2"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            icon={<Send size={16} />}
            className="max-[420px]:order-1"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PreInterviewModal;
