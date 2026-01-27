import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { SplatLoader } from '@mkkellogg/gaussian-splats-3d'

function SplatScene() {
  // 1. Hook into the 3D world
  const { scene } = useThree();

  // 2. Create a "State" to track if we are loading
  const [isLoading, setIsLoading] = useState(true);

  // 3. The Loading Logic (useEffect)
  useEffect(() => {
    const loader = new SplatLoader();

    // Track Mount Status
    let isMounted = true; 

    // Load the file from the 'public' folder
    let loadedSplat = null;

    loader.load(
      'scene.splat',
      (splat) => {
        // --- ON SUCCESS ---
        // Stop if Unmounted
        if (!isMounted) {
            // If we loaded it but the user left, clean it up immediately
            splat.geometry.dispose();
            splat.material.dispose();
            return; 
        }
        // 'splat' is the 3D object. We can move/rotate it here
        splat.position.set(0, 0, 0);
        splat.rotation.set(0, 0, 0);

        // Add it to the world
        scene.add(splat);
        loadedSplat = splat; // Save reference for cleanup

        console.log("Splat loaded");
        setIsLoading(false);
      },
      null,
      (error) => {
        // --- ON ERROR ---
        console.error("Error loading splat:", error);
      }
    );
    // Cleanup: If the user leaves the page, remove the splat to free memory
    return () => {
      // Mark as Unmounted
      isMounted = false;
      if (loadedSplat) {
        scene.remove(loadedSplat);
        if (loadedSplat.geometry) loadedSplat.geometry.dispose();
        if (loadedSplat.material) loadedSplat.material.dispose();
        console.log("Splat cleaned up");
      }
    };
  }, [scene]); 

  return null; 
}

export default function Viewer() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>

      {/* The 3d Window */}
      <Canvas camera={{ position: [5, 2, 5], fov: 65}}>

        {/* Controls to rotate around */}
        <OrbitControls />

        {/* Ambient light*/}
        <ambientLight intensity={0.5} />

        <SplatScene />

      </Canvas>
    </div>
  );
}