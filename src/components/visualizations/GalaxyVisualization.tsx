
import { useEffect, useRef } from 'react';
import { GitHubRepo, GitHubLanguage } from '@/types/github';
import * as THREE from 'three';

interface GalaxyVisualizationProps {
  repos: GitHubRepo[];
  languages: Record<string, GitHubLanguage>;
}

export function GalaxyVisualization({ repos, languages }: GalaxyVisualizationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  
  useEffect(() => {
    if (!mountRef.current || repos.length === 0) return;
    
    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090D1F');
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 25;
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    // Create galaxy center (representing the user)
    const galaxyCenter = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    scene.add(galaxyCenter);
    
    // Add glow effect to galaxy center
    const centerGlow = new THREE.PointLight(0xB794F6, 5, 10);
    galaxyCenter.add(centerGlow);
    
    // Create dust particles for galaxy background
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Position
      const radius = Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      
      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = (radius * Math.sin(theta) * Math.sin(phi)) * 0.3; // Flatten the galaxy
      positions[i * 3 + 2] = radius * Math.cos(theta);
      
      // Color (subtle purple/blue hues)
      const hue = 0.6 + Math.random() * 0.2; // Purple-blue range
      const saturation = 0.5 + Math.random() * 0.5;
      const lightness = 0.7 + Math.random() * 0.3;
      
      const color = new THREE.Color().setHSL(hue, saturation, lightness);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Create stars for each repository
    const maxRepos = Math.min(repos.length, 100); // Limit for performance
    const galaxyGroup = new THREE.Group();
    scene.add(galaxyGroup);
    
    const languageColorMap: Record<string, THREE.Color> = {};
    Object.entries(languages).forEach(([lang, data]) => {
      languageColorMap[lang] = new THREE.Color(data.color);
    });
    
    for (let i = 0; i < maxRepos; i++) {
      const repo = repos[i];
      
      // Generate position on a spiral arm of the galaxy
      const angle = i * 0.3;
      const radius = 2 + i * 0.2;
      
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = (Math.random() - 0.5) * 2; // Small vertical variation
      
      // Determine star size based on repo stats (star count)
      const starSize = 0.2 + Math.min(repo.stargazers_count * 0.05, 1);
      
      // Determine star color based on repo language
      const color = repo.language && languageColorMap[repo.language] 
        ? languageColorMap[repo.language] 
        : new THREE.Color(0xffffff);
      
      // Create star (repository)
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(starSize, 16, 16),
        new THREE.MeshBasicMaterial({ color })
      );
      
      star.position.set(x, y, z);
      galaxyGroup.add(star);
      
      // Add star glow
      const starLight = new THREE.PointLight(color, 1, 3);
      starLight.intensity = 0.5;
      star.add(starLight);
      
      // Optional: Add star name for hover effects
      star.userData = { 
        name: repo.name, 
        stars: repo.stargazers_count,
        language: repo.language 
      };
    }
    
    // Animation variables
    let animationFrameId: number;
    let time = 0;
    
    // Animation loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.005;
      
      // Rotate the galaxy
      galaxyGroup.rotation.y = time * 0.2;
      particleSystem.rotation.y = time * 0.1;
      
      // Add subtle pulsating effect to galaxy center
      const pulse = Math.sin(time * 2) * 0.2 + 0.8;
      centerGlow.intensity = 2 + pulse * 3;
      
      // Make stars twinkle
      galaxyGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          // Use different phase for each star to avoid synchronized twinkling
          const individualPulse = Math.sin(time * 3 + i * 0.5) * 0.3 + 0.7;
          if (child.children[0] instanceof THREE.PointLight) {
            child.children[0].intensity = individualPulse;
          }
        }
      });
      
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
      aria-label="Galaxy visualization of GitHub repositories"
    />
  );
}
