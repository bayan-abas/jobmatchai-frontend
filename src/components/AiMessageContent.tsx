import type { ReactNode } from "react";
import {
  User,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Trophy,
  ListChecks,
  HelpCircle,
  Scale,
  Info,
} from "lucide-react";
import { getMatchTier } from "../utils/matchScore";

// Renders an AI chat reply that follows the backend's structured template (see
// AIChatService's responseFormatTemplate): "## Heading" sections, "- " bullets, and
// "**bold**" spans. Falls back to plain text (still with bold support) for any message
// that doesn't contain that structure at all - the static welcome message, the generic
// error fallback, and any older/legacy message all still render exactly as before.

type Section = {
  heading: string | null;
  lines: string[];
};

function parseSections(text: string): Section[] {
  const rawLines = text.split(/\r?\n/);
  const sections: Section[] = [];
  let current: Section = { heading: null, lines: [] };

  const flush = () => {
    if (current.heading !== null || current.lines.length > 0) {
      sections.push(current);
    }
  };

  for (const rawLine of rawLines) {
    const headingMatch = rawLine.match(/^##\s+(.+?)\s*$/);
    if (headingMatch) {
      flush();
      current = { heading: headingMatch[1].trim(), lines: [] };
    } else if (rawLine.trim()) {
      current.lines.push(rawLine.trim());
    }
  }
  flush();

  return sections;
}

function splitBulletsAndCaptions(lines: string[]): { bullets: string[]; captions: string[] } {
  const bullets: string[] = [];
  const captions: string[] = [];
  for (const line of lines) {
    if (line.startsWith("- ") || line.startsWith("• ")) {
      bullets.push(line.slice(2).trim());
    } else {
      captions.push(line);
    }
  }
  return { bullets, captions };
}

function extractPercent(lines: string[]): number | null {
  const match = lines.join(" ").match(/(\d{1,3})\s*%/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : null;
}

function renderInlineBold(text: string): ReactNode {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={index} className="font-bold text-white">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

function iconForHeading(heading: string) {
  const key = heading.toLowerCase();
  if (key.includes("candidate")) return User;
  if (key.includes("strength")) return TrendingUp;
  if (key.includes("missing") || key.includes("gap")) return AlertTriangle;
  if (key.includes("recommend")) return Sparkles;
  if (key.includes("top") || key.includes("candidates")) return Trophy;
  if (key.includes("compar")) return Scale;
  if (key.includes("next step")) return ListChecks;
  if (key.includes("interview")) return HelpCircle;
  if (key.includes("skill")) return Briefcase;
  return Info;
}

function MatchScoreBadge({ percent }: { percent: number }) {
  const tier = getMatchTier(percent);
  return (
    <div className={`rounded-xl border ${tier.border} ${tier.bg} px-3 py-2.5`}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
          Match Score
        </span>
        <span className={`flex items-center gap-1 text-[15px] font-extrabold ${tier.text}`}>
          <span>{tier.emoji}</span>
          {percent}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${tier.bar} transition-all`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function SectionCard({ heading, lines, isRTL }: { heading: string; lines: string[]; isRTL: boolean }) {
  const { bullets, captions } = splitBulletsAndCaptions(lines);
  const Icon = iconForHeading(heading);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <h4
        className={`mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-white ${
          isRTL ? "flex-row-reverse text-right" : "text-left"
        }`}
      >
        <Icon size={13} className="shrink-0 text-[#9aa5ff]" />
        {heading}
      </h4>
      {bullets.length > 0 && (
        <ul className="space-y-1">
          {bullets.map((bullet, index) => (
            <li
              key={index}
              className={`flex items-start gap-1.5 text-[13px] leading-5 text-[#e4e7ff] ${
                isRTL ? "flex-row-reverse text-right" : "text-left"
              }`}
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#9aa5ff]" />
              <span>{renderInlineBold(bullet)}</span>
            </li>
          ))}
        </ul>
      )}
      {captions.map((caption, index) => (
        <p key={index} className={`mt-1 text-[12px] text-white/60 ${isRTL ? "text-right" : "text-left"}`}>
          {renderInlineBold(caption)}
        </p>
      ))}
    </div>
  );
}

function AiMessageContent({ text, isRTL }: { text: string; isRTL: boolean }) {
  const sections = parseSections(text);
  const isStructured = sections.some((section) => section.heading !== null);

  if (!isStructured) {
    return <div className="whitespace-pre-line">{renderInlineBold(text)}</div>;
  }

  return (
    <div className="space-y-2.5">
      {sections.map((section, index) => {
        if (section.heading === null) {
          return (
            <p key={index} className="whitespace-pre-line">
              {renderInlineBold(section.lines.join(" "))}
            </p>
          );
        }

        const headingKey = section.heading.toLowerCase();

        if (headingKey === "summary") {
          return (
            <p
              key={index}
              className={`text-[13.5px] font-semibold leading-6 text-white ${isRTL ? "text-right" : "text-left"}`}
            >
              {renderInlineBold(section.lines.join(" "))}
            </p>
          );
        }

        if (headingKey === "match score") {
          const percent = extractPercent(section.lines);
          if (percent !== null) {
            return <MatchScoreBadge key={index} percent={percent} />;
          }
        }

        return <SectionCard key={index} heading={section.heading} lines={section.lines} isRTL={isRTL} />;
      })}
    </div>
  );
}

export default AiMessageContent;
