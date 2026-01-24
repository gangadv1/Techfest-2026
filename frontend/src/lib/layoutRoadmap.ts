// Simple deterministic level layout:
// - group by level (top to bottom)
// - spread nodes evenly per level, centered
// - returns positions for ReactFlow
export function layoutRoadmap(nodes: Array<{ id: string; label: string; level: number }>) {
  const levels = new Map<number, Array<{ id: string; label: string }>>()

  for (const n of nodes) {
    const list = levels.get(n.level) ?? []
    list.push({ id: n.id, label: n.label })
    levels.set(n.level, list)
  }

  // deterministic ordering: sort by label within each level
  for (const [lvl, list] of levels.entries()) {
    list.sort((a, b) => a.label.localeCompare(b.label))
    levels.set(lvl, list)
  }

  const sortedLevels = Array.from(levels.keys()).sort((a, b) => a - b)

  // Layout constants (tweak as needed)
  const Y_GAP = 160
  const X_GAP = 240

  const positions: Record<string, { x: number; y: number }> = {}

  for (const lvl of sortedLevels) {
    const list = levels.get(lvl)!
    const count = list.length

    // Center the row around x=0
    // Example: count=1 -> x=0
    // count=2 -> x=-X_GAP/2, +X_GAP/2
    // count=3 -> x=-X_GAP, 0, +X_GAP
    const rowWidth = (count - 1) * X_GAP
    const xStart = -rowWidth / 2
    const y = lvl * Y_GAP

    list.forEach((item, i) => {
      positions[item.id] = { x: xStart + i * X_GAP, y }
    })
  }

  return positions
}
