import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  BriefcaseBusiness,
  MapPin,
  ArrowLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

type FilterType = "all" | "active" | "completed";

type ApplicationItem = {
  percent: string;
  title: string;
  company: string;
  location: string;
  date: string;
  score?: string;
  pending?: string;
  progress: number;
  status: "active" | "completed";
};

function CircleProgress({ percent }: { percent: string }) {
  const value = parseInt(percent.replace("%", ""));
  const size = 76;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = (num: number) => {
    if (num >= 90) return "#8b93ff";
    if (num >= 75) return "#7f4cff";
    return "#22d3ee";
  };

  return (
    <div className="relative h-[76px] w-[76px] shrink-0">
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(value)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
          style={{
            filter: "drop-shadow(0 0 10px rgba(139,147,255,0.28))",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center text-[18px] font-extrabold text-white">
        {percent}
      </div>
    </div>
  );
}

function Applications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("all");

  const applications: ApplicationItem[] = [
    {
      percent: "92%",
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "Tel Aviv",
      date: "15/01/2024",
      score: "85%",
      progress: 3,
      status: "active",
    },
    {
      percent: "87%",
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "Herzliya",
      date: "18/01/2024",
      score: "78%",
      progress: 2,
      status: "active",
    },
    {
      percent: "85%",
      title: "React Developer",
      company: "InnovateLab",
      location: "Ramat Gan",
      date: "10/01/2024",
      score: "90%",
      progress: 4,
      status: "completed",
    },
    {
      percent: "80%",
      title: "UX Engineer",
      company: "DesignCo",
      location: "Remote",
      date: "20/01/2024",
      pending: "Pre-interview pending",
      progress: 1,
      status: "active",
    },
    {
      percent: "88%",
      title: "Software Architect",
      company: "Enterprise Inc",
      location: "Haifa",
      date: "05/01/2024",
      score: "92%",
      progress: 5,
      status: "active",
    },
  ];

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const renderStep = (index: number, progress: number) => {
    const done = index < progress;
    const current = index === progress;

    const icons = ["✈", "✦", "◉", "☆", "✓"];
    const icon = icons[index - 1];

    return (
      <div key={index} className="flex items-center">
        <div
          className={`flex h-[44px] w-[44px] items-center justify-center rounded-full border text-[16px] transition ${
            done
              ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-300"
              : current
                ? "border-indigo-400 bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                : "border-white/10 bg-white/5 text-white/30"
          }`}
        >
          {icon}
        </div>

        {index !== 5 && (
          <div
            className={`mx-2 h-[2px] w-8 lg:w-10 ${
              index < progress ? "bg-cyan-400/70" : "bg-white/10"
            }`}
          />
        )}
      </div>
    );
  };

  const filterButtonClass = (value: FilterType) =>
    `rounded-[14px] px-5 py-2.5 text-[16px] font-semibold transition ${
      filter === value
        ? "bg-indigo-500/25 text-indigo-200 shadow-[0_0_0_1px_rgba(129,140,248,0.18)]"
        : "text-white/60 hover:text-white hover:bg-white/[0.04]"
    }`;

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_24%),linear-gradient(135deg,#17184a_0%,#1a1b56_42%,#17234f_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <section>
          <button
            onClick={() => navigate("/candidate-dashboard")}
            className="mb-8 flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.05] px-6 py-3 text-[18px] font-semibold text-white/80 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[18px] bg-gradient-to-b from-sky-500 to-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.35)]">
              <FileText size={28} className="text-white" />
            </div>

            <div>
              <h1 className="text-[34px] font-extrabold text-white sm:text-[42px]">
                My Applications
              </h1>
              <p className="mt-1 text-[18px] text-white/60">
                Track and manage your job applications
              </p>
            </div>
          </div>

          <div className="mb-10 inline-flex rounded-[18px] border border-white/10 bg-white/[0.05] p-1">
            <button
              onClick={() => setFilter("all")}
              className={filterButtonClass("all")}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={filterButtonClass("active")}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={filterButtonClass("completed")}
            >
              Completed
            </button>
          </div>

          <div className="space-y-5">
            {filteredApplications.map((app, index) => (
              <div
                key={index}
                className="rounded-[28px] border border-white/10 bg-white/[0.07] px-5 py-6 shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-sm transition hover:bg-white/[0.09] lg:px-7"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-center gap-5">
                    <CircleProgress percent={app.percent} />

                    <div className="min-w-0">
                      <h3 className="truncate text-[24px] font-extrabold text-white lg:text-[28px]">
                        {app.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-[16px] text-white/55">
                        <span className="flex items-center gap-2">
                          <BriefcaseBusiness size={16} />
                          {app.company}
                        </span>

                        <span className="flex items-center gap-2">
                          <MapPin size={16} />
                          {app.location}
                        </span>
                      </div>

                      <p className="mt-2 text-[15px] text-white/40">
                        Applied {app.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center xl:justify-center">
                    {[1, 2, 3, 4, 5].map((step) =>
                      renderStep(step, app.progress)
                    )}
                  </div>

                  <div className="flex min-w-[170px] items-center justify-between gap-4 xl:justify-end">
                    <div className="text-right">
                      {app.pending ? (
                        <div className="rounded-full bg-yellow-500/20 px-4 py-2 text-[14px] font-semibold text-yellow-300">
                          {app.pending}
                        </div>
                      ) : (
                        <>
                          <h2 className="text-[26px] font-extrabold text-white lg:text-[30px]">
                            {app.score}
                          </h2>
                          <p className="text-[14px] text-white/50">
                            Interview Score
                          </p>
                        </>
                      )}
                    </div>

                    <button className="text-white/35 transition hover:text-white">
                      <ChevronRight size={28} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredApplications.length === 0 && (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.05] px-8 py-12 text-center">
                <h3 className="text-[24px] font-bold text-white">
                  No applications found
                </h3>
                <p className="mt-2 text-white/55">
                  There are no applications in this section yet.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Applications;