import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import RequirementPills from '../components/RequirementPills'
import axios from 'axios'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<any>(null)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [fitResult, setFitResult] = useState<any>(null)

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
        company: 'Tech Corp',
        location: 'Remote',
        salary: '$120k - $180k',
        description: 'We are looking for an experienced software engineer...',
        extractedSkills: ['Python', 'React', 'AWS', 'Docker'],
        extractedQualifications: ['Bachelor\'s degree', '5+ years experience'],
        extractedConstraints: ['Must be authorized to work in US']
      })
    }
  }

  const handleAnalyzeFit = async () => {
    try {
      const response = await axios.post('/api/resume/scan', {
        jobId: id,
        resumeText
      })
      setFitResult(response.data)
      setShowResumeModal(false)
      navigate('/roadmap', { state: { fitResult: response.data, job } })
    } catch (error) {
      console.error('Failed to analyze fit:', error)
    }
  }

  const handleSaveJob = () => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]')
    if (!saved.find((j: any) => j.id === id)) {
      saved.push({ ...job, status: 'Saved' })
      localStorage.setItem('savedJobs', JSON.stringify(saved))
      alert('Job saved!')
    }
  }

  if (!job) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate('/jobs')}
          className="mb-6 text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
        >
          ← Back to jobs
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <p className="text-xl text-gray-700 mb-4">{job.company}</p>
            <div className="flex gap-4 text-gray-600">
              <span>📍 {job.location}</span>
              <span>💰 {job.salary}</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Required Skills</h2>
            <RequirementPills items={job.extractedSkills} type="skill" />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Qualifications</h2>
            <RequirementPills items={job.extractedQualifications} type="qualification" />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowResumeModal(true)}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Analyze My Fit
            </button>
            <button
              onClick={handleSaveJob}
              className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold"
            >
              Save Job
            </button>
            <a
              href={`https://jobs.example.com/apply/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Apply
            </a>
          </div>
        </div>
      </div>

      {showResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Paste Your Resume</h2>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg mb-4"
              placeholder="Paste your resume text here..."
            />
            <div className="flex gap-4">
              <button
                onClick={handleAnalyzeFit}
                disabled={!resumeText.trim()}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Analyze
              </button>
              <button
                onClick={() => setShowResumeModal(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
