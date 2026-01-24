import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<any>(null)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchJobDetail()
  }, [id])

  const fetchJobDetail = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`)
      setJob(response.data)
    } catch (error) {
      console.error('Failed to fetch job:', error)
      // Mock data
      setJob({
        id,
        title: 'Senior Software Engineer',
        company: 'Grab',
        location: 'Singapore (Central)',
        salary: 'SGD $180k - $250k',
        description: 'We are looking for an experienced software engineer to join our growing Southeast Asia team. You will work on cutting-edge technologies and mentor junior developers. Help us build the future of mobility and payments in the region.',
        extractedSkills: ['Python', 'React', 'AWS', 'Docker'],
        extractedQualifications: ['Bachelor\'s degree in CS or related field', '5+ years software engineering experience'],
        extractedConstraints: ['Must be eligible to work in Singapore', 'Valid work pass or visa sponsorship available'],
        employmentType: 'Full-time',
        workplaceModel: 'Hybrid'
      })
    }
  }

  const handleAnalyzeFit = async () => {
    try {
      const response = await axios.post('/api/resume/scan', {
        jobId: id,
        resumeText
      })
      setShowResumeModal(false)
      navigate('/roadmap', { state: { fitResult: response.data, job } })
    } catch (error) {
      console.error('Failed to analyze fit:', error)
    }
  }

  const handleSaveJob = () => {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]')
    if (!saved) {
      savedJobs.push({ ...job, status: 'Saved' })
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs))
      setSaved(true)
    }
  }

  if (!job) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/jobs')}
            className="text-brand hover:text-brand-dark flex items-center gap-2 font-medium"
          >
            ← Back to jobs
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="col-span-2">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{job.title}</h1>
              <p className="text-xl text-gray-700 mb-4 font-medium">{job.company}</p>
              
              <div className="flex gap-6 text-gray-600 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">📍 {job.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employment Type</p>
                  <p className="font-medium">💼 {job.employmentType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Workplace</p>
                  <p className="font-medium">🏢 {job.workplaceModel}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResumeModal(true)}
                  className="flex-1 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-dark font-semibold transition"
                >
                  Analyze My Fit
                </button>
                <a
                  href={`https://jobs.example.com/apply/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 font-semibold transition text-center shadow-md hover:shadow-lg"
                >
                  🚀 Apply Now
                </a>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">{job.description}</p>
              <button
                onClick={() => setShowResumeModal(true)}
                className="px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-dark font-semibold transition"
              >
                Apply Now
              </button>
            </div>

            {/* Required Skills */}
            {job.extractedSkills && job.extractedSkills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {job.extractedSkills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-4 py-2 bg-brand text-white rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Qualifications */}
            {job.extractedQualifications && job.extractedQualifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Qualifications</h2>
                <ul className="space-y-2">
                  {job.extractedQualifications.map((qual: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <span className="text-brand font-bold mt-1">✓</span>
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Constraints */}
            {job.extractedConstraints && job.extractedConstraints.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.extractedConstraints.map((constraint: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <span className="text-accent font-bold mt-1">!</span>
                      <span>{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="col-span-1">
            {/* Salary Card */}
            <div className="bg-cream rounded-lg p-6 mb-6 border border-brand">
              <p className="text-sm text-gray-600 mb-2">Salary</p>
              <p className="text-3xl font-bold text-brand">{job.salary}</p>
            </div>

            {/* Applicant Percentage Card */}
            {job.applicantCount && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-brand">
                <p className="text-sm text-gray-600 mb-2">Hiring Activity</p>
                <p className="text-3xl font-bold text-brand">{Math.round((job.applicantCount / 500) * 100)}%</p>
                <p className="text-xs text-gray-600 mt-2">{job.applicantCount} applicants</p>
              </div>
            )}

            {/* Save Job Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <button
                onClick={handleSaveJob}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                  saved
                    ? 'bg-green-50 text-green-700 border-2 border-green-600'
                    : 'border-2 border-green-600 text-green-600 hover:bg-green-50'
                }`}
              >
                {saved ? '🔖 Saved' : '🔖 Save Job'}
              </button>
            </div>

            {/* Share Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="font-semibold text-gray-900 mb-3">Share</p>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">📱 Share on LinkedIn</button>
                <button className="w-full px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">✉️ Email to Friend</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Analyze Your Fit</h2>
            <p className="text-gray-600 mb-4">Paste your resume to see how well you match this job.</p>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-brand"
              placeholder="Paste your resume text here..."
            />
            <div className="flex gap-4">
              <button
                onClick={handleAnalyzeFit}
                disabled={!resumeText.trim()}
                className="flex-1 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-50 font-semibold transition"
              >
                Analyze
              </button>
              <button
                onClick={() => setShowResumeModal(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
