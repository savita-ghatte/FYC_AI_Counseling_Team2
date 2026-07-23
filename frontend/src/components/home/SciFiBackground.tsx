import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const HolographicObject = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Gentle rotation
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;

    // Interactive mouse movement affecting the object
    const mouseX = (state.pointer.x * Math.PI) / 10;
    const mouseY = (state.pointer.y * Math.PI) / 10;
    
    // Smooth interpolation for mouse movement
    meshRef.current.rotation.x += (mouseY - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (mouseX - meshRef.current.rotation.y) * 0.05;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[2.5, 64, 64]} position={[2, 0, -2]}>
        <MeshDistortMaterial
          color="#06b6d4" // Cyan
          emissive="#3b82f6" // Blue
          emissiveIntensity={1.5}
          wireframe={true}
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={1}
          transparent={true}
          opacity={0.4}
        />
      </Sphere>
      
      {/* Inner solid core */}
      <Sphere args={[1.5, 32, 32]} position={[2, 0, -2]}>
        <meshStandardMaterial 
          color="#8b5cf6" // Purple
          emissive="#a855f7" 
          emissiveIntensity={0.5}
          transparent={true}
          opacity={0.8}
        />
      </Sphere>
    </Float>
  );
};

const CameraRig = () => {
  useFrame((state) => {
    // Subtle camera movement based on mouse pointer to create depth
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 0.5, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.pointer.y * 0.5, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

export const SciFiBackground = () => {
  return (
    <div className="fixed inset-0 z-0 bg-[#050510]"> {/* Extremely dark void background */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]} // Optimize pixel ratio
        gl={{ alpha: false, antialias: true }}
      >
        <color attach="background" args={['#050510']} />
        
        {/* Lights */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#a855f7" />

        {/* Environment */}
        <Stars 
          radius={50} 
          depth={50} 
          count={4000} 
          factor={4} 
          saturation={1} 
          fade 
          speed={1} 
        />
        
        <HolographicObject />
        <CameraRig />
      </Canvas>
    </div>
  );
};
