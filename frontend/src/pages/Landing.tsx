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
            Vector
          </h1>
          <p className="text-3xl font-bold text-gray-800 mb-4">
            Where ambition meets intelligence.
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Career search, reimagined. AI-driven job matching, interview prep with speech analysis, and smart tracking that shows you where to improve and where to apply next
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/onboarding')}
              className="px-8 py-4 bg-brand text-white text-lg font-semibold rounded-lg hover:bg-brand-dark transition-colors shadow-lg"
            >
              Get Matched
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="px-8 py-4 bg-white text-brand text-lg font-semibold rounded-lg hover:bg-cream transition-colors shadow-lg border-2 border-brand"
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
