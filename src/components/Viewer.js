import { OrbitControls, Splat } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

export default function Viewer() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      
      <Canvas camera={{ position: [5, 2, 5], fov: 65 }}>
        
        {/* Controls to rotate around */}
        <OrbitControls />

        <Splat src="scene.splat" />

      </Canvas>
    </div>
  );
}