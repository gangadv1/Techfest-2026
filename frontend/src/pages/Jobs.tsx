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
}

export default function Jobs() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

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
      setJobs([
        {
          id: '1',
          title: 'Senior Software Engineer',
          company: 'Tech Corp',
          location: 'Remote',
          datePosted: '2026-01-20',
          workplaceModel: 'Remote',
          employmentType: 'Full-time',
          salary: '$120k - $180k',
          extractedSkills: ['Python', 'React', 'AWS']
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Perfect Job</h1>
          <p className="text-gray-600">Browse opportunities tailored to your preferences</p>
        </div>

        <div className="flex gap-8">
          <aside className="w-80 flex-shrink-0">
            <Filters />
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600">{jobs.length} jobs found</p>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Sort by: Newest</option>
                    <option>Sort by: Salary</option>
                    <option>Sort by: Relevance</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
