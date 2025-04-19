
import { GitHubLanguage, GitHubRepo, GitHubUser } from '@/types/github';

const GITHUB_API_URL = 'https://api.github.com';

// Define language colors based on GitHub's language colors
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572A5',
  Java: '#b07219',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Go: '#00ADD8',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Shell: '#89e051',
  Rust: '#dea584',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Lua: '#000080',
  Vue: '#41b883',
  React: '#61dafb',
  // Default color for languages not in this list
  default: '#8257e6',
};

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_URL}/users/${username}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchUserRepos(username: string): Promise<GitHubRepo[]> {
  // Fetch up to 100 repos per page to get most of the user's repos
  const response = await fetch(`${GITHUB_API_URL}/users/${username}/repos?per_page=100&sort=updated`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch repositories: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchRepoLanguages(repoFullName: string): Promise<Record<string, number>> {
  const response = await fetch(`${GITHUB_API_URL}/repos/${repoFullName}/languages`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch languages for ${repoFullName}: ${response.statusText}`);
  }
  
  return await response.json();
}

export function processLanguageStats(
  repos: GitHubRepo[], 
  languagesData: Record<string, Record<string, number>>
): Record<string, GitHubLanguage> {
  const processedLanguages: Record<string, GitHubLanguage> = {};
  let totalSize = 0;
  
  // First, sum up all languages across repos
  Object.entries(languagesData).forEach(([repoName, languages]) => {
    Object.entries(languages).forEach(([lang, size]) => {
      if (!processedLanguages[lang]) {
        processedLanguages[lang] = {
          name: lang,
          color: LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.default,
          size: 0,
          percentage: 0
        };
      }
      processedLanguages[lang].size += size;
      totalSize += size;
    });
  });
  
  // Calculate percentages
  Object.values(processedLanguages).forEach(lang => {
    lang.percentage = (lang.size / totalSize) * 100;
  });
  
  return processedLanguages;
}

// This is a mock function since GitHub API doesn't directly provide commit counts per repo
// In a production app, you'd need to make multiple API calls to get this data
export async function fetchCommitCounts(username: string, repoName: string): Promise<number> {
  try {
    // This would give you the first page of commits (usually 30)
    const response = await fetch(`${GITHUB_API_URL}/repos/${username}/${repoName}/commits?per_page=1`);
    
    if (!response.ok) {
      return 0;
    }
    
    // Get the total count from the Link header (if available)
    const linkHeader = response.headers.get('Link');
    if (linkHeader && linkHeader.includes('rel="last"')) {
      const match = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (match && match[1]) {
        return parseInt(match[1], 10) * 30; // Approximate based on pages
      }
    }
    
    // Fallback to a random number for demo purposes
    // In a real app, you'd need to implement proper pagination or use GitHub's GraphQL API
    return Math.floor(Math.random() * 500) + 10;
  } catch (error) {
    console.error("Error fetching commit count:", error);
    return 0;
  }
}
