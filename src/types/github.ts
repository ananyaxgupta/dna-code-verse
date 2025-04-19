
export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubLanguage {
  name: string;
  color: string;
  size: number;
  percentage: number;
}

export interface GitHubUserData {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  languages: Record<string, GitHubLanguage>;
  isLoading: boolean;
  error: string | null;
}

export type VisualizationMode = 'dna' | 'galaxy' | 'tree';
