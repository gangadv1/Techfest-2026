import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const statusColumns = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']
const rejectionStages = ['Initial', 'Technical', 'Behavioral', 'HR Round', 'Final Round']

export default function Tracker() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<any[]>([])
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

  const getAITips = () => {
    const tips: string[] = []
    
    if (applicationsInProcess === 0 && totalApplications > 0) {
      tips.push('🎯 Focus on networking - reach out to recruiters directly on LinkedIn to increase application flow.')
    }
    if (applicationsRejected > totalApplications * 0.5 && totalApplications > 3) {
      tips.push('📋 Your rejection rate is high. Focus on resume optimization and cover letter personalization.')
    }
    if (rejectionData['Technical'] > rejectionData['Initial'] && rejectionData['Technical'] > 0) {
      tips.push('💻 You\'re failing at technical rounds. Practice coding problems on LeetCode and system design.')
    }
    if (rejectionData['Behavioral'] > rejectionData['Technical'] && rejectionData['Behavioral'] > 0) {
      tips.push('🗣️ Behavioral rejections are high. Practice STAR method and research company culture before interviews.')
    }
    if (rejectionData['Initial'] > 0) {
      tips.push('✅ Your resume passes initial screening. Continue improving your technical and soft skills.')
    }
    if (applicationsInProcess > 0) {
      tips.push('⚡ You have active interviews! Prepare well and follow up within 24-48 hours.')
    }

    return tips.length > 0 ? tips : ['📊 Start applying to jobs and track your progress!']
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-brand to-teal bg-clip-text text-transparent mb-8">📊 Application Tracker</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {[
            { id: 'dashboard', label: '📊 Tracker' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === tab.id
                  ? 'text-brand border-b-2 border-brand'
                  : 'text-gray-600 hover:text-brand'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg p-6 border-l-4 border-blue-300 text-white">
                <p className="text-blue-100 text-sm font-semibold">Total Applications</p>
                <p className="text-4xl font-bold mt-2">{totalApplications}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-lg p-6 border-l-4 border-yellow-300 text-white">
                <p className="text-yellow-100 text-sm font-semibold">In Process</p>
                <p className="text-4xl font-bold mt-2">{applicationsInProcess}</p>
              </div>
              <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-lg p-6 border-l-4 border-red-300 text-white">
                <p className="text-red-100 text-sm font-semibold">Rejected</p>
                <p className="text-4xl font-bold mt-2">{applicationsRejected}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg p-6 border-l-4 border-green-300 text-white">
                <p className="text-green-100 text-sm font-semibold">Success Rate</p>
                <p className="text-4xl font-bold mt-2">
                  {totalApplications > 0 ? Math.round(((totalApplications - applicationsRejected) / totalApplications) * 100) : 0}%
                </p>
              </div>
            </div>

            {/* Rejections by Stage - Show all applied jobs */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-xl p-8 border-t-4 border-brand">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-brand to-teal bg-clip-text text-transparent mb-6">📋 Application Tracking</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Job Title</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Rejection Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                          No applications yet. Start applying to jobs!
                        </td>
                      </tr>
                    ) : (
                      applications.map(app => (
                        <tr key={app.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900 cursor-pointer hover:text-brand" onClick={() => navigate(`/jobs/${app.id}`)}>
                              {app.title}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{app.company}</td>
                          <td className="py-3 px-4">
                            <select 
                              value={app.status} 
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium"
                            >
                              {statusColumns.map(s => (<option key={s} value={s}>{s}</option>))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            {app.status === 'Rejected' ? (
                              <select 
                                value={app.rejectionStage || ''} 
                                onChange={(e) => handleRejectionStageForJob(app.id, e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded text-sm font-medium"
                              >
                                <option value="">Select stage</option>
                                {rejectionStages.map(stage => (
                                  <option key={stage} value={stage}>{stage}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-gray-400">-</span>
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
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-xl p-8 border-t-4 border-purple-500">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">📌 Saved Jobs</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.filter(app => app.status === 'Saved').length === 0 ? (
                  <div className="col-span-full py-8 text-center text-gray-500">
                    No saved jobs yet. Save jobs from the job listings to review them later!
                  </div>
                ) : (
                  applications.filter(app => app.status === 'Saved').map(app => (
                    <div key={app.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition cursor-pointer" onClick={() => navigate(`/jobs/${app.id}`)}>
                      <h3 className="font-bold text-gray-900 mb-2">{app.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{app.company}</p>
                      <p className="text-xs text-gray-500 mb-4">{app.location}</p>
                      <button onClick={(e) => { e.stopPropagation(); handleStatusChange(app.id, 'Applied'); }} className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-2 rounded font-medium text-sm hover:shadow transition">
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
