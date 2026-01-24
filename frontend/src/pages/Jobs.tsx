import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Filters from '../components/Filters'
import { scoreJobFit, getResumeSkills } from '../lib/jobFitScore'
import axios from 'axios'
import { jobsAPI } from '../services/api'

interface Job {
  id: string
  title: string
  company: string
  location: string
  datePosted: string
  workplaceModel: string
  employmentType: string
  salary: string
  extractedSkills: string[]
  applicantCount?: number
  role?: string
  description?: string
  extractedQualifications?: string[]
  extractedConstraints?: string[]
}

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [saved, setSaved] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  useEffect(() => {
    fetchJobs()
  }, [searchParams])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = Object.fromEntries(searchParams.entries())
      const response = await jobsAPI.getAll(params)
      
      let filteredJobs = response.data as Job[]
      
      // Apply client-side search filtering
      const search = searchParams.get('search') || ''
      if (search.trim()) {
        const query = search.toLowerCase()
        filteredJobs = filteredJobs.filter(job =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query)
        )
      }

      // Sort by selected option
      const sort = searchParams.get('sort') || 'newest'
      if (sort === 'relevance') {
        const resumeSkills = getResumeSkills()
        if (resumeSkills.length > 0) {
          filteredJobs = filteredJobs
            .map(j => {
              const skillsStr = Array.isArray(j.extractedSkills) ? j.extractedSkills.join(', ') : String(j.extractedSkills || '')
              const fit = scoreJobFit(resumeSkills, skillsStr, j.title, j.description)
              return { ...j, __fitScore: fit.score as number } as any
            })
            .sort((a: any, b: any) => (b.__fitScore || 0) - (a.__fitScore || 0))
            .map(({ __fitScore, ...rest }: any) => rest)
        }
      } else if (sort === 'newest') {
        filteredJobs = filteredJobs.sort((a, b) => (a.datePosted < b.datePosted ? 1 : -1))
      }
      
      setJobs(filteredJobs)
      setSelectedJob(filteredJobs[0] || null)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveJob = () => {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]')
    if (!saved && selectedJob) {
      savedJobs.push({ ...selectedJob, status: 'Saved' })
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs))
      setSaved(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-blue-50 to-slate-50">
      {/* Full-width header banner */}
      <header className="w-full bg-gradient-to-r from-brand to-teal border-b-4 border-accent shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
            <div>
              <h1 className="text-5xl font-extrabold text-white mb-2">Find Your Perfect Job</h1>
              <p className="text-blue-100 text-lg font-medium">Browse opportunities tailored to your preferences</p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-1/2">
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  const params = new URLSearchParams(searchParams)
                  if (e.target.value.trim()) {
                    params.set('search', e.target.value)
                  } else {
                    params.delete('search')
                  }
                  setSearchParams(params)
                }}
                className="flex-1 px-4 py-3 border-2 border-white rounded-lg text-sm focus:outline-none focus:border-white bg-white bg-opacity-10 text-white placeholder-white"
              />
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-white text-brand rounded-lg text-sm font-semibold hover:shadow-lg transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-filter"></i>
                  <span>Filters</span>
                </button>
                {showFilters && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-50 w-80">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-sm">Filters</h3>
                      <button onClick={() => setShowFilters(false)} className="text-xs text-gray-500">Close</button>
                    </div>
                    <Filters />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {/* Left: Job List */}
            <div className="col-span-1">
              <div className="mb-4 flex flex-col gap-4">
                <p className="text-brand font-bold text-lg">{jobs.length} jobs found</p>
                <select
                  className="px-3 py-2 border border-gray-300 rounded text-sm w-32"
                  value={searchParams.get('sort') || 'newest'}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams)
                    params.set('sort', e.target.value)
                    setSearchParams(params)
                  }}
                >
                  <option value="newest">Newest</option>
                  <option value="salary">Highest Salary</option>
                  <option value="relevance">Relevance</option>
                </select>
              </div>

              {/* Job List */}
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {(() => {
                  return jobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job)
                        setSaved(false)
                      }}
                      className={`cursor-pointer p-4 rounded border-2 transition ${
                        selectedJob?.id === job.id
                          ? 'border-brand bg-cream'
                          : 'border-gray-200 bg-white hover:border-brand'
                      }`}
                    >
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{job.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{job.company}</p>
                      <div className="flex gap-2 mt-2 text-xs text-gray-600">
                        <span>📍 {job.location}</span>
                        <span>💰 {job.salary.split('-')[0]}</span>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>

            {/* Right: Job Detail */}
            <div className="col-span-3">
              {selectedJob ? (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedJob.title}</h1>
                        <p className="text-xl text-gray-700 font-medium">{selectedJob.company}</p>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-cream px-4 py-3 rounded border border-brand">
                          <p className="text-sm text-gray-600">Salary</p>
                          <p className="text-2xl font-bold text-brand">{selectedJob.salary}</p>
                        </div>
                        {selectedJob.applicantCount && (
                          <div className="bg-blue-50 px-4 py-3 rounded border border-brand">
                            <p className="text-sm text-gray-600">Hiring Activity</p>
                            <p className="text-2xl font-bold text-brand">{Math.round((selectedJob.applicantCount / 500) * 100)}%</p>
                            <p className="text-xs text-gray-600 mt-1">{selectedJob.applicantCount} applicants</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-6 text-gray-600 mb-6">
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="font-medium">📍 {selectedJob.location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Employment</p>
                        <p className="font-medium">💼 {selectedJob.employmentType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Workplace</p>
                        <p className="font-medium">🏢 {selectedJob.workplaceModel}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 px-4 py-3 bg-brand text-white rounded font-semibold hover:bg-brand-dark transition">
                        Analyze My Fit
                      </button>
                      <button
                        onClick={handleSaveJob}
                        className={`px-4 py-3 rounded font-semibold transition ${
                          saved
                            ? 'bg-green-50 text-green-700 border-2 border-green-600'
                            : 'border-2 border-green-600 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {saved ? '💾 Saved' : '💾 Save'}
                      </button>
                      <a
                        href={`https://jobs.example.com/apply/${selectedJob.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded font-semibold hover:from-purple-700 hover:to-violet-700 transition text-center shadow-md hover:shadow-lg"
                      >
                        🚀 Apply
                      </a>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedJob.description && (
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Job Description</h2>
                      <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedJob.extractedSkills && selectedJob.extractedSkills.length > 0 && (
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Required Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.extractedSkills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-brand text-white rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Qualifications */}
                  {selectedJob.extractedQualifications && selectedJob.extractedQualifications.length > 0 && (
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Qualifications</h2>
                      <ul className="space-y-2">
                        {selectedJob.extractedQualifications.map((qual, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-700 text-sm">
                            <span className="text-brand font-bold">✓</span>
                            <span>{qual}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Constraints */}
                  {selectedJob.extractedConstraints && selectedJob.extractedConstraints.length > 0 && (
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Requirements</h2>
                      <ul className="space-y-2">
                        {selectedJob.extractedConstraints.map((constraint, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-700 text-sm">
                            <span className="text-accent font-bold">!</span>
                            <span>{constraint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-500 text-lg">Select a job to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
