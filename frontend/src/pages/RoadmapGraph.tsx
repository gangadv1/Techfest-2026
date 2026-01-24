import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  type Edge,
  type Node,
  type NodeTypes,
} from "reactflow"
import "reactflow/dist/style.css"

import SkillNode, { type SkillNodeData } from "../components/SkillNode"
import NodeDetailModal from "../components/NodeDetailModal"
import GeneratePlanModal from "../components/GeneratePlanModal"
import { StudyPlanTab } from "../components/StudyPlanTab"
import { layoutRoadmap } from "../lib/layoutRoadmap"
import { useRoadmapProgress } from "../lib/useRoadmapProgress"
import { useStudyPlan } from "../lib/useStudyPlan"

type ApiRoadmapNode = {
  id: string
  label: string
  level: number
  status: "matched" | "missing" | "next"
  estimatedMinutes?: number
  category?: string
  prerequisites?: string[]
  tasks?: { id: string; text: string }[]
  resources?: { type: "youtube" | "coursera" | "roadmap"; title: string; url: string }[]
}

type ApiRoadmapEdge = { source: string; target: string }

type ApiRoadmapGraphResponse = {
  pathId: string
  pathTitle: string
  nodes: ApiRoadmapNode[]
  edges: ApiRoadmapEdge[]
}

export default function RoadmapGraph() {
  const location = useLocation()
  const search = location.search || ""
  const qs = new URLSearchParams(search)
  const roleParam = qs.get("role") || ""
  const pathIdParam = qs.get("pathId") || "full-stack"

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiData, setApiData] = useState<ApiRoadmapGraphResponse | null>(null)
  const [selectedNode, setSelectedNode] = useState<ApiRoadmapNode | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [planEstimate, setPlanEstimate] = useState<{ weeksToComplete: number; hoursTotal: number } | null>(null)

  const currentPathId = apiData?.pathId ?? pathIdParam
  const { progress, toggleTask, isNodeCompleted } = useRoadmapProgress(currentPathId)
  const { plan, savePlan, streak, updateStreak, resetStreak } = useStudyPlan(currentPathId)
  const [activeTab, setActiveTab] = useState<"roadmap" | "study-plan">("roadmap")

  useEffect(() => {
    let aborted = false

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const url = roleParam
          ? `/api/roadmap/graph/by-role?role=${encodeURIComponent(roleParam)}&maxNodes=18`
          : `/api/roadmap/graph?pathId=${encodeURIComponent(pathIdParam)}&maxNodes=18`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Failed to load roadmap graph (${res.status})`)

        const data = (await res.json()) as ApiRoadmapGraphResponse
        if (!aborted) setApiData(data)
      } catch (e: any) {
        if (!aborted) setError(e?.message ?? "Unknown error")
      } finally {
        if (!aborted) setLoading(false)
      }
    }

    load()
    return () => {
      aborted = true
    }
  }, [roleParam, pathIdParam])

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      skillNode: SkillNode,
    }),
    []
  )

  const { rfNodes, rfEdges } = useMemo(() => {
    if (!apiData) return { rfNodes: [] as Node<SkillNodeData>[], rfEdges: [] as Edge[] }

    const positions = layoutRoadmap(
      apiData.nodes.map((n) => ({ id: n.id, label: n.label, level: n.level }))
    )

    const rfNodes: Node<SkillNodeData>[] = apiData.nodes.map((n) => {
      let status = n.status
      if (isNodeCompleted(n.id, n.tasks)) {
        status = "matched"
      }

      return {
        id: n.id,
        type: "skillNode",
        position: positions[n.id] ?? { x: 0, y: 0 },
        data: {
          label: n.label,
          status,
          category: n.category ?? "",
        },
      }
    })

    const edgesInput: ApiRoadmapEdge[] = apiData.edges && apiData.edges.length > 0
      ? apiData.edges
      : apiData.nodes.flatMap((n) => (n.prerequisites ?? []).map((p) => ({ source: p, target: n.id })))

    const nodeIds = new Set(apiData.nodes.map((n) => n.id))
    const seen = new Set<string>()
    const uniqueEdges = edgesInput.filter((e) => {
      if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) return false
      const key = `${e.source}->${e.target}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const rfEdges: Edge[] = uniqueEdges.map((e) => ({
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
      style: { strokeWidth: 2 },
    }))

    return { rfNodes, rfEdges }
  }, [apiData, isNodeCompleted])

  const handleGeneratePlan = async (data: { hoursPerDay: number; daysPerWeek: number; targetGoal: string }) => {
    try {
      const pathIdToUse = apiData?.pathId || currentPathId || "full-stack"
      const payload = {
        userId: "demo",
        pathId: pathIdToUse,
        hoursPerDay: data.hoursPerDay,
        daysPerWeek: data.daysPerWeek,
        days: 7,
        maxNodes: 10,
        targetGoal: data.targetGoal,
      }

      const res = await fetch("http://localhost:8000/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to generate plan (${res.status})`)
      }

      const result = await res.json()

      savePlan(result)
      setPlanEstimate({
        weeksToComplete: result.estimate.totalDaysGenerated / data.daysPerWeek,
        hoursTotal: result.estimate.totalMinutesPlanned / 60,
      })
      setActiveTab("study-plan")
      setShowPlanModal(false)
      alert(`✅ Plan generated successfully!\n\nCheck the Study Plan tab to start learning!`)
    } catch (e: any) {
      alert(`❌ Error: ${e?.message ?? "Unknown error"}`)
    }
  }

  const title = (() => {
    if (!apiData) return "Roadmap"
    const pid = (apiData.pathId || "").toLowerCase()
    if (pid === "machine-learning" || roleParam.toLowerCase() === "ml" || roleParam.toLowerCase() === "machine learning") {
      return "ML"
    }
    return apiData.pathTitle || "Roadmap"
  })()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Roadmap</p>
              <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
              <p className="text-sm text-slate-600">Click a node to view tasks and resources, or generate a personalized study plan.</p>
              {activeTab === "roadmap" && (
                <div className="flex flex-wrap gap-2 pt-2 text-xs font-semibold">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">Matched</span>
                  <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700">Missing</span>
                  <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-700">Next</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab("roadmap")}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "roadmap"
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-700"
                }`}
              >
                📊 Roadmap
              </button>
              <button
                onClick={() => setActiveTab("study-plan")}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "study-plan"
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-700"
                }`}
              >
                📅 Study Plan
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                onClick={() => setShowPlanModal(true)}
              >
                ⚡ Generate Plan
              </button>
            </div>
          </div>

          {planEstimate && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
              <span className="text-2xl">✅</span>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">Learning Plan Generated</p>
                <p className="text-emerald-800">~{Math.ceil(planEstimate.weeksToComplete)} weeks • {Math.round(planEstimate.hoursTotal)} total hours</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
          {activeTab === "roadmap" ? (
            <div className="h-[70vh] overflow-hidden rounded-xl border border-slate-100 bg-white">
              {loading ? (
                <div className="flex h-full items-center justify-center text-slate-600">Loading roadmap…</div>
              ) : (
                <ReactFlow
                  nodes={rfNodes}
                  edges={rfEdges}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.25 }}
                  onNodeClick={(_, node) => {
                    const original = apiData?.nodes.find((n) => n.id === node.id) ?? null
                    setSelectedNode(original)
                  }}
                >
                  <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
                  <Controls className="!bg-white/70 !backdrop-blur !rounded-lg !shadow !border !border-slate-200" />
                  <MiniMap
                    zoomable
                    pannable
                    nodeColor={(n) => {
                      if (n.type === "skillNode") {
                        const status = (n.data as any)?.status as string
                        if (status === "matched") return "#10b981"
                        if (status === "missing") return "#ef4444"
                        if (status === "next") return "#6366f1"
                      }
                      return "#94a3b8"
                    }}
                    nodeStrokeColor={(n) => {
                      if (n.type === "skillNode") return "#1e293b"
                      return "#334155"
                    }}
                    nodeBorderRadius={8}
                  />
                </ReactFlow>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 bg-slate-50/60">
              <StudyPlanTab
                plan={plan}
                streak={streak}
                onTaskComplete={updateStreak}
                onResetPlan={() => {
                  resetStreak()
                  setActiveTab("roadmap")
                  setShowPlanModal(true)
                }}
              />
            </div>
          )}
        </div>

        <NodeDetailModal
          open={!!selectedNode}
          node={selectedNode}
          allNodes={apiData?.nodes ?? []}
          onClose={() => setSelectedNode(null)}
          storageKey={`node_progress_${currentPathId}`}
          onToggleTask={toggleTask}
          progress={progress}
        />

        <GeneratePlanModal open={showPlanModal} onClose={() => setShowPlanModal(false)} onSubmit={handleGeneratePlan} />
      </div>
    </div>
  )
}
