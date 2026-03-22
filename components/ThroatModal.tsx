"use client";
 
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
 
function ThroatModel() {
  const { scene } = useGLTF(
    "/models/ear-anatomy/throat/textures/ThroatNew.glb"
  );
 
  useEffect(() => {
    // Auto center the model
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
  }, [scene]);
 
  return (
    <primitive
      object={scene}
      scale={0.01}   // 🔥 changed from 1.5 → 0.01
      rotation={[0, Math.PI, 0]}
    />
  );
}
 
useGLTF.preload(
  "/models/ear-anatomy/throat/textures/ThroatNew.glb"
);
 
export default function ThroatViewer() {
  return (
    <div className="w-full `h-100` bg-gray-900 rounded-lg">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
 
        <OrbitControls
          enableZoom
          enablePan
          minDistance={2}
          maxDistance={10}
        />
 
        <Suspense fallback={null}>
          <ThroatModel />
        </Suspense>
      </Canvas>
    </div>
  );
}