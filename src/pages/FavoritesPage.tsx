import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Building2, MapPin, Wallet, Trash2, ArrowLeft } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { apiFetch } from "../utils/api";
import { formatSalary } from "../utils/formatSalary";

type SavedJobRow = {
  id: number;
  jobId: number;
  jobType: "internal" | "external";
  jobTitle?: string;
  companyName?: string;
  location?: string;
  salary?: string;
};

function FavoritesPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language] || translations.en;
  const f = t.favoritesPage;
  const isRTL = language === "ar" || language === "he";

  const [rows, setRows] = useState<SavedJobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const identity = { email: user?.email || "" };
    setEmail(identity.email);

    if (!identity.email) {
      setLoading(false);
      return;
    }

    apiFetch(`/api/saved-jobs/candidate/${encodeURIComponent(identity.email)}`)
      .then((data: SavedJobRow[]) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = (row: SavedJobRow) => {
    setRows((prev) => prev.filter((r) => r.id !== row.id));

    apiFetch(
      `/api/saved-jobs/candidate/${encodeURIComponent(email)}/${row.jobType}/${row.jobId}`,
      { method: "DELETE" }
    ).catch(() => {
      setRows((prev) => [...prev, row]);
    });
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)] px-4 py-7 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1080px]">
        <section className="mb-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7f4cff] to-[#a855f7] text-white shadow-[0_10px_30px_rgba(127,76,255,0.35)]">
              <Bookmark size={26} />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h1 className="text-[42px] font-extrabold leading-tight text-white">{f.title}</h1>
              <p className="mt-2 text-[17px] text-[#aeb4d6]">{f.subtitle}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5">
          {loading && (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-white/65">
              {f.loading}
            </div>
          )}

          {!loading && !email && (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-white/65">
              {f.loginRequired}
            </div>
          )}

          {!loading && email && rows.length === 0 && (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-white/65">
              {f.empty}
            </div>
          )}

          {!loading &&
            rows.map((row) => (
              <article
                key={row.id}
                onClick={() => navigate(`/job-details/${row.jobType}/${row.jobId}`)}
                className="group cursor-pointer rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.16)] transition hover:bg-white/[0.06]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className={`mb-3 flex flex-wrap items-center gap-3 ${isRTL ? "md:flex-row-reverse" : ""}`}>
                      <h3 className="text-xl font-bold text-white">{row.jobTitle || "Untitled Job"}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          row.jobType === "external"
                            ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                            : "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        }`}
                      >
                        {row.jobType === "external" ? t.jobDetails.externalJobBadge : t.jobDetails.internalJobBadge}
                      </span>
                    </div>

                    <div className={`mb-2 flex items-center gap-2 text-white/70 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Building2 size={16} />
                      <span className="text-[15px]">{row.companyName || "Unknown Company"}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/55">
                      {row.location && (
                        <span className={`inline-flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <MapPin size={16} />
                          {row.location}
                        </span>
                      )}
                      {row.salary && (
                        <span className={`inline-flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Wallet size={16} />
                          {formatSalary(row.salary)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnsave(row);
                    }}
                    className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/20 md:self-center"
                  >
                    <Trash2 size={16} />
                    {f.unsave}
                  </button>
                </div>
              </article>
            ))}
        </section>

        {!loading && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#dbe2ff] transition hover:bg-white/10 hover:text-white ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
            <span>{t.common?.back || "Back"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;
