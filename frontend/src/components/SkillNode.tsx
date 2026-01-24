import type { NodeProps } from "reactflow"
import { Handle, Position } from "reactflow"

export type SkillNodeData = {
  label: string
  status: "matched" | "missing" | "next"
  category?: string
}

function statusStyles(status: SkillNodeData["status"]) {
  switch (status) {
    case "matched":
      return {
        border: "border-emerald-200",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        underline: "bg-emerald-500",
      }
    case "missing":
      return {
        border: "border-red-200",
        badge: "bg-red-50 text-red-700 border-red-200",
        underline: "bg-red-500",
      }
    case "next":
      return {
        border: "border-indigo-200",
        badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
        underline: "bg-indigo-600",
      }
    default:
      return {
        border: "border-slate-200",
        badge: "bg-slate-50 text-slate-700 border-slate-200",
        underline: "bg-slate-400",
      }
  }
}

export default function SkillNode({ data }: NodeProps<SkillNodeData>) {
  const s = statusStyles(data.status)

  return (
    <div
      className={[
        "relative min-w-[180px] max-w-[220px]",
        "bg-white/70 backdrop-blur",
        "border shadow-lg rounded-2xl px-4 py-3",
        "cursor-pointer select-none",
        s.border,
      ].join(" ")}
    >
      {/* Handles for React Flow connections */}
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-indigo-400 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-indigo-600 !border-0" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900 leading-snug">{data.label}</div>
          {data.category ? <div className="text-xs text-slate-500 mt-1">{data.category}</div> : null}
        </div>

        <span className={["text-[10px] font-semibold px-2 py-1 rounded-full border", s.badge].join(" ")}>
          {data.status.toUpperCase()}
        </span>
      </div>

      <div className={["mt-3 h-[3px] rounded-full", s.underline].join(" ")} />
    </div>
  )
}
