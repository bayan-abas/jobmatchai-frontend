import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, X, Send, Sparkles, MessageSquare, RotateCcw } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

type Message = {
  id: number;
  sender: "user" | "ai";
  text: string;
};

function AIChatButton() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRTL = language === "ar" || language === "he";
  const isCompany = user?.role === "company";

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const content = useMemo(() => {
    if (language === "ar") {
      return {
        title: isCompany ? "مساعد التوظيف JobMatchAI" : "مساعد JobMatchAI",
        subtitle: isCompany
          ? "اسألني عن المرشحين والطلبات والتوظيف"
          : "اسألني عن الوظائف، السيرة، أو التطوير المهني",
        placeholder: "اكتب رسالتك...",
        welcome: isCompany
          ? "مرحبًا! أنا مساعدك الذكي للتوظيف. أقدر أساعدك في مراجعة المتقدمين، تحديد أفضل المرشحين، تحليل نسب التطابق، وتحسين إعلانات الوظائف."
          : "مرحبًا! أنا مساعدك الذكي. أقدر أساعدك في فهم الوظائف المناسبة، تحسين ملفك الشخصي، أو إعطائك نصائح مهنية.",
        typing: "يكتب الآن...",
        clear: "محادثة جديدة",
        quickPrompts: isCompany
          ? [
              "أفضل المرشحين",
              "مراجعة الطلبات",
              "أكثر المتقدمين",
              "تحسين الإعلان",
              "مهارات ناقصة",
              "قيد المراجعة",
            ]
          : ["شو أفضل الوظائف إلي؟", "كيف أحسن السيرة الذاتية؟", "كيف أزيد نسبة التطابق؟"],
        send: "إرسال",
        buttonLabel: "مساعد AI",
        onlineNow: "متاح الآن",
        errorReply: "عذرًا، حدث خطأ. يرجى المحاولة مرة أخرى.",
      };
    }

    if (language === "he") {
      return {
        title: isCompany ? "עוזר הגיוס של JobMatchAI" : "עוזר JobMatchAI",
        subtitle: isCompany
          ? "שאל אותי על מועמדים, הגשות וגיוס"
          : "אפשר לשאול על משרות, קורות חיים ופיתוח קריירה",
        placeholder: "כתוב הודעה...",
        welcome: isCompany
          ? "היי! אני עוזר הגיוס החכם שלך. אני יכול לעזור לך לבדוק מועמדים, לזהות את המועמדים המובילים, לנתח ציוני התאמה, ולשפר את מודעות הדרושים שלך."
          : "היי! אני העוזר החכם שלך. אני יכול לעזור לך להבין אילו משרות מתאימות לך, לשפר את הפרופיל שלך, ולתת טיפים לקריירה.",
        typing: "מקליד...",
        clear: "שיחה חדשה",
        quickPrompts: isCompany
          ? [
              "מועמדים מובילים",
              "בדיקת הגשות",
              "הכי הרבה הגשות",
              "שיפור מודעת המשרה",
              "כישורים חסרים",
              "ממתינים לבדיקה",
            ]
          : ["אילו משרות הכי מתאימות לי?", "איך לשפר את קורות החיים?", "איך להעלות את אחוז ההתאמה?"],
        send: "שלח",
        buttonLabel: "עוזר AI",
        onlineNow: "זמין עכשיו",
        errorReply: "מצטער, אירעה שגיאה. אנא נסה שנית.",
      };
    }

    return {
      title: isCompany ? "JobMatchAI Recruitment Assistant" : "JobMatchAI Assistant",
      subtitle: isCompany
        ? "Ask me about candidates, applications, and hiring"
        : "Ask me about jobs, resumes, and career growth",
      placeholder: "Type your message...",
      welcome: isCompany
        ? "Hi! I'm your AI recruitment assistant. I can help you review applicants, identify top candidates, analyze match scores, and improve your job postings."
        : "Hi! I'm your smart assistant. I can help you understand job matches, improve your profile, and give career tips.",
      typing: "Typing...",
      clear: "New chat",
      quickPrompts: isCompany
        ? [
            "Top candidates",
            "Review applications",
            "Most applicants",
            "Improve job post",
            "Missing skills",
            "Pending reviews",
          ]
        : ["What jobs fit me best?", "How can I improve my resume?", "How do I increase my match score?"],
      send: "Send",
      buttonLabel: "AI Assistant",
      onlineNow: "Online now",
      errorReply: "Sorry, something went wrong. Please try again.",
    };
  }, [language, isCompany]);

  useEffect(() => {
    setMessages([{ id: 1, sender: "ai", text: content.welcome }]);
  }, [content.welcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (customText?: string) => {
    const text = (customText ?? input).trim();
    if (!text || isTyping) return;

    const history = messages.slice(-20).map((m) => ({
      role: m.sender === "ai" ? "assistant" : "user",
      content: m.text,
    }));

    const userMessage: Message = { id: Date.now(), sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const data = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, history, language }),
      });

      const reply = data.reply || content.errorReply;

      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "ai", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "ai", text: content.errorReply },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    sendMessage();
  };

  const resetChat = () => {
    setMessages([{ id: 1, sender: "ai", text: content.welcome }]);
    setInput("");
    setIsTyping(false);
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-[linear-gradient(135deg,#7f4cff_0%,#9d4edd_100%)] px-5 py-3 text-white shadow-[0_14px_40px_rgba(127,76,255,0.38)] transition hover:scale-[1.03] ${
            isRTL ? "left-6" : "right-6"
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <Bot size={22} />
          </div>
          <div className={isRTL ? "text-right" : "text-left"}>
            <p className="text-sm font-bold">{content.buttonLabel}</p>
            <p className="text-xs text-white/80">{content.onlineNow}</p>
          </div>
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed bottom-6 z-50 flex h-[760px] max-h-[85vh] w-[460px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(14,18,58,0.96)] shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl ${
            isRTL ? "left-6" : "right-6"
          } max-[640px]:bottom-3 max-[640px]:left-3 max-[640px]:right-3 max-[640px]:h-[85vh] max-[640px]:w-auto`}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(127,76,255,0.22),rgba(68,211,255,0.10))] px-5 py-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f4cff]/20 text-white">
                  <Sparkles size={22} />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h3 className="text-[16px] font-extrabold text-white">{content.title}</h3>
                  <p className="text-[12px] text-[#c8cffd]">{content.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetChat}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[#d8ddff] transition hover:bg-white/10"
              >
                <RotateCcw size={14} />
                <span>{content.clear}</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className={`mb-4 flex flex-wrap gap-2 ${isRTL ? "justify-end" : "justify-start"}`}>
              {content.quickPrompts.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => sendMessage(item)}
                  disabled={isTyping}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-[#d4d9ff] transition hover:bg-white/10 disabled:opacity-50"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user"
                      ? isRTL ? "justify-start" : "justify-end"
                      : isRTL ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.sender === "user"
                        ? "bg-[linear-gradient(135deg,#7f4cff_0%,#9d4edd_100%)] text-white"
                        : "border border-white/10 bg-white/5 text-[#eef1ff]"
                    } ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-center gap-1.5 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#8ea2ff] [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#8ea2ff] [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#8ea2ff] [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 bg-[rgba(255,255,255,0.03)] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
                <MessageSquare size={18} className="shrink-0 text-[#98a2db]" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={content.placeholder}
                  disabled={isTyping}
                  className={`w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8d94bd] disabled:opacity-60 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7f4cff_0%,#9d4edd_100%)] text-white shadow-[0_10px_24px_rgba(127,76,255,0.35)] transition hover:scale-[1.04] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default AIChatButton;
