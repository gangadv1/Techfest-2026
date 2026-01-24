interface JobCardProps {
  job: {
    title: string
    company: string
    location: string
    datePosted: string
    workplaceModel: string
    employmentType: string
    salary: string
    extractedSkills: string[]
  }
  onClick: () => void
}

export default function JobCard({ job, onClick }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
          <p className="text-gray-700 font-medium">{job.company}</p>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(job.datePosted).toLocaleDateString()}
        </span>
      </div>
      
      <div className="flex gap-4 text-sm text-gray-600 mb-4">
        <span>📍 {job.location}</span>
        <span>💼 {job.employmentType}</span>
        <span>🏢 {job.workplaceModel}</span>
        <span>💰 {job.salary}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {job.extractedSkills.slice(0, 5).map((skill, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
        {job.extractedSkills.length > 5 && (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            +{job.extractedSkills.length - 5} more
          </span>
        )}
      </div>
    </div>
  )
}
