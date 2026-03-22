"use client";
 
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
 
function EarModel3D() {
  const gltf = useGLTF(
    "/models/ear-anatomy/source/ear_model/scene.gltf"
  );
 
  return (
    <Center>
      <primitive object={gltf.scene} />
    </Center>
  );
}
 
function CameraSetup() {
  const { camera } = useThree();
 
  useEffect(() => {
    // Set initial camera position - adjust based on model size
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);
  }, [camera]);
 
  return null;
}
 
export default function EarModel() {
  return (
    <Canvas
      camera={{ fov: 50, position: [0, 0, 3], near: 0.1, far: 1000 }}
      style={{ background: "#1a1a1a", height: "100%", width: "100%" }}
      gl={{ preserveDrawingBuffer: true }}
    >
      {/* Camera setup */}
      <CameraSetup />
     
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={1} />
      <directionalLight position={[-3, -3, -3]} intensity={0.5} />
      <directionalLight position={[0, 5, 0]} intensity={0.3} />
 
      {/* 3D Model with Center component */}
      <EarModel3D />
 
      {/* Controls - orbit around center */}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={1}
        maxDistance={8}
        target={[0, 0, 0]}
        enableZoom={true}
        enableRotate={true}
      />
    </Canvas>
  );
}
 
/* Preload the model */
useGLTF.preload("/models/ear-anatomy/source/ear_model/scene.gltf");
 