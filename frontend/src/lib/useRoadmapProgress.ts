import { useState, useEffect } from "react"

export type ProgressData = {
  tasks: Record<string, Record<string, boolean>> // nodeId -> taskId -> completed
}

/**
 * Hook to manage roadmap progress in localStorage
 * Key: `progress_${pathId}`
 */
export function useRoadmapProgress(pathId: string) {
  const storageKey = `progress_${pathId}`
  const [progress, setProgress] = useState<ProgressData>({ tasks: {} })

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        setProgress(JSON.parse(saved))
      } catch {
        setProgress({ tasks: {} })
      }
    }
  }, [storageKey])

  // Save to localStorage whenever progress changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progress))
  }, [progress, storageKey])

  const toggleTask = (nodeId: string, taskId: string, checked: boolean) => {
    setProgress((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [nodeId]: {
          ...(prev.tasks[nodeId] ?? {}),
          [taskId]: checked,
        },
      },
    }))
  }

  const isNodeCompleted = (nodeId: string, nodeTasks: { id: string }[] | undefined): boolean => {
    if (!nodeTasks || nodeTasks.length === 0) return false
    const taskMap = progress.tasks[nodeId] ?? {}
    return nodeTasks.every((t) => taskMap[t.id] === true)
  }

  const getTaskChecked = (nodeId: string, taskId: string): boolean => {
    return progress.tasks[nodeId]?.[taskId] ?? false
  }

  return {
    progress,
    toggleTask,
    isNodeCompleted,
    getTaskChecked,
  }
}
