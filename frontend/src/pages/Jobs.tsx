import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Filters from '../components/Filters'
import { scoreJobFit, getResumeSkills } from '../lib/jobFitScore'
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

// Helper function to clean skill strings
const cleanSkill = (skill: string): string => {
  if (!skill) return ''
  return skill
    .replace(/[\[\]"']/g, '') // Remove brackets and quotes
    .trim() // Remove whitespace
}

// Helper function to clean and filter skills array
const cleanSkills = (skills: any): string[] => {
  if (!skills) return []
  
  let skillArray: string[] = []
  
  // Handle if skills is a string (JSON array string or comma-separated)
  if (typeof skills === 'string') {
    // Try parsing as JSON first
    try {
      skillArray = JSON.parse(skills)
    } catch {
      // If JSON parse fails, treat as comma-separated
      skillArray = skills.split(',')
    }
  } else if (Array.isArray(skills)) {
    skillArray = skills
  }
  
  // Clean each skill and filter out empty strings
  return skillArray
    .map(skill => cleanSkill(String(skill)))
    .filter(skill => skill.length > 0)
}

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [saved, setSaved] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [fitModalOpen, setFitModalOpen] = useState(false);
  const [fitResult, setFitResult] = useState({ percent: 0, matched: [], missing: [] });

  const handleAnalyzeFit = () => {
    if (!selectedJob) return;
    let resumeSkills: string[] = [];
    try {
      resumeSkills = JSON.parse(localStorage.getItem('resume_skills') || '[]');
    } catch {
      resumeSkills = [];
    }
    // Clean both resume and job skills for robust comparison
    const cleanedResumeSkills = resumeSkills.map(s => cleanSkill(String(s)));
    const jobSkills = cleanSkills(selectedJob.extractedSkills).map(s => cleanSkill(String(s)));
    const matched = jobSkills.filter(skill =>
      cleanedResumeSkills.some(rs => rs.toLowerCase().includes(skill.toLowerCase()))
    );
    const missing = jobSkills.filter(skill => !matched.includes(skill));
    const percent = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 0;
    setFitResult({ percent, matched, missing });
    setFitModalOpen(true);
  };
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
              const cleanedSkills = cleanSkills(j.extractedSkills)
              const skillsStr = cleanedSkills.join(', ')
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

            <div className="flex flex-col w-full md:w-2/3 gap-4">
              <div className="flex items-center gap-4">
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
                <button className="px-5 py-3 bg-white text-brand rounded-lg text-sm font-semibold hover:shadow-lg transition">
                  Seek
                </button>
              </div>

              <div className="bg-white/10 rounded-2xl border border-white/20 shadow-inner">
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm font-semibold text-white/90 tracking-wide">Filters</p>
                  <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="text-xs font-semibold text-white/90 bg-white/15 px-3 py-2 rounded-lg border border-white/20 hover:bg-white/25 transition"
                  >
                    {filtersOpen ? 'Hide' : 'Show'}
                  </button>
                </div>
                {filtersOpen && (
                  <div className="px-4 pb-4">
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
          <div className="grid grid-cols-5 gap-6">
            {/* Left: Job List */}
            <div className="col-span-2">
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
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {(() => {
                  return jobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job)
                        setSaved(false)
                      }}
                      className={`cursor-pointer p-5 rounded-xl border-2 transition ${
                        selectedJob?.id === job.id
                          ? 'border-brand bg-cream'
                          : 'border-gray-200 bg-white hover:border-brand'
                      }`}
                    >
                      <h3 className="font-semibold text-lg text-gray-900 leading-snug line-clamp-2">{job.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{job.company}</p>
                      <div className="flex gap-3 mt-2 text-sm text-gray-600">
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
                      <button className="flex-1 px-4 py-3 bg-brand text-white rounded font-semibold hover:bg-brand-dark transition"   onClick={handleAnalyzeFit}
>
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
                        {saved ? 'Saved' : 'Save'}
                      </button>
                      <a
                        href={`https://jobs.example.com/apply/${selectedJob.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded font-semibold hover:from-purple-700 hover:to-violet-700 transition text-center shadow-md hover:shadow-lg"
                      >
                        Apply
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
                        {cleanSkills(selectedJob.extractedSkills).map((skill, idx) => (
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
                        {cleanSkills(selectedJob.extractedQualifications).map((qual, idx) => (
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
                        {cleanSkills(selectedJob.extractedConstraints).map((constraint, idx) => (
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
      {/* Fit Modal */}
      {fitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setFitModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">Skill Match</h2>
            <p className="text-lg mb-2">You match <span className="font-bold text-indigo-600">{fitResult.percent}%</span> of the required skills for this job.</p>
            <div className="mb-3">
              <p className="font-semibold text-green-700 mb-1">Matched Skills:</p>
              <div className="flex flex-wrap gap-2">
                {fitResult.matched.length > 0 ? fitResult.matched.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold border border-green-200">{skill}</span>
                )) : <span className="text-gray-500">None</span>}
              </div>
            </div>
            <div className="mb-3">
              <p className="font-semibold text-rose-700 mb-1">Missing Skills:</p>
              <div className="flex flex-wrap gap-2">
                {fitResult.missing.length > 0 ? fitResult.missing.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold border border-rose-200">{skill}</span>
                )) : <span className="text-gray-500">None</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
