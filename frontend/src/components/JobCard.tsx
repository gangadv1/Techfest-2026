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
  fitScore?: number
  onClick: () => void
  isSelected?: boolean
  totalApplicants?: number
}
export default function JobCard({ job, fitScore, onClick, totalApplicants }: JobCardProps) {
  const getFitColor = (score?: number) => {
    if (score === undefined) return ''
    if (score >= 70) return 'bg-green-100 text-green-700'
    if (score >= 40) return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-700'
  }
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded shadow hover:shadow-md transition-shadow p-5 cursor-pointer hover:border-brand"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
            {typeof fitScore === 'number' && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getFitColor(fitScore)}`}>
                Fit {fitScore}%
              </span>
            )}
          </div>
          <p className="text-gray-700 font-medium mt-1">{job.company}</p>
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
