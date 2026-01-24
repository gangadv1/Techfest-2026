import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Tracker from './pages/Tracker'
import Roadmap from './pages/Roadmap'
import Forums from './pages/Forums'
import Social from './pages/Social'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/forums" element={<Forums />} />
        <Route path="/social" element={<Social />} />
      </Routes>
    </>
  )
}

export default App
