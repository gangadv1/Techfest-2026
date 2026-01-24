import { useEffect, useMemo, useState } from "react"

type Resource = { type: "youtube" | "coursera" | "roadmap"; title: string; url: string }
type Task = { id: string; text: string }

type ApiRoadmapNode = {
  id: string
  label: string
  status: "matched" | "missing" | "next"
  estimatedMinutes?: number
  category?: string
  prerequisites?: string[]
  tasks?: Task[]
  resources?: Resource[]
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export default function NodeDetailModal({
  open,
  node,
  allNodes,
  onClose,
  storageKey,
}: {
  open: boolean
  node: ApiRoadmapNode | null
  allNodes: ApiRoadmapNode[]
  onClose: () => void
  storageKey: string
}) {
  // ESC to close
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  const prereqLabels = useMemo(() => {
    const prereqs = node?.prerequisites ?? []
    const map = new Map(allNodes.map((n) => [n.id, n.label]))
    return prereqs.map((id) => map.get(id) ?? id)
  }, [node, allNodes])

  // Persist task completion per node
  const [doneMap, setDoneMap] = useState<Record<string, Record<string, boolean>>>({})
  // Track completed nodes
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set())

  useEffect(() => {
    const saved = safeJsonParse<Record<string, Record<string, boolean>>>(
      localStorage.getItem(storageKey),
      {}
    )
    setDoneMap(saved)

    const completedKey = `${storageKey}_completed`
    const savedCompleted = safeJsonParse<string[]>(
      localStorage.getItem(completedKey),
      []
    )
    setCompletedNodes(new Set(savedCompleted))
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(doneMap))
  }, [doneMap, storageKey])

  useEffect(() => {
    const completedKey = `${storageKey}_completed`
    localStorage.setItem(completedKey, JSON.stringify(Array.from(completedNodes)))
  }, [completedNodes, storageKey])

  if (!open || !node) return null

  const nodeTasks = node.tasks ?? []
  const nodeResources = node.resources ?? []

  const youtube = nodeResources.filter((r) => r.type === "youtube")
  const coursera = nodeResources.filter((r) => r.type === "coursera")
  const roadmap = nodeResources.filter((r) => r.type === "roadmap")

  const nodeDone = doneMap[node.id] ?? {}
  const setTaskDone = (taskId: string, v: boolean) => {
    setDoneMap((prev) => ({
      ...prev,
      [node.id]: {
        ...(prev[node.id] ?? {}),
        [taskId]: v,
      },
    }))
  }

  const isNodeComplete = completedNodes.has(node.id)
  const toggleNodeComplete = () => {
    setCompletedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(node.id)) {
        next.delete(node.id)
      } else {
        next.add(node.id)
      }
      return next
    })
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
        className="relative w-full max-w-2xl rounded-3xl border border-white/60 bg-white/80 backdrop-blur shadow-2xl p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{node.label}</h2>
              {isNodeComplete && (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  ✓ Complete
                </span>
              )}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              {node.category ?? "General"} • {node.estimatedMinutes ?? 25} mins
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleNodeComplete}
              className={`px-4 py-2 rounded-xl font-semibold shadow-sm transition-colors ${
                isNodeComplete
                  ? 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isNodeComplete ? 'Unmark' : 'Mark Complete'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
            >
              Close
            </button>
          </div>
        </div>

        {/* Prereqs */}
        {prereqLabels.length > 0 && (
          <div className="mt-5">
            <div className="text-sm font-semibold text-slate-900">Prerequisites</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {prereqLabels.map((p) => (
                <span
                  key={p}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tasks */}
        <div className="mt-6">
          <div className="text-sm font-semibold text-slate-900">Tasks</div>
          {nodeTasks.length === 0 ? (
            <div className="text-sm text-slate-600 mt-2">No tasks provided for this node yet.</div>
          ) : (
            <div className="mt-2 space-y-2">
              {nodeTasks.map((t) => (
                <label
                  key={t.id}
                  className="flex items-start gap-3 p-3 rounded-2xl border border-white/60 bg-white/60"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={!!nodeDone[t.id]}
                    onChange={(e) => setTaskDone(t.id, e.target.checked)}
                  />
                  <span className="text-sm text-slate-800">{t.text}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Resources */}
        <div className="mt-6">
          <div className="text-sm font-semibold text-slate-900">Resources</div>

          {(youtube.length + coursera.length + roadmap.length) === 0 ? (
            <div className="text-sm text-slate-600 mt-2">No resources provided for this node yet.</div>
          ) : (
            <div className="mt-3 space-y-4">
              {youtube.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">YouTube</div>
                  <div className="flex flex-col gap-2">
                    {youtube.map((r) => (
                      <a
                        key={r.url}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold text-sm"
                      >
                        <span>▶ {r.title}</span>
                        <span className="text-xs opacity-70">Open</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {coursera.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Coursera</div>
                  <div className="flex flex-col gap-2">
                    {coursera.map((r) => (
                      <a
                        key={r.url}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm"
                      >
                        <span>🎓 {r.title}</span>
                        <span className="text-xs opacity-70">Open</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {roadmap.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Reference</div>
                  <div className="flex flex-col gap-2">
                    {roadmap.map((r) => (
                      <a
                        key={r.url}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm"
                      >
                        <span>📌 {r.title}</span>
                        <span className="text-xs opacity-70">Open</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
