import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const statusColumns = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']

export default function Tracker() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<any[]>([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]')
    setApplications(saved)
  }, [])

  const handleStatusChange = (jobId: string, newStatus: string) => {
    const updated = applications.map(app =>
      app.id === jobId ? { ...app, status: newStatus } : app
    )
    setApplications(updated)
    localStorage.setItem('savedJobs', JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Application Tracker</h1>

        <div className="grid grid-cols-5 gap-4">
          {statusColumns.map((status) => (
            <div key={status} className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-700 mb-4">{status}</h2>
              <div className="space-y-3">
                {applications
                  .filter(app => app.status === status)
                  .map(app => (
                    <div
                      key={app.id}
                      className="p-3 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:shadow"
                      onClick={() => navigate(`/jobs/${app.id}`)}
                    >
                      <p className="font-medium text-sm">{app.title}</p>
                      <p className="text-xs text-gray-600">{app.company}</p>
                      <select
                        value={app.status}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleStatusChange(app.id, e.target.value)
                        }}
                        className="mt-2 text-xs w-full p-1 border rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {statusColumns.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
