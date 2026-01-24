import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateRoadmapPlan } from '../lib/roadmapGen'

// Industry benchmark profiles
const INDUSTRY_PROFILES = {
  software: {
    label: 'Software Engineering',
    targetScore: 85,
    skills: ['git', 'react', 'node.js', 'sql', 'docker', 'aws', 'typescript']
  },
  data: {
    label: 'Data / Analytics',
    targetScore: 82,
    skills: ['sql', 'python', 'excel', 'power bi', 'statistics', 'dashboards']
  },
  finance: {
    label: 'Finance',
    targetScore: 80,
    skills: ['excel', 'valuation', 'accounting', 'financial modeling', 'powerpoint']
  }
}

type IndustryKey = keyof typeof INDUSTRY_PROFILES

interface ResumeScanResult {
  metrics: {
    content: { score: number; max: number; label: string }
    ats: { score: number; max: number; label: string }
    jobOpt: { score: number; max: number; label: string }
    writing: { score: number; max: number; label: string }
    ready: boolean
  }
  resumeSkills: string[]
  missingTopKeywords: string[]
  strengths: string[]
  weaknesses: string[]
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
}

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="bg-white/70 backdrop-blur border border-white/60 shadow-xl rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

interface MetricBarRowProps {
  label: string
  score: number
  max: number
  status?: string
}

function MetricBarRow({ label, score, max, status }: MetricBarRowProps) {
  const ratio = score / max
  const percentage = Math.round(ratio * 100)
  
  const barColor =
    ratio >= 0.8 ? 'bg-emerald-500' :
    ratio >= 0.6 ? 'bg-indigo-500' :
    'bg-red-500'
  
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-40 flex-shrink-0">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {status && <p className="text-xs text-slate-500">{status}</p>}
      </div>
      <div className="flex-1">
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="w-16 text-right">
        <p className="text-sm font-semibold text-slate-900">
          {score}/{max}
        </p>
      </div>
    </div>
  )
}

interface SkillMatchRowProps {
  skill: string
  matched: boolean
}

function SkillMatchRow({ skill, matched }: SkillMatchRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700 capitalize">{skill}</span>
      {matched ? (
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
          Matched
        </span>
      ) : (
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
          Missing
        </span>
      )}
    </div>
  )
}

interface BenchmarkChartProps {
  yourScore: number
  targetScore: number
}

function BenchmarkChart({ yourScore, targetScore }: BenchmarkChartProps) {
  const width = 400
  const height = 200
  const padding = 40
  
  // Bell curve path (simplified)
  const bellCurve = `
    M ${padding} ${height - padding}
    Q ${width * 0.25} ${height - padding - 60},
      ${width * 0.35} ${height - padding - 90}
    Q ${width * 0.5} ${height - padding - 100},
      ${width * 0.65} ${height - padding - 90}
    Q ${width * 0.75} ${height - padding - 60},
      ${width - padding} ${height - padding}
  `
  
  // Calculate x positions (0-100 scale)
  const xScale = (score: number) => padding + ((width - 2 * padding) * score) / 100
  
  const yourX = xScale(yourScore)
  const targetX = xScale(targetScore)
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
      {/* Background grid */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="2" />
      
      {/* Bell curve */}
      <path d={bellCurve} fill="none" stroke="#94a3b8" strokeWidth="2" />
      
      {/* Hire zone shading */}
      <rect
        x={targetX}
        y={padding}
        width={width - padding - targetX}
        height={height - 2 * padding}
        fill="#10b981"
        fillOpacity="0.1"
      />
      
      {/* Target score line */}
      <line
        x1={targetX}
        y1={padding}
        x2={targetX}
        y2={height - padding}
        stroke="#10b981"
        strokeWidth="2"
        strokeDasharray="4"
      />
      <text x={targetX} y={padding - 10} textAnchor="middle" className="text-xs font-semibold fill-emerald-700">
        Hire Zone
      </text>
      
      {/* Your score line */}
      <line
        x1={yourX}
        y1={padding}
        x2={yourX}
        y2={height - padding}
        stroke="#4f46e5"
        strokeWidth="3"
        strokeDasharray="4"
      />
      <text x={yourX} y={height - padding + 20} textAnchor="middle" className="text-sm font-bold fill-indigo-600">
        You ({yourScore})
      </text>
      
      {/* Scale markers */}
      {[0, 25, 50, 75, 100].map((mark) => (
        <g key={mark}>
          <line
            x1={xScale(mark)}
            y1={height - padding}
            x2={xScale(mark)}
            y2={height - padding + 5}
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <text
            x={xScale(mark)}
            y={height - padding + 18}
            textAnchor="middle"
            className="text-xs fill-slate-500"
          >
            {mark}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [scanResult, setScanResult] = useState<ResumeScanResult | null>(null)
  const [preferences, setPreferences] = useState<any>(null)
  const [industry, setIndustry] = useState<IndustryKey>('software')
  const [overallScore, setOverallScore] = useState(0)
  
  useEffect(() => {
    loadDashboardData()
  }, [])
  
  const loadDashboardData = () => {
    // Load questionnaire preferences
    const prefsRaw = localStorage.getItem('jobfit_preferences')
    if (prefsRaw) {
      const prefs = JSON.parse(prefsRaw)
      setPreferences(prefs)
      
      // Map role to industry
      const role = prefs.role?.toLowerCase() || ''
      if (role.includes('software') || role.includes('engineer') || role.includes('developer') || role.includes('frontend') || role.includes('backend')) {
        setIndustry('software')
      } else if (role.includes('data') || role.includes('analyst') || role.includes('scientist')) {
        setIndustry('data')
      } else if (role.includes('finance') || role.includes('consulting')) {
        setIndustry('finance')
      }
    }
    
    // Load resume scan result
    const scanRaw = localStorage.getItem('resume_scan_result')
    if (scanRaw) {
      const scan = JSON.parse(scanRaw)
      setScanResult(scan)
      
      // Calculate overall score
      const total95 = scan.metrics.content.score + scan.metrics.ats.score + scan.metrics.jobOpt.score + scan.metrics.writing.score
      const overall100 = Math.round((total95 / 95) * 100)
      setOverallScore(overall100)
    } else {
      // Mock data for development
      const mockScan: ResumeScanResult = {
        metrics: {
          content: { score: 28, max: 40, label: 'needs work' },
          ats: { score: 15, max: 20, label: 'good' },
          jobOpt: { score: 20, max: 25, label: 'good' },
          writing: { score: 7, max: 10, label: 'excellent' },
          ready: false
        },
        resumeSkills: ['javascript', 'react', 'node.js', 'git', 'sql'],
        missingTopKeywords: ['docker', 'aws', 'typescript'],
        strengths: ['Clear structure', 'Good action verbs', 'Quantified achievements'],
        weaknesses: ['Missing key technologies', 'Limited project descriptions', 'No leadership examples']
      }
      setScanResult(mockScan)
      
      const total95 = 28 + 15 + 20 + 7
      const overall100 = Math.round((total95 / 95) * 100)
      setOverallScore(overall100)
    }
  }
  
  const handleGenerateRoadmap = () => {
    if (!scanResult) return
    
    const profile = INDUSTRY_PROFILES[industry]
    const missingSkills = profile.skills.filter(
      skill => !scanResult.resumeSkills.some(
        rs => rs.toLowerCase().includes(skill.toLowerCase())
      )
    )
    
    // Find weakest area
    const metrics = scanResult.metrics
    const areas = [
      { name: 'Content Quality', ratio: metrics.content.score / metrics.content.max },
      { name: 'ATS & Structure', ratio: metrics.ats.score / metrics.ats.max },
      { name: 'Job Optimization', ratio: metrics.jobOpt.score / metrics.jobOpt.max },
      { name: 'Writing Quality', ratio: metrics.writing.score / metrics.writing.max }
    ]
    const weakestArea = areas.sort((a, b) => a.ratio - b.ratio)[0].name
    
    const roadmap = generateRoadmapPlan({
      industry: profile.label,
      missingSkills,
      weakestArea
    })
    
    localStorage.setItem('roadmap_plan', JSON.stringify(roadmap))
    navigate('/roadmap')
  }
  
  if (!scanResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }
  
  const profile = INDUSTRY_PROFILES[industry]
  const matchedSkills = profile.skills.filter(
    skill => scanResult.resumeSkills.some(
      rs => rs.toLowerCase().includes(skill.toLowerCase())
    )
  )
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Resume Dashboard</h1>
          <p className="text-slate-600">Track your progress and optimize for {profile.label}</p>
        </div>
        
        {/* Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Industry Benchmark (spans 2 cols on large screens) */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur border border-white/60 shadow-xl rounded-2xl p-8 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Industry Benchmark</h2>
              <BenchmarkChart yourScore={overallScore} targetScore={profile.targetScore} />
              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <p className="text-sm text-slate-600">Your Score</p>
                  <p className="text-3xl font-bold text-indigo-600">{overallScore}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-sm text-slate-600">Target Score</p>
                  <p className="text-3xl font-bold text-emerald-600">{profile.targetScore}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column: Stats Cards */}
          <div className="space-y-6">
            <StatCard
              title="Resumes Analyzed"
              value="1"
              icon={
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            
            <StatCard
              title="Reviews Completed"
              value="1"
              subtitle="Last scan today"
              icon={
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
            />
            
            <StatCard
              title="Avg Score"
              value={overallScore}
              subtitle={overallScore >= profile.targetScore ? 'Above target!' : 'Keep improving'}
              icon={
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
          </div>
        </div>
        
        {/* Score Breakdown Card */}
        <div className="mt-6 bg-white/70 backdrop-blur border border-white/60 shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Score Breakdown</h2>
          <div className="space-y-2">
            <MetricBarRow
              label="Content Quality"
              score={scanResult.metrics.content.score}
              max={scanResult.metrics.content.max}
              status={scanResult.metrics.content.label}
            />
            <MetricBarRow
              label="ATS & Structure"
              score={scanResult.metrics.ats.score}
              max={scanResult.metrics.ats.max}
              status={scanResult.metrics.ats.label}
            />
            <MetricBarRow
              label="Job Optimization"
              score={scanResult.metrics.jobOpt.score}
              max={scanResult.metrics.jobOpt.max}
              status={scanResult.metrics.jobOpt.label}
            />
            <MetricBarRow
              label="Writing Quality"
              score={scanResult.metrics.writing.score}
              max={scanResult.metrics.writing.max}
              status={scanResult.metrics.writing.label}
            />
            
            {/* Application Ready */}
            <div className="flex items-center justify-between py-3 pt-6 border-t-2 border-slate-200">
              <p className="text-sm font-medium text-slate-700">Application Ready</p>
              {scanResult.metrics.ready ? (
                <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                  ✓ Ready
                </span>
              ) : (
                <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  ✗ Needs Work
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Industry Skills Benchmark Card */}
        <div className="mt-6 bg-white/70 backdrop-blur border border-white/60 shadow-xl rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Industry Skills Benchmark</h2>
              <p className="text-sm text-slate-600 mt-1">
                Matched {matchedSkills.length} / {profile.skills.length} skills for {profile.label}
              </p>
            </div>
            <button
              onClick={handleGenerateRoadmap}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Generate Roadmap →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.skills.map((skill) => {
              const matched = scanResult.resumeSkills.some(
                rs => rs.toLowerCase().includes(skill.toLowerCase())
              )
              return <SkillMatchRow key={skill} skill={skill} matched={matched} />
            })}
          </div>
          
          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-200">
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Strengths
              </h3>
              <ul className="space-y-2">
                {scanResult.strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {scanResult.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
