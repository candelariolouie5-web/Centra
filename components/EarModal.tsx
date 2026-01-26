"use client"; // Important for Next.js 13+ app directory
 
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
 
function Model() {
  // Load the GLB file from public/models/ear-anatomy/source/ear.glb
  const gltf = useGLTF("/models/ear-anatomy/source/ear.glb");
 
  return (
    <primitive
      object={gltf.scene}
      scale={1.5}
      position={[0, -0.5, 0]}
      rotation={[0, Math.PI, 0]}
    />
  );
}
 
export default function EarModel() {
  return (
    <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 2, 2]} intensity={1} />
      <Model />
      <OrbitControls />
    </Canvas>
  );
}   