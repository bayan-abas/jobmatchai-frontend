import { useNavigate } from "react-router-dom";

type ApplicationItem = {
  percent: string;
  title: string;
  company: string;
  location: string;
  date: string;
  score?: string;
  pending?: string;
  progress: number;
};

function Applications() {
  const navigate = useNavigate();

  const applications: ApplicationItem[] = [
    {
      percent: "92%",
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "Tel Aviv",
      date: "15/01/2024",
      score: "85%",
      progress: 3,
    },
    {
      percent: "87%",
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "Herzliya",
      date: "18/01/2024",
      score: "78%",
      progress: 2,
    },
    {
      percent: "85%",
      title: "React Developer",
      company: "InnovateLab",
      location: "Ramat Gan",
      date: "10/01/2024",
      score: "90%",
      progress: 4,
    },
    {
      percent: "80%",
      title: "UX Engineer",
      company: "DesignCo",
      location: "Remote",
      date: "20/01/2024",
      pending: "Pre-interview pending",
      progress: 1,
    },
    {
      percent: "88%",
      title: "Software Architect",
      company: "Enterprise Inc",
      location: "Haifa",
      date: "05/01/2024",
      score: "92%",
      progress: 5,
    },
  ];

  const renderStep = (index: number, progress: number) => {
    const done = index < progress;
    const current = index === progress;

    const icons = ["✈", "✦", "◉", "☆", "✓"];
    const icon = icons[index - 1];

    return (
      <div key={index} className="flex items-center">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full border text-lg transition ${
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
            className={`mx-3 h-[2px] w-10 md:w-14 ${
              index < progress ? "bg-cyan-400/70" : "bg-white/10"
            }`}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_30%),linear-gradient(90deg,#15154a_0%,#1b1d5b_45%,#18234f_100%)] px-6 py-8 md:px-10 text-white">
      <section>
        <button
          onClick={() => navigate("/candidate-dashboard")}
          className="mb-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-[18px] font-semibold text-white/80 transition hover:bg-white/10"
        >
          <span className="text-2xl">←</span>
          Back
        </button>

        <div className="mb-8 flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-sky-500 to-blue-600 text-3xl shadow-[0_0_30px_rgba(59,130,246,0.35)]">
            ▤
          </div>

          <div>
            <h1 className="text-4xl font-bold md:text-5xl">My Applications</h1>
            <p className="mt-2 text-xl text-white/60">
              Track and manage your job applications
            </p>
          </div>
        </div>

        <div className="mb-10 inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
          <button className="rounded-xl bg-indigo-500/25 px-6 py-3 text-lg font-semibold text-indigo-200">
            All
          </button>
          <button className="rounded-xl px-6 py-3 text-lg font-semibold text-white/60">
            Active
          </button>
          <button className="rounded-xl px-6 py-3 text-lg font-semibold text-white/60">
            Completed
          </button>
        </div>

        <div className="space-y-6">
          {applications.map((app, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-white/10 bg-white/[0.07] px-6 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-sm"
            >
              <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-[320px] items-center gap-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-indigo-300 text-2xl font-bold text-white shadow-[0_0_25px_rgba(129,140,248,0.2)]">
                    {app.percent}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold md:text-[38px]">
                      {app.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-5 text-lg text-white/55">
                      <span>▤ {app.company}</span>
                      <span>⌖ {app.location}</span>
                    </div>

                    <p className="mt-3 text-lg text-white/40">
                      Applied {app.date}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-start xl:justify-center">
                  {[1, 2, 3, 4, 5].map((step) =>
                    renderStep(step, app.progress)
                  )}
                </div>

                <div className="flex min-w-[180px] items-center justify-between gap-5 xl:justify-end">
                  <div className="text-right">
                    {app.pending ? (
                      <div className="rounded-full bg-yellow-500/20 px-5 py-3 text-lg font-semibold text-yellow-300">
                        {app.pending}
                      </div>
                    ) : (
                      <>
                        <h2 className="text-4xl font-bold">{app.score}</h2>
                        <p className="text-lg text-white/50">
                          Interview Score
                        </p>
                      </>
                    )}
                  </div>

                  <button className="text-4xl text-white/35 transition hover:text-white">
                    ›
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button className="fixed bottom-6 right-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-3xl shadow-[0_0_35px_rgba(168,85,247,0.45)]">
        ◔
      </button>
    </div>
  );
}

export default Applications;