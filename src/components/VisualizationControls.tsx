
import { Button } from "@/components/ui/button";
import { 
  ToggleGroup,
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { 
  Dna, 
  GalleryHorizontal, 
  TreePine, 
  Download
} from "lucide-react";
import { VisualizationMode } from "@/types/github";

interface VisualizationControlsProps {
  mode: VisualizationMode;
  setMode: (mode: VisualizationMode) => void;
  onExport: () => void;
  canExport: boolean;
}

export function VisualizationControls({
  mode,
  setMode,
  onExport,
  canExport
}: VisualizationControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full max-w-md">
      <ToggleGroup type="single" value={mode} onValueChange={(value: VisualizationMode) => value && setMode(value)}>
        <ToggleGroupItem value="dna" aria-label="Toggle DNA visualization" className="px-3">
          <Dna className="h-4 w-4 mr-2" />
          DNA Helix
        </ToggleGroupItem>
        
        <ToggleGroupItem value="galaxy" aria-label="Toggle Galaxy visualization" className="px-3">
          <GalleryHorizontal className="h-4 w-4 mr-2" />
          Galaxy
        </ToggleGroupItem>
        
        <ToggleGroupItem value="tree" aria-label="Toggle Tree visualization" className="px-3">
          <TreePine className="h-4 w-4 mr-2" />
          Tree
        </ToggleGroupItem>
      </ToggleGroup>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onExport}
        disabled={!canExport}
        className="gap-1"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  );
}
