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
    applicantCount?: number
  }
  onClick: () => void
  totalApplicants?: number
}

export default function JobCard({ job, onClick, totalApplicants }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded shadow hover:shadow-md transition-shadow p-5 cursor-pointer hover:border-brand"
    >
      {/* Top row: Company, Applicants, Date */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-600 font-medium">{job.company}</p>
        <span className="text-xs text-gray-500">{new Date(job.datePosted).toLocaleDateString()}</span>
      </div>

      {/* Job Title - Main Headline */}
      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 hover:text-brand transition">{job.title}</h3>

      {/* Location, Employment, Workplace */}
      <div className="flex flex-wrap gap-2 mb-3 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <span>📍</span> {job.location}
        </span>
        <span className="flex items-center gap-1">
          <span>💼</span> {job.employmentType}
        </span>
        <span className="flex items-center gap-1">
          <span>🏢</span> {job.workplaceModel}
        </span>
      </div>

      {/* Salary - Prominent */}
      <div className="mb-3 p-3 bg-cream rounded">
        <p className="text-lg font-bold text-brand">{job.salary}</p>
      </div>

      {/* Skills Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.extractedSkills.slice(0, 4).map((skill, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
          >
            {skill}
          </span>
        ))}
        {job.extractedSkills.length > 4 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            +{job.extractedSkills.length - 4}
          </span>
        )}
      </div>

      {/* Applicant Info */}
      {typeof job.applicantCount === 'number' && (
        <div className="text-xs text-gray-500 border-t pt-2">
          {typeof totalApplicants === 'number' && totalApplicants > 0 
            ? `${Math.round((job.applicantCount / totalApplicants) * 100)}% of applicants • ${job.applicantCount} applied`
            : `${job.applicantCount} applicants`
          }
        </div>
      )}
    </div>
  )
}
