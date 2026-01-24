import { useState, useEffect } from "react"

export type StudyTask = {
  nodeId: string
  nodeTitle: string
  taskId: string
  taskText: string
  minutes: number
  resources: Array<{ type: string; title: string; url?: string }>
}

export type StudyDay = {
  day: number
  title: string
  totalMinutes: number
  items: StudyTask[]
}

export type StudyPlanData = {
  userId: string
  pathId: string
  estimate: {
    minutesPerDay: number
    daysPerWeek: number
    totalDaysGenerated: number
    totalMinutesPlanned: number
  }
  plan: StudyDay[]
  createdAt?: number
}

export type StreakData = {
  currentStreak: number
  longestStreak: number
  tasksCompleted: number
  lastCompletedDate?: string
  completionHistory: Record<string, number> // date -> tasks completed
}

/**
 * Hook to manage study plan and streaks in localStorage
 */
export function useStudyPlan(pathId: string) {
  const planStorageKey = `study_plan_${pathId}`
  const streakStorageKey = `study_streak_${pathId}`

  const [plan, setPlan] = useState<StudyPlanData | null>(null)
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    tasksCompleted: 0,
    completionHistory: {},
  })

  // Load from localStorage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem(planStorageKey)
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan))
      } catch {
        setPlan(null)
      }
    }

    const savedStreak = localStorage.getItem(streakStorageKey)
    if (savedStreak) {
      try {
        setStreak(JSON.parse(savedStreak))
      } catch {
        setStreak({
          currentStreak: 0,
          longestStreak: 0,
          tasksCompleted: 0,
          completionHistory: {},
        })
      }
    }
  }, [planStorageKey, streakStorageKey])

  const savePlan = (newPlan: StudyPlanData) => {
    const planWithTimestamp = {
      ...newPlan,
      createdAt: Date.now(),
    }
    setPlan(planWithTimestamp)
    localStorage.setItem(planStorageKey, JSON.stringify(planWithTimestamp))
  }

  const updateStreak = () => {
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    setStreak((prev) => {
      const wasStreakYesterday = prev.completionHistory[yesterday] > 0
      const isStreakToday = prev.completionHistory[today] > 0

      let newCurrentStreak = prev.currentStreak
      if (isStreakToday) {
        // Already counted for today
        newCurrentStreak = prev.currentStreak
      } else if (wasStreakYesterday) {
        // Continuing streak
        newCurrentStreak = prev.currentStreak + 1
      } else if (prev.currentStreak === 0) {
        // Starting new streak
        newCurrentStreak = 1
      } else {
        // Streak broken, restart
        newCurrentStreak = 1
      }

      const newLongestStreak = Math.max(newCurrentStreak, prev.longestStreak)

      const updated: StreakData = {
        ...prev,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        tasksCompleted: prev.tasksCompleted + 1,
        lastCompletedDate: today,
        completionHistory: {
          ...prev.completionHistory,
          [today]: (prev.completionHistory[today] ?? 0) + 1,
        },
      }

      localStorage.setItem(streakStorageKey, JSON.stringify(updated))
      return updated
    })
  }

  const resetStreak = () => {
    const newStreak: StreakData = {
      currentStreak: 0,
      longestStreak: streak.longestStreak,
      tasksCompleted: 0,
      completionHistory: {},
    }
    setStreak(newStreak)
    localStorage.setItem(streakStorageKey, JSON.stringify(newStreak))
  }

  return {
    plan,
    savePlan,
    streak,
    updateStreak,
    resetStreak,
  }
}
