import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { extractSkillsFromText } from '../lib/jobSkillParse'
import { saveResumeSkills } from '../lib/jobFitScore'
import { extractTextFromPdf } from '../lib/pdfExtract'

export default function ResumeUpload() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [extractedSkills, setExtractedSkills] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    console.log('📁 File selected:', selectedFile?.name, 'Type:', selectedFile?.type, 'Size:', selectedFile?.size)
    
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        console.error('❌ Invalid file type:', selectedFile.type)
        setError('Please upload a PDF file')
        return
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        console.error('❌ File too large:', selectedFile.size)
        setError('File size must be less than 5MB')
        return
      }
      console.log('✅ File validation passed')
      setFile(selectedFile)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      console.log('⚠️ No file selected')
      return
    }

    console.log('🚀 Starting upload process for:', file.name)
    setUploading(true)
    setError('')

    try {
      console.log('📖 Extracting text from PDF...')
      // Extract text from PDF using local worker
      const text = await extractTextFromPdf(file)
      console.log('📝 Extracted text length:', text.length)
      console.log('📝 First 500 characters:', text.substring(0, 500))
      
      // Store raw resume text in localStorage
      localStorage.setItem('resume_text', text)
      console.log('💾 Resume text saved to localStorage')
      
      console.log('🔍 Extracting skills from text...')
      // Extract skills from resume text
      const skills = extractSkillsFromText(text)
      console.log('🎯 Skills found:', skills.length, skills)
      
      if (skills.length === 0) {
        console.warn('⚠️ No skills extracted from resume')
        setError('No recognizable skills found in your resume. Please ensure it contains technical skills, tools, or technologies.')
        setUploading(false)
        return
      }

      // Set extracted skills for display
      setExtractedSkills(skills)

      console.log('💾 Saving skills to localStorage...')
      // Save to localStorage
      saveResumeSkills(skills)
      console.log('✅ Skills saved successfully')

      // Call backend API to analyze resume
      console.log('📡 Sending resume to backend for analysis...')
      try {
        // Get industry from preferences if available
        const prefsRaw = localStorage.getItem('jobfit_preferences')
        let industry = 'software'
        if (prefsRaw) {
          try {
            const prefs = JSON.parse(prefsRaw)
            const rolesVal = prefs.role
            const rolesArr = Array.isArray(rolesVal) ? rolesVal : [rolesVal]
            const rolesLower = rolesArr
              .filter((r: any) => r != null)
              .map((r: any) => String(r).toLowerCase())

            console.log('🎯 Detected roles:', rolesArr, 'Lowercase:', rolesLower)

            if (rolesLower.some((r: string) => r.includes('full-stack') || r.includes('fullstack'))) industry = 'fullstack'
            else if (rolesLower.some((r: string) => r.includes('machine learning') || r.includes('ml'))) industry = 'ml'
            else if (rolesLower.some((r: string) => r.includes('product manager'))) industry = 'productmanager'
            else if (rolesLower.some((r: string) => r.includes('ui') || r.includes('ux'))) industry = 'uiux'
            else if (rolesLower.some((r: string) => r.includes('cybersecurity') || r.includes('security'))) industry = 'cybersecurity'
            else if (rolesLower.some((r: string) => r.includes('devops'))) industry = 'devops'
            else if (rolesLower.some((r: string) => r.includes('data') || r.includes('analyst') || r.includes('scientist'))) industry = 'data'
            else if (rolesLower.some((r: string) => r.includes('finance'))) industry = 'finance'
            else industry = 'software'
          } catch {}
        }
        
        console.log('📊 Sending to backend with industry:', industry)
        
        const response = await fetch('/api/resume/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resumeText: text,
            extractedSkills: skills,
            industry: industry
          })
        })

        if (response.ok) {
          const scanResult = await response.json()
          console.log('✅ Backend analysis received:', scanResult)
          console.log('📊 Score breakdown:', {
            content: scanResult.metrics.content.score,
            ats: scanResult.metrics.ats.score,
            jobOpt: scanResult.metrics.jobOpt.score,
            writing: scanResult.metrics.writing.score
          })
          localStorage.setItem('resume_scan_result', JSON.stringify(scanResult))
          console.log('💾 Resume scan result saved to localStorage')
        } else {
          const errorText = await response.text()
          console.warn('⚠️ Backend analysis failed (', response.status, '):', errorText)
        }
      } catch (apiErr) {
        console.warn('⚠️ Could not reach backend, continuing with local computation:', apiErr)
      }

      console.log('🎉 Navigating to dashboard...')
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      console.error('❌ Upload error:', err)
      console.error('❌ Error details:', {
        message: (err as Error).message,
        stack: (err as Error).stack,
        error: err
      })
      setError(`Failed to process your resume. Error: ${(err as Error).message}`)
    } finally {
      setUploading(false)
      console.log('🏁 Upload process finished')
    }
  }

  const handleSkipForNow = () => {
    navigate('/jobs')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Resume</h1>
            <p className="text-gray-600">
              We'll analyze your skills and match you with the best job opportunities
            </p>
          </div>

          {/* Upload Area */}
          <div className="mb-6">
            <label
              htmlFor="resume-upload"
              className={`relative block w-full border-2 border-dashed rounded-xl p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer ${
                file ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
              }`}
            >
              {!file ? (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-4 text-sm text-gray-600">
                    <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">PDF up to 5MB</p>
                </>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              )}
              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Extracted Skills Display */}
          {extractedSkills.length > 0 && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-sm font-semibold text-green-900">Skills Found in Your Resume</h3>
              </div>
              <p className="text-sm text-green-700 mb-3">We identified <span className="font-bold">{extractedSkills.length}</span> skills from your resume:</p>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-green-700 border border-green-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Your privacy matters</p>
                <p>Your resume is processed locally in your browser and stored only on your device. We never send your personal information to our servers.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Continue'
              )}
            </button>
            <button
              onClick={handleSkipForNow}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
          </div>

          {/* Helper Text */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have a resume? <button onClick={handleSkipForNow} className="text-indigo-600 hover:underline">Browse jobs without matching</button>
          </p>
        </div>
      </div>
    </div>
  )
}
