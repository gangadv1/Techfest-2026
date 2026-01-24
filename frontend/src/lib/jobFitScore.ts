import { parseExtractedSkills } from './jobSkillParse'
import { normalizeSkills } from './skillsNormalize'

export interface FitScoreResult {
  score: number
  matched: string[]
  missing: string[]
  jobSkills: string[]
}

/**
 * Compute job fit score using keyword matching
 * 
 * @param resumeSkills - normalized skills from resume
 * @param extractedSkillsRaw - raw ExtractedSkills field from job data
 * @param title - optional job title for weighted scoring
 * @param description - optional job description for weighted scoring
 * @returns FitScoreResult with score (0-100), matched, missing, jobSkills
 */
export function scoreJobFit(
  resumeSkills: string[],
  extractedSkillsRaw: string,
  title?: string,
  description?: string
): FitScoreResult {
  // Parse and normalize job skills
  const jobSkills = parseExtractedSkills(extractedSkillsRaw)
  
  if (jobSkills.length === 0) {
    return { score: 0, matched: [], missing: [], jobSkills: [] }
  }
  
  // Normalize resume skills
  const normalizedResume = normalizeSkills(resumeSkills)
  
  // Find matches
  const matched: string[] = []
  const missing: string[] = []
  
  for (const skill of jobSkills) {
    if (normalizedResume.includes(skill)) {
      matched.push(skill)
    } else {
      missing.push(skill)
    }
  }
  
  // Weighted scoring if title/description available
  if (title || description) {
    const score = computeWeightedScore(matched, jobSkills, title, description)
    return { score, matched, missing, jobSkills }
  }
  
  // Unweighted scoring
  const score = Math.round((100 * matched.length) / Math.max(jobSkills.length, 1))
  return { score, matched, missing, jobSkills }
}

/**
 * Compute weighted score where skills in title or first 30% of description get weight=2
 */
function computeWeightedScore(
  matched: string[],
  jobSkills: string[],
  title?: string,
  description?: string
): number {
  const titleLower = title?.toLowerCase() || ''
  const descLower = description?.toLowerCase() || ''
  const descFirst30Pct = descLower.slice(0, Math.floor(descLower.length * 0.3))
  
  let sumMatchedWeights = 0
  let sumAllWeights = 0
  
  for (const skill of jobSkills) {
    // Determine weight
    const inTitle = titleLower.includes(skill)
    const inTopDesc = descFirst30Pct.includes(skill)
    const weight = (inTitle || inTopDesc) ? 2 : 1
    
    sumAllWeights += weight
    if (matched.includes(skill)) {
      sumMatchedWeights += weight
    }
  }
  
  return Math.round((100 * sumMatchedWeights) / Math.max(sumAllWeights, 1))
}

/**
 * Get resume skills from localStorage
 */
export function getResumeSkills(): string[] {
  try {
    const raw = localStorage.getItem('resume_skills')
    console.log('📖 Reading resume_skills from localStorage:', raw?.length, 'chars')
    if (!raw) {
      console.log('⚠️ No resume_skills found in localStorage')
      return []
    }
    const parsed = JSON.parse(raw)
    const skills = Array.isArray(parsed) ? parsed : []
    console.log('✅ Loaded skills from localStorage:', skills.length, skills)
    return skills
  } catch (err) {
    console.error('❌ Error reading resume_skills:', err)
    return []
  }
}

/**
 * Save resume skills to localStorage
 */
export function saveResumeSkills(skills: string[]): void {
  console.log('💾 Saving resume skills to localStorage:', skills.length, 'skills')
  console.log('📝 Skills to save:', skills)
  try {
    const jsonString = JSON.stringify(skills)
    localStorage.setItem('resume_skills', jsonString)
    console.log('✅ Successfully saved to localStorage')
    
    // Verify the save
    const verify = localStorage.getItem('resume_skills')
    console.log('🔍 Verification - localStorage now contains:', verify?.length, 'chars')
  } catch (err) {
    console.error('❌ Error saving to localStorage:', err)
    throw err
  }
}

/**
 * Optional: cache fit scores to avoid recomputation
 */
export function getCachedFitScore(jobId: string): FitScoreResult | null {
  try {
    const raw = localStorage.getItem('job_fit_cache')
    if (!raw) return null
    const cache = JSON.parse(raw)
    return cache[jobId] || null
  } catch {
    return null
  }
}

export function cacheFitScore(jobId: string, result: FitScoreResult): void {
  try {
    const raw = localStorage.getItem('job_fit_cache') || '{}'
    const cache = JSON.parse(raw)
    cache[jobId] = result
    localStorage.setItem('job_fit_cache', JSON.stringify(cache))
  } catch {}
}
