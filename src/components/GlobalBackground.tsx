import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function GlobalBackground({ children }: Props) {
  return (
    <div
      className="relative min-h-screen overflow-hidden text-white bg-[radial-gradient(circle_at_top,rgba(76,70,255,0.18),transparent_28%),linear-gradient(135deg,#090b3a_0%,#15145a_45%,#0f1f59_100%)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(115,73,255,0.18),transparent_22%),radial-gradient(circle_at_80%_85%,rgba(0,153,255,0.16),transparent_24%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25 [mask-image:linear-gradient(to_bottom,rgba(255,255,255,0.75),transparent)]" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default GlobalBackground;