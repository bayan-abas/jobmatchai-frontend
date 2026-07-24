import { Component, type ErrorInfo, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

// Without this, an uncaught error anywhere in a route's render tree unmounts the ENTIRE React
// tree (React's default behavior) - since html/body/#root all share the same dark base color
// (see index.css), that reads as a near-blank dark screen with no indication anything failed.
// This boundary turns that into a visible, on-brand error screen instead, while still logging
// the full error/component stack to the console exactly as an uncaught error would - nothing
// here is swallowed, only surfaced more visibly than React's default silent unmount.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)] px-4 py-10 text-center">
        <div className="max-w-lg rounded-panel border border-white/10 bg-white/5 p-8 shadow-elevated backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-danger-400/10 text-danger-400">
            <TriangleAlert size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Something went wrong</h1>
          <p className="mt-3 text-[15px] leading-7 text-white/70">{error.message}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-[#0f172a] transition hover:bg-cyan-300"
            >
              Reload page
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white/80 transition hover:bg-white/10"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
