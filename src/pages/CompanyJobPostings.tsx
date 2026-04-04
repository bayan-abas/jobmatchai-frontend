import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  BriefcaseBusiness,
  Users,
  MoreVertical,
  MapPin,
  CircleDollarSign,
  ArrowLeft,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

type JobStatus = "Active" | "Closed" | "Draft";

type JobItem = {
  id: number;
  title: string;
  location: string;
  salary: string;
  postedDate: string;
  status: JobStatus;
  applicants: number;
  newApplicants?: number;
};

const defaultJobs: JobItem[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    location: "Tel Aviv, Israel",
    salary: "$120k - $180k",
    postedDate: "10/01/2024",
    status: "Active",
    applicants: 45,
    newApplicants: 8,
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    location: "Herzliya, Israel",
    salary: "$100k - $150k",
    postedDate: "12/01/2024",
    status: "Active",
    applicants: 32,
    newApplicants: 5,
  },
  {
    id: 3,
    title: "DevOps Engineer",
    location: "Remote",
    salary: "$110k - $160k",
    postedDate: "15/01/2024",
    status: "Active",
    applicants: 28,
    newApplicants: 3,
  },
  {
    id: 4,
    title: "UX Designer",
    location: "Be'er Sheva, Israel",
    salary: "$90k - $130k",
    postedDate: "20/12/2023",
    status: "Closed",
    applicants: 56,
  },
  {
    id: 5,
    title: "Product Manager",
    location: "Haifa, Israel",
    salary: "$130k - $180k",
    postedDate: "18/01/2024",
    status: "Draft",
    applicants: 0,
  },
];

function getStatusStyles(status: JobStatus) {
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
}

function CompanyJobPostings() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === "ar" || language === "he";

  const [postedJobs, setPostedJobs] = useState<JobItem[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem("postedJobs") || "[]");

    const formattedJobs: JobItem[] = savedJobs.map((job: any) => {
      const salary =
        job.minSalary || job.maxSalary
          ? `$${job.minSalary || "0"} - $${job.maxSalary || "0"}`
          : "Not specified";

      return {
        id: job.id,
        title: job.title || "Untitled Job",
        location: job.location || (job.remoteWork ? "Remote" : "Not specified"),
        salary,
        postedDate: job.postedDate || "Recently",
        status: "Active",
        applicants: 0,
        newApplicants: 0,
      };
    });

    setPostedJobs(formattedJobs);
  }, []);

  const allJobs = useMemo(() => {
    return [...postedJobs, ...defaultJobs];
  }, [postedJobs]);

  return (
    <div
      className={`relative overflow-hidden text-white ${
        isRTL ? "text-right" : "text-left"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(0,194,255,0.09),transparent_10%),radial-gradient(circle_at_62%_80%,rgba(116,80,255,0.10),transparent_18%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:90px_90px]" />

     <div className="relative z-10 mx-auto w-full max-w-[980px] px-6 pb-10 pt-10 md:px-8 xl:px-0">
        <button
          type="button"
          onClick={() => navigate("/company-dashboard")}
          className={`mb-10 inline-flex items-center gap-3 rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-6 py-3 text-[16px] font-semibold text-white/80 backdrop-blur-[8px] transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          Back
        </button>

        <div
          className={`mb-10 flex items-center justify-between gap-4 max-[900px]:flex-col max-[900px]:items-start ${
            isRTL ? "max-[900px]:items-end" : ""
          }`}
        >
          <div
            className={`flex items-center gap-5 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="flex h-[62px] w-[62px] items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#7b61ff,#b13dff)] shadow-[0_12px_30px_rgba(139,92,246,0.28)]">
              <BriefcaseBusiness size={30} className="text-white" />
            </div>

            <div>
              <h1 className="text-[46px] font-extrabold leading-none text-white max-[900px]:text-[34px]">
                Job Postings
              </h1>
              <p className="mt-3 text-[18px] text-white/50">
                {allJobs.length} total jobs
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/post-job")}
            className={`inline-flex items-center gap-3 rounded-[14px] bg-[linear-gradient(135deg,#7f6bff,#9b3ff5)] px-6 py-3.5 text-[16px] font-bold text-white shadow-[0_14px_30px_rgba(139,92,246,0.25)] transition hover:scale-[1.02] hover:opacity-95 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Plus size={18} />
            Post New Job
          </button>
        </div>

        <div className="space-y-6">
          {allJobs.map((job) => (
            <div
              key={job.id}
              className={`relative rounded-[28px] border border-white/10 bg-[rgba(48,46,108,0.72)] px-7 py-7 shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur-[10px] transition hover:bg-[rgba(54,52,118,0.84)] ${
                openMenuId === job.id ? "z-50" : "z-0"
              }`}            >
              <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div
                    className={`mb-4 flex flex-wrap items-center gap-4 ${
                      isRTL ? "flex-row-reverse justify-end xl:justify-start" : ""
                    }`}
                  >
                    <h2 className="text-[24px] font-extrabold text-white">
                      {job.title}
                    </h2>

                    <span
                      className={`rounded-full px-4 py-1.5 text-[13px] font-bold ${getStatusStyles(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div
                    className={`flex flex-wrap items-center gap-x-8 gap-y-3 text-[15px] text-white/50 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <CircleDollarSign size={16} />
                      <span>{job.salary}</span>
                    </div>

                    <div className="text-white/50">
                      <span>Posted {job.postedDate}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`flex flex-wrap items-center gap-6 xl:flex-nowrap ${
                    isRTL ? "xl:flex-row-reverse" : ""
                  }`}
                >
                  <div className="min-w-[95px] text-center">
                    <div className="text-[24px] font-extrabold text-white">
                      {job.applicants}
                    </div>
                    <div className="text-[14px] text-white/45">Applicants</div>
                  </div>

                  <div className="min-w-[70px] text-center">
                    <div className="text-[24px] font-extrabold text-[#39e3b2]">
                      {job.newApplicants ? `+${job.newApplicants}` : ""}
                    </div>
                    <div className="text-[14px] text-white/45">
                      {job.newApplicants ? "New" : ""}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`inline-flex items-center gap-3 rounded-[14px] border border-[rgba(140,157,255,0.25)] bg-[rgba(255,255,255,0.02)] px-5 py-3 text-[15px] font-semibold text-[#b8c4ff] transition hover:bg-[rgba(255,255,255,0.06)] ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Users size={18} />
                    View Applicants
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
                      <div className="absolute right-0 top-full mt-2 w-[180px] rounded-[14px] bg-white text-black shadow-lg z-[9999]">
                        <button className="flex w-full items-center gap-2 px-4 py-3 hover:bg-gray-100">
                          View Details
                        </button>

                        <button className="flex w-full items-center gap-2 px-4 py-3 hover:bg-gray-100">
                          Edit Job
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CompanyJobPostings;