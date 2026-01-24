import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const statusColumns = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']
const rejectionStages = ['Initial', 'Technical', 'Behavioral', 'HR Round', 'Final Round']

export default function Tracker() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<any[]>([])

  // Function to clear all applications
  const clearApplications = () => {
    setApplications([])
    localStorage.setItem('savedJobs', JSON.stringify([]))
  }
  const [activeTab, setActiveTab] = useState('dashboard')
  const [rejectionData, setRejectionData] = useState<Record<string, number>>({})
  const [skillProgress, setSkillProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]')
    const appData = JSON.parse(localStorage.getItem('applicationData') || '{}')
    setApplications(saved)
    setRejectionData(appData.rejectionData || {})
    setSkillProgress(appData.skillProgress || {})
  }, [])

  const handleStatusChange = (jobId: string, newStatus: string) => {
    const updated = applications.map(app =>
      app.id === jobId ? { ...app, status: newStatus } : app
    )
    setApplications(updated)
    localStorage.setItem('savedJobs', JSON.stringify(updated))
  }

  const handleRejectionStageChange = (stage: string, count: number) => {
    const updated = { ...rejectionData, [stage]: count }
    setRejectionData(updated)
    localStorage.setItem('applicationData', JSON.stringify({ rejectionData: updated, skillProgress }))
  }

  const handleRejectionStageForJob = (jobId: string, stage: string) => {
    const updated = applications.map(app =>
      app.id === jobId ? { ...app, rejectionStage: stage } : app
    )
    setApplications(updated)
    localStorage.setItem('savedJobs', JSON.stringify(updated))
  }

  const handleSkillProgressChange = (skill: string, progress: number) => {
    const updated = { ...skillProgress, [skill]: progress }
    setSkillProgress(updated)
    localStorage.setItem('applicationData', JSON.stringify({ rejectionData, skillProgress: updated }))
  }

  // Analytics calculations
  const totalApplications = applications.length
  const applicationsInProcess = applications.filter(a => ['Applied', 'Interview'].includes(a.status)).length
  const applicationsRejected = applications.filter(a => a.status === 'Rejected').length
  const totalRejections = Object.values(rejectionData).reduce((a: number, b: number) => a + b, 0)
  
  const mostFailedStage = totalRejections > 0 
    ? Object.entries(rejectionData).reduce((a, b) => (b[1] as number) > (a[1] as number) ? b : a)[0]
    : 'N/A'

  const allSkills = ['Python', 'JavaScript', 'React', 'TypeScript', 'AWS', 'Docker', 'Java', 'SQL']
  const skillsByDifficulty = ['Java', 'AWS', 'Docker', 'React', 'TypeScript', 'Python', 'JavaScript', 'SQL']

  

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        {/* Header */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Analytics</p>
          <h1 className="text-4xl font-bold text-slate-900">Application Tracker</h1>
          <p className="text-sm text-slate-600">Monitor your job applications and track interview progress.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {[
            { id: 'dashboard', label: '📊 Tracker' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Total Applications</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{totalApplications}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">In Process</p>
                <p className="mt-3 text-3xl font-bold text-amber-900">{applicationsInProcess}</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Rejected</p>
                <p className="mt-3 text-3xl font-bold text-rose-900">{applicationsRejected}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Success Rate</p>
                <p className="mt-3 text-3xl font-bold text-emerald-900">
                  {totalApplications > 0 ? Math.round(((totalApplications - applicationsRejected) / totalApplications) * 100) : 0}%
                </p>
              </div>
            </div>

              <div className="mb-6 space-y-2 flex items-center justify-between">
                
                
              </div>
            {/* Application Tracking Table */}
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="mb-6 space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">📋 Applications</h2>
                <p className="text-sm text-slate-600">Track and manage your job applications across different stages.</p>
                <button
                  onClick={clearApplications}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700 transition"
                >
                  Clear All Applications
                </button>
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">Job Title</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">Rejection Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                          No applications yet. Start applying to jobs!
                        </td>
                      </tr>
                    ) : (
                      applications.map(app => (
                        <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="px-6 py-4">
                            <p className="cursor-pointer font-medium text-slate-900 hover:text-indigo-600" onClick={() => navigate(`/jobs/${app.id}`)}>
                              {app.title}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{app.company}</td>
                          <td className="px-6 py-4">
                            <select 
                              value={app.status} 
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 transition hover:border-slate-300"
                            >
                              {statusColumns.map(s => (<option key={s} value={s}>{s}</option>))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            {app.status === 'Rejected' ? (
                              <select 
                                value={app.rejectionStage || ''} 
                                onChange={(e) => handleRejectionStageForJob(app.id, e.target.value)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 transition hover:border-slate-300"
                              >
                                <option value="">Select stage</option>
                                {rejectionStages.map(stage => (
                                  <option key={stage} value={stage}>{stage}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Saved Jobs */}
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="mb-6 space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">📌 Saved Jobs</h2>
                <p className="text-sm text-slate-600">Review and apply to jobs you've bookmarked.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {applications.filter(app => app.status === 'Saved').length === 0 ? (
                  <div className="col-span-full rounded-xl border border-slate-100 bg-slate-50 px-6 py-8 text-center">
                    <p className="text-sm text-slate-500">No saved jobs yet. Save jobs from the job listings to review them later!</p>
                  </div>
                ) : (
                  applications.filter(app => app.status === 'Saved').map(app => (
                    <div 
                      key={app.id} 
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm" 
                      onClick={() => navigate(`/jobs/${app.id}`)}
                    >
                      <h3 className="font-semibold text-slate-900">{app.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{app.company}</p>
                      <p className="mt-2 text-xs text-slate-500">{app.location}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(app.id, 'Applied'); }} 
                        className="mt-4 w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                      >
                        Apply Now 🚀
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
