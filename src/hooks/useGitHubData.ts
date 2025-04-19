
import { useState } from 'react';
import { GitHubLanguage, GitHubRepo, GitHubUser, GitHubUserData } from '@/types/github';
import { fetchGitHubUser, fetchUserRepos, fetchRepoLanguages, processLanguageStats } from '@/services/githubService';
import { useToast } from "@/components/ui/use-toast";

export function useGitHubData(): [
  GitHubUserData,
  (username: string) => Promise<void>
] {
  const [data, setData] = useState<GitHubUserData>({
    user: null,
    repos: [],
    languages: {},
    isLoading: false,
    error: null
  });

  const { toast } = useToast();

  const fetchUserData = async (username: string): Promise<void> => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a GitHub username",
        variant: "destructive"
      });
      return;
    }

    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Special case for Torvalds
      const isTorvalds = username.toLowerCase() === 'torvalds';
      
      if (isTorvalds) {
        toast({
          title: "Easter Egg Found! 🥚",
          description: "You've found the Linux creator! Let's see his contributions...",
          variant: "default"
        });
      }
      
      // Fetch user info
      const user = await fetchGitHubUser(username);
      
      // Fetch user repositories
      const repos = await fetchUserRepos(username);
      
      // Fetch languages for each repository (in parallel for better performance)
      const languagePromises = repos.map(
        repo => fetchRepoLanguages(`${username}/${repo.name}`)
          .then(languages => [repo.name, languages] as [string, Record<string, number>])
          .catch(() => [repo.name, {}] as [string, Record<string, number>]) // Handle errors for individual repos
      );
      
      const repoLanguages = Object.fromEntries(
        await Promise.all(languagePromises)
      );
      
      // Process language statistics
      const languages = processLanguageStats(repos, repoLanguages);
      
      // Update state with all the data
      setData({
        user,
        repos,
        languages,
        isLoading: false,
        error: null
      });
      
      // Show success message
      toast({
        title: "Data Loaded Successfully",
        description: `Found ${repos.length} repositories for ${user.name || username}`,
      });
      
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch GitHub data"
      }));
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch GitHub data",
        variant: "destructive"
      });
    }
  };

  return [data, fetchUserData];
}
