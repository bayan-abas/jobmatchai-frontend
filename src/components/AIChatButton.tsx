import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, X, Send, Sparkles, MessageSquare, RotateCcw } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

type Message = {
  id: number;
  sender: "user" | "ai";
  text: string;
};

function AIChatButton() {
  const { language } = useLanguage();
  const isRTL = language === "ar" || language === "he";

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const content = useMemo(() => {
    if (language === "ar") {
      return {
        title: "مساعد JobMatchAI",
        subtitle: "اسألني عن الوظائف، السيرة، أو التطوير المهني",
        placeholder: "اكتب رسالتك...",
        welcome:
          "مرحبًا! أنا مساعدك الذكي. أقدر أساعدك في فهم الوظائف المناسبة، تحسين ملفك الشخصي، أو إعطائك نصائح مهنية.",
        typing: "يكتب الآن...",
        clear: "محادثة جديدة",
        quick1: "شو أفضل الوظائف إلي؟",
        quick2: "كيف أحسن السيرة الذاتية؟",
        quick3: "كيف أزيد نسبة التطابق؟",
        send: "إرسال",
      };
    }

    if (language === "he") {
      return {
        title: "עוזר JobMatchAI",
        subtitle: "אפשר לשאול על משרות, קורות חיים ופיתוח קריירה",
        placeholder: "כתוב הודעה...",
        welcome:
          "היי! אני העוזר החכם שלך. אני יכול לעזור לך להבין אילו משרות מתאימות לך, לשפר את הפרופיל שלך, ולתת טיפים לקריירה.",
        typing: "מקליד...",
        clear: "שיחה חדשה",
        quick1: "אילו משרות הכי מתאימות לי?",
        quick2: "איך לשפר את קורות החיים?",
        quick3: "איך להעלות את אחוז ההתאמה?",
        send: "שלח",
      };
    }

    return {
      title: "JobMatchAI Assistant",
      subtitle: "Ask me about jobs, resumes, and career growth",
      placeholder: "Type your message...",
      welcome:
        "Hi! I’m your smart assistant. I can help you understand job matches, improve your profile, and give career tips.",
      typing: "Typing...",
      clear: "New chat",
      quick1: "What jobs fit me best?",
      quick2: "How can I improve my resume?",
      quick3: "How do I increase my match score?",
      send: "Send",
    };
  }, [language]);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: "ai",
        text: content.welcome,
      },
    ]);
  }, [content.welcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const generateReply = (text: string) => {
    const lower = text.toLowerCase();

    if (language === "ar") {
      if (
        lower.includes("سيرة") ||
        lower.includes("cv") ||
        lower.includes("resume")
      ) {
        return "لتحسين السيرة الذاتية، حاولي تضيفي مهارات واضحة، مشاريع عملية، وكلمات مفتاحية مرتبطة بالوظيفة المطلوبة. كمان رتبي المعلومات بشكل مختصر وواضح.";
      }

      if (
        lower.includes("تطابق") ||
        lower.includes("match") ||
        lower.includes("score")
      ) {
        return "لرفع نسبة التطابق، حسّني الملف الشخصي، أضيفي مهارات تقنية مرتبطة بالوظائف، وركّزي على الخبرات أو المشاريع اللي تشبه متطلبات السوق.";
      }

      if (
        lower.includes("وظيفة") ||
        lower.includes("jobs") ||
        lower.includes("job")
      ) {
        return "بحسب ملفك، الأفضل عادة تكون الوظائف الأقرب لمهاراتك وخبراتك الحالية. ركّزي على الوظائف اللي فيها توافق واضح بين المهارات المطلوبة ومهاراتك.";
      }

      return "أقدر أساعدك في تحليل الوظائف، تحسين السيرة الذاتية، رفع نسبة التطابق، أو إعطائك نصائح مهنية للمقابلات والتقديم.";
    }

    if (language === "he") {
      if (
        lower.includes("קורות") ||
        lower.includes("resume") ||
        lower.includes("cv")
      ) {
        return "כדי לשפר את קורות החיים, כדאי להוסיף כישורים ברורים, פרויקטים מעשיים, ומילות מפתח שרלוונטיות למשרה המבוקשת. חשוב גם לשמור על מבנה קצר וברור.";
      }

      if (
        lower.includes("התאמה") ||
        lower.includes("match") ||
        lower.includes("score")
      ) {
        return "כדי להעלות את אחוז ההתאמה, כדאי לשפר את הפרופיל שלך, להוסיף כישורים רלוונטיים, ולהדגיש ניסיון או פרויקטים שמתאימים לדרישות המשרה.";
      }

      if (
        lower.includes("משרה") ||
        lower.includes("jobs") ||
        lower.includes("job")
      ) {
        return "בהתאם לפרופיל שלך, עדיף להתמקד במשרות שהכישורים והניסיון שלך מתאימים להן בצורה ברורה. כך הסיכוי להתאמה גבוהה יותר.";
      }

      return "אני יכול לעזור לך להבין התאמות למשרות, לשפר קורות חיים, להעלות את ציון ההתאמה, ולתת טיפים לקריירה.";
    }

    if (
      lower.includes("resume") ||
      lower.includes("cv")
    ) {
      return "To improve your resume, add clear technical skills, real projects, and role-specific keywords. Keep the structure clean, short, and relevant to the jobs you want.";
    }

    if (
      lower.includes("match") ||
      lower.includes("score")
    ) {
      return "To increase your match score, improve your profile details, add relevant skills, and highlight projects or experience that align with job requirements.";
    }

    if (
      lower.includes("job") ||
      lower.includes("jobs")
    ) {
      return "The best jobs for you are usually the ones that closely match your current skills, experience level, and career direction. Focus on roles where your strengths are clearly visible.";
    }

    return "I can help you understand job matches, improve your resume, raise your match score, and get better career guidance.";
  };

  const sendMessage = (customText?: string) => {
    const text = (customText ?? input).trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: "ai",
        text: generateReply(text),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 900);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        sender: "ai",
        text: content.welcome,
      },
    ]);
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
            isRTL ? "left-6 flex-row-reverse" : "right-6"
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <Bot size={22} />
          </div>

          <div className={isRTL ? "text-right" : "text-left"}>
            <p className="text-sm font-bold">AI Assistant</p>
            <p className="text-xs text-white/80">Online now</p>
          </div>
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed bottom-6 z-50 flex h-[620px] w-[380px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(14,18,58,0.96)] shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl ${
            isRTL ? "left-6" : "right-6"
          } max-[640px]:bottom-3 max-[640px]:left-3 max-[640px]:right-3 max-[640px]:h-[78vh] max-[640px]:w-auto`}
        >
          <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(127,76,255,0.22),rgba(68,211,255,0.10))] px-5 py-4">
            <div
              className={`mb-3 flex items-start justify-between gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f4cff]/20 text-white">
                  <Sparkles size={22} />
                </div>

                <div className={isRTL ? "text-right" : "text-left"}>
                  <h3 className="text-[16px] font-extrabold text-white">
                    {content.title}
                  </h3>
                  <p className="text-[12px] text-[#c8cffd]">
                    {content.subtitle}
                  </p>
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

            <div
              className={`flex items-center gap-2 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
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

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div
              className={`mb-4 flex flex-wrap gap-2 ${
                isRTL ? "justify-end" : "justify-start"
              }`}
            >
              {[content.quick1, content.quick2, content.quick3].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => sendMessage(item)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-[#d4d9ff] transition hover:bg-white/10"
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
                      ? isRTL
                        ? "justify-start"
                        : "justify-end"
                      : isRTL
                      ? "justify-end"
                      : "justify-start"
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
                <div
                  className={`flex ${
                    isRTL ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#c8cffd]">
                    {content.typing}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 bg-[rgba(255,255,255,0.03)] p-4"
          >
            <div
              className={`flex items-center gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="flex flex-1 items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
                <MessageSquare size={18} className="text-[#98a2db]" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={content.placeholder}
                  className={`w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8d94bd] ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                />
              </div>

              <button
                type="submit"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7f4cff_0%,#9d4edd_100%)] text-white shadow-[0_10px_24px_rgba(127,76,255,0.35)] transition hover:scale-[1.04]"
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