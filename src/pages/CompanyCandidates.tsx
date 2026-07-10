import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";
import { getMatchTier, getMatchLabel } from "../utils/matchScore";
import CandidateAiSummaryModal from "../components/CandidateAiSummaryModal";
import {
  ArrowLeft,
  Users,
  Search,
  Mail,
  Send,
  Calendar,
  Sparkles,
  X,
} from "lucide-react";

type BackendApplicant = {
  id: number;
  jobId: number;
  jobTitle: string | null;
  candidateName: string | null;
  candidateEmail: string | null;
  status: string | null;
  appliedDate: string | null;
  matchPercent: number | null;
  matchLabel: string | null;
};

type CandidateGroup = {
  candidateEmail: string;
  candidateName: string;
  applications: BackendApplicant[];
  bestMatch: number | null;
  bestMatchLabel: string | null;
};

function groupByCandidate(apps: BackendApplicant[]): CandidateGroup[] {
  const map = new Map<string, CandidateGroup>();

  for (const app of apps) {
    const key = app.candidateEmail || `unknown-${app.id}`;

    if (!map.has(key)) {
      map.set(key, {
        candidateEmail: app.candidateEmail || "",
        candidateName: app.candidateName || "Unknown Candidate",
        applications: [],
        bestMatch: null,
        bestMatchLabel: null,
      });
    }

    const group = map.get(key)!;
    group.applications.push(app);

    if (typeof app.matchPercent === "number" && (group.bestMatch === null || app.matchPercent > group.bestMatch)) {
      group.bestMatch = app.matchPercent;
      group.bestMatchLabel = app.matchLabel;
    }
  }

  return Array.from(map.values());
}

function getInitial(name: string) {
  return (name || "?").charAt(0).toUpperCase();
}

function getStatusClass(status: string | null) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "shortlisted") return "bg-cyan-500/12 text-cyan-300 border-cyan-400/25";
  if (normalized === "accepted") return "bg-emerald-500/12 text-emerald-300 border-emerald-400/25";
  if (normalized === "rejected") return "bg-rose-500/12 text-rose-300 border-rose-400/25";
  return "bg-amber-500/12 text-amber-300 border-amber-400/25";
}

function CompanyCandidates() {
  const navigate = useNavigate();
  const location = useLocation();
  const targetCandidateEmail = (location.state as { candidateEmail?: string } | null)?.candidateEmail;
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const isRTL = language === "ar" || language === "he";

  const common = t.common || {};
  const page = t.companyCandidatesPage || {};
  const applicationsPage = t.companyApplicationsPage || {};

  const [candidates, setCandidates] = useState<CandidateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedCandidate, setSelectedCandidate] = useState<CandidateGroup | null>(null);
  const [aiSummaryApplication, setAiSummaryApplication] = useState<BackendApplicant | null>(null);

  const [showContactModal, setShowContactModal] = useState(false);
  const [messageText, setMessageText] = useState("");

  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewType, setInterviewType] = useState(page.online || "Online");
  const [interviewNotes, setInterviewNotes] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");

    apiFetch("/api/applications/company")
      .then((data: BackendApplicant[]) => {
        if (cancelled) return;
        setCandidates(groupByCandidate(Array.isArray(data) ? data : []));
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(
          error instanceof ApiError
            ? error.message
            : "Could not load candidates. Make sure the backend is running."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!targetCandidateEmail || candidates.length === 0) return;

    const match = candidates.find((candidate) => candidate.candidateEmail === targetCandidateEmail);
    if (match) {
      setSelectedCandidate(match);
      navigate(location.pathname, { replace: true });
    }
  }, [targetCandidateEmail, candidates, navigate, location.pathname]);

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return candidates;

    return candidates.filter((candidate) => {
      const haystack = [
        candidate.candidateName,
        candidate.candidateEmail,
        ...candidate.applications.map((a) => a.jobTitle || ""),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [candidates, search]);

  const applyStatusUpdate = async (id: number, status: "Accepted" | "Rejected") => {
    try {
      const data = await apiFetch(`/api/applications/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      if (!data.success) return;

      setCandidates((prev) =>
        prev.map((candidate) => ({
          ...candidate,
          applications: candidate.applications.map((app) =>
            app.id === id ? { ...app, status } : app
          ),
        }))
      );

      setSelectedCandidate((prev) =>
        prev
          ? {
              ...prev,
              applications: prev.applications.map((app) =>
                app.id === id ? { ...app, status } : app
              ),
            }
          : prev
      );
    } catch {
      // Leave state untouched on failure so the UI reflects the real backend state.
    }
  };

  const applyAiMatchScore = (applicationId: number, matchScore: number, matchLabel: string) => {
    const label = matchLabel || getMatchLabel(matchScore);

    const patchApp = (app: BackendApplicant) =>
      app.id === applicationId ? { ...app, matchPercent: matchScore, matchLabel: label } : app;

    const patchGroup = (group: CandidateGroup): CandidateGroup => {
      const applications = group.applications.map(patchApp);
      const bestMatch = applications.reduce<number | null>(
        (best, app) => (typeof app.matchPercent === "number" && (best === null || app.matchPercent > best) ? app.matchPercent : best),
        null
      );
      const bestApp = applications.find((app) => app.matchPercent === bestMatch);
      return { ...group, applications, bestMatch, bestMatchLabel: bestApp?.matchLabel ?? null };
    };

    setCandidates((prev) => prev.map(patchGroup));
    setSelectedCandidate((prev) => (prev ? patchGroup(prev) : prev));
  };

  const openContactModal = (candidate: CandidateGroup) => {
    setMessageText(`Hi ${candidate.candidateName}, we would like to contact you regarding your profile.`);
    setShowContactModal(true);
  };

  const openInterviewModal = () => {
    setInterviewDate("");
    setInterviewTime("");
    setInterviewType(page.online || "Online");
    setInterviewNotes("");
    setShowInterviewModal(true);
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(91,77,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.10),transparent_25%),linear-gradient(135deg,#151748_0%,#141755_45%,#0f143f_100%)] px-6 pb-10 pt-8 md:px-10 text-white"
    >
      <div className="mx-auto max-w-5xl">
        {!selectedCandidate ? (
          <>
            <button
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[15px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
              {common.back || "Back"}
            </button>

            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300 shadow-[0_10px_30px_rgba(34,211,238,0.15)]">
                <Users size={28} />
              </div>

              <div className={isRTL ? "text-right" : "text-left"}>
                <h1 className="text-4xl font-extrabold tracking-tight text-white">
                  {page.title || "Candidates"}
                </h1>
                <p className="mt-2 text-[18px] text-white/60">
                  {page.subtitle || "Everyone who has applied to your job postings"}
                </p>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5">
              <Search size={18} className="text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={page.searchPlaceholder || "Search by name, email, or job title..."}
                className="w-full bg-transparent text-white outline-none placeholder:text-white/35"
              />
            </div>

            {loadError && (
              <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
                {loadError}
              </div>
            )}

            {loading && (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-center text-white/65">
                {common.loading || "Loading..."}
              </div>
            )}

            {!loading && (
              <>
                <p className="mb-5 text-lg text-white/55">
                  {filteredCandidates.length}{" "}
                  {page.candidatesMatchCriteria || "candidates"}
                </p>

                <div className="space-y-5">
                  {filteredCandidates.map((candidate) => {
                    const tier = candidate.bestMatch !== null ? getMatchTier(candidate.bestMatch) : null;

                    return (
                      <div
                        key={candidate.candidateEmail}
                        onClick={() => setSelectedCandidate(candidate)}
                        className="cursor-pointer rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm transition hover:bg-white/[0.055]"
                      >
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                          <div className="flex flex-1 gap-5">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#7b61ff] to-[#a855f7] text-3xl font-extrabold text-white shadow-[0_12px_28px_rgba(124,77,255,0.28)]">
                              {getInitial(candidate.candidateName)}
                            </div>

                            <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                              <h2 className="text-[24px] font-extrabold leading-tight text-white">
                                {candidate.candidateName}
                              </h2>
                              <p className="text-[16px] text-white/60">{candidate.candidateEmail}</p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {candidate.applications.map((app) => (
                                  <span
                                    key={app.id}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(app.status)}`}
                                  >
                                    {app.jobTitle || "Untitled Role"} · {app.status || "Under Review"}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            {tier && candidate.bestMatch !== null ? (
                              <div className={`flex h-16 w-16 items-center justify-center rounded-full border bg-white/[0.05] text-lg font-extrabold ${tier.text} ${tier.border}`}>
                                {candidate.bestMatch}%
                              </div>
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-center text-xs font-semibold text-white/35">
                                {applicationsPage.notScoredYet || "Not scored yet"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredCandidates.length === 0 && (
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-center text-white/65">
                      {candidates.length === 0
                        ? page.noCandidatesYet || "No candidates yet. They'll appear here once someone applies to one of your jobs."
                        : page.noCandidatesForFilters || "No candidates match your search."}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setSelectedCandidate(null)}
              className="mb-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[15px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
              {common.back || "Back"}
            </button>

            <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex flex-1 gap-5">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#7b61ff] to-[#a855f7] text-5xl font-extrabold text-white shadow-[0_12px_28px_rgba(124,77,255,0.28)]">
                    {getInitial(selectedCandidate.candidateName)}
                  </div>

                  <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                    <h1 className="text-[26px] font-extrabold text-white md:text-[40px]">
                      {selectedCandidate.candidateName}
                    </h1>

                    <div className="mt-2 flex items-center gap-2 text-[15px] text-white/60">
                      <Mail size={16} />
                      <span>{selectedCandidate.candidateEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 xl:w-[260px]">
                  <button
                    onClick={() => openContactModal(selectedCandidate)}
                    className="flex items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#7f6bff,#9b3ff5)] px-5 py-3.5 text-[15px] font-bold text-white transition hover:opacity-95"
                  >
                    <Send size={17} />
                    {page.contactCandidate || "Contact Candidate"}
                  </button>

                  <button
                    onClick={openInterviewModal}
                    className="flex items-center justify-center gap-2 rounded-[14px] border border-white/15 bg-white/[0.03] px-5 py-3.5 text-[15px] font-semibold text-[#b8c4ff] transition hover:bg-white/[0.06]"
                  >
                    <Calendar size={17} />
                    {page.scheduleInterview || "Schedule Interview"}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
              <h2 className="mb-5 text-[20px] font-extrabold">
                {page.applications || "Applications"}
              </h2>

              <div className="space-y-4">
                {selectedCandidate.applications.map((app) => {
                  const tier = typeof app.matchPercent === "number" ? getMatchTier(app.matchPercent) : null;

                  return (
                    <div
                      key={app.id}
                      className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className={isRTL ? "text-right" : "text-left"}>
                          <h3 className="text-lg font-bold text-white">{app.jobTitle || "Untitled Role"}</h3>
                          <p className="mt-1 text-sm text-white/50">{app.appliedDate}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(app.status)}`}>
                            {app.status || "Under Review"}
                          </span>

                          {tier && typeof app.matchPercent === "number" && (
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${tier.bg} ${tier.text} ${tier.border}`}>
                              {app.matchPercent}% {app.matchLabel || getMatchLabel(app.matchPercent)}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setAiSummaryApplication(app)}
                            className="inline-flex items-center gap-2 rounded-[12px] border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/20"
                          >
                            <Sparkles size={14} />
                            {applicationsPage.aiSummary || "AI Summary"}
                          </button>

                          <button
                            type="button"
                            onClick={() => applyStatusUpdate(app.id, "Accepted")}
                            className="rounded-[12px] bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                          >
                            {applicationsPage.accept || "Accept"}
                          </button>

                          <button
                            type="button"
                            onClick={() => applyStatusUpdate(app.id, "Rejected")}
                            className="rounded-[12px] bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/30"
                          >
                            {applicationsPage.reject || "Reject"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {showContactModal && selectedCandidate && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-[560px] rounded-[28px] border border-white/10 bg-[#1b1d57] p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <div className="mb-5 flex items-center justify-between">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h2 className="text-[24px] font-extrabold">
                    {(page.contactCandidateWith || page.contactCandidate || "Contact") +
                      " " +
                      selectedCandidate.candidateName}
                  </h2>
                  <p className="text-sm text-white/55">{selectedCandidate.candidateEmail}</p>
                </div>

                <button onClick={() => setShowContactModal(false)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={5}
                className="mb-4 w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
              />

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowContactModal(false)} className="rounded bg-white/10 px-4 py-2">
                  {common.cancel || "Cancel"}
                </button>

                <button
                  onClick={() => {
                    const applicationId = selectedCandidate.applications[0]?.id;
                    if (applicationId) {
                      apiFetch("/api/messages", {
                        method: "POST",
                        body: JSON.stringify({ applicationId, content: messageText }),
                      }).catch(() => null);
                    }

                    alert(page.messageSent || "Message sent!");
                    setShowContactModal(false);
                  }}
                  className="rounded bg-purple-500 px-4 py-2"
                >
                  {page.send || "Send"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showInterviewModal && selectedCandidate && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-[560px] rounded-[28px] border border-white/10 bg-[#1b1d57] p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <div className="mb-5 flex items-center justify-between">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h2 className="text-[24px] font-extrabold">
                    {page.scheduleInterview || "Schedule Interview"}
                  </h2>
                  <p className="text-sm text-white/55">
                    {page.withCandidate || "With"} {selectedCandidate.candidateName}
                  </p>
                </div>

                <button onClick={() => setShowInterviewModal(false)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/70">{page.date || "Date"}</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">{page.time || "Time"}</label>
                  <input
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-white/70">{page.interviewType || "Interview Type"}</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                >
                  <option value={page.online || "Online"} className="bg-[#1d2258] text-white">
                    {page.online || "Online"}
                  </option>
                  <option value={page.inPerson || "In Person"} className="bg-[#1d2258] text-white">
                    {page.inPerson || "In Person"}
                  </option>
                </select>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-white/70">{page.notes || "Notes"}</label>
                <textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  placeholder={page.addInterviewNotes || "Add interview notes..."}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowInterviewModal(false)} className="rounded bg-white/10 px-4 py-2">
                  {common.cancel || "Cancel"}
                </button>

                <button
                  onClick={() => {
                    const applicationId = selectedCandidate.applications[0]?.id;
                    if (applicationId && interviewDate && interviewTime) {
                      apiFetch("/api/interviews", {
                        method: "POST",
                        body: JSON.stringify({
                          applicationId,
                          scheduledAt: `${interviewDate}T${interviewTime}`,
                          type: interviewType,
                          notes: interviewNotes,
                        }),
                      }).catch(() => null);
                    }

                    alert(`${page.interviewScheduledWith || "Interview scheduled with"} ${selectedCandidate.candidateName}`);
                    setShowInterviewModal(false);
                  }}
                  className="flex items-center gap-2 rounded bg-purple-500 px-4 py-2 text-white"
                >
                  <Calendar size={16} />
                  {page.confirmSchedule || "Confirm Schedule"}
                </button>
              </div>
            </div>
          </div>
        )}

        {aiSummaryApplication && (
          <CandidateAiSummaryModal
            applicationId={aiSummaryApplication.id}
            candidateName={aiSummaryApplication.candidateName || "Unknown Candidate"}
            jobTitle={aiSummaryApplication.jobTitle || "Untitled Role"}
            language={language}
            t={t}
            isRTL={isRTL}
            onClose={() => setAiSummaryApplication(null)}
            onScoreReady={(matchScore, matchLabel) => applyAiMatchScore(aiSummaryApplication.id, matchScore, matchLabel)}
          />
        )}
      </div>
    </div>
  );
}

export default CompanyCandidates;
