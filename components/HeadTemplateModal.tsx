"use client";
 
import { useState, useRef, useEffect } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
 
/* ================= MODAL ================= */
const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({
  onClose,
  children,
}) => (
  <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50">
    <div className="bg-gray-900 p-4 rounded relative w-full max-w-5xl shadow-lg text-white">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-xl font-bold hover:text-red-500"
      >
        ✕
      </button>
      {children}
    </div>
  </div>
);
 
/* ================= TYPES ================= */
type DrawingPoint = { x: number; y: number; z: number; text?: string };
 
type HeadTemplateModalProps = {
  open: boolean;
  onClose: () => void;
  patientId: string;
  onSaveFinding?: (findingText: string) => void;
  onExport?: () => void;
};
 
/* ================= TEMPLATES ================= */
const templates = {
  Ear: [{ name: "Outer Ear", position: [1.2, 1.5, 0] }],
  Nose: [{ name: "Septum", position: [0, 1.6, 1.2] }],
  Throat: [
    { name: "Tonsils", position: [0, 1.2, 0.8] },
    { name: "Larynx", position: [0, 0.6, 0.5] },
    { name: "Epiglottis", position: [0, 0.9, 0.6] },
  ],
  Aesthetics: [{ name: "Cheeks", position: [1, 1.5, 1.5] }],
};
 
/* ================= MODELS ================= */
const EarModel = () => {
  const { scene } = useGLTF("/models/ear-anatomy/source/ear.glb");
  return <primitive object={scene} scale={2.5} />;
};
 
const NoseModel = () => {
  const { scene } = useGLTF(
    "/models/ear-anatomy/nose/anatomi_hidung_nose_anatomy/scene.gltf"
  );
  return (
    <primitive
      object={scene}
      scale={2.2}
      position={[0, -0.3, 0.5]}
      rotation={[0, Math.PI, 0]}
    />
  );
};
 
const ThroatModel = () => {
  const { scene } = useGLTF(
    "/models/ear-anatomy/throat/larynx_with_muscles_and_ligaments.glb"
  );
  return (
    <primitive
      object={scene}
      scale={2.2}
      position={[0, -0.5, 0]}
      rotation={[0, Math.PI, 0]}
    />
  );
};
 
/* Preload */
useGLTF.preload("/models/ear-anatomy/source/ear.glb");
useGLTF.preload(
  "/models/ear-anatomy/nose/anatomi_hidung_nose_anatomy/scene.gltf"
);
useGLTF.preload(
  "/models/ear-anatomy/throat/larynx_with_muscles_and_ligaments.glb"
);
 
/* ================= MAIN ================= */
const HeadTemplateModal: React.FC<HeadTemplateModalProps> = ({
  open,
  onClose,
  patientId,
  onSaveFinding,
  onExport,
}) => {
  const [selectedTab, setSelectedTab] =
    useState<keyof typeof templates>("Ear");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [finding, setFinding] = useState("");
  const [drawingData, setDrawingData] = useState<DrawingPoint[]>([]);
  const [pastFindings, setPastFindings] = useState<DrawingPoint[][]>([]);
 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
 
  /* Resize canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
 
  /* Drawing */
  const startDrawing = (e: any) => {
    if (!selectedArea) return;
    drawing.current = true;
    draw(e);
  };
 
  const stopDrawing = () => (drawing.current = false);
 
  const draw = (e: any) => {
    if (!drawing.current || !canvasRef.current) return;
    e.preventDefault();
 
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
 
    const rect = canvasRef.current.getBoundingClientRect();
    const x =
      e.touches?.[0]?.clientX ?? e.clientX - rect.left;
    const y =
      e.touches?.[0]?.clientY ?? e.clientY - rect.top;
 
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
 
    const normX = (x / rect.width - 0.5) * 0.4;
    const normY = (0.5 - y / rect.height) * 0.4;
 
    const hotspot =
      templates[selectedTab].find((h) => h.name === selectedArea)?.position ??
      [0, 0, 0];
 
    setDrawingData((prev) => [
      ...prev,
      {
        x: hotspot[0] + normX,
        y: hotspot[1] + normY,
        z: hotspot[2],
        text: finding,
      },
    ]);
  };
 
  const handleSaveFinding = () => {
    if (!selectedArea) return;
    onSaveFinding?.(finding);
    setPastFindings((prev) => [...prev, drawingData]);
    setDrawingData([]);
    setFinding("");
    canvasRef.current
      ?.getContext("2d")
      ?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };
 
  if (!open) return null;
 
  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* 3D VIEW */}
        <div className="relative md:w-2/3 h-96 bg-gray-900 rounded">
          <Canvas camera={{ position: [0, 1.5, 5], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} />
            <OrbitControls />
 
            {selectedTab === "Ear" && <EarModel />}
            {selectedTab === "Nose" && <NoseModel />}
            {selectedTab === "Throat" && <ThroatModel />}
 
            {selectedTab === "Aesthetics" && (
              <mesh>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshStandardMaterial color="#555" />
              </mesh>
            )}
 
            {templates[selectedTab].map((h) => (
              <mesh
                key={h.name}
                position={h.position}
                onClick={(e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation();
                  setSelectedArea(h.name);
                }}
              >
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                  color={selectedArea === h.name ? "orange" : "red"}
                />
                {selectedArea === h.name && (
                  <Html position={[0, 0.3, 0]}>
                    <div className="bg-gray-800 px-2 py-1 rounded text-sm">
                      {h.name}
                    </div>
                  </Html>
                )}
              </mesh>
            ))}
 
            {[...pastFindings.flat(), ...drawingData].map((p, i) => (
              <mesh key={i} position={[p.x, p.y, p.z]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="red" />
              </mesh>
            ))}
          </Canvas>
 
          {selectedArea && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
            />
          )}
        </div>
 
        {/* SIDE PANEL */}
        <div className="md:w-1/3 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(templates) as Array<
              keyof typeof templates
            >).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab);
                  setSelectedArea(null);
                }}
                className={`px-3 py-1 rounded ${
                  selectedTab === tab ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
 
          {selectedArea && (
            <>
              <textarea
                value={finding}
                onChange={(e) => setFinding(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded p-2 h-24"
                placeholder={`Notes for ${selectedArea}`}
              />
              <button
                onClick={handleSaveFinding}
                className="bg-green-600 p-2 rounded w-full"
              >
                Save Finding
              </button>
            </>
          )}
 
          <button
            onClick={onExport}
            className="bg-yellow-600 p-2 rounded w-full"
          >
            Export PDF Report
          </button>
        </div>
      </div>
    </Modal>
  );
};
 
export default HeadTemplateModal;