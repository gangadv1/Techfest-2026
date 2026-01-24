import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function Filters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    location: searchParams.getAll('location'),
    employmentType: searchParams.getAll('employmentType'),
    experienceLevel: searchParams.getAll('experienceLevel')
  })

  const updateFilters = (key: string, value: string, checked: boolean) => {
    const newFilters = { ...filters }
    if (checked) {
      newFilters[key as keyof typeof filters] = [...newFilters[key as keyof typeof filters], value]
    } else {
      newFilters[key as keyof typeof filters] = newFilters[key as keyof typeof filters].filter(v => v !== value)
    }
    setFilters(newFilters)
    
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, values]) => {
      values.forEach(v => params.append(key, v))
    })
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({ location: [], employmentType: [], experienceLevel: [] })
    setSearchParams(new URLSearchParams())
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Location</h3>
          {['Remote', 'New York', 'San Francisco', 'Seattle', 'Austin'].map(loc => (
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
          {['Intern', 'Entry Level', 'Mid Level', 'Senior'].map(level => (
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
      </div>
    </div>
  )
}
