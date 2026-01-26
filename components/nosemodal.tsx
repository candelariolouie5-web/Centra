"use client";
 
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
 
function NoseModel() {
  const { scene } = useGLTF(
    "/models/ear-anatomy/nose/anatomi_hidung_nose_anatomy/scene.gltf"
  );
 
  return (
    <primitive
      object={scene}
      scale={1.5}
      position={[0, -0.4, 0]}
      rotation={[0, Math.PI, 0]}
    />
  );
}
 
// Preload for performance
useGLTF.preload(
  "/models/ear-anatomy/nose/anatomi_hidung_nose_anatomy/scene.gltf"
);
 
export default function NoseViewer() {
  return (
    <div className="w-full h-[400] bg-gray-900 rounded-lg">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
 
        <OrbitControls
          enableZoom
          enablePan
          minDistance={1.5}
          maxDistance={6}
        />
 
        <Suspense fallback={null}>
          <NoseModel />
        </Suspense>
      </Canvas>
    </div>
  );
}