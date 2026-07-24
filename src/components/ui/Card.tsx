import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: "sm" | "md" | "lg" | "none";
  interactive?: boolean;
  as?: "div" | "section" | "article";
};

const PADDING_CLASSES = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

// The `rounded-[Npx] border border-white/10 bg-white/[0.0N] shadow-[...]` surface repeated on
// nearly every card/panel across the app, as one component. `interactive` adds the hover-lift +
// press feedback used for clickable cards (job cards, stat cards) via plain CSS transitions -
// non-interactive cards (form panels, static sections) skip it so hovering a form doesn't
// visually "lift" for no reason.
function Card({ children, padding = "md", interactive = false, as = "div", className = "", ...rest }: CardProps) {
  const Component = as;

  return (
    <Component
      className={`rounded-panel border border-white/10 bg-[rgba(44,45,95,0.85)] shadow-elevated transition-[transform,background-color,border-color] duration-200 ${
        interactive
          ? "cursor-pointer hover:-translate-y-1 hover:border-white/20 hover:bg-[rgba(50,52,108,0.92)] active:translate-y-0 active:scale-[0.995]"
          : ""
      } ${PADDING_CLASSES[padding]} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Card;
