import { useMemo, useState } from "react"
import FiltersPanel from "../components/FiltersPanel"
import JobCard from "../components/JobCard"
import JobDetailPanel from "../components/JobDetailPanel"
import { mockJobs, type Job } from "../lib/jobs/mockJobs"

type Filters = {
  keyword: string
  location: string
  category: string[]
  employmentType: string[]
  experienceLevel: string[]
  salaryMin?: number
  salaryMax?: number
  workplaceModel: string[]
  visaEligible?: boolean
  techStack: string[]
  sort: "newest" | "salary" | "relevance"
}

const defaultFilters: Filters = {
  keyword: "",
  location: "Singapore",
  category: [],
  employmentType: [],
  experienceLevel: [],
  salaryMin: undefined,
  salaryMax: undefined,
  workplaceModel: [],
  visaEligible: undefined,
  techStack: [],
  sort: "newest",
}

export default function FindJobs() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const filtered = useMemo(() => {
    let out = [...mockJobs]

    const kw = filters.keyword.trim().toLowerCase()

    // Search
    if (kw) {
      out = out.filter(
        (job) =>
          job.title.toLowerCase().includes(kw) ||
          job.company.toLowerCase().includes(kw) ||
          job.description.toLowerCase().includes(kw) ||
          job.skills.some((skill) => skill.toLowerCase().includes(kw))
      )
    }

    // Location
    if (filters.location === "Remote") {
      out = out.filter((job) => job.workplaceModel === "Remote")
    } else if (filters.location !== "Any") {
      out = out.filter((job) => job.location === filters.location)
    }

    // Category
    if (filters.category.length) {
      const categoryMatches: Record<string, (job: Job) => boolean> = {
        Software: (job) =>
          job.skills.some((skill) =>
            ["React", "Node.js", "TypeScript", "Java", "Next.js"].includes(skill)
          ),

        Data: (job) =>
          job.skills.some((skill) =>
            ["SQL", "Python", "Tableau", "PowerBI", "Spark"].includes(skill)
          ),

        Cloud: (job) =>
          job.skills.some((skill) =>
            ["AWS", "Azure", "Terraform", "Docker"].includes(skill)
          ),

        Analytics: (job) =>
          job.skills.some((skill) =>
            ["Tableau", "PowerBI", "R"].includes(skill)
          ),

        Product: (job) =>
          job.title.toLowerCase().includes("product"),
      }

      out = out.filter((job) =>
        filters.category.some(
          (category) =>
            categoryMatches[category]?.(job) ?? false
        )
      )
    }

    // Employment type
    if (filters.employmentType.length) {
      out = out.filter((job) =>
        filters.employmentType.includes(job.employmentType)
      )
    }

    // Experience level
    if (filters.experienceLevel.length) {
      out = out.filter((job) =>
        filters.experienceLevel.includes(job.experienceLevel)
      )
    }

    // Salary
    if (filters.salaryMin != null || filters.salaryMax != null) {
      out = out.filter((job) => {
        if (job.salaryMin == null || job.salaryMax == null) {
          return false
        }

        const minOk =
          filters.salaryMin == null ||
          job.salaryMax >= filters.salaryMin

        const maxOk =
          filters.salaryMax == null ||
          job.salaryMin <= filters.salaryMax

        return minOk && maxOk
      })
    }

    // Workplace
    if (filters.workplaceModel.length) {
      out = out.filter((job) =>
        filters.workplaceModel.includes(job.workplaceModel)
      )
    }

    // Visa
    if (filters.visaEligible != null) {
      out = out.filter(
        (job) => job.visaEligible === filters.visaEligible
      )
    }

    // Technical stack
    if (filters.techStack.length) {
      out = out.filter((job) =>
        job.skills.some((skill) =>
          filters.techStack.includes(skill)
        )
      )
    }

    // Sorting
    if (filters.sort === "newest") {
      out.sort(
        (a, b) =>
          new Date(b.datePosted).getTime() -
          new Date(a.datePosted).getTime()
      )
    }

    if (filters.sort === "salary") {
      out.sort(
        (a, b) =>
          (b.salaryMax ?? 0) - (a.salaryMax ?? 0)
      )
    }

    if (filters.sort === "relevance") {
      const score = (job: Job) => {
        let total = 0

        if (!kw) return total

        if (job.title.toLowerCase().includes(kw)) {
          total += 3
        }

        if (job.company.toLowerCase().includes(kw)) {
          total += 2
        }

        if (job.description.toLowerCase().includes(kw)) {
          total += 2
        }

        total += job.skills.filter((skill) =>
          skill.toLowerCase().includes(kw)
        ).length

        total += job.skills.filter((skill) =>
          filters.techStack.includes(skill)
        ).length

        return total
      }

      out.sort((a, b) => score(b) - score(a))
    }

    return out
  }, [filters])

  const resetFilters = () => {
    setFilters(defaultFilters)
    setSelectedJob(null)
    setIsFiltersOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-amber-200 bg-amber-50/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            Job Board
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Find Your Perfect Job
          </h1>

          <p className="text-sm text-amber-700">
            Browse opportunities tailored to your preferences
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">

        {/* Search + Sort */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
            <input
              value={filters.keyword}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  keyword: event.target.value,
                }))
              }
              placeholder="Search jobs, companies, skills..."
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 md:col-span-7"
            />

            <select
              value={filters.sort}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  sort: event.target.value as Filters["sort"],
                }))
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 md:col-span-3"
            >
              <option value="newest">Newest</option>
              <option value="salary">Highest Salary</option>
              <option value="relevance">Relevance</option>
            </select>

            <button
              type="button"
              onClick={() => setIsFiltersOpen(true)}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 md:col-span-2"
            >
              Search
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setIsFiltersOpen((open) => !open)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
            >
              Filters
            </button>

            <span className="text-sm font-semibold text-slate-700">
              {filtered.length} jobs found
            </span>
          </div>
        </div>

        {/* Filters */}
        {isFiltersOpen && (
          <FiltersPanel
            filters={filters}
            setFilters={setFilters}
            onReset={resetFilters}
          />
        )}

        {/* Job list + details */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Job List */}
          <div className="space-y-4 lg:col-span-2">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-12 text-center shadow-sm">
                <div className="mb-2 text-xl font-bold text-slate-900">
                  No matching jobs found
                </div>

                <p className="mb-6 text-slate-600">
                  Try adjusting your filters or search terms
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filtered.map((job) => (
                <JobCard
                  key={job.id}
                  job={{
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    datePosted: job.datePosted,
                    workplaceModel: job.workplaceModel,
                    employmentType: job.employmentType,
                    salary: `SGD ${job.salaryMin?.toLocaleString() ?? "—"} – ${job.salaryMax?.toLocaleString() ?? "—"}`,
                    extractedSkills: job.skills,
                    applicantCount: undefined,
                  }}
                  isSelected={selectedJob?.id === job.id}
                  onClick={() => setSelectedJob(job)}
                />
              ))
            )}
          </div>

          {/* Job Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {selectedJob ? (
                <JobDetailPanel job={selectedJob} />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm">
                  <div className="text-lg font-semibold text-slate-700">
                    Select a job to view details
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
