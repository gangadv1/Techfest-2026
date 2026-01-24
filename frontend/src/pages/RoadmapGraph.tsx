import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
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
import { layoutRoadmap } from "../lib/layoutRoadmap"

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
  const { pathId = "full-stack" } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [apiData, setApiData] = useState<ApiRoadmapGraphResponse | null>(null)
  const [selectedNode, setSelectedNode] = useState<ApiRoadmapNode | null>(null)

  useEffect(() => {
    let aborted = false

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/roadmap/graph?pathId=${encodeURIComponent(pathId)}&maxNodes=18`)
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
  }, [pathId])

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      skillNode: SkillNode,
    }),
    []
  )

  const { rfNodes, rfEdges } = useMemo(() => {
    if (!apiData) return { rfNodes: [] as Node<SkillNodeData>[], rfEdges: [] as Edge[] }

    // Layout positions based on level and count per level
    const positions = layoutRoadmap(
      apiData.nodes.map((n) => ({ id: n.id, label: n.label, level: n.level }))
    )

    const rfNodes: Node<SkillNodeData>[] = apiData.nodes.map((n) => ({
      id: n.id,
      type: "skillNode",
      position: positions[n.id] ?? { x: 0, y: 0 },
      data: {
        label: n.label,
        status: n.status,
        category: n.category ?? "",
      },
    }))

    // Build edges: use backend-provided edges if available,
    // otherwise generate from node prerequisites on the frontend
    const edgesInput: ApiRoadmapEdge[] = (apiData.edges && apiData.edges.length > 0)
      ? apiData.edges
      : apiData.nodes.flatMap((n) => (n.prerequisites ?? []).map((p) => ({ source: p, target: n.id })))

    // Debug: log nodes and edges
    const nodeIds = new Set(apiData.nodes.map((n) => n.id))
    console.log("[RoadmapGraph] nodeIds:", Array.from(nodeIds))
    console.log("[RoadmapGraph] edgesInput:", edgesInput)

    // Deduplicate edges and filter invalid endpoints
    const seen = new Set<string>()
    const uniqueEdges = edgesInput.filter((e) => {
      // Skip if either endpoint is missing
      if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) {
        console.warn("[RoadmapGraph] Skipping edge with missing endpoint:", e)
        return false
      }
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
  }, [apiData])

  const title = apiData?.pathTitle ?? "Roadmap"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{title} Roadmap</h1>
            <p className="text-slate-600 mt-1">Click a node to view tasks and resources.</p>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                Matched
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-red-50 text-red-700 border-red-200">
                Missing
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200">
                Next
              </span>
            </div>
          </div>

          <button
            className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
            onClick={() => {
              alert("Generate Plan (wire this to backend)")
            }}
          >
            Generate Plan
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Graph */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="h-[75vh] rounded-3xl border border-white/60 bg-white/40 backdrop-blur shadow-xl overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-600">Loading roadmap…</div>
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
              <Controls className="!bg-white/60 !backdrop-blur !rounded-lg !shadow !border !border-white/40" />
              <MiniMap
                zoomable
                pannable
                nodeColor={(n) => {
                  if (n.type === "skillNode") {
                    const status = (n.data as any)?.status as string
                    if (status === "matched") return "#10b981" // emerald-500
                    if (status === "missing") return "#ef4444" // red-500
                    if (status === "next") return "#6366f1" // indigo-500
                  }
                  return "#94a3b8" // slate-400 default
                }}
                nodeStrokeColor={(n) => {
                  if (n.type === "skillNode") return "#1e293b" // slate-800 stroke
                  return "#334155" // slate-700
                }}
                nodeBorderRadius={8}
              />
            </ReactFlow>
          )}
        </div>
      </div>

      <NodeDetailModal
        open={!!selectedNode}
        node={selectedNode}
        allNodes={apiData?.nodes ?? []}
        onClose={() => setSelectedNode(null)}
        storageKey={`node_progress_${pathId}`}
      />
    </div>
  )
}
