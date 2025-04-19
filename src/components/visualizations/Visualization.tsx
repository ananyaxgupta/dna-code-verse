
import { useState, useRef } from 'react';
import { GitHubRepo, GitHubLanguage, VisualizationMode } from "@/types/github";
import { DNAHelix } from './DNAHelix';
import { GalaxyVisualization } from './GalaxyVisualization';
import { TreeVisualization } from './TreeVisualization';
import { Card } from "@/components/ui/card";
import { VisualizationControls } from '@/components/VisualizationControls';
import { toast } from "@/components/ui/use-toast";

interface VisualizationProps {
  repos: GitHubRepo[];
  languages: Record<string, GitHubLanguage>;
}

export function Visualization({ repos, languages }: VisualizationProps) {
  const [mode, setMode] = useState<VisualizationMode>('dna');
  const visualizationRef = useRef<HTMLDivElement>(null);
  
  const handleExport = () => {
    if (!visualizationRef.current) return;
    
    try {
      // For Three.js visualizations
      const canvas = visualizationRef.current.querySelector('canvas');
      
      if (canvas) {
        // Export canvas as PNG
        const link = document.createElement('a');
        link.download = `github-${mode}-visualization.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast({
          title: "Visualization Exported",
          description: "Your visualization has been downloaded as a PNG file.",
        });
        return;
      }
      
      // For SVG visualizations
      const svgElement = visualizationRef.current.querySelector('svg');
      
      if (svgElement) {
        // Clone the SVG to avoid modifying the visible one
        const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
        
        // Set proper dimensions & styling
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgClone.setAttribute('width', svgElement.clientWidth.toString());
        svgClone.setAttribute('height', svgElement.clientHeight.toString());
        
        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        // Download SVG
        const link = document.createElement('a');
        link.download = `github-${mode}-visualization.svg`;
        link.href = svgUrl;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(svgUrl);
        
        toast({
          title: "Visualization Exported",
          description: "Your visualization has been downloaded as an SVG file.",
        });
      }
    } catch (error) {
      console.error("Error exporting visualization:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your visualization.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="w-full max-w-5xl space-y-4">
      <VisualizationControls
        mode={mode}
        setMode={setMode}
        onExport={handleExport}
        canExport={repos.length > 0}
      />
      
      <Card 
        className="glass-card overflow-hidden p-0" 
        ref={visualizationRef}
      >
        {repos.length === 0 ? (
          <div className="flex items-center justify-center h-[500px] text-muted-foreground">
            Search for a GitHub user to see their code visualization
          </div>
        ) : (
          <>
            {mode === 'dna' && <DNAHelix repos={repos} languages={languages} />}
            {mode === 'galaxy' && <GalaxyVisualization repos={repos} languages={languages} />}
            {mode === 'tree' && <TreeVisualization repos={repos} languages={languages} />}
          </>
        )}
      </Card>
    </div>
  );
}
