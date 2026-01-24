// Skill synonym mapping for normalization
const SYNONYMS: Record<string, string> = {
  'powerbi': 'power bi',
  'js': 'javascript',
  'ts': 'typescript',
  'node': 'node.js',
  'nodejs': 'node.js',
  'postgres': 'postgresql',
  'ml': 'machine learning',
  'ai': 'artificial intelligence',
  'aws': 'amazon web services',
  'gcp': 'google cloud platform',
  'k8s': 'kubernetes',
  'react.js': 'react',
  'vue.js': 'vue',
  'next.js': 'next',
  'c++': 'cpp',
  'c#': 'csharp'
}

/**
 * Normalize a single skill token:
 * - lowercase
 * - trim
 * - apply synonym mapping
 */
export function normalizeSkill(token: string): string {
  const cleaned = token.toLowerCase().trim()
  return SYNONYMS[cleaned] || cleaned
}

/**
 * Normalize an array of skill tokens
 */
export function normalizeSkills(tokens: string[]): string[] {
  return tokens
    .map(t => normalizeSkill(t))
    .filter(t => t.length > 0)
}
