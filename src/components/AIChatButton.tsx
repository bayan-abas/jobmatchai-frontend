function AIChatButton() {
  return (
    <button
      type="button"
      className="fixed bottom-7 right-7 z-[9999] flex h-[64px] w-[64px] items-center justify-center rounded-full bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-[24px] text-white shadow-[0_12px_30px_rgba(127,76,255,0.35)] transition hover:scale-105"
      onClick={() => alert("AI Chat will open here")}
    >
      ✨
    </button>
  );
}

export default AIChatButton;