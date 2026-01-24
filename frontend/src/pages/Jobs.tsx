import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import JobCard from '../components/JobCard'
import Filters from '../components/Filters'
import axios from 'axios'

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
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [searchParams])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = Object.fromEntries(searchParams.entries())
      const response = await axios.get('/api/jobs', { params })
      setJobs(response.data)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      // Mock data for development
      const mockJobs = [
        { id: '1', title: 'Senior Software Engineer', company: 'Grab', location: 'Singapore (Central)', datePosted: '2026-01-20', workplaceModel: 'Hybrid', employmentType: 'Full-time', salary: 'SGD $180k - $250k', extractedSkills: ['Python', 'React', 'AWS'], applicantCount: 120, role: 'Software Engineer', description: 'Join Grab\'s engineering team and build the future of mobility and payments in Southeast Asia. We\'re looking for senior engineers to mentor teams and ship scalable solutions.', extractedQualifications: ['Bachelor\'s degree in CS or related field', '5+ years software engineering experience'], extractedConstraints: ['Must be eligible to work in Singapore', 'Visa sponsorship available'] },
        { id: '2', title: 'Data Scientist', company: 'ByteDance', location: 'Singapore (Marina Bay)', datePosted: '2026-01-18', workplaceModel: 'On-site', employmentType: 'Full-time', salary: 'SGD $160k - $220k', extractedSkills: ['Python', 'ML', 'TensorFlow'], applicantCount: 45, role: 'Data Scientist', description: 'Work on machine learning models that power recommendation engines for millions of users across Asia-Pacific. Collaborate with top-tier data scientists and engineers.', extractedQualifications: ['Master\'s in Computer Science or related field', '3+ years ML/AI experience'], extractedConstraints: ['Must be eligible to work in Singapore'] },
        { id: '3', title: 'Frontend Engineer', company: 'Shopee', location: 'Singapore (Beach Road)', datePosted: '2026-01-15', workplaceModel: 'Hybrid', employmentType: 'Full-time', salary: 'SGD $140k - $200k', extractedSkills: ['React', 'TypeScript', 'Vue.js'], applicantCount: 300, role: 'Software Engineer', description: 'Build beautiful and performant web applications that reach millions of users in Southeast Asia. Work with cutting-edge frontend technologies and lead feature development.', extractedQualifications: ['2+ years React or Vue.js experience', 'Strong TypeScript skills'], extractedConstraints: ['Must be eligible to work in Singapore'] },
        { id: '4', title: 'Product Manager', company: 'Carousell', location: 'Singapore (Tanjong Pagar)', datePosted: '2026-01-10', workplaceModel: 'Hybrid', employmentType: 'Full-time', salary: 'SGD $130k - $180k', extractedSkills: ['Product Strategy', 'Analytics', 'User Research'], applicantCount: 25, role: 'Product Manager', description: 'Lead product strategy for our Southeast Asia marketplace platform. Drive roadmap decisions and collaborate with engineering, design, and stakeholders to ship delightful user experiences.', extractedQualifications: ['3+ years PM experience in tech/marketplace', 'Track record of shipping products'], extractedConstraints: ['Must be eligible to work in Singapore'] }
      ]
      setJobs(mockJobs)
      setSelectedJob(mockJobs[0])
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
    <div className="min-h-screen bg-gray-50">
      {/* Full-width header banner */}
      <header className="w-full bg-white border-b border-brand">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-extrabold text-brand mb-1">Find Your Perfect Job</h1>
            <p className="text-brand-dark text-lg">Browse opportunities tailored to your preferences</p>
          </div>
          <div>
            <a href="/social" className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark">Social</a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Left: Job List */}
            <div className="col-span-1">
              {/* Role applicant summary */}
              {(() => {
                const totalApplicants = jobs.reduce((s, j) => s + (j.applicantCount || 0), 0)
                const roleMap: Record<string, number> = {}
                jobs.forEach(j => {
                  const r = j.role || j.title
                  roleMap[r] = (roleMap[r] || 0) + (j.applicantCount || 0)
                })
                const roleEntries = Object.entries(roleMap).sort((a, b) => b[1] - a[1])
                return (
                  <div className="mb-6 space-y-3">
                    {roleEntries.slice(0, 3).map(([role, count]) => {
                      const pct = totalApplicants ? Math.round((count / totalApplicants) * 100) : 0
                      return (
                        <div key={role} className="bg-white p-3 rounded shadow-sm border-l-4 border-brand">
                          <div className="font-medium text-sm">{role}</div>
                          <div className="text-xs text-gray-600">{pct}% of applicants</div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              <div className="mb-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-brand font-medium">{jobs.length} jobs</p>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-3 py-2 border border-brand text-brand rounded text-sm bg-white hover:bg-cream"
                  >
                    Filters
                  </button>
                </div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded text-sm"
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

              {/* Dropdown filter panel */}
              {showFilters && (
                <div className="mb-6 bg-white rounded-lg shadow-lg p-4 z-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-sm">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="text-xs text-gray-500">Close</button>
                  </div>
                  <Filters />
                </div>
              )}

              {/* Job List */}
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {(() => {
                  const totalApplicants = jobs.reduce((s, j) => s + (j.applicantCount || 0), 0)
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
            <div className="col-span-2">
              {selectedJob ? (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedJob.title}</h1>
                        <p className="text-xl text-gray-700 font-medium">{selectedJob.company}</p>
                      </div>
                      <div className="bg-cream px-4 py-3 rounded border border-brand">
                        <p className="text-sm text-gray-600">Salary</p>
                        <p className="text-2xl font-bold text-brand">{selectedJob.salary}</p>
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
                            ? 'bg-gray-100 text-gray-700'
                            : 'border-2 border-brand text-brand hover:bg-cream'
                        }`}
                      >
                        {saved ? '❤️ Saved' : '🤍 Save'}
                      </button>
                      <a
                        href={`https://jobs.example.com/apply/${selectedJob.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-accent text-white rounded font-semibold hover:bg-accent-dark transition text-center"
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
