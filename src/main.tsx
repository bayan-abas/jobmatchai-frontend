import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";

// Every deploy overwrites dist/assets with newly hashed chunk filenames, and assets are served
// with a 1-year immutable Cache-Control, so old hashes simply stop existing on the server. A
// tab left open (or one restored from bfcache/disk cache) across a deploy still holds the OLD
// index.html referencing those now-gone hashes - clicking into any lazy route (e.g. Login) then
// fires a dynamic import() that 404s. Vite fires this exact "vite:preloadError" event for that
// case; reloading once fetches the fresh index.html + current chunk map, which resolves it.
//
// Guarded by a timestamp (not just a one-time flag) so a genuinely broken chunk - as opposed to
// mere staleness - reloads at most once per 10s window and then falls through to ErrorBoundary's
// visible error screen instead of reload-looping forever, while a *later* redeploy in this same
// tab session (minutes/hours on) still gets its own fresh reload attempt.
const PRELOAD_RELOAD_KEY = "vite-preload-reload-at";
const PRELOAD_RELOAD_COOLDOWN_MS = 10_000;

window.addEventListener("vite:preloadError", (event) => {
  const lastAttempt = Number(sessionStorage.getItem(PRELOAD_RELOAD_KEY) || 0);
  if (Date.now() - lastAttempt < PRELOAD_RELOAD_COOLDOWN_MS) {
    return;
  }
  sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(Date.now()));
  event.preventDefault();
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <LanguageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
);