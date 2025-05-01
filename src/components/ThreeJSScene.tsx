'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeJSScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x9b87f5, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    // Create a futuristic building
    const buildingGroup = new THREE.Group();
    
    // Main tower
    const towerGeometry = new THREE.BoxGeometry(1, 3, 1);
    const towerMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x7E69AB,
      shininess: 90,
      transparent: true,
      opacity: 0.8,
    });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 1.5;
    buildingGroup.add(tower);
    
    // Secondary towers
    for (let i = 0; i < 4; i++) {
      const smallTowerGeometry = new THREE.BoxGeometry(0.4, 1.5, 0.4);
      const smallTowerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x0EA5E9,
        shininess: 100,
        transparent: true,
        opacity: 0.7,
      });
      const smallTower = new THREE.Mesh(smallTowerGeometry, smallTowerMaterial);
      
      // Position around the main tower
      const angle = (i / 4) * Math.PI * 2;
      smallTower.position.x = Math.sin(angle) * 1.2;
      smallTower.position.z = Math.cos(angle) * 1.2;
      smallTower.position.y = 0.75;
      
      buildingGroup.add(smallTower);
    }
    
    // Base/foundation
    const baseGeometry = new THREE.BoxGeometry(3, 0.2, 3);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x1A1F2C });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.1;
    buildingGroup.add(base);
    
    scene.add(buildingGroup);
    
    // Position camera
    camera.position.z = 5;
    camera.position.y = 2;
    
    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Rotate the building
      buildingGroup.rotation.y += 0.01;
      
      // Apply a subtle floating animation
      const time = Date.now() * 0.001;
      buildingGroup.position.y = Math.sin(time) * 0.1;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (e) {
          console.error("Error removing renderer:", e);
        }
      }
    };
  }, []);
  
  return <div ref={mountRef} className="w-full h-full" />;
};

export default ThreeJSScene; 