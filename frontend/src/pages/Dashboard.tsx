import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateRoadmapPlan } from '../lib/roadmapGen'

// Industry benchmark profiles
const INDUSTRY_PROFILES = {
  software: {
    label: 'Software Engineering',
    targetScore: 85,
    skills: ['git', 'react', 'node.js', 'sql', 'docker', 'aws', 'typescript']
  },
  fullstack: {
    label: 'Full-Stack Development',
    targetScore: 85,
    skills: ['react', 'node.js', 'express', 'sql', 'mongodb', 'typescript', 'git', 'aws']
  },
  ml: {
    label: 'Machine Learning',
    targetScore: 83,
    skills: ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'sql', 'jupyter']
  },
  productmanager: {
    label: 'Product Manager',
    targetScore: 80,
    skills: ['product strategy', 'user research', 'analytics', 'roadmap planning', 'agile', 'sql', 'figma']
  },
  uiux: {
    label: 'UI/UX Design',
    targetScore: 82,
    skills: ['figma', 'wireframing', 'prototyping', 'user research', 'interaction design', 'css', 'usability testing']
  },
  cybersecurity: {
    label: 'Cybersecurity',
    targetScore: 84,
    skills: ['network security', 'encryption', 'penetration testing', 'security protocols', 'firewalls', 'linux', 'python']
  },
  devops: {
    label: 'DevOps',
    targetScore: 84,
    skills: ['docker', 'kubernetes', 'aws', 'ci/cd', 'terraform', 'linux', 'git', 'monitoring']
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

// Map display roles to backend-compatible role strings
const ROLE_NORMALIZATION: Record<string, string> = {
  'Software Engineering': 'Software Engineering',
  'Full Stack': 'Full Stack',
  'Full-Stack': 'Full Stack',
  'Frontend': 'Frontend',
  'Backend': 'Backend',
  'Machine Learning': 'Machine Learning',
  'ML': 'ML',
  'Product Manager': 'Product Manager',
  'Product Management': 'Product Manager',
  'UI/UX': 'UI/UX',
  'UX Design': 'UI/UX',
  'UI Design': 'UI/UX',
  'Cybersecurity': 'Cybersecurity',
  'Security': 'Cybersecurity',
  'DevOps': 'DevOps',
  'Dev-Ops': 'DevOps',
  'Data Science': 'Data Science',
  'Data Scientist': 'Data Scientist',
  'Data Analyst': 'Data',
  'Data / Analytics': 'Data',
  'Data': 'Data',
  'Finance': 'Finance',
}

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
  const [industry, setIndustry] = useState<IndustryKey>('software')
  const [overallScore, setOverallScore] = useState(0)
  const [targetRoles, setTargetRoles] = useState<string[]>(['Software Engineering'])
  const [detectedIndustry, setDetectedIndustry] = useState<string>('software')

  const deriveIndustryFromRole = (role: string): IndustryKey => {
    const r = role.toLowerCase()
    if (r.includes('full-stack') || r.includes('fullstack')) return 'fullstack'
    if (r.includes('machine learning') || r.includes('ml')) return 'ml'
    if (r.includes('product manager') || r.includes('product management')) return 'productmanager'
    if (r.includes('ui') || r.includes('ux') || r.includes('designer')) return 'uiux'
    if (r.includes('cybersecurity') || r.includes('security')) return 'cybersecurity'
    if (r.includes('devops') || r.includes('dev-ops')) return 'devops'
    if (r.includes('data') || r.includes('analyst') || r.includes('scientist')) return 'data'
    if (r.includes('finance') || r.includes('consult')) return 'finance'
    return 'software'
  }

  const pathIdFromIndustry = (key: IndustryKey) => {
    if (key === 'data') return 'data'
    if (key === 'finance') return 'finance'
    if (key === 'ml') return 'machinelearning'
    if (key === 'cybersecurity') return 'cybersecurity'
    if (key === 'devops') return 'devops'
    if (key === 'productmanager') return 'productmanager'
    if (key === 'uiux') return 'uiux'
    return 'fullstack'
  }
  
  useEffect(() => {
    loadDashboardData()
  }, [])
  
  const loadDashboardData = () => {
    // Load questionnaire preferences
    const prefsRaw = localStorage.getItem('jobfit_preferences')
    let detectedInd = 'software'
    if (prefsRaw) {
      try {
        const prefs = JSON.parse(prefsRaw)
        const rolesVal = prefs.role
        const rolesArr = Array.isArray(rolesVal) ? rolesVal : [rolesVal]
        const rolesLower = rolesArr
          .filter((r: any) => r != null)
          .map((r: any) => String(r).toLowerCase())

        const hasSoftware = rolesLower.some((r: string) =>
          r.includes('software') || r.includes('engineer') || r.includes('developer') || r.includes('frontend') || r.includes('backend')
        )
        const hasData = rolesLower.some((r: string) =>
          r.includes('data') || r.includes('analyst') || r.includes('scientist')
        )
        const hasFinance = rolesLower.some((r: string) =>
          r.includes('finance') || r.includes('consulting')
        )
        const hasML = rolesLower.some((r: string) =>
          r.includes('machine learning') || r.includes('ml')
        )
        const hasFullStack = rolesLower.some((r: string) =>
          r.includes('full-stack') || r.includes('fullstack')
        )
        const hasPM = rolesLower.some((r: string) =>
          r.includes('product manager')
        )
        const hasUIUX = rolesLower.some((r: string) =>
          r.includes('ui') || r.includes('ux')
        )
        const hasCyber = rolesLower.some((r: string) =>
          r.includes('cybersecurity') || r.includes('security')
        )
        const hasDevOps = rolesLower.some((r: string) =>
          r.includes('devops') || r.includes('dev-ops')
        )

        if (hasSoftware) detectedInd = 'software'
        else if (hasFullStack) detectedInd = 'fullstack'
        else if (hasML) detectedInd = 'ml'
        else if (hasPM) detectedInd = 'productmanager'
        else if (hasUIUX) detectedInd = 'uiux'
        else if (hasCyber) detectedInd = 'cybersecurity'
        else if (hasDevOps) detectedInd = 'devops'
        else if (hasData) detectedInd = 'data'
        else if (hasFinance) detectedInd = 'finance'

        const cleanedRoles = rolesArr.filter(Boolean)
        if (cleanedRoles.length) setTargetRoles(cleanedRoles)
      } catch {}
    }
    setDetectedIndustry(detectedInd)
    setIndustry(detectedInd as IndustryKey)
    
    // Load resume scan result if present
    const scanRaw = localStorage.getItem('resume_scan_result')
    if (scanRaw) {
      const scan = JSON.parse(scanRaw)
      setScanResult(scan)
      const total95 = scan.metrics.content.score + scan.metrics.ats.score + scan.metrics.jobOpt.score + scan.metrics.writing.score
      const overall100 = Math.round((total95 / 95) * 100)
      setOverallScore(overall100)
      return
    }

    // If no server scan, compute metrics locally from saved resume text/skills
    const resumeText = localStorage.getItem('resume_text') || ''
    const skillsRaw = localStorage.getItem('resume_skills') || '[]'
    let resumeSkills: string[] = []
    try { resumeSkills = JSON.parse(skillsRaw) } catch { resumeSkills = [] }

    const profile = INDUSTRY_PROFILES[industry]

    const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length
    const hasSections = /(experience|education|projects|skills)/i.test(resumeText)
    const bulletCount = (resumeText.match(/\n[-*•]/g) || []).length
    const actionVerbs = /(led|built|designed|implemented|optimized|managed|created|developed)/i
    const actionVerbHits = (resumeText.match(new RegExp(actionVerbs, 'gi')) || []).length

    const matchedProfileSkills = profile.skills.filter(s => resumeSkills.some(r => r.toLowerCase().includes(s.toLowerCase())))
    const missingTopKeywords = profile.skills.filter(s => !matchedProfileSkills.includes(s))

    const metrics = {
      content: {
        score: Math.min(40, Math.round((Math.min(wordCount, 800) / 800) * 20 + (hasSections ? 10 : 0) + Math.min(bulletCount, 10))),
        max: 40,
        label: hasSections ? 'good' : 'needs work'
      },
      ats: {
        score: Math.min(20, Math.round((hasSections ? 10 : 5) + Math.min(bulletCount, 10))),
        max: 20,
        label: bulletCount >= 5 ? 'excellent' : 'good'
      },
      jobOpt: {
        score: Math.min(25, Math.round((matchedProfileSkills.length / Math.max(profile.skills.length, 1)) * 25)),
        max: 25,
        label: matchedProfileSkills.length >= Math.ceil(profile.skills.length * 0.6) ? 'good' : 'needs work'
      },
      writing: {
        score: Math.min(10, Math.round(Math.min(actionVerbHits, 10))),
        max: 10,
        label: actionVerbHits >= 5 ? 'excellent' : 'good'
      },
      ready: false
    }

    const strengths: string[] = []
    if (hasSections) strengths.push('Clear section structure')
    if (bulletCount >= 5) strengths.push('Good use of bullet points')
    if (matchedProfileSkills.length >= 3) strengths.push('Relevant skills highlighted')
    const weaknesses: string[] = []
    if (!hasSections) weaknesses.push('Missing standard sections')
    if (missingTopKeywords.length) weaknesses.push('Missing key technologies')
    if (wordCount < 200) weaknesses.push('Too short; add more detail')

    const computed: ResumeScanResult = {
      metrics,
      resumeSkills,
      missingTopKeywords,
      strengths,
      weaknesses
    }
    setScanResult(computed)
    const total95 = metrics.content.score + metrics.ats.score + metrics.jobOpt.score + metrics.writing.score
    const overall100 = Math.round((total95 / 95) * 100)
    setOverallScore(overall100)
  }
  
  const handleGenerateRoadmap = (roleLabel?: string) => {
    if (!scanResult) return

    const rawRole = roleLabel || targetRoles[0] || 'Software Engineering'
    // Normalize role to match backend expectations
    const role = ROLE_NORMALIZATION[rawRole] || rawRole
    const derivedIndustry = deriveIndustryFromRole(role)
    const profile = INDUSTRY_PROFILES[derivedIndustry]
    const pathId = pathIdFromIndustry(derivedIndustry)

    const missingSkills = profile.skills.filter(
      skill => !scanResult.resumeSkills.some(
        rs => rs.toLowerCase().includes(skill.toLowerCase())
      )
    )

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
    // Navigate by role so backend selects the correct pathId (e.g., ML)
    navigate(`/roadmap-graph?role=${encodeURIComponent(role)}`)
  }

  const roleCards = useMemo(() => {
    if (!scanResult) return []
    return (targetRoles.length ? targetRoles : ['Software Engineering']).map((role) => {
      const roleIndustry = deriveIndustryFromRole(role)
      const roleProfile = INDUSTRY_PROFILES[roleIndustry]
      const missingSkills = roleProfile.skills.filter(
        skill => !scanResult.resumeSkills.some(rs => rs.toLowerCase().includes(skill.toLowerCase()))
      )
      return { role, roleProfile, missingSkills }
    })
  }, [targetRoles, scanResult])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Resume Dashboard</h1>
          <p className="text-slate-600">Track your progress and optimize for {profile.label}</p>
        </div>

        {/* Target Roles: strengths & weaknesses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Target roles</h2>
              <p className="text-slate-600">Your stated roles with strengths, gaps, and quick roadmap access.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roleCards.map(({ role, roleProfile, missingSkills }) => (
              <div key={role} className="bg-white/80 backdrop-blur border border-white/60 shadow-xl rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">{roleProfile.label}</p>
                    <h3 className="text-xl font-bold text-slate-900">{role}</h3>
                  </div>
                  <button
                    onClick={() => handleGenerateRoadmap(role)}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                  >
                    Generate roadmap
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-emerald-700 mb-2">Strengths</p>
                    <ul className="space-y-1 text-sm text-emerald-900 list-disc list-inside">
                      {scanResult.strengths.slice(0, 3).map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-rose-700 mb-2">Weaknesses</p>
                    <ul className="space-y-1 text-sm text-rose-900 list-disc list-inside">
                      {[...scanResult.weaknesses.slice(0, 2), ...(missingSkills.slice(0, 2).map(ms => `Missing: ${ms}`))].map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {missingSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">Priority gaps</p>
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.slice(0, 6).map((skill) => (
                        <span key={skill} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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

          {/* Reupload Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/resume-upload')}
              className="px-6 py-3 text-base font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg transition-colors"
            >
              Reupload Resume
            </button>
          </div>
        </div>

        {/* Debug: LocalStorage Contents */}
        <div className="mt-6 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-6 text-slate-100">
          <h3 className="text-lg font-bold text-slate-200 mb-4">🔍 Debug: LocalStorage</h3>
          <div className="grid grid-cols-1 gap-4">
            {/* Preferences */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${localStorage.getItem('jobfit_preferences') ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                <p className="text-xs font-semibold text-slate-300">jobfit_preferences {!localStorage.getItem('jobfit_preferences') && '(NOT SET)'}</p>
              </div>
              <pre className="text-xs overflow-auto max-h-32 bg-black/30 p-2 rounded">
                {JSON.stringify(JSON.parse(localStorage.getItem('jobfit_preferences') || '{}'), null, 2)}
              </pre>
            </div>

            {/* Resume Scan Result */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${localStorage.getItem('resume_scan_result') ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <p className="text-xs font-semibold text-slate-300">resume_scan_result {!localStorage.getItem('resume_scan_result') && '(MISSING - Upload resume first)'}</p>
              </div>
              <pre className="text-xs overflow-auto max-h-32 bg-black/30 p-2 rounded">
                {JSON.stringify(JSON.parse(localStorage.getItem('resume_scan_result') || '{}'), null, 2)}
              </pre>
            </div>

            {/* Resume Skills */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${localStorage.getItem('resume_skills') && JSON.parse(localStorage.getItem('resume_skills') || '[]').length > 0 ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                <p className="text-xs font-semibold text-slate-300">resume_skills</p>
              </div>
              <pre className="text-xs overflow-auto max-h-20 bg-black/30 p-2 rounded">
                {JSON.stringify(JSON.parse(localStorage.getItem('resume_skills') || '[]'), null, 2)}
              </pre>
            </div>

            {/* Resume Text */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${localStorage.getItem('resume_text') ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                <p className="text-xs font-semibold text-slate-300">resume_text (length: {localStorage.getItem('resume_text')?.length || 0} chars)</p>
              </div>
              <pre className="text-xs overflow-auto max-h-20 bg-black/30 p-2 rounded text-slate-400">
                {(localStorage.getItem('resume_text') || 'NOT SET').substring(0, 200)}...
              </pre>
            </div>

            {/* Roadmap Plan */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${localStorage.getItem('roadmap_plan') ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                <p className="text-xs font-semibold text-slate-300">roadmap_plan</p>
              </div>
              <pre className="text-xs overflow-auto max-h-32 bg-black/30 p-2 rounded">
                {JSON.stringify(JSON.parse(localStorage.getItem('roadmap_plan') || '{}'), null, 2)}
              </pre>
            </div>

            {/* Component State */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs font-semibold text-slate-300 mb-2">Component State</p>
              <pre className="text-xs overflow-auto max-h-20 bg-black/30 p-2 rounded">
                {JSON.stringify({ industry, detectedIndustry, overallScore, targetRoles }, null, 2)}
              </pre>
            </div>

            {/* Data Source */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs font-semibold text-slate-300 mb-2">Data Source & Industry</p>
              <div className="text-xs text-slate-300 space-y-1 bg-black/30 p-2 rounded">
                <div>Detected industry: <span className="font-bold text-blue-300">{detectedIndustry}</span></div>
                {localStorage.getItem('resume_scan_result') ? (
                  <div className="text-green-300">✓ Using server scan (resume_scan_result exists)</div>
                ) : localStorage.getItem('resume_text') ? (
                  <div className="text-blue-300">✓ Using local computation (no resume_scan_result from backend)</div>
                ) : (
                  <div className="text-yellow-300">⚠ No resume data - using defaults</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
