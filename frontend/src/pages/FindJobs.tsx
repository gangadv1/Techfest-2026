import { useMemo, useState } from "react"
import Filters from "../components/Filters"
import JobCard from "../components/JobCard"
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

export default function FindJobs() {
  const [filters, setFilters] = useState<Filters>({
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
  })
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const filtered = useMemo(() => {
    let out = [...mockJobs]

    // Keyword match
    const kw = filters.keyword.trim().toLowerCase()
    if (kw) {
      out = out.filter((j) =>
        j.title.toLowerCase().includes(kw) ||
        j.company.toLowerCase().includes(kw) ||
        j.description.toLowerCase().includes(kw) ||
        j.skills.some((s) => s.toLowerCase().includes(kw))
      )
    }

    // Location
    if (filters.location === "Remote") {
      out = out.filter((j) => j.workplaceModel === "Remote")
    } else if (filters.location !== "Any") {
      out = out.filter((j) => j.location === filters.location)
    }

    // Category
    if (filters.category.length) {
      const catMap: Record<string, (j: Job) => boolean> = {
        Software: (j) => j.skills.some((s) => ["React","Node.js","TypeScript","Java","Next.js"].includes(s)),
        Data: (j) => j.skills.some((s) => ["SQL","Python","Tableau","PowerBI","Spark"].includes(s)),
        Cloud: (j) => j.skills.some((s) => ["AWS","Azure","Terraform","Docker"].includes(s)),
        Analytics: (j) => j.skills.some((s) => ["Tableau","PowerBI","R"].includes(s)),
        Product: (j) => j.title.toLowerCase().includes("product")
      }
      out = out.filter((j) => filters.category.some((c) => (catMap[c] ? catMap[c](j) : false)))
    }

    // Employment Type
    if (filters.employmentType.length) {
      out = out.filter((j) => filters.employmentType.includes(j.employmentType))
    }

    // Experience Level
    if (filters.experienceLevel.length) {
      out = out.filter((j) => filters.experienceLevel.includes(j.experienceLevel))
    }

    // Salary
    if (filters.salaryMin != null || filters.salaryMax != null) {
      out = out.filter((j) => {
        if (j.salaryMin == null || j.salaryMax == null) return false
        const minOk = filters.salaryMin == null || (j.salaryMax >= filters.salaryMin)
        const maxOk = filters.salaryMax == null || (j.salaryMin <= filters.salaryMax)
        return minOk && maxOk
      })
    }

    // Workplace
    if (filters.workplaceModel.length) {
      out = out.filter((j) => filters.workplaceModel.includes(j.workplaceModel))
    }

    // Visa
    if (filters.visaEligible != null) {
      out = out.filter((j) => j.visaEligible === filters.visaEligible)
    }

    // Tech stack
    if (filters.techStack.length) {
      out = out.filter((j) => j.skills.some((s) => filters.techStack.includes(s)))
    }

    // Sort
    if (filters.sort === "newest") {
      out.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime())
    } else if (filters.sort === "salary") {
      out.sort((a, b) => (b.salaryMax ?? 0) - (a.salaryMax ?? 0))
    } else if (filters.sort === "relevance") {
      const kwScore = (j: Job) => {
        let score = 0
        if (!kw) return score
        const t = (s: string) => s.toLowerCase()
        if (t(j.title).includes(kw)) score += 3
        if (t(j.company).includes(kw)) score += 2
        if (t(j.description).includes(kw)) score += 2
        score += j.skills.filter((s) => t(s).includes(kw)).length
        return score
      }
      const stackScore = (j: Job) => j.skills.filter((s) => filters.techStack.includes(s)).length
      out.sort((a, b) => (kwScore(b) + stackScore(b)) - (kwScore(a) + stackScore(a)))
    }

    return out
  }, [filters])

  const resetFilters = () => {
    setFilters({
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
    })
    setIsFiltersOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-amber-200 bg-amber-50/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Job Board</p>
            <h1 className="text-3xl font-bold text-slate-900">Find Your Perfect Job</h1>
            <p className="text-sm text-amber-700">Browse opportunities tailored to your preferences</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        {/* Search and Sort Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
            <input
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              placeholder="Search jobs, companies, skills..."
              className="md:col-span-7 rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value as Filters["sort"] })}
              className="md:col-span-3 rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="newest">Newest</option>
              <option value="salary">Highest Salary</option>
              <option value="relevance">Relevance</option>
            </select>
            <button
              className="md:col-span-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              onClick={() => setIsFiltersOpen(false)}
            >
              Search
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
              onClick={() => setIsFiltersOpen((open) => !open)}
            >
              Filters
            </button>
            <span className="text-sm font-semibold text-slate-700">{filtered.length} jobs found</span>
          </div>
        </div>

        {/* Collapsible Filters Panel */}
        {isFiltersOpen && (
      <div className="mb-6">
        <Filters />
      </div>
    )}

        {/* Main Layout: Job List + Job Detail */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Job List */}
          <div className="space-y-4 lg:col-span-2">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-12 text-center shadow-sm backdrop-blur">
                <div className="mb-2 text-xl font-bold text-slate-900">No matching jobs found</div>
                <p className="mb-6 text-slate-600">Try adjusting your filters or search terms</p>
                <button
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
                  onClick={resetFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filtered.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSelected={selectedJob?.id === job.id}
                  onClick={() => setSelectedJob(job)}
                />
              ))
            )}
          </div>

  {/* Right: Job Details */}
  <div className="lg:col-span-1">
    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
      {selectedJob ? (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            {selectedJob.title}
          </h2>
          <p className="text-sm text-slate-600">
            {selectedJob.company}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            {selectedJob.location}
          </p>
        </div>
      ) : (
        <div className="text-lg font-semibold text-slate-700">
          Select a job to view details
        </div>
      )}
    </div>
  </div>
  )
}
