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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-brand hover:text-brand-dark"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Location</h3>
          {['Remote', 'Singapore', 'Downtown / Raffles Place', 'Orchard', 'Tanjong Pagar', 'Jurong East', 'Tampines', 'Woodlands'].map(loc => (
            <label key={loc} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={filters.location.includes(loc)}
                onChange={(e) => updateFilters('location', loc, e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700">{loc}</span>
            </label>
          ))}
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Role / Category</h3>
          {['Software Engineer', 'Data Scientist', 'Product Manager', 'Designer', 'DevOps Engineer', 'QA'].map(role => (
            <label key={role} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={filters.role.includes(role)}
                onChange={(e) => updateFilters('role', role, e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700">{role}</span>
            </label>
          ))}
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Employment Type</h3>
          {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
            <label key={type} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={filters.employmentType.includes(type)}
                onChange={(e) => updateFilters('employmentType', type, e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700">{type}</span>
            </label>
          ))}
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Experience Level</h3>
          {['Entry-level (0-2 years)', 'Intermediate/Mid-level (2-5 years)', 'Senior/Executive (5+ years)'].map(level => (
            <label key={level} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={filters.experienceLevel.includes(level)}
                onChange={(e) => updateFilters('experienceLevel', level, e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700">{level}</span>
            </label>
          ))}
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Salary Range (SGD)</h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={filters.salaryMin}
              onChange={(e) => updateField('salaryMin', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded w-1/2"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.salaryMax}
              onChange={(e) => updateField('salaryMax', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded w-1/2"
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Visa / Work Eligibility</h3>
          {['No sponsorship needed', 'Sponsorship available', 'Open to sponsorship'].map(v => (
            <label key={v} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={filters.visa.includes(v)}
                onChange={(e) => updateFilters('visa', v, e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700">{v}</span>
            </label>
          ))}
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Technical Stack</h3>
          {['Python', 'JavaScript', 'Java', 'React', 'TypeScript', 'Vue.js', 'AWS', 'Docker', 'ML', 'TensorFlow', 'PowerBI', 'SQL'].map(skill => (
            <label key={skill} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={filters.skills.includes(skill)}
                onChange={(e) => updateFilters('skills', skill, e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700">{skill}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
