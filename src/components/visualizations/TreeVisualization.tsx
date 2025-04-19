
import { useEffect, useRef } from 'react';
import { GitHubRepo, GitHubLanguage } from '@/types/github';
import * as d3 from 'd3';

interface TreeVisualizationProps {
  repos: GitHubRepo[];
  languages: Record<string, GitHubLanguage>;
}

interface TreeNode {
  id: string;
  name: string;
  value: number;
  language: string | null;
  color: string;
  children?: TreeNode[];
}

// Extending the d3.HierarchyNode interface to include treemap-specific properties
interface TreemapNode extends d3.HierarchyNode<TreeNode> {
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
}

export function TreeVisualization({ repos, languages }: TreeVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || repos.length === 0) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare language colors map
    const languageColorMap: Record<string, string> = {};
    Object.entries(languages).forEach(([lang, data]) => {
      languageColorMap[lang] = data.color;
    });

    // Group repositories by primary language
    const languageGroups: Record<string, GitHubRepo[]> = {};
    repos.forEach(repo => {
      const lang = repo.language || 'Unknown';
      if (!languageGroups[lang]) {
        languageGroups[lang] = [];
      }
      languageGroups[lang].push(repo);
    });

    // Create tree data structure
    const treeData: TreeNode = {
      id: 'root',
      name: 'GitHub',
      value: repos.length,
      language: null,
      color: '#2463eb',
      children: Object.entries(languageGroups).map(([lang, langRepos]) => ({
        id: `lang-${lang}`,
        name: lang,
        value: langRepos.length,
        language: lang,
        color: languageColorMap[lang] || '#888888',
        children: langRepos.map(repo => ({
          id: `repo-${repo.id}`,
          name: repo.name,
          value: repo.stargazers_count + 1, // +1 to ensure at least some size
          language: repo.language,
          color: languageColorMap[repo.language || ''] || '#888888'
        }))
      }))
    };

    // Set up dimensions
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create group for the tree
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create hierarchy from data
    const root = d3.hierarchy(treeData)
      .sum(d => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0)) as TreemapNode;

    // Apply treemap layout
    d3.treemap<TreeNode>()
      .size([innerWidth, innerHeight])
      .padding(4)
      .round(true)
      (root);

    // Create groups for each node
    const leaf = g.selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Add rectangles for each leaf node
    leaf.append('rect')
      .attr('width', d => (d.x1 || 0) - (d.x0 || 0))
      .attr('height', d => (d.y1 || 0) - (d.y0 || 0))
      .attr('fill', d => d.data.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('opacity', 0.85)
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('stroke-width', 2);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.85)
          .attr('stroke-width', 1);
      });

    // Add text labels
    leaf.append('text')
      .attr('x', 4)
      .attr('y', 14)
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text(d => d.data.name)
      .attr('clip-path', d => `inset(0px 0px 0px 0px)`);
    
    // Add value labels (stars)
    leaf.append('text')
      .attr('x', 4)
      .attr('y', 26)
      .attr('fill', '#ffffff')
      .attr('font-size', '8px')
      .attr('opacity', 0.8)
      .text(d => d.data.value > 1 ? `★ ${d.data.value - 1}` : '');

    // Add tree title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Repository Tree Map');

    // Handle window resize
    const handleResize = () => {
      if (!svgRef.current) return;
      // Redraw the visualization on window resize
      const width = svgRef.current.clientWidth;
      const height = svgRef.current.clientHeight;
      svg.attr('width', width).attr('height', height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [repos, languages]);

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden bg-[#121828]">
      <svg 
        ref={svgRef} 
        className="w-full h-full"
        aria-label="Tree visualization of GitHub repositories"
      />
    </div>
  );
}
