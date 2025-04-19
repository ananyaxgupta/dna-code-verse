
import { useState } from 'react';
import { useGitHubData } from '@/hooks/useGitHubData';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SearchForm } from '@/components/SearchForm';
import { UserSummary } from '@/components/UserSummary';
import { Visualization } from '@/components/visualizations/Visualization';
import { VisualizationMode } from '@/types/github';
import { Github } from 'lucide-react';

const Index = () => {
  const [data, fetchUserData] = useGitHubData();
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground">
      {/* Header with theme toggle */}
      <header className="w-full py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Github className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Code DNA Visualizer</h1>
        </div>
        <ThemeToggle />
      </header>
      
      {/* Main content */}
      <main className="flex-1 w-full max-w-7xl px-4 py-8 flex flex-col items-center gap-8">
        {/* Hero section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Visualize Your GitHub Contributions
          </h2>
          <p className="text-muted-foreground text-lg">
            Transform your GitHub profile into beautiful visualizations including
            DNA helix, galaxy map, or code tree representation.
          </p>
          
          {/* Search form */}
          <div className="py-6 flex justify-center">
            <SearchForm onSearch={fetchUserData} isLoading={data.isLoading} />
          </div>
        </section>
        
        {/* Error message */}
        {data.error && (
          <div className="w-full max-w-md p-4 bg-destructive/20 text-destructive rounded-lg">
            {data.error}
          </div>
        )}
        
        {/* Visualization container */}
        {!data.isLoading && data.user && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar - User summary */}
            <div className="lg:col-span-1">
              <UserSummary data={data} />
            </div>
            
            {/* Main content area - Visualization */}
            <div className="lg:col-span-2">
              <Visualization repos={data.repos} languages={data.languages} />
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="w-full py-6 border-t border-border">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Code DNA Visualizer — Explore your GitHub profile in an artistic way</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
