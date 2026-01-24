interface RoadmapParams {
  industry: string
  missingSkills: string[]
  weakestArea: string
}

interface DayTask {
  day: number
  title: string
  estMins: number
  tasks: string[]
  done: boolean
  id: string
}

interface RoadmapPlan {
  weeklyGoals: string[]
  days: DayTask[]
}

/**
 * Generate a 7-day roadmap plan based on industry, missing skills, and weakest area
 */
export function generateRoadmapPlan(params: RoadmapParams): RoadmapPlan {
  const { industry, missingSkills, weakestArea } = params
  
  // Generate weekly goals based on missing skills and weak areas
  const weeklyGoals: string[] = []
  
  if (missingSkills.length > 0) {
    weeklyGoals.push(`Learn ${missingSkills.slice(0, 3).join(', ')} to match industry standards`)
  }
  
  if (weakestArea) {
    weeklyGoals.push(`Improve ${weakestArea} to increase overall score`)
  }
  
  weeklyGoals.push(`Update resume to highlight ${industry} experience`)
  weeklyGoals.push('Practice interview questions for target role')
  
  // Generate 7-day plan with specific tasks
  const days: DayTask[] = []
  
  // Day 1: Resume Content
  days.push({
    day: 1,
    title: 'Resume Content Optimization',
    estMins: 25,
    tasks: [
      'Review resume structure and formatting',
      'Add quantifiable achievements with numbers',
      'Ensure each bullet starts with strong action verbs',
      'Remove generic phrases and buzzwords'
    ],
    done: false,
    id: 'day-1-resume-content'
  })
  
  // Day 2: ATS Optimization
  days.push({
    day: 2,
    title: 'ATS & Keywords',
    estMins: 20,
    tasks: [
      'Identify keywords from target job descriptions',
      'Add relevant keywords naturally to resume',
      'Check section headings are ATS-friendly',
      'Ensure consistent formatting throughout'
    ],
    done: false,
    id: 'day-2-ats-keywords'
  })
  
  // Day 3: First Missing Skill
  if (missingSkills.length > 0) {
    days.push({
      day: 3,
      title: `Learn ${missingSkills[0]}`,
      estMins: 30,
      tasks: [
        `Complete introductory tutorial for ${missingSkills[0]}`,
        'Build a small practice project',
        'Add project to portfolio or GitHub',
        'Update resume with new skill'
      ],
      done: false,
      id: `day-3-skill-${missingSkills[0].toLowerCase().replace(/\s+/g, '-')}`
    })
  } else {
    days.push({
      day: 3,
      title: 'Technical Skills Review',
      estMins: 30,
      tasks: [
        'Review current technical skills',
        'Practice coding challenges',
        'Update GitHub profile',
        'Document recent projects'
      ],
      done: false,
      id: 'day-3-skills-review'
    })
  }
  
  // Day 4: Job Application Strategy
  days.push({
    day: 4,
    title: 'Job Application Strategy',
    estMins: 25,
    tasks: [
      'Research 10 companies in target industry',
      'Save 5 relevant job postings',
      'Tailor resume for top 2 positions',
      'Prepare company-specific cover letters'
    ],
    done: false,
    id: 'day-4-job-strategy'
  })
  
  // Day 5: Second Missing Skill or Interview Prep
  if (missingSkills.length > 1) {
    days.push({
      day: 5,
      title: `Learn ${missingSkills[1]}`,
      estMins: 30,
      tasks: [
        `Watch ${missingSkills[1]} tutorial videos`,
        'Take notes on key concepts',
        'Complete hands-on exercises',
        'Add to skills section on resume'
      ],
      done: false,
      id: `day-5-skill-${missingSkills[1].toLowerCase().replace(/\s+/g, '-')}`
    })
  } else {
    days.push({
      day: 5,
      title: 'Interview Preparation',
      estMins: 30,
      tasks: [
        'Research common interview questions for role',
        'Prepare STAR method examples',
        'Practice behavioral questions',
        'Record yourself answering questions'
      ],
      done: false,
      id: 'day-5-interview-prep'
    })
  }
  
  // Day 6: LinkedIn & Online Presence
  days.push({
    day: 6,
    title: 'LinkedIn Optimization',
    estMins: 25,
    tasks: [
      'Update LinkedIn headline and summary',
      'Add recent projects and achievements',
      'Connect with professionals in target industry',
      'Share relevant content or article'
    ],
    done: false,
    id: 'day-6-linkedin'
  })
  
  // Day 7: Application & Follow-up
  days.push({
    day: 7,
    title: 'Apply & Network',
    estMins: 30,
    tasks: [
      'Submit applications to top 3 target companies',
      'Send personalized connection requests to hiring managers',
      'Follow up on previous applications',
      'Schedule coffee chats or informational interviews'
    ],
    done: false,
    id: 'day-7-apply'
  })
  
  return {
    weeklyGoals,
    days
  }
}
