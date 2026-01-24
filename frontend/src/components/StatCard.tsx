interface StatCardProps {
  value: string
  label: string
}

export default function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 pointer-events-auto max-w-[150px]">
      <div className="text-3xl font-bold text-indigo-600 mb-1">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  )
}
