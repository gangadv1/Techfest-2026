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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-900 font-['Inter',_'Segoe_UI',_sans-serif] relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="text-center max-w-4xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Career Intelligence Platform</p>
          <h1 className="text-7xl font-bold leading-tight text-slate-900">
            Vector
          </h1>
          <p className="text-3xl font-bold text-indigo-800">
            Transparent matches. Actionable guidance. Real momentum.
          </p>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed">
            Get role-matched openings, see exactly what matters, and follow a focused 7-day upskilling plan to clear the hiring funnel with confidence.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <button
              onClick={() => navigate('/onboarding')}
              className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-200"
            >
              Get Matched
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="px-8 py-4 bg-white text-indigo-700 text-lg font-semibold rounded-xl hover:bg-indigo-50 transition-colors border border-indigo-200"
            >
              Explore Jobs
            </button>
          </div>
        </div>

        <div className="mt-20 w-full max-w-6xl">
          <p className="text-sm text-slate-600 mb-4 text-center">Trusted by talent moving to</p>
          <div className="bg-white/60 border border-white/80 rounded-2xl backdrop-blur px-4 py-6 shadow-lg shadow-indigo-100">
            <SlidingLogos logos={logos} speed={30} />
          </div>
        </div>
      </div>
    </div>
  )
}
