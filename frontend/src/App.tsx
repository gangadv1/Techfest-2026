import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import ResumeUpload from './pages/ResumeUpload'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Tracker from './pages/Tracker'
import Roadmap from './pages/Roadmap'
import RoadmapGraph from './pages/RoadmapGraph'
import Forums from './pages/Forums'
import Social from './pages/Social'
import InterviewSimulator from './pages/InterviewSimulator'

function App() {
  const location = useLocation()
  const headerHiddenRoutes = ['/', '/onboarding', '/resume-upload']
  const showHeader = !headerHiddenRoutes.includes(location.pathname)

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/roadmap-graph" element={<RoadmapGraph />} />
        <Route path="/forums" element={<Forums />} />
        <Route path="/social" element={<Social />} />
        <Route path="/interview-simulator" element={<InterviewSimulator />} />
      </Routes>
    </>
  )
}

export default App
