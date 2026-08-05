import type { Job } from "../lib/jobs/mockJobs"

export default function JobDetailPanel({ job }: { job: Job }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-semibold text-indigo-600">
          {job.company}
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          {job.title}
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          {job.location} • {job.workplaceModel}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Employment</p>
          <p className="mt-1 text-sm font-semibold">
            {job.employmentType}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Experience</p>
          <p className="mt-1 text-sm font-semibold">
            {job.experienceLevel}
          </p>
        </div>
      </div>

      {(job.salaryMin != null || job.salaryMax != null) && (
        <div className="mb-6">
          <h3 className="mb-2 font-semibold text-slate-900">
            Salary
          </h3>

          <p className="text-sm text-slate-700">
            SGD {job.salaryMin?.toLocaleString() ?? "—"} –{" "}
            {job.salaryMax?.toLocaleString() ?? "—"}
          </p>
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-2 font-semibold text-slate-900">
          About the role
        </h3>

        <p className="text-sm leading-6 text-slate-600">
          {job.description}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 font-semibold text-slate-900">
          Technical Skills
        </h3>

        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-slate-600">
          Visa sponsorship:{" "}
          <span className="font-semibold text-slate-900">
            {job.visaEligible ? "Available" : "Not available"}
          </span>
        </p>
      </div>

      <button
        className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
        onClick={() => {
          if (job.applyUrl) {
            window.open(job.applyUrl, "_blank")
          }
        }}
      >
        Apply Now
      </button>
    </div>
  )
}
