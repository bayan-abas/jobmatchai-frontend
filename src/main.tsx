import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";

const PRELOAD_RELOAD_KEY = "vite-preload-reload-at";
const PRELOAD_RELOAD_COOLDOWN_MS = 10_000;

// אחרי דיפלוי חדש הצ'אנקים הישנים בדפדפן כבר לא קיימים בשרת - רענון אוטומטי פעם אחת פותר את זה, הקירור מונע לולאת רענונים
window.addEventListener("vite:preloadError", (event) => {
  const lastAttempt = Number(sessionStorage.getItem(PRELOAD_RELOAD_KEY) || 0);
  if (Date.now() - lastAttempt < PRELOAD_RELOAD_COOLDOWN_MS) {
    return;
  }
  sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(Date.now()));
  event.preventDefault();
  window.location.reload();
});

// עוטף את כל האפליקציה בספקי השפה והאימות כדי שיהיו זמינים בכל קומפוננטה
ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <LanguageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
);
