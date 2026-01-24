import { useNavigate } from 'react-router-dom'
import SlidingLogos from "../components/SlidingLogos.tsx"
import googleLogo from "../assets/google.png"
import microsoftLogo from '../assets/microsoft.png'
import amazonLogo from '../assets/amazon.png'
import metaLogo from '../assets/meta.webp'
import netflixLogo from '../assets/netflix.svg'
import morganStanleyLogo from '../assets/morgan-stanley.png'
import dbsLogo from '../assets/dbs.png'

export default function Landing() {
  const navigate = useNavigate()

  const logos = [
    { name: 'Google', imagePath: googleLogo },
    { name: 'Microsoft', imagePath: microsoftLogo },
    { name: 'Amazon', imagePath: amazonLogo },
    { name: 'Meta', imagePath: metaLogo },
    { name: 'Netflix', imagePath: netflixLogo },
    { name: 'Morgan Stanley', imagePath: morganStanleyLogo },
    { name: 'DBS', imagePath: dbsLogo },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
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
        <div className="mt-20 w-full max-w-6xl">
          <p className="text-sm text-gray-500 mb-4 text-center">Trusted by job seekers at</p>
          <SlidingLogos logos={logos} speed={30} />
        </div>
      </div>
    </div>
  )
}
