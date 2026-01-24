import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type QuestionType = 'single' | 'multi' | 'text'
type AnswerMap = Record<string, string | string[]>

const STORAGE_KEY = 'jobfit_preferences'

type Question = {
  id: string
  label: string
  type: QuestionType
  options?: string[]
  maxSelected?: number
  placeholder?: string
}

const QUESTIONS: Question[] = [
  {
    id: 'role',
    label: 'What is your target role?',
    type: 'single',
    options: ['Software Engineer','Data Analyst','Data Scientist','Product Manager','UI/UX','Cybersecurity','DevOps']
  },
  {
    id: 'arrangement',
    label: 'Preferred work arrangement?',
    type: 'single',
    options: ['Remote (SG)','Hybrid (SG)','On-site (SG)']
  },
  {
    id: 'region',
    label: 'Preferred region in Singapore?',
    type: 'single',
    options: ['Central','East','West','North','North-East','CBD','One-North','Jurong East','Punggol']
  },
  {
    id: 'employment',
    label: 'Employment type?',
    type: 'single',
    options: ['Internship','Full-time','Contract']
  },
  {
    id: 'experience',
    label: 'Experience level?',
    type: 'single',
    options: ['Internship','Fresh Grad (0–1)','Junior (1–3)','Mid (3–5)']
  },
  {
    id: 'salary',
    label: 'Salary expectation (SGD monthly)?',
    type: 'single',
    options: ['<3k','3–5k','5–8k','8–12k','12k+']
  },
  {
    id: 'eligibility',
    label: 'Work eligibility?',
    type: 'single',
    options: ['Singapore Citizen/PR','Student Pass (internships)','LTVP/DP','Need sponsorship (EP)','Not sure']
  },
  {
    id: 'skills',
    label: 'Select your tech skills (max 8)',
    type: 'multi',
    options: ['Python','SQL','Java','JavaScript','React','Node.js','AWS','Docker','Power BI','Excel','Git'],
    maxSelected: 8
  }
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [direction, setDirection] = useState<'next'|'prev'>('next')

  // Load existing answers on mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          setAnswers(parsed)
        }
      } catch {}
    }
  }, [])

  // Persist anytime answers change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  }, [answers])

  const current = QUESTIONS[step]
  const total = QUESTIONS.length

  const selectedCount = useMemo(() => {
    const v = answers[current?.id]
    return Array.isArray(v) ? v.length : (v ? 1 : 0)
  }, [answers, current?.id])

  const progressPct = Math.round(((step) / total) * 100)

  const saveAnswer = (id: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  const canGoNext = () => {
    const v = answers[current.id]
    if (current.type === 'multi') return Array.isArray(v) && v.length > 0
    if (current.type === 'text') return typeof v === 'string' && v.trim().length > 0
    return typeof v === 'string' && v.length > 0
  }

  const toggleMulti = (id: string, value: string, max = 8) => {
    const cur = (answers[id] as string[]) || []
    const exists = cur.includes(value)
    let next: string[]
    if (exists) next = cur.filter(v => v !== value)
    else next = cur.length < max ? [...cur, value] : cur
    saveAnswer(id, next)
  }

  const next = () => {
    if (step < total - 1) {
      setDirection('next')
      setStep(s => s + 1)
    } else {
      navigate('/jobs')
    }
  }

  const back = () => {
    if (step > 0) {
      setDirection('prev')
      setStep(s => s - 1)
    }
  }

  const onSingleSelect = (opt: string) => {
    saveAnswer(current.id, opt)
    // Auto-advance after brief delay
    setTimeout(() => next(), 150)
  }

  const onTextEnter: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && canGoNext()) next()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div
        key={current.id}
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-2xl w-full ${
          direction === 'next' ? 'animate-slide-right' : 'animate-slide-left'
        }`}
      >
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step {step + 1} / {total}</span>
            <span className="text-sm text-gray-400">{selectedCount} selected{current.type==='multi' && current.maxSelected ? ` / ${current.maxSelected}` : ''}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{current.label}</h2>

        {/* Options / Input */}
        <div className="space-y-3 mb-8">
          {current.type === 'single' && current.options?.map((opt) => {
            const isSelected = answers[current.id] === opt
            return (
              <button
                key={opt}
                onClick={() => onSingleSelect(opt)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-gray-200 hover:border-indigo-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{opt}</span>
                  {isSelected && (
                    <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}

          {current.type === 'multi' && current.options?.map((opt) => {
            const cur = (answers[current.id] as string[]) || []
            const isSelected = cur.includes(opt)
            const atMax = cur.length >= (current.maxSelected || 8)
            return (
              <button
                key={opt}
                onClick={() => toggleMulti(current.id, opt, current.maxSelected || 8)}
                disabled={!isSelected && atMax}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-gray-200 hover:border-indigo-300 bg-white'
                } ${!isSelected && atMax ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{opt}</span>
                  {isSelected && (
                    <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}

          {current.type === 'text' && (
            <input
              type="text"
              placeholder={current.placeholder || 'Type your answer and press Enter'}
              className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-indigo-500 outline-none"
              value={(answers[current.id] as string) || ''}
              onChange={(e) => saveAnswer(current.id, e.target.value)}
              onKeyDown={onTextEnter}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={back}
            disabled={step === 0}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {current.type === 'multi' ? (
            <button
              onClick={next}
              disabled={!canGoNext()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={next}
              disabled={!canGoNext()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === total - 1 ? 'Finish' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
