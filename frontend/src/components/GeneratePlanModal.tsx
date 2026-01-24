import { useState } from "react"

type GeneratePlanModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (data: { hoursPerDay: number; daysPerWeek: number; targetGoal: string }) => void
}

const GOAL_OPTIONS = [
  "Get internship",
  "Switch role",
  "Improve resume",
  "Learn new skills",
  "Prepare for interview",
  "Other",
]

export default function GeneratePlanModal({ open, onClose, onSubmit }: GeneratePlanModalProps) {
  const [hoursPerDay, setHoursPerDay] = useState(1)
  const [daysPerWeek, setDaysPerWeek] = useState(5)
  const [targetGoal, setTargetGoal] = useState("Get internship")

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("📋 Form submitted with data:", { hoursPerDay, daysPerWeek, targetGoal })
    onSubmit({ hoursPerDay, daysPerWeek, targetGoal })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/90 backdrop-blur shadow-2xl p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Generate Learning Plan</h2>
        <p className="text-sm text-slate-600 mb-6">
          Tell us your availability and we'll create a personalized timeline.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hours per day */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Hours per day
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="6"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Days per week */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Days per week
            </label>
            <select
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? "day" : "days"}
                </option>
              ))}
            </select>
          </div>

          {/* Target goal */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Target goal (optional)
            </label>
            <select
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {GOAL_OPTIONS.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg"
            >
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
