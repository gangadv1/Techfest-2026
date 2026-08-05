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

type Props = {
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  onReset: () => void
}

export default function FiltersPanel({
  filters,
  setFilters,
  onReset,
}: Props) {
  const toggleArrayValue = (
    key:
      | "category"
      | "employmentType"
      | "experienceLevel"
      | "workplaceModel"
      | "techStack",
    value: string
  ) => {
    setFilters((prev) => {
      const current = prev[key]

      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      }
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Filters
          </p>
          <h2 className="text-xl font-bold text-slate-900">
            Refine your search
          </h2>
        </div>

        <button
          onClick={onReset}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* Location */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Location
          </h3>

          {[
            "Singapore",
            "Remote",
            "Downtown / Raffles Place",
            "Orchard",
            "Tanjong Pagar",
            "Jurong East",
            "Tampines",
            "Woodlands",
          ].map((location) => (
            <label
              key={location}
              className="mb-2 flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="radio"
                name="location"
                checked={filters.location === location}
                onChange={() =>
                  setFilters((prev) => ({
                    ...prev,
                    location,
                  }))
                }
              />
              {location}
            </label>
          ))}
        </div>

        {/* Category */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Category
          </h3>

          {["Software", "Data", "Cloud", "Analytics", "Product"].map(
            (category) => (
              <label
                key={category}
                className="mb-2 flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={filters.category.includes(category)}
                  onChange={() =>
                    toggleArrayValue("category", category)
                  }
                />
                {category}
              </label>
            )
          )}
        </div>

        {/* Employment */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Employment Type
          </h3>

          {["Full-time", "Part-time", "Contract", "Internship"].map(
            (type) => (
              <label
                key={type}
                className="mb-2 flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={filters.employmentType.includes(type)}
                  onChange={() =>
                    toggleArrayValue("employmentType", type)
                  }
                />
                {type}
              </label>
            )
          )}
        </div>

        {/* Experience */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Experience Level
          </h3>

          {[
            "Entry-level",
            "Mid-level",
            "Senior",
          ].map((level) => (
            <label
              key={level}
              className="mb-2 flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={filters.experienceLevel.includes(level)}
                onChange={() =>
                  toggleArrayValue("experienceLevel", level)
                }
              />
              {level}
            </label>
          ))}
        </div>

        {/* Salary */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Salary Range (SGD)
          </h3>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.salaryMin ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  salaryMin:
                    e.target.value === ""
                      ? undefined
                      : Number(e.target.value),
                }))
              }
              className="w-1/2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <input
              type="number"
              placeholder="Max"
              value={filters.salaryMax ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  salaryMax:
                    e.target.value === ""
                      ? undefined
                      : Number(e.target.value),
                }))
              }
              className="w-1/2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Workplace */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Workplace
          </h3>

          {["Remote", "Hybrid", "On-site"].map((model) => (
            <label
              key={model}
              className="mb-2 flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={filters.workplaceModel.includes(model)}
                onChange={() =>
                  toggleArrayValue("workplaceModel", model)
                }
              />
              {model}
            </label>
          ))}
        </div>

        {/* Visa */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Visa Eligibility
          </h3>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filters.visaEligible === true}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  visaEligible: e.target.checked
                    ? true
                    : undefined,
                }))
              }
            />
            Sponsorship available
          </label>
        </div>

        {/* Tech Stack */}
        <div className="md:col-span-2 lg:col-span-3">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Technical Stack
          </h3>

          <div className="flex flex-wrap gap-2">
            {[
              "Python",
              "JavaScript",
              "Java",
              "React",
              "TypeScript",
              "Vue.js",
              "AWS",
              "Docker",
              "ML",
              "TensorFlow",
              "PowerBI",
              "SQL",
            ].map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() =>
                  toggleArrayValue("techStack", skill)
                }
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  filters.techStack.includes(skill)
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
