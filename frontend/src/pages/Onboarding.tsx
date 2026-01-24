import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const questions = [
  {
    id: 'roles',
    question: 'What roles are you interested in?',
    type: 'multi-select',
    options: ['Software Engineer', 'Data Scientist', 'Product Manager', 'Designer', 'DevOps Engineer']
  },
  {
    id: 'experienceLevel',
    question: 'What is your experience level?',
    type: 'single-select',
    options: ['Intern', 'Entry Level', 'Mid Level', 'Senior', 'Lead']
  },
  {
    id: 'locations',
    question: 'Preferred locations?',
    type: 'multi-select',
    options: ['Remote', 'New York', 'San Francisco', 'Seattle', 'Austin', 'Boston']
  },
  {
    id: 'employmentTypes',
    question: 'Employment type preference?',
    type: 'multi-select',
    options: ['Full-time', 'Part-time', 'Contract', 'Internship']
  },
  {
    id: 'visaEligible',
    question: 'Do you require visa sponsorship?',
    type: 'single-select',
    options: ['Yes', 'No', 'Not sure']
  }
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})

  const currentQuestion = questions[currentStep]

  const handleSelect = (value: string) => {
    if (currentQuestion.type === 'single-select') {
      setAnswers({ ...answers, [currentQuestion.id]: [value] })
    } else {
      const current = answers[currentQuestion.id] || []
      if (current.includes(value)) {
        setAnswers({ ...answers, [currentQuestion.id]: current.filter(v => v !== value) })
      } else {
        setAnswers({ ...answers, [currentQuestion.id]: [...current, value] })
      }
    }
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save preferences to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(answers))
      navigate('/jobs')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isAnswered = answers[currentQuestion.id]?.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">
              Question {currentStep + 1} of {questions.length}
            </span>
            <div className="flex gap-1">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-8 rounded ${
                    idx <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{currentQuestion.question}</h2>
        </div>

        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id]?.includes(option)
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-gray-200 hover:border-indigo-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {isSelected && (
                    <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
