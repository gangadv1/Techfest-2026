import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function Filters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    location: searchParams.getAll('location'),
    employmentType: searchParams.getAll('employmentType'),
    experienceLevel: searchParams.getAll('experienceLevel'),
    role: searchParams.getAll('role'),
    visa: searchParams.getAll('visa'),
    skills: searchParams.getAll('skills'),
    salaryMin: searchParams.get('salaryMin') || '',
    salaryMax: searchParams.get('salaryMax') || ''
  })

  const updateFilters = (key: string, value: string, checked: boolean) => {
    const newFilters: any = { ...filters }
    if (checked) {
      newFilters[key] = [...(newFilters[key] || []), value]
    } else {
      newFilters[key] = (newFilters[key] || []).filter((v: string) => v !== value)
    }
    setFilters(newFilters)
    syncParams(newFilters)
  }

  const updateField = (key: string, value: string) => {
    const newFilters: any = { ...filters, [key]: value }
    setFilters(newFilters)
    syncParams(newFilters)
  }

  const syncParams = (newFilters: any) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, values]) => {
      if (values === undefined || values === null) return
      if (Array.isArray(values)) {
        values.forEach((v: string) => params.append(k, v))
      } else if (values !== '') {
        params.set(k, String(values))
      }
    })
    setSearchParams(params)
  }

  const clearFilters = () => {
    const empty = { location: [], employmentType: [], experienceLevel: [], role: [], visa: [], skills: [], salaryMin: '', salaryMax: '' }
    setFilters(empty)
    setSearchParams(new URLSearchParams())
  }

  return (
    <div className="bg-white/90 backdrop-blur border border-white/60 shadow-lg rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Filters</p>
          <h2 className="text-xl font-bold text-slate-900">Refine your search</h2>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Location</h3>
          {['Remote', 'Singapore', 'Downtown / Raffles Place', 'Orchard', 'Tanjong Pagar', 'Jurong East', 'Tampines', 'Woodlands'].map(loc => (
            <label key={loc} className="flex items-center text-sm text-slate-700">
              <input type="checkbox" checked={filters.location.includes(loc)} onChange={(e) => updateFilters('location', loc, e.target.checked)} className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              {loc}
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Role / Category</h3>
          {['Software Engineer', 'Data Scientist', 'Product Manager', 'Designer', 'DevOps Engineer', 'QA'].map(role => (
            <label key={role} className="flex items-center text-sm text-slate-700">
              <input type="checkbox" checked={filters.role.includes(role)} onChange={(e) => updateFilters('role', role, e.target.checked)} className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              {role}
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Employment Type</h3>
          {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
            <label key={type} className="flex items-center text-sm text-slate-700">
              <input type="checkbox" checked={filters.employmentType.includes(type)} onChange={(e) => updateFilters('employmentType', type, e.target.checked)} className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              {type}
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Experience Level</h3>
          {['Entry-level (0-2 years)', 'Intermediate/Mid-level (2-5 years)', 'Senior/Executive (5+ years)'].map(level => (
            <label key={level} className="flex items-center text-sm text-slate-700">
              <input type="checkbox" checked={filters.experienceLevel.includes(level)} onChange={(e) => updateFilters('experienceLevel', level, e.target.checked)} className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              {level}
            </label>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Salary Range (SGD)</h3>
          <div className="flex gap-2 items-center">
            <input type="number" placeholder="Min" value={filters.salaryMin} onChange={(e) => updateField('salaryMin', e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 w-1/2 text-sm" />
            <input type="number" placeholder="Max" value={filters.salaryMax} onChange={(e) => updateField('salaryMax', e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 w-1/2 text-sm" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Visa / Work Eligibility</h3>
          {['No sponsorship needed', 'Sponsorship available', 'Open to sponsorship'].map(v => (
            <label key={v} className="flex items-center text-sm text-slate-700">
              <input type="checkbox" checked={filters.visa.includes(v)} onChange={(e) => updateFilters('visa', v, e.target.checked)} className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              {v}
            </label>
          ))}
        </div>

        <div className="space-y-2 lg:col-span-3">
          <h3 className="text-sm font-semibold text-slate-900">Technical Stack</h3>
          <div className="flex flex-wrap gap-2">
            {['Python', 'JavaScript', 'Java', 'React', 'TypeScript', 'Vue.js', 'AWS', 'Docker', 'ML', 'TensorFlow', 'PowerBI', 'SQL'].map(skill => (
              <button
                key={skill}
                onClick={() => updateFilters('skills', skill, !filters.skills.includes(skill))}
                className={
                  "px-3 py-1.5 rounded-full border text-sm font-medium transition " +
                  (filters.skills.includes(skill)
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100")
                }
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
