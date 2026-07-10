import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  BriefcaseBusiness,
  MoreVertical,
  MapPin,
  CircleDollarSign,
  ArrowLeft,
  X,
  Save,
  Trash2,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { translations } from "../translations";
import { apiFetch, ApiError } from "../utils/api";
import { formatSalary } from "../utils/formatSalary";
import { getMatchTier } from "../utils/matchScore";

type JobStatus = "Active" | "Closed" | "Draft";

type JobItem = {
  id: number;
  title: string;
  companyName?: string;
  companyEmail?: string;
  location: string;
  type?: string;
  salary: string;
  description?: string;
  requirements?: string;
  skills?: string;
  postedDate: string;
  status: JobStatus;
  applicants: number;
};

type BackendApplication = {
  jobId: number;
  matchPercent: number | null;
};

function formatPostedDate(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CompanyJobPostings() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language] || translations.en;
  const page = t.companyJobPostingsPage || {};
  const common = t.common || {};
  const isRTL = language === "ar" || language === "he";

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [applications, setApplications] = useState<BackendApplication[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [deleteJobModal, setDeleteJobModal] = useState<JobItem | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editType, setEditType] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRequirements, setEditRequirements] = useState("");
  const [editSkills, setEditSkills] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [page.notSpecified, page.recently, page.untitledJob]);

  useEffect(() => {
    if (!user?.email) return;

    apiFetch("/api/applications/company")
      .then((data: BackendApplication[]) => {
        setApplications(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, [user?.email]);

  const avgMatchScoreByJobId = useMemo(() => {
    const scoresByJob = new Map<number, number[]>();

    for (const app of applications) {
      if (typeof app.matchPercent !== "number") continue;
      const scores = scoresByJob.get(app.jobId) || [];
      scores.push(app.matchPercent);
      scoresByJob.set(app.jobId, scores);
    }

    const averages = new Map<number, number>();
    for (const [jobId, scores] of scoresByJob) {
      averages.set(jobId, Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length));
    }

    return averages;
  }, [applications]);

  const fetchJobs = async () => {
    try {
      const companyEmail = user?.email;

      if (!companyEmail) {
        setJobs([]);
        setLoading(false);
        return;
      }

      const data = await apiFetch(`/api/jobs/company/${companyEmail}`);

      const formattedJobs: JobItem[] = data.map((job: any) => ({
        id: job.id,
        title: job.title || page.untitledJob || "Untitled Job",
        companyName: job.companyName || "Company",
        companyEmail: job.companyEmail || companyEmail,
        location: job.location || page.notSpecified || "Not specified",
        type: job.type || "Full-time",
        salary: job.salary || "",
        description: job.description || "",
        requirements: job.requirements || "",
        skills: job.skills || "",
        postedDate: formatPostedDate(job.createdAt) || page.recently || "Recently",
        status: "Active",
        applicants: job.applicantsCount ?? 0,
      }));

      setJobs(formattedJobs);
    } catch (error) {
      console.error(error);
      alert("Failed to load jobs from server.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (job: JobItem) => {
    setEditingJob(job);
    setEditTitle(job.title);
    setEditLocation(job.location);
    setEditType(job.type || "Full-time");
    setEditSalary(job.salary);
    setEditDescription(job.description || "");
    setEditRequirements(job.requirements || "");
    setEditSkills(job.skills || "");
    setOpenMenuId(null);
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    if (!editTitle.trim() || !editDescription.trim()) {
      alert(
        page.fillTitleAndDescription ||
          "Please fill in Job Title and Description."
      );
      return;
    }

    try {
      setIsUpdating(true);

      const data = await apiFetch(`/api/jobs/${editingJob.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editTitle,
          companyName:
            editingJob.companyName || user?.name || "Company",
          companyEmail:
            editingJob.companyEmail || user?.email,
          location: editLocation,
          type: editType,
          salary: editSalary,
          description: editDescription,
          requirements: editRequirements,
          skills: editSkills,
        }),
      });

      if (!data.success) {
        alert(data.message || page.failedToUpdateJob || "Failed to update job.");
        return;
      }

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === editingJob.id
            ? {
                ...job,
                title: editTitle,
                location: editLocation,
                type: editType,
                salary: editSalary,
                description: editDescription,
                requirements: editRequirements,
                skills: editSkills,
              }
            : job
        )
      );

      setEditingJob(null);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof ApiError
          ? error.message
          : page.serverConnectionFailed || "Server connection failed."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      setIsDeleting(jobId);

      const data = await apiFetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (!data.success) {
        alert(data.message || page.failedToDeleteJob || "Failed to delete job.");
        return;
      }

      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      setDeleteJobModal(null);
      setOpenMenuId(null);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof ApiError
          ? error.message
          : page.serverConnectionFailed || "Server connection failed."
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const getStatusLabel = (status: JobStatus) => {
    if (status === "Active") return page.activeJobs || "Active";
    if (status === "Closed") return page.closedJobs || "Closed";
    return page.draftJobs || "Draft";
  };

  const getStatusStyles = (status: JobStatus) => {
    switch (status) {
      case "Active":
        return "bg-[rgba(38,199,132,0.14)] text-[#4ff0b2] border border-[rgba(79,240,178,0.18)]";
      case "Closed":
        return "bg-[rgba(145,153,180,0.12)] text-[#c5cadb] border border-[rgba(197,202,219,0.14)]";
      case "Draft":
        return "bg-[rgba(147,117,255,0.12)] text-[#cbb8ff] border border-[rgba(203,184,255,0.14)]";
      default:
        return "bg-white/10 text-white border border-white/10";
    }
  };

  return (
    <div
      className={`relative overflow-hidden text-white ${
        isRTL ? "text-right" : "text-left"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(0,194,255,0.09),transparent_10%),radial-gradient(circle_at_62%_80%,rgba(116,80,255,0.10),transparent_18%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:90px_90px] opacity-[0.12]" />

      <div className="relative z-10 mx-auto w-full max-w-[980px] px-6 pb-10 pt-10 md:px-8 xl:px-0">
        <button
          type="button"
          onClick={() => navigate("/company-dashboard")}
          className="mb-10 inline-flex items-center gap-3 rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-6 py-3 text-[16px] font-semibold text-white/80 backdrop-blur-[8px] transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
        >
          <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          {common.back || "Back"}
        </button>

        <div
          className={`mb-10 flex items-center justify-between gap-4 max-[900px]:flex-col max-[900px]:items-start ${
            isRTL ? "max-[900px]:items-end" : ""
          }`}
        >
          <div className="flex items-center gap-5">
            <div className="flex h-[62px] w-[62px] items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#7b61ff,#b13dff)] shadow-[0_12px_30px_rgba(139,92,246,0.28)]">
              <BriefcaseBusiness size={30} className="text-white" />
            </div>

            <div>
              <h1 className="text-[46px] font-extrabold leading-none text-white max-[900px]:text-[34px]">
                {page.title || "Job Postings"}
              </h1>
              <p className="mt-3 text-[18px] text-white/50">
                {jobs.length} {page.totalJobs || "total jobs"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/post-job")}
            className="inline-flex items-center gap-3 rounded-[14px] bg-[linear-gradient(135deg,#7f6bff,#9b3ff5)] px-6 py-3.5 text-[16px] font-bold text-white shadow-[0_14px_30px_rgba(139,92,246,0.25)] transition hover:scale-[1.02] hover:opacity-95"
          >
            <Plus size={18} />
            {page.postNewJob || "Post New Job"}
          </button>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-[rgba(48,46,108,0.72)] p-8 text-center text-white/70">
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-[rgba(48,46,108,0.72)] p-8 text-center text-white/70">
            No jobs found. Post your first job.
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`relative rounded-[28px] border border-white/10 bg-[rgba(48,46,108,0.72)] px-7 py-7 shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur-[10px] transition hover:bg-[rgba(54,52,118,0.84)] ${
                  openMenuId === job.id ? "z-50" : "z-0"
                }`}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  <div className="min-w-0 flex-1">
                    <div
                      className={`mb-3 flex flex-wrap items-center gap-3 ${
                        isRTL ? "justify-end" : "justify-start"
                      }`}
                    >
                      <h2 className="text-[22px] font-extrabold text-white">
                        {job.title}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-[12px] font-bold ${getStatusStyles(
                          job.status
                        )}`}
                      >
                        {getStatusLabel(job.status)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-white/50">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={15} />
                        <span>{job.location}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <CircleDollarSign size={15} />
                        <span>{formatSalary(job.salary) || page.salaryNotSpecified || "Salary not specified"}</span>
                      </div>

                      <div>
                        <span>
                          {page.posted || "Posted"} {job.postedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 border-y border-white/5 py-4 lg:border-y-0 lg:border-x lg:px-8 lg:py-0">
                    <div className="text-center">
                      <div className="text-[22px] font-extrabold text-white">
                        {job.applicants}
                      </div>
                      <div className="text-[13px] text-white/45">
                        {page.applicants || "Applicants"}
                      </div>
                    </div>

                    <div className="text-center">
                      <div
                        className={`text-[22px] font-extrabold ${
                          job.applicants > 0 && avgMatchScoreByJobId.has(job.id)
                            ? getMatchTier(avgMatchScoreByJobId.get(job.id)!).text
                            : "text-white/45"
                        }`}
                      >
                        {job.applicants === 0
                          ? page.noApplicants || "No applicants"
                          : avgMatchScoreByJobId.has(job.id)
                          ? `${avgMatchScoreByJobId.get(job.id)}%`
                          : page.notScoredYet || "Not scored yet"}
                      </div>
                      <div className="text-[13px] text-white/45">
                        {page.avgMatchScore || "Avg Match Score"}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 lg:w-[200px] ${
                      isRTL ? "flex-row-reverse justify-start" : "justify-end"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/company-applications?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}`
                        )
                      }
                      className="flex-1 rounded-[12px] border border-[rgba(140,157,255,0.25)] bg-[rgba(255,255,255,0.02)] px-4 py-2.5 text-[14px] font-semibold text-[#b8c4ff] transition hover:bg-[rgba(255,255,255,0.06)]"
                    >
                      {page.viewCandidates || "View Candidates"}
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(openMenuId === job.id ? null : job.id)
                        }
                        className="rounded-full p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {openMenuId === job.id && (
                        <div
                          className={`absolute top-full z-[9999] mt-2 w-[190px] overflow-hidden rounded-[16px] border border-black/5 bg-white text-black shadow-[0_18px_45px_rgba(0,0,0,0.25)] ${
                            isRTL ? "left-0" : "right-0"
                          }`}
                        >
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              navigate(`/company-job-details/${job.id}`);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-gray-100"
                          >
                            {page.viewDetails || "View Details"}
                          </button>

                          <button
                            onClick={() => openEditModal(job)}
                            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-gray-100"
                          >
                            {page.editJob || "Edit Job"}
                          </button>

                          <button
                            onClick={() => {
                              setDeleteJobModal(job);
                              setOpenMenuId(null);
                            }}
                            disabled={isDeleting === job.id}
                            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                            {isDeleting === job.id
                              ? page.deleting || "Deleting..."
                              : page.deleteJob || "Delete Job"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingJob && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[760px] rounded-[30px] border border-white/10 bg-[#201f58] p-7 shadow-[0_25px_90px_rgba(0,0,0,0.55)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[28px] font-extrabold text-white">
                  {page.editJob || "Edit Job"}
                </h2>
                <p className="mt-1 text-white/50">
                  {page.editJobSubtitle || "Update this job posting details."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid max-h-[65vh] gap-5 overflow-y-auto pr-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/70">
                  {page.jobTitleRequired || "Job Title *"}
                </label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-12 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[#7f6bff]"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/70">
                    {page.location || "Location"}
                  </label>
                  <input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="h-12 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[#7f6bff]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/70">
                    {page.employmentType || "Employment Type"}
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="h-12 w-full rounded-[14px] border border-white/10 bg-[#2f2d68] px-4 text-white outline-none focus:border-[#7f6bff]"
                  >
                    <option>{page.fullTime || "Full-time"}</option>
                    <option>{page.partTime || "Part-time"}</option>
                    <option>{page.contract || "Contract"}</option>
                    <option>{page.internship || "Internship"}</option>
                    <option>{page.remote || "Remote"}</option>
                    <option>{page.hybrid || "Hybrid"}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/70">
                  {page.salary || "Salary"}
                </label>
                <input
                  value={editSalary}
                  onChange={(e) => setEditSalary(e.target.value)}
                  placeholder={page.salaryPlaceholder || "e.g., 10000 - 20000"}
                  className="h-12 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[#7f6bff]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/70">
                  {page.descriptionRequired || "Description *"}
                </label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#7f6bff]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/70">
                  {page.requirements || "Requirements"}
                </label>
                <textarea
                  rows={3}
                  value={editRequirements}
                  onChange={(e) => setEditRequirements(e.target.value)}
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#7f6bff]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/70">
                  {page.skills || "Skills"}
                </label>
                <input
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  placeholder={page.skillsPlaceholder || "React, JavaScript, CSS"}
                  className="h-12 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[#7f6bff]"
                />
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="rounded-[14px] border border-white/10 bg-white/5 px-6 py-3 font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {common.cancel || "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleUpdateJob}
                disabled={isUpdating}
                className={`inline-flex items-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#7f6bff,#9b3ff5)] px-6 py-3 font-bold text-white shadow-[0_14px_30px_rgba(139,92,246,0.25)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Save size={18} />
                {isUpdating
                  ? page.saving || "Saving..."
                  : page.saveChanges || "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteJobModal && (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
    <div className="relative w-full max-w-[560px] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,#26245f,#1d1b4d)] p-0 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">

      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-500/20 blur-[60px]" />
      <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-purple-500/20 blur-[60px]" />

      <div
        className={`relative flex items-center justify-between border-b border-white/10 px-7 py-5 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`flex items-center gap-4 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
            <Trash2 size={26} />
          </div>

          <div>
            <h2 className="text-[24px] font-extrabold text-white">
              {page.deleteJob || "Delete Job"}
            </h2>

            <p className="mt-1 text-sm text-white/50">
              {page.deleteJobWarning || "This action cannot be undone"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDeleteJobModal(null)}
          className="rounded-full p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative px-7 py-6">
        <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-[20px] font-bold text-white">
            {deleteJobModal.title}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/50">
            <span>{deleteJobModal.location}</span>

            <span className="h-1 w-1 rounded-full bg-white/30" />

            <span>{formatSalary(deleteJobModal.salary) || page.salaryNotSpecified || "Salary not specified"}</span>
          </div>
        </div>

        <p className="mt-5 text-[15px] leading-7 text-white/60">
          {page.deleteJobConfirm ||
            "Are you sure you want to permanently remove this job posting from the platform?"}
        </p>

        <div className="mt-7 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => setDeleteJobModal(null)}
            className="rounded-[16px] border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            {common.cancel || "Cancel"}
          </button>

          <button
            type="button"
            onClick={() => handleDeleteJob(deleteJobModal.id)}
            disabled={isDeleting === deleteJobModal.id}
            className={`inline-flex items-center gap-2 rounded-[16px] bg-red-500 px-6 py-3 font-bold text-white shadow-[0_14px_30px_rgba(239,68,68,0.25)] transition hover:scale-[1.02] hover:bg-red-600 disabled:opacity-60 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Trash2 size={18} />

            {isDeleting === deleteJobModal.id
              ? page.deleting || "Deleting..."
              : page.deleteJob || "Delete Job"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default CompanyJobPostings;