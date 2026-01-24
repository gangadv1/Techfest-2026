import { useMemo, useState } from "react"
import { StudyPlanData, StreakData } from "../lib/useStudyPlan"

interface StudyPlanTabProps {
  plan: StudyPlanData | null
  streak: StreakData
  onTaskComplete: () => void
  onResetPlan: () => void
}

export function StudyPlanTab({ plan, streak, onTaskComplete, onResetPlan }: StudyPlanTabProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  if (!plan) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">📋</div>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-900">No study plan yet</p>
          <p className="text-sm text-slate-600">Generate a personalized schedule to start tracking your daily tasks.</p>
        </div>
        <button
          onClick={onResetPlan}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Generate Plan
        </button>
      </div>
    )
  }

  const handleTaskCheck = (taskId: string) => {
    const newCompleted = new Set(completedTasks)
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId)
    } else {
      newCompleted.add(taskId)
      onTaskComplete()
    }
    setCompletedTasks(newCompleted)
  }

  const dayNumber = Math.floor((Date.now() - (plan.createdAt || Date.now())) / (1000 * 60 * 60 * 24)) + 1

  const totals = useMemo(() => {
    const totalTasks = plan.plan.reduce((sum, d) => sum + d.items.length, 0)
    const completed = plan.plan.reduce(
      (sum, d) => sum + d.items.filter((t) => completedTasks.has(t.taskId)).length,
      0
    )
    return { totalTasks, completed }
  }, [plan.plan, completedTasks])

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Current Streak</span>
            <span className="text-amber-500">🔥</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{streak.currentStreak}</span>
            <span className="text-sm text-slate-500">days</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
              style={{ width: `${Math.min(streak.currentStreak * 10, 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Longest Streak</span>
            <span className="text-indigo-500">🏆</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{streak.longestStreak}</span>
            <span className="text-sm text-slate-500">days</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
              style={{ width: `${Math.min((streak.longestStreak || 1) * 10, 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Tasks Completed</span>
            <span className="text-emerald-500">✅</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{streak.tasksCompleted}</span>
            <span className="text-sm text-slate-500">total</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              style={{ width: `${totals.totalTasks ? Math.min((streak.tasksCompleted / totals.totalTasks) * 100, 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">Overview</p>
            <p className="text-xl font-bold text-slate-900">
              {plan.estimate.totalDaysGenerated}-day learning plan
            </p>
            <p className="text-sm text-slate-500">
              {plan.estimate.minutesPerDay} min/day · {plan.estimate.daysPerWeek} days/week · {Math.round(plan.estimate.totalMinutesPlanned / 60)} hours total
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Tasks: {totals.completed}/{totals.totalTasks}
            </span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                style={{ width: `${totals.totalTasks ? (totals.completed / totals.totalTasks) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {plan.plan.map((day) => {
          const isToday = day.day === dayNumber
          const isExpanded = expandedDay === day.day
          const completedForDay = day.items.filter((t) => completedTasks.has(t.taskId)).length
          const percent = Math.round((completedForDay / day.items.length) * 100)

          return (
            <div
              key={day.day}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm transition hover:shadow-md"
            >
              <button
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                onClick={() => setExpandedDay(isExpanded ? null : day.day)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                    {day.day}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{day.title}</p>
                    <p className="text-xs text-slate-500">{day.totalMinutes} minutes planned</p>
                    <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  {isToday && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      Today
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                    {completedForDay}/{day.items.length} done
                  </span>
                  <span className="text-slate-400">{isExpanded ? "▾" : "▸"}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                  <div className="space-y-3">
                    {day.items.map((task) => (
                      <div
                        key={task.taskId}
                        className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={task.taskId}
                            checked={completedTasks.has(task.taskId)}
                            onChange={() => handleTaskCheck(task.taskId)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor={task.taskId} className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-900">{task.taskText}</span>
                              <span className="text-xs font-semibold text-slate-500">⏱ {task.minutes} min</span>
                            </div>
                            <p className="text-xs text-slate-500">📌 {task.nodeTitle}</p>
                          </label>
                        </div>

                        {task.resources && task.resources.length > 0 && (
                          <div className="flex flex-wrap gap-2 pl-7">
                            {task.resources.map((resource, idx) => (
                              <a
                                key={idx}
                                href={resource.url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                                  {resource.type}
                                </span>
                                <span className="line-clamp-1">{resource.title}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onResetPlan}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
        >
          🔄 Generate New Plan
        </button>
      </div>
    </div>
  )
}
