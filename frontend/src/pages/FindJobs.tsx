import { useMemo, useState } from "react"
import FiltersPanel from "../components/jobs/FiltersPanel"
import JobCard from "../components/jobs/JobCard"
import JobDetailPanel from "../components/jobs/JobDetailPanel"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-3">Find Your Perfect Job</h1>
          <p className="text-lg md:text-xl text-indigo-100">Browse opportunities tailored to your preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Sort Bar */}
        <div className="bg-white/90 backdrop-blur border border-white/60 shadow-lg rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <input
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              placeholder="Search jobs, companies..."
              className="md:col-span-7 px-5 py-3 rounded-xl border border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-base transition"
            />
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value as Filters["sort"] })}
              className="md:col-span-3 px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-base transition"
            >
              <option value="newest">Newest</option>
              <option value="salary">Highest Salary</option>
              <option value="relevance">Relevance</option>
            </select>
            <button
              className="md:col-span-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition shadow-sm"
              onClick={() => setIsFiltersOpen(false)}
            >
              Search
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <button
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition"
              onClick={() => setIsFiltersOpen((open) => !open)}
            >
              Filters
            </button>
            <span className="text-slate-700 font-semibold">{filtered.length} jobs found</span>
          </div>
        </div>

        {/* Collapsible Filters Panel */}
        {isFiltersOpen && (
          <div className="mb-6">
            <FiltersPanel
              filters={filters}
              setFilters={setFilters}
              onReset={resetFilters}
            />
          </div>
        )}

        {/* Main Layout: Job List + Job Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Job List */}
          <div className="lg:col-span-2 space-y-4">
            {filtered.length === 0 ? (
              <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl p-12 text-center">
                <div className="text-slate-900 font-bold text-xl mb-2">No matching jobs found</div>
                <p className="text-slate-600 mb-6">Try adjusting your filters or search terms</p>
                <button
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
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

          {/* Right: Job Detail (Sticky) */}
          <div className="lg:col-span-1">
            {selectedJob ? (
              <div className="sticky top-24">
                <JobDetailPanel job={selectedJob} />
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl p-8 text-center sticky top-24">
                <div className="text-slate-700 text-lg font-semibold">Select a job to view details</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
