import { normalizeSkills } from './skillsNormalize'

/**
 * Parse ExtractedSkills field which may use various separators:
 * comma, semicolon, pipe, slash, newline
 * 
 * Returns normalized array of skills
 */
export function parseExtractedSkills(raw: string): string[] {
  if (!raw || typeof raw !== 'string') return []
  
  // Split by multiple separators: , ; | / \n
  const tokens = raw
    .split(/[,;|/\n]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0)
  
  return normalizeSkills(tokens)
}

/**
 * Extract skills from resume text using comprehensive skill matching
 */
export function extractSkillsFromText(text: string): string[] {
  console.log('🔍 extractSkillsFromText called with text length:', text?.length)
  
  if (!text || typeof text !== 'string') {
    console.warn('⚠️ Invalid text input:', typeof text)
    return []
  }
  
  const lowerText = text.toLowerCase()
  const foundSkills = new Set<string>()
  console.log('📋 Searching for skills in text...')
  
  // Comprehensive skill database
  const skillPatterns = [
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin',
    'go', 'rust', 'scala', 'r', 'matlab', 'perl', 'objective-c', 'dart', 'lua', 'haskell',
    
    // Web Technologies
    'react', 'angular', 'vue', 'vue.js', 'svelte', 'next.js', 'nuxt', 'gatsby', 'html', 'css',
    'html5', 'css3', 'sass', 'scss', 'less', 'tailwind', 'bootstrap', 'material-ui', 'chakra ui',
    'webpack', 'vite', 'parcel', 'rollup', 'babel',
    
    // Backend & APIs
    'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot', '.net', 'asp.net',
    'laravel', 'symfony', 'rails', 'ruby on rails', 'graphql', 'rest api', 'grpc', 'websocket',
    
    // Databases
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sql server',
    'dynamodb', 'cassandra', 'firebase', 'supabase', 'prisma', 'sequelize', 'typeorm',
    
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'google cloud', 'amazon web services', 'ec2', 's3', 'lambda',
    'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab ci', 'github actions', 'terraform',
    'ansible', 'chef', 'puppet', 'circleci', 'travis ci', 'nginx', 'apache',
    
    // Data Science & ML
    'machine learning', 'deep learning', 'neural networks', 'tensorflow', 'pytorch', 'keras',
    'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter', 'nlp', 'computer vision',
    'data analysis', 'data visualization', 'tableau', 'power bi', 'looker', 'spark', 'hadoop',
    
    // Mobile Development
    'ios', 'android', 'react native', 'flutter', 'xamarin', 'cordova', 'ionic',
    
    // Tools & Methodologies
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'agile', 'scrum', 'kanban',
    'ci/cd', 'tdd', 'bdd', 'unit testing', 'integration testing', 'jest', 'mocha', 'pytest',
    'selenium', 'cypress', 'postman',
    
    // Other Technologies
    'microservices', 'serverless', 'blockchain', 'ethereum', 'solidity', 'smart contracts',
    'cybersecurity', 'penetration testing', 'siem', 'soc', 'authentication', 'oauth', 'jwt',
    'ui/ux', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
    'seo', 'google analytics', 'digital marketing', 'content management', 'wordpress',
    
    // Soft Skills & Business
    'leadership', 'project management', 'product management', 'communication', 'problem solving',
    'team collaboration', 'stakeholder management', 'business analysis', 'requirements gathering'
  ]
  
  console.log('🎯 Skill patterns to search:', skillPatterns.length)
  
  // Match each skill pattern in the text
  let matchCount = 0
  for (const skill of skillPatterns) {
    // Create regex that matches whole word or with common boundaries
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (regex.test(lowerText)) {
      foundSkills.add(skill)
      matchCount++
      if (matchCount <= 10) {
        console.log(`✅ Found skill: ${skill}`)
      }
    }
  }
  
  console.log(`📊 Pattern matching found ${matchCount} skills`)
  
  // Also look for version numbers (e.g., "Python 3.x", "Node 18")
  const versionPatterns = [
    /\b(python|java|node|php|go|rust)\s+\d+/gi,
    /\b(react|angular|vue)\s+\d+/gi,
  ]
  
  for (const pattern of versionPatterns) {
    const matches = lowerText.matchAll(pattern)
    for (const match of matches) {
      const baseSkill = match[1].toLowerCase()
      foundSkills.add(baseSkill)
      console.log(`✅ Found versioned skill: ${baseSkill}`)
    }
  }
  
  // Convert to array and normalize
  const skillsArray = Array.from(foundSkills)
  console.log(`🔄 Normalizing ${skillsArray.length} unique skills...`)
  const normalized = normalizeSkills(skillsArray)
  console.log(`✅ Final normalized skills: ${normalized.length}`, normalized)
  return normalized
}

