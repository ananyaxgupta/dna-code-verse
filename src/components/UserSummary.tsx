
import { GitHubUser, GitHubUserData } from "@/types/github";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Star, GitBranch } from "lucide-react";

interface UserSummaryProps {
  data: GitHubUserData;
}

export function UserSummary({ data }: UserSummaryProps) {
  if (!data.user) return null;

  const { user, repos, languages } = data;

  // Find the most used language
  const sortedLanguages = Object.values(languages).sort((a, b) => b.size - a.size);
  const mostUsedLanguage = sortedLanguages.length > 0 ? sortedLanguages[0].name : 'None';
  
  // Calculate total stars
  const totalStars = repos.reduce((total, repo) => total + repo.stargazers_count, 0);

  return (
    <Card className="glass-card w-full max-w-md">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <img 
          src={user.avatar_url} 
          alt={user.login} 
          className="w-16 h-16 rounded-full border-2 border-primary/30"
        />
        <div>
          <CardTitle className="text-xl font-bold">{user.name || user.login}</CardTitle>
          <CardDescription className="line-clamp-2">{user.bio || `@${user.login}`}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <GitBranch className="h-5 w-5 text-primary mb-1" />
            <span className="text-lg font-bold">{repos.length}</span>
            <span className="text-xs text-muted-foreground">Repositories</span>
          </div>
          
          <div className="flex flex-col items-center">
            <Star className="h-5 w-5 text-yellow-500 mb-1" />
            <span className="text-lg font-bold">{totalStars}</span>
            <span className="text-xs text-muted-foreground">Stars</span>
          </div>
          
          <div className="flex flex-col items-center">
            <Code className="h-5 w-5 text-green-500 mb-1" />
            <span className="text-lg font-bold">{mostUsedLanguage}</span>
            <span className="text-xs text-muted-foreground">Top Language</span>
          </div>
        </div>
        
        {sortedLanguages.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-1">Language Distribution</div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              {sortedLanguages.map((lang, index) => (
                <div 
                  key={index}
                  className="h-full float-left" 
                  style={{ 
                    width: `${lang.percentage}%`, 
                    backgroundColor: lang.color,
                  }}
                  title={`${lang.name}: ${lang.percentage.toFixed(1)}%`}
                ></div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {sortedLanguages.slice(0, 5).map((lang, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: lang.color }}
                  ></div>
                  <span>{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
