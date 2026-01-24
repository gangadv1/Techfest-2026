import { useNavigate } from 'react-router-dom'
import StatCard from '../components/StatCard'

export default function Landing() {
  const navigate = useNavigate()

  const stats = [
    { value: '70%', label: 'of applicants filtered by ATS' },
    { value: '85%', label: 'never receive feedback' },
    { value: '3hrs', label: 'saved per week' },
    { value: '10k+', label: 'jobs analyzed' },
    { value: '92%', label: 'match accuracy' },
    { value: '7-day', label: 'upskill plans' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Floating stat cards */}
      <div className="absolute inset-0 pointer-events-none">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="absolute"
            style={{
              top: `${10 + (idx * 15)}%`,
              left: idx % 2 === 0 ? '5%' : 'auto',
              right: idx % 2 === 1 ? '5%' : 'auto',
            }}
          >
            <StatCard value={stat.value} label={stat.label} />
          </div>
        ))}
      </div>

      {/* Hero section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-7xl font-bold text-gray-900 mb-6">
            Job<span className="text-indigo-600">Fit</span>
          </h1>
          <p className="text-3xl font-bold text-gray-800 mb-4">
            Never Be Filtered by a Black Box Again
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Get personalized job matches, transparent requirements, AI-powered resume analysis, 
            and a 7-day upskilling roadmap tailored to your dream role.
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/onboarding')}
              className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Get Matched
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg border-2 border-indigo-600"
            >
              Explore Jobs
            </button>
          </div>
        </div>

        {/* Trusted by section */}
        <div className="mt-20 text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted by job seekers at</p>
          <div className="flex gap-8 items-center opacity-60">
            <div className="text-2xl font-bold text-gray-700">Google</div>
            <div className="text-2xl font-bold text-gray-700">Microsoft</div>
            <div className="text-2xl font-bold text-gray-700">Amazon</div>
            <div className="text-2xl font-bold text-gray-700">Meta</div>
          </div>
        </div>
      </div>
    </div>
  )
}
