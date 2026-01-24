interface RequirementPillsProps {
  items: string[]
  type: 'skill' | 'qualification' | 'constraint'
}

export default function RequirementPills({ items, type }: RequirementPillsProps) {
  const colors = {
    skill: 'bg-blue-100 text-blue-800',
    qualification: 'bg-green-100 text-green-800',
    constraint: 'bg-orange-100 text-orange-800'
  }

  if (!items || items.length === 0) {
    return <p className="text-gray-500 italic">None specified</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span
          key={idx}
          className={`px-3 py-1 rounded-full text-sm font-medium ${colors[type]}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}
