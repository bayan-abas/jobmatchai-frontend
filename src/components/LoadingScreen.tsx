import { Brain, Sparkles } from "lucide-react";

type LoadingScreenProps = {
  message?: string;
};

function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-10 text-center">
      <div className="flex flex-col items-center">
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_0deg,rgba(139,92,246,0)_0deg,rgba(139,92,246,0.9)_360deg)] [animation-duration:1.6s]" />
          <div className="absolute inset-[6px] rounded-full bg-[#101548]" />
          <div className="relative flex h-full w-full items-center justify-center">
            <Brain size={40} className="animate-pulse text-[#c4b5fd]" />
          </div>
          <Sparkles
            size={20}
            className="absolute -right-1 -top-1 animate-pulse text-[#22d3ee]"
          />
        </div>

        <h2 className="text-[22px] font-extrabold text-white">
          Analyzing your profile...
        </h2>
        <p className="mt-3 max-w-[380px] text-[15px] leading-7 text-[#aeb4d6]">
          {message ||
            "Our AI is preparing the best job matches for you. This will just take a moment."}
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;
