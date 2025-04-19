
import { useEffect, useRef } from 'react';
import { GitHubRepo, GitHubLanguage } from '@/types/github';
import * as THREE from 'three';

interface DNAHelixProps {
  repos: GitHubRepo[];
  languages: Record<string, GitHubLanguage>;
}

export function DNAHelix({ repos, languages }: DNAHelixProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  
  useEffect(() => {
    if (!mountRef.current || repos.length === 0) return;
    
    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#111827');
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 30;
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create DNA helix
    const repoCount = repos.length;
    const maxRepos = Math.min(repoCount, 50); // Limit for performance
    
    // Get unique languages for coloring
    const languageSet = new Set<string>();
    repos.forEach(repo => {
      if (repo.language) languageSet.add(repo.language);
    });
    
    const uniqueLanguages = Array.from(languageSet);
    const languageColorMap: Record<string, THREE.Color> = {};
    
    uniqueLanguages.forEach((lang, index) => {
      // Try to get the GitHub color for this language
      const color = languages[lang]?.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`;
      languageColorMap[lang] = new THREE.Color(color);
    });
    
    // Create helix structure
    const helixGroup = new THREE.Group();
    scene.add(helixGroup);
    
    // DNA parameters
    const helixHeight = 30;
    const helixRadius = 5;
    const nucleotidesPerTurn = 10;
    const turns = 3;
    
    // Create strands
    const strand1Geometry = new THREE.BufferGeometry();
    const strand2Geometry = new THREE.BufferGeometry();
    
    const strand1Points: THREE.Vector3[] = [];
    const strand2Points: THREE.Vector3[] = [];
    
    // Vertical step size
    const stepSize = helixHeight / (maxRepos / 2);
    
    for (let i = 0; i < maxRepos / 2; i++) {
      const angle = (i / nucleotidesPerTurn) * Math.PI * 2 * turns;
      const height = i * stepSize - helixHeight / 2;
      
      // Points for the first strand
      const x1 = Math.cos(angle) * helixRadius;
      const z1 = Math.sin(angle) * helixRadius;
      strand1Points.push(new THREE.Vector3(x1, height, z1));
      
      // Points for the second strand (opposite side)
      const x2 = Math.cos(angle + Math.PI) * helixRadius;
      const z2 = Math.sin(angle + Math.PI) * helixRadius;
      strand2Points.push(new THREE.Vector3(x2, height, z2));
      
      // Create "rungs" connecting the strands
      if (i < maxRepos / 2 - 1) {
        const repo1 = repos[i];
        const repo2 = repos[i + maxRepos / 2] || repos[i];
        
        // Get language colors for the repos
        const color1 = repo1.language ? languageColorMap[repo1.language] : new THREE.Color(0x3498db);
        const color2 = repo2.language ? languageColorMap[repo2.language] : new THREE.Color(0x3498db);
        
        // Create nucleotide spheres at each strand point
        const nucleotide1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 16, 16),
          new THREE.MeshPhongMaterial({ color: color1 })
        );
        nucleotide1.position.set(x1, height, z1);
        helixGroup.add(nucleotide1);
        
        const nucleotide2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 16, 16),
          new THREE.MeshPhongMaterial({ color: color2 })
        );
        nucleotide2.position.set(x2, height, z2);
        helixGroup.add(nucleotide2);
        
        // Create connecting "rung"
        const rungGeometry = new THREE.CylinderGeometry(0.1, 0.1, helixRadius * 2, 8);
        const rungMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.6 });
        const rung = new THREE.Mesh(rungGeometry, rungMaterial);
        
        // Position and rotate the rung to connect the nucleotides
        rung.position.set((x1 + x2) / 2, height, (z1 + z2) / 2);
        rung.lookAt(new THREE.Vector3(x2, height, z2));
        rung.rotateZ(Math.PI / 2);
        
        helixGroup.add(rung);
      }
    }
    
    // Create the strands as tubes
    const strand1Curve = new THREE.CatmullRomCurve3(strand1Points);
    const strand1Path = new THREE.TubeGeometry(strand1Curve, maxRepos * 2, 0.2, 8, false);
    const strand1Material = new THREE.MeshPhongMaterial({ 
      color: 0x2463eb, 
      shininess: 100,
      transparent: true,
      opacity: 0.8
    });
    const strand1 = new THREE.Mesh(strand1Path, strand1Material);
    helixGroup.add(strand1);
    
    const strand2Curve = new THREE.CatmullRomCurve3(strand2Points);
    const strand2Path = new THREE.TubeGeometry(strand2Curve, maxRepos * 2, 0.2, 8, false);
    const strand2Material = new THREE.MeshPhongMaterial({ 
      color: 0x16a34a, 
      shininess: 100,
      transparent: true,
      opacity: 0.8
    });
    const strand2 = new THREE.Mesh(strand2Path, strand2Material);
    helixGroup.add(strand2);
    
    // Animation variables
    let animationFrameId: number;
    
    // Animation loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Rotate the DNA helix
      helixGroup.rotation.y += 0.005;
      
      // Render the scene
      renderer.render(scene, camera);
    };
    
    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose of geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [repos, languages]);
  
  return (
    <div 
      ref={mountRef} 
      className="w-full h-[500px] rounded-lg overflow-hidden"
      aria-label="DNA Helix visualization of GitHub repositories"
    />
  );
}
