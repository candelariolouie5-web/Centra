"use client";

import React, { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { Canvas, ThreeEvent, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Line } from "@react-three/drei";
import * as THREE from "three";

/* ================= MODAL ================= */
const Modal = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-2 md:p-4">
    <div className="relative bg-slate-900 w-full max-w-[98vw] md:max-w-[96vw] lg:max-w-[95vw] rounded-xl shadow-2xl text-gray-100 flex flex-col h-[95vh] border border-slate-700 overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 md:top-4 md:right-4 text-2xl text-slate-400 hover:text-red-400 z-50 bg-slate-800/80 hover:bg-slate-700 rounded-full p-2 shadow-lg transition-colors"
      >
        ✕
      </button>
      {children}
    </div>
  </div>
);

/* ================= TYPES ================= */
type SOAPType = "S" | "O" | "A" | "P";
type TabKey = "Ear" | "Nose" | "Throat" | "Head";
type Vec3 = [number, number, number];
type MeasureMode = "off" | "distance" | "angle";

type ClinicalTemplate = {
  id?: string;
  name: string;
  findings: string;
};

// DEFAULT TEMPLATES (findings only)
const DEFAULT_TEMPLATES: Record<TabKey, ClinicalTemplate[]> = {
  Ear: [
    {
      name: "Normal Ear Examination",
      findings: "External ear canal appears normal. No signs of inflammation or infection. Tympanic membrane is intact with proper light reflex. No discharge or debris noted.",
    },
    {
      name: "Otitis Media",
      findings: "Redness and inflammation noted in the middle ear. Tympanic membrane appears bulging with reduced mobility. Fluid level visible behind the membrane.",
    },
    {
      name: "Impacted Cerumen",
      findings: "Cerumen impaction observed blocking the external auditory canal. Cerumen is dark, hard, and completely occluding the canal wall.",
    },
    {
      name: "Ear Infection",
      findings: "Signs of infection present including redness, swelling, and warmth in the ear canal. Possible discharge noted with foul odor.",
    },
  ],
  Nose: [
    {
      name: "Normal Nasal Examination",
      findings: "Nasal passages are clear and symmetrical. No visible inflammation or discharge. Nasal septum is midline. Turbinates appear normal in size and color.",
    },
    {
      name: "Deviated Nasal Septum",
      findings: "Nasal septum is displaced to the left/right, causing narrowing of one nasal passage. Cartilaginous deviation noted.",
    },
    {
      name: "Nasal Polyps",
      findings: "Smooth, pale, gelatinous masses observed in the nasal cavity. Polyps are bilateral and originating from the ethmoid region.",
    },
    {
      name: "Allergic Rhinitis",
      findings: "Pale, boggy nasal mucosa with clear watery discharge. Swollen turbinates noted. Allergic shiners present.",
    },
  ],
  Throat: [
    {
      name: "Normal Throat",
      findings: "Pharynx is pink and moist. Tonsils are normal in size without exudate. Uvula is midline. No erythema or swelling noted.",
    },
    {
      name: "Tonsillitis",
      findings: "Enlarged and erythematous tonsils with white/yellow exudate. Tender cervical lymph nodes. Patient reports pain on swallowing.",
    },
    {
      name: "Pharyngitis",
      findings: "Red and inflamed pharyngeal walls. No exudate on tonsils. Tender anterior cervical lymphadenopathy.",
    },
    {
      name: "Enlarged Tonsils",
      findings: "Tonsils are enlarged (grade 2-3) without signs of acute infection. No exudate present. May cause airway obstruction symptoms.",
    },
  ],
  Head: [
    {
      name: "Normal Facial Examination",
      findings: "Facial symmetry is preserved. Skin appears healthy with normal color and texture. No lesions, discoloration, or abnormalities noted.",
    },
    {
      name: "Acne Vulgaris",
      findings: "Multiple comedones, papules, and pustules noted on face. Inflammation present. Scarring may be starting to form.",
    },
    {
      name: "Facial Asymmetry",
      findings: "Noticeable asymmetry of facial features. Possible underlying bone structure difference or soft tissue volume loss on one side.",
    },
    {
      name: "Skin Irritation",
      findings: "Erythematous patches with mild scaling noted. Skin appears irritated with possible allergic contact dermatitis pattern.",
    },
    {
      name: "Post Aesthetic Procedure",
      findings: "Expected post-procedure findings: mild swelling, pinpoint bruising at injection sites. No signs of infection or vascular compromise.",
    },
  ],
};

type Stroke = {
  x: number;
  y: number;
  z?: number;
  soap: SOAPType;
  pressure: number;
  is3D: boolean;
};

type AreaData = { strokes: Stroke[][] };

/* ================= CONFIG ================= */
const MODEL_CONFIG = {
  Ear: { scale: 3.0 },
  Nose: { scale: 5.0 },
  Throat: { scale: 1.0 },
  Head: { scale: 6.0 },
};

const STROKE_WIDTH = 2;

// ============================================================
// REGION MAPPING
// ============================================================
type Region = {
  id: string;
  label: string;
  meshSelector: string | ((mesh: THREE.Mesh) => boolean);
  polygon: [number, number][];
  highlightColor?: string;
};

const REGIONS: Record<TabKey, Region[]> = {
  Ear: [
    { id: "ear_outer", label: "Outer Ear", meshSelector: "outer", polygon: [[0.2, 0.3], [0.8, 0.3], [0.75, 0.7], [0.25, 0.7]], highlightColor: "#3b82f6" },
    { id: "ear_canal", label: "Ear Canal", meshSelector: "canal", polygon: [[0.4, 0.4], [0.6, 0.4], [0.55, 0.55], [0.45, 0.55]], highlightColor: "#22c55e" },
    { id: "ear_tympanic", label: "Tympanic Membrane", meshSelector: "tympanic", polygon: [[0.45, 0.45], [0.55, 0.45], [0.5, 0.55]], highlightColor: "#f97316" },
    { id: "ear_malleus", label: "Malleus", meshSelector: "malleus", polygon: [[0.48, 0.48], [0.52, 0.48], [0.5, 0.52]], highlightColor: "#a855f7" },
    { id: "ear_incus", label: "Incus", meshSelector: "incus", polygon: [[0.52, 0.48], [0.56, 0.48], [0.54, 0.52]], highlightColor: "#ec4899" },
    { id: "ear_stapes", label: "Stapes", meshSelector: "stapes", polygon: [[0.55, 0.5], [0.58, 0.5], [0.56, 0.53]], highlightColor: "#8b5cf6" },
  ],
  Nose: [
    { id: "nose_septum", label: "Nasal Septum", meshSelector: (mesh) => mesh.name.toLowerCase().includes("septum"), polygon: [[0.45, 0.35], [0.55, 0.35], [0.5, 0.65], [0.4, 0.6]], highlightColor: "#22c55e" },
    { id: "nose_turbinate", label: "Turbinates", meshSelector: (mesh) => mesh.name.toLowerCase().includes("turbinate"), polygon: [[0.3, 0.45], [0.7, 0.45], [0.65, 0.7], [0.35, 0.7]], highlightColor: "#f97316" },
    { id: "nose_bone", label: "Nasal Bone", meshSelector: (mesh) => mesh.name.toLowerCase().includes("bone"), polygon: [[0.4, 0.3], [0.6, 0.3], [0.55, 0.45], [0.45, 0.45]], highlightColor: "#3b82f6" },
    { id: "nose_cartilage", label: "Nasal Cartilage", meshSelector: (mesh) => mesh.name.toLowerCase().includes("cartilage"), polygon: [[0.35, 0.5], [0.65, 0.5], [0.6, 0.7], [0.4, 0.7]], highlightColor: "#a855f7" },
    { id: "nose_sinus", label: "Sinus", meshSelector: (mesh) => mesh.name.toLowerCase().includes("sinus"), polygon: [[0.2, 0.2], [0.8, 0.2], [0.7, 0.4], [0.3, 0.4]], highlightColor: "#ec4899" },
  ],
  Throat: [
    { id: "throat_tonsils", label: "Tonsils", meshSelector: "tonsil", polygon: [[0.3, 0.4], [0.7, 0.4], [0.6, 0.6], [0.4, 0.6]], highlightColor: "#a855f7" },
    { id: "throat_larynx", label: "Larynx", meshSelector: "larynx", polygon: [[0.4, 0.55], [0.6, 0.55], [0.55, 0.75], [0.45, 0.75]], highlightColor: "#ec4899" },
    { id: "throat_cricoid", label: "Cricoid cartilage", meshSelector: "cricoid", polygon: [[0.4, 0.6], [0.6, 0.6], [0.55, 0.8], [0.45, 0.8]], highlightColor: "#f472b6" },
    { id: "throat_thyroid", label: "Thyroid gland", meshSelector: "thyroid", polygon: [[0.35, 0.5], [0.65, 0.5], [0.6, 0.7], [0.4, 0.7]], highlightColor: "#fb923c" },
    { id: "throat_trachea", label: "Trachea", meshSelector: "trachea", polygon: [[0.45, 0.75], [0.55, 0.75], [0.5, 0.95], [0.4, 0.9]], highlightColor: "#60a5fa" },
  ],
  Head: [
    { id: "head_scalp", label: "Scalp", meshSelector: "scalp", polygon: [[0.2, 0.1], [0.8, 0.1], [0.85, 0.35], [0.15, 0.35]], highlightColor: "#8b5cf6" },
    { id: "head_face", label: "Face", meshSelector: "face", polygon: [[0.25, 0.4], [0.75, 0.4], [0.7, 0.8], [0.3, 0.8]], highlightColor: "#f59e0b" },
    { id: "head_neck", label: "Neck", meshSelector: "neck", polygon: [[0.35, 0.8], [0.65, 0.8], [0.6, 0.95], [0.4, 0.95]], highlightColor: "#06b6d4" },
    { id: "head_forehead", label: "Forehead", meshSelector: "forehead", polygon: [[0.3, 0.2], [0.7, 0.2], [0.65, 0.4], [0.35, 0.4]], highlightColor: "#f472b6" },
    { id: "head_cheek", label: "Cheek", meshSelector: "cheek", polygon: [[0.2, 0.5], [0.4, 0.5], [0.35, 0.7], [0.25, 0.7]], highlightColor: "#fb923c" },
    { id: "head_chin", label: "Chin", meshSelector: "chin", polygon: [[0.4, 0.75], [0.6, 0.75], [0.55, 0.85], [0.45, 0.85]], highlightColor: "#60a5fa" },
    { id: "head_eye", label: "Eye", meshSelector: "eye", polygon: [[0.3, 0.35], [0.45, 0.35], [0.4, 0.45], [0.35, 0.45]], highlightColor: "#3b82f6" },
    { id: "head_nose", label: "Nose", meshSelector: "nose", polygon: [[0.45, 0.4], [0.55, 0.4], [0.5, 0.55], [0.4, 0.5]], highlightColor: "#22c55e" },
  ],
};

// ============================================================
// MODELS
// ============================================================
const EarModel = () => {
  const { scene } = useGLTF("/models/ear-anatomy/source/EARSblend.glb");
  return <primitive object={scene} />;
};

const HeadModal = () => {
  const { scene } = useGLTF("/models/ear-anatomy/Head/head/scene.gltf");
  return <primitive object={scene} />;
};

const NoseModel = () => {
  const { scene } = useGLTF("/models/ear-anatomy/nose/nosee.glb");
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const origMat = mesh.material;
        const mat = Array.isArray(origMat) ? origMat[0] : origMat;
        const meshName = mesh.name.toLowerCase();
        const isInternal = meshName.includes("cartilage") || meshName.includes("bone") || meshName.includes("tissue") || meshName.includes("membrane") || meshName.includes("sinus") || meshName.includes("cavity") || meshName.includes("septum") || meshName.includes("turbinate");
        const isOuter = meshName.includes("skin") || meshName.includes("outer") || meshName.includes("surface") || meshName.includes("exterior") || meshName.includes("shell") || meshName.includes("cover");
        const color = (mat as any).color || 0xffffff;
        const map = (mat as any).map || null;
        const roughness = (mat as any).roughness || 0.5;
        const metalness = (mat as any).metalness || 0;
        if (isOuter) {
          const outerMaterial = new THREE.MeshStandardMaterial({ color, map, transparent: true, opacity: 0.3, depthWrite: false, roughness, metalness, side: THREE.FrontSide });
          mesh.material = outerMaterial;
          mesh.renderOrder = 2;
        } else {
          const internalMaterial = new THREE.MeshStandardMaterial({ color, map, transparent: true, opacity: 0.9, depthWrite: true, roughness, metalness, side: THREE.DoubleSide });
          mesh.material = internalMaterial;
          mesh.renderOrder = 1;
        }
      }
    });
  }, [scene]);
  return <primitive object={scene} />;
};

const ThroatModel = ({ onLoad }: { onLoad?: (scene: THREE.Group) => void }) => {
  const { scene } = useGLTF("/models/ear-anatomy/throat/textures/ThroatNew.glb");
  useEffect(() => { if (onLoad) onLoad(scene); }, [scene, onLoad]);
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const origMat = mesh.material;
        const mat = Array.isArray(origMat) ? origMat[0] : origMat;
        const meshName = mesh.name.toLowerCase();
        const isInternal = meshName.includes("cartilage") || meshName.includes("bone") || meshName.includes("tissue") || meshName.includes("membrane") || meshName.includes("sinus") || meshName.includes("cavity") || meshName.includes("septum") || meshName.includes("turbinate");
        const isOuter = meshName.includes("skin") || meshName.includes("outer") || meshName.includes("surface") || meshName.includes("exterior") || meshName.includes("shell") || meshName.includes("cover");
        const color = (mat as any).color || 0xffffff;
        const map = (mat as any).map || null;
        const roughness = (mat as any).roughness || 0.5;
        const metalness = (mat as any).metalness || 0;
        if (isOuter) {
          const outerMaterial = new THREE.MeshStandardMaterial({ color, map, transparent: true, opacity: 0.3, depthWrite: false, roughness, metalness, side: THREE.FrontSide });
          mesh.material = outerMaterial;
          mesh.renderOrder = 2;
        } else {
          const internalMaterial = new THREE.MeshStandardMaterial({ color, map, transparent: true, opacity: 0.9, depthWrite: true, roughness, metalness, side: THREE.DoubleSide });
          mesh.material = internalMaterial;
          mesh.renderOrder = 1;
        }
      }
    });
  }, [scene]);
  return <primitive object={scene} />;
};

// ============================================================
// Helper components
// ============================================================
const ModelCenterer = ({ tab, earRef, noseRef, throatRef, headRef, orbitRef }: any) => {
  const { camera } = useThree();
  const isCentered = useRef(false);
  const getActiveRef = (): THREE.Group | null => {
    switch (tab) {
      case "Ear": return earRef.current;
      case "Nose": return noseRef.current;
      case "Throat": return throatRef.current;
      case "Head": return headRef.current;
      default: return null;
    }
  };
  useEffect(() => {
    const activeModelRef = getActiveRef();
    if (!activeModelRef) { isCentered.current = false; return; }
    const timer = setTimeout(() => {
      if (!activeModelRef || isCentered.current) return;
      const model = activeModelRef;
      const box = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center);
      let centerOffsetY = 0;
      if (tab === "Throat") centerOffsetY = 0.5;
      else if (tab === "Nose") centerOffsetY = 0.3;
      else if (tab === "Ear") centerOffsetY = 0.2;
      else if (tab === "Head") centerOffsetY = 0.4;
      model.position.y += centerOffsetY;
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      const fov = perspectiveCamera.fov * (Math.PI / 180);
      let cameraDistance = Math.abs(maxDim / Math.tan(fov / 2)) * 1.5;
      cameraDistance = Math.max(2, Math.min(cameraDistance, 20));
      const targetPos = new THREE.Vector3(0, centerOffsetY, 0);
      if (orbitRef.current) {
        orbitRef.current.target.copy(targetPos);
        orbitRef.current.update();
      }
      camera.position.set(0, centerOffsetY, cameraDistance);
      camera.lookAt(targetPos);
      isCentered.current = true;
    }, 500);
    return () => clearTimeout(timer);
  }, [tab, camera, earRef, noseRef, throatRef, headRef, orbitRef]);
  useEffect(() => { isCentered.current = false; }, [tab]);
  return null;
};

const WebGLCanvasCapture = ({ webglRef }: { webglRef: React.RefObject<HTMLCanvasElement | null> }) => {
  const { gl } = useThree();
  useEffect(() => { if (webglRef.current !== gl.domElement) webglRef.current = gl.domElement; }, [gl.domElement, webglRef]);
  return null;
};

const RotationAnimator = ({ targetRotation, headRef }: { targetRotation: number; headRef: React.RefObject<THREE.Group | null> }) => {
  useFrame(() => {
    if (!headRef.current) return;
    headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotation, 0.05);
  });
  return null;
};

// ============================================================
// HELPERS
// ============================================================
const isTouchDevice = () => typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

const smoothPointsRealtime = (points: Stroke[], smoothing = 0.25): Vec3[] => {
  if (points.length < 2) return points.map((p) => [p.x, p.y, p.z || 0] as Vec3);
  const smoothed: Vec3[] = [[points[0].x, points[0].y, points[0].z || 0]];
  for (let i = 1; i < points.length; i++) {
    const last = smoothed[smoothed.length - 1];
    const curr = points[i];
    smoothed.push([
      last[0] + (curr.x - last[0]) * smoothing,
      last[1] + (curr.y - last[1]) * smoothing,
      last[2] + ((curr.z || 0) - last[2]) * smoothing,
    ]);
  }
  return smoothed;
};

const distanceBetween = (a: Vec3, b: Vec3): number => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2));

const angleBetween = (a: Vec3, b: Vec3, c: Vec3): number => {
  const v1 = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const v2 = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
  const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
  const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
  const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]);
  if (mag1 === 0 || mag2 === 0) return 0;
  const cos = Math.min(1, Math.max(-1, dot / (mag1 * mag2)));
  return Math.acos(cos) * 180 / Math.PI;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function HeadTemplateModal({
  open,
  onClose,
  patientId,
  onSaveDiagnostic,
  onSaveFinding,
  onExport,
  initialStrokes,
}: {
  open: boolean;
  onClose: () => void;
  patientId: string;
  onSaveDiagnostic?: (diagnostic: { imageData: string; strokes: Record<string, Record<string, AreaData>> }) => void;
  onSaveFinding?: (data: { diagnosis: string; anatomy: string; notes: string }) => void;
  onExport?: () => void;
  initialStrokes?: Record<string, Record<string, AreaData>>;
}) {
  const [tab, setTab] = useState<TabKey>("Ear");
  const [area, setArea] = useState<string | null>(null);
  const [soap, setSoap] = useState<SOAPType>("O");
  const [mode, setMode] = useState<"draw" | "view">("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Clinical Notes State - ONLY FINDINGS
  const [clinicalNotes, setClinicalNotes] = useState({
    findings: "",
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const currentDefaultTemplates = DEFAULT_TEMPLATES[tab];

  // DATABASE TEMPLATES
  const [dbTemplates, setDbTemplates] = useState<ClinicalTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState<{ name: string; findings: string }>({
    name: '',
    findings: '',
  });

  // Load templates from DB
  const loadTemplates = useCallback(async () => {
    if (!tab) return;
    setIsLoadingTemplates(true);
    try {
      const res = await fetch(`/api/clinical-templates?anatomy=${tab}`);
      if (res.ok) {
        const data = await res.json();
        setDbTemplates(data.templates || []);
      } else {
        console.error("Failed to load templates");
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [tab]);

  // Reload templates when tab changes or modal opens
  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, tab, loadTemplates]);

  // Combined templates
  const allTemplates = [...currentDefaultTemplates, ...dbTemplates];

  // Apply template
  const applyTemplate = (templateName: string) => {
    const template = dbTemplates.find((t) => t.name === templateName) ||
                     currentDefaultTemplates.find((t) => t.name === templateName);
    if (template) {
      setClinicalNotes({
        findings: template.findings,
      });
      setSelectedTemplate(templateName);
    }
  };

  const clearTemplateSelection = () => {
    setSelectedTemplate("");
  };

  // Add template to DB
  const handleAddTemplate = async () => {
    if (!newTemplate.name.trim()) return;

    try {
      const res = await fetch("/api/clinical-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anatomy: tab,
          name: newTemplate.name,
          findings: newTemplate.findings,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDbTemplates((prev) => [...prev, data.template]);
        setNewTemplate({ name: "", findings: "" });
        setShowAddTemplate(false);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template");
    }
  };

  // Delete template from DB
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      const res = await fetch(`/api/clinical-templates/${templateId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDbTemplates((prev) => prev.filter((t) => t.id !== templateId));
      } else {
        alert("Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template");
    }
  };

  // Patient Image
  const [patientImages, setPatientImages] = useState<{ front: string | null; left: string | null; right: string | null; }>({ front: null, left: null, right: null });
  const [uploadType, setUploadType] = useState<"front" | "left" | "right">("front");
  const [targetRotation, setTargetRotation] = useState<number>(0);
  const [isPatientImageCollapsed, setIsPatientImageCollapsed] = useState(false);
  const previewImage = patientImages[uploadType];
  const [imageLoadingStates, setImageLoadingStates] = useState<{ front: boolean; left: boolean; right: boolean; }>({ front: false, left: false, right: false });
  const handleImageLoad = (type: "front" | "left" | "right") => { setImageLoadingStates((prev) => ({ ...prev, [type]: false })); };
  const handleImageError = (type: "front" | "left" | "right") => { setImageLoadingStates((prev) => ({ ...prev, [type]: false })); };
  useEffect(() => { if (patientImages[uploadType]) { setImageLoadingStates((prev) => ({ ...prev, [uploadType]: true })); } }, [patientImages, uploadType]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (patientImages[uploadType]) { URL.revokeObjectURL(patientImages[uploadType]!); }
      const objectUrl = URL.createObjectURL(file);
      setPatientImages((prev) => ({ ...prev, [uploadType]: objectUrl }));
      setImageLoadingStates((prev) => ({ ...prev, [uploadType]: false }));
    }
    if (fileInputRef.current) { fileInputRef.current.value = ""; }
  };
  const handleRemoveImage = (type: "front" | "left" | "right") => {
    if (patientImages[type]) { URL.revokeObjectURL(patientImages[type]!); setPatientImages((prev) => ({ ...prev, [type]: null })); }
  };

  // Measurement
  const [measureMode, setMeasureMode] = useState<MeasureMode>("off");
  const [measurePoints, setMeasurePoints] = useState<Vec3[]>([]);
  const [measureResult, setMeasureResult] = useState<string>("");
  const [showGrid, setShowGrid] = useState(false);
  const [showSymmetry, setShowSymmetry] = useState(false);

  const getActiveModelGroup = useCallback((): THREE.Group | null => {
    switch (tab) {
      case "Ear": return earRef.current;
      case "Nose": return noseRef.current;
      case "Throat": return throatRef.current;
      case "Head": return headRef.current;
      default: return null;
    }
  }, [tab]);

  const handleMeasureClick = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (measureMode === "off") return;
    e.stopPropagation();
    const modelGroup = getActiveModelGroup();
    if (!modelGroup) return;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, e.camera);
    const meshes: THREE.Mesh[] = [];
    modelGroup.traverse((child) => { if ((child as THREE.Mesh).isMesh) { meshes.push(child as THREE.Mesh); } });
    const intersects = raycaster.intersectObjects(meshes);
    if (intersects.length === 0) return;
    const point = intersects[0].point.clone();
    modelGroup.localToWorld(point);
    const newPoint: Vec3 = [point.x, point.y, point.z];
    const newPoints = [...measurePoints, newPoint];
    setMeasurePoints(newPoints);
    if (measureMode === "distance" && newPoints.length === 2) {
      const dist = distanceBetween(newPoints[0], newPoints[1]);
      setMeasureResult(`Distance: ${(dist * 1).toFixed(2)} cm`);
    } else if (measureMode === "angle" && newPoints.length === 3) {
      const angle = angleBetween(newPoints[0], newPoints[1], newPoints[2]);
      setMeasureResult(`Angle: ${angle.toFixed(1)}°`);
    } else { setMeasureResult(""); }
  }, [measureMode, measurePoints, getActiveModelGroup]);

  useEffect(() => { setMeasurePoints([]); setMeasureResult(""); }, [measureMode, tab]);

  const addMeasurementToFindings = () => {
    if (measureResult) {
      setClinicalNotes((prev) => ({
        ...prev,
        findings: prev.findings + (prev.findings ? "\n" : "") + measureResult,
      }));
      setMeasurePoints([]);
      setMeasureResult("");
      setMeasureMode("off");
    }
  };

  // ============================================================
  // REGION MAPPING
  // ============================================================
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [meshRegionMap, setMeshRegionMap] = useState<Map<THREE.Mesh, string>>(new Map());
  const [popup, setPopup] = useState<{ region: Region; x: number; y: number } | null>(null);
  const pointerDownRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const buildMeshRegionMap = useCallback((model: THREE.Group, regions: Region[]) => {
    const map = new Map<THREE.Mesh, string>();
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        for (const region of regions) {
          let matches = false;
          if (typeof region.meshSelector === "string") { matches = mesh.name.toLowerCase().includes(region.meshSelector.toLowerCase()); }
          else { matches = region.meshSelector(mesh); }
          if (matches) { map.set(mesh, region.id); break; }
        }
      }
    });
    return map;
  }, []);

  useEffect(() => {
    const modelGroup = getActiveModelGroup();
    if (!modelGroup) return;
    const regions = REGIONS[tab] || [];
    const newMap = buildMeshRegionMap(modelGroup, regions);
    setMeshRegionMap(newMap);
    setSelectedRegion(null);
    setPopup(null);
  }, [tab, getActiveModelGroup, buildMeshRegionMap]);

  const selectRegion = useCallback((regionId: string, event?: { clientX: number; clientY: number }) => {
    const region = REGIONS[tab].find((r) => r.id === regionId);
    if (!region) return;
    setSelectedRegion(regionId);
    setArea(region.label);
    if (event) {
      const x = Math.min(event.clientX, window.innerWidth - 220);
      const y = Math.min(event.clientY - 20, window.innerHeight - 140);
      setPopup({ region, x, y });
    } else {
      setPopup({ region, x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50 });
    }
    setClinicalNotes((prev) => ({
      ...prev,
      findings: prev.findings + (prev.findings ? "\n" : "") + `Region: ${region.label}`,
    }));
  }, [tab]);

  const handleRegionClick = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (mode !== "view" || measureMode !== "off") return;
    e.stopPropagation();
    const intersects = e.intersections;
    if (!intersects || intersects.length === 0) return;
    const clickedMesh = intersects[0].object as THREE.Mesh;
    const regionId = meshRegionMap.get(clickedMesh);
    if (regionId) { selectRegion(regionId, { clientX: e.clientX, clientY: e.clientY }); }
  }, [mode, measureMode, meshRegionMap, selectRegion]);

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (mode !== "view" || measureMode !== "off") return;
    pointerDownRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  }, [mode, measureMode]);

  const handlePointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!pointerDownRef.current) return;
    const { x, y, time } = pointerDownRef.current;
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const elapsed = Date.now() - time;
    if (dist < 5 && elapsed < 300) { handleRegionClick(e); }
    pointerDownRef.current = null;
  }, [handleRegionClick]);

  // Highlight selected region
  useEffect(() => {
    meshRegionMap.forEach((id, mesh) => {
      if (mesh.material) {
        const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        if ((mat as any).userData?.originalColor !== undefined) { (mat as any).color.setHex((mat as any).userData.originalColor); }
      }
    });
    if (selectedRegion) {
      meshRegionMap.forEach((id, mesh) => {
        if (id === selectedRegion) {
          const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          if (!(mat as any).userData) (mat as any).userData = {};
          if ((mat as any).userData.originalColor === undefined) { (mat as any).userData.originalColor = (mat as any).color.getHex(); }
          const region = REGIONS[tab].find((r) => r.id === selectedRegion);
          const highlightColor = region?.highlightColor ? new THREE.Color(region.highlightColor) : new THREE.Color(0x00ffff);
          (mat as any).color.copy(highlightColor);
        }
      });
    }
  }, [selectedRegion, meshRegionMap, tab]);

  useEffect(() => {
    if (popup) { const timer = setTimeout(() => setPopup(null), 5000); return () => clearTimeout(timer); }
  }, [popup]);

  useEffect(() => {
    const handleClickOutside = () => { if (popup) setPopup(null); };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [popup]);

  // ============================================================
  // Drawing state & refs
  // ============================================================
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webglRef = useRef<HTMLCanvasElement>(null);
  const currentStroke = useRef<Stroke[]>([]);
  const orbitRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const throatRef = useRef<THREE.Group>(null);
  const earRef = useRef<THREE.Group>(null);
  const noseRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const [data, setData] = useState<Record<TabKey, Record<string, AreaData>>>(initialStrokes || { Ear: {}, Nose: {}, Throat: {}, Head: {} });

  const loadDiagnostic = (savedData: { imageData: string; strokes: Record<TabKey, Record<string, AreaData>> }) => { setData(savedData.strokes); };

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem("diagnostic");
      if (saved) { loadDiagnostic(JSON.parse(saved)); }
    }
  }, [open]);

  const [tempData, setTempData] = useState<Record<TabKey, Record<string, AreaData>>>({ Ear: {}, Nose: {}, Throat: {}, Head: {} });

  const soapColor: Record<SOAPType, string> = { S: "#3b82f6", O: "#22c55e", A: "#f97316", P: "#a855f7" };

  const syncTempStroke = useCallback((targetTab: TabKey, targetArea: string) => {
    const strokeCopy = [...currentStroke.current];
    setTempData((prev) => ({
      ...prev,
      [targetTab]: { ...prev[targetTab], [targetArea]: { strokes: strokeCopy.length > 0 ? [strokeCopy] : [] } },
    }));
  }, []);

  const commitCurrentStroke = useCallback((targetTab: TabKey, targetArea: string) => {
    const strokeCopy = [...currentStroke.current];
    if (strokeCopy.length > 0) {
      setData((prev) => ({
        ...prev,
        [targetTab]: { ...prev[targetTab], [targetArea]: { strokes: [...(prev[targetTab][targetArea]?.strokes || []), strokeCopy] } },
      }));
    }
    setTempData((prev) => ({ ...prev, [targetTab]: { ...prev[targetTab], [targetArea]: { strokes: [] } } }));
    currentStroke.current = [];
    setIsDrawing(false);
  }, []);

  const start3DStroke = () => {
    if (mode !== "draw" || !area) return;
    currentStroke.current = [];
    setIsDrawing(true);
    syncTempStroke(tab, area);
  };

  const draw3DStroke = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDrawing || mode !== "draw" || !area) return;
    e.stopPropagation();
    const p = e.point;
    const pressure = e.pointerType === "pen" ? e.pressure || 0.5 : 0.5;
    currentStroke.current.push({ x: p.x, y: p.y, z: p.z, soap, pressure, is3D: true });
    syncTempStroke(tab, area);
  }, [area, isDrawing, mode, soap, syncTempStroke, tab]);

  const end3DStroke = () => {
    if (!area) { currentStroke.current = []; setIsDrawing(false); return; }
    commitCurrentStroke(tab, area);
  };

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  };

  const start2DStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return;
    e.preventDefault(); e.stopPropagation();
    const canvas = overlayRef.current;
    if (!canvas) return;
    canvas.setPointerCapture?.(e.pointerId);
    const key = area || "default";
    const { x, y } = getCanvasPoint(e, canvas);
    currentStroke.current = [{ x, y, soap, pressure: e.pressure && e.pressure > 0 ? e.pressure : 0.5, is3D: false }];
    setIsDrawing(true);
    syncTempStroke(tab, key);
  };

  const draw2DStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== "draw") return;
    e.preventDefault(); e.stopPropagation();
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const events = typeof e.nativeEvent.getCoalescedEvents === "function" ? e.nativeEvent.getCoalescedEvents() : [e.nativeEvent];
    const rect = canvas.getBoundingClientRect();
    for (const ev of events) {
      const x = (ev.clientX - rect.left) / rect.width;
      const y = (ev.clientY - rect.top) / rect.height;
      const last = currentStroke.current[currentStroke.current.length - 1];
      const newPoint = { x, y, soap, pressure: ev.pressure && ev.pressure > 0 ? ev.pressure : 0.5, is3D: false as const };
      currentStroke.current.push(newPoint);
      if (last) {
        ctx.strokeStyle = soapColor[soap];
        ctx.lineWidth = STROKE_WIDTH;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(last.x * rect.width, last.y * rect.height);
        ctx.lineTo(newPoint.x * rect.width, newPoint.y * rect.height);
        ctx.stroke();
      }
    }
    syncTempStroke(tab, area || "default");
  };

  const end2DStroke = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (e) { e.preventDefault(); e.stopPropagation(); const canvas = overlayRef.current; if (canvas) { try { canvas.releasePointerCapture?.(e.pointerId); } catch {} } }
    commitCurrentStroke(tab, area || "default");
  };

  const mergeCanvases = () => {
    const webglCanvas = webglRef.current;
    const overlayCanvas = overlayRef.current;
    if (!webglCanvas || !overlayCanvas) return null;
    const mergedCanvas = document.createElement("canvas");
    mergedCanvas.width = webglCanvas.width;
    mergedCanvas.height = webglCanvas.height;
    const ctx = mergedCanvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(webglCanvas, 0, 0, mergedCanvas.width, mergedCanvas.height);
    ctx.drawImage(overlayCanvas, 0, 0, overlayCanvas.width, overlayCanvas.height, 0, 0, mergedCanvas.width, mergedCanvas.height);
    return mergedCanvas.toDataURL("image/png");
  };

  // Overlay effects
  useEffect(() => {
    if (!overlayRef.current) return;
    const canvas = overlayRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const tabData = data[tab];
    Object.values(tabData).forEach((areaData) => {
      areaData.strokes.forEach((stroke) => {
        if (!stroke[0]?.is3D) {
          ctx.beginPath();
          for (let i = 0; i < stroke.length; i++) {
            const p = stroke[i];
            const x = p.x * rect.width;
            const y = p.y * rect.height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = soapColor[stroke[0]?.soap ?? "O"];
          ctx.lineWidth = STROKE_WIDTH;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
        }
      });
    });

    if (showGrid) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      const thirds = [0.33, 0.66];
      thirds.forEach((t) => { const y = t * rect.height; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke(); });
      const fifths = [0.2, 0.4, 0.6, 0.8];
      fifths.forEach((t) => { const x = t * rect.width; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke(); });
      ctx.setLineDash([]);
    }

    if (showSymmetry) {
      ctx.strokeStyle = "rgba(0, 200, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(rect.width / 2, 0);
      ctx.lineTo(rect.width / 2, rect.height);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(0, 200, 255, 0.6)";
      ctx.font = "12px sans-serif";
      ctx.fillText("Symmetry Heatmap (visual)", 10, 20);
    }
  }, [mode, tab, data, showGrid, showSymmetry]);

  // Fullscreen
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) { viewerRef.current.requestFullscreen?.().catch((err) => console.warn("Fullscreen request failed:", err)); }
    else { document.exitFullscreen?.().catch((err) => console.warn("Exit fullscreen failed:", err)); }
  };
  useEffect(() => {
    const handleFullscreenChange = () => { setIsFullscreen(!!document.fullscreenElement); };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);

  // Save Notes - only findings now
  const handleSaveNotes = () => {
    const findings = clinicalNotes.findings;
    console.log("📝 Saving findings:", findings);

    if (onSaveFinding) {
      const diagnosis = selectedTemplate || "Custom";
      onSaveFinding({
        diagnosis: diagnosis,
        anatomy: tab,
        notes: findings,
      });
    }
    if (notesDrawerOpen) setNotesDrawerOpen(false);
  };

  if (!open) return null;

  const anatomyTabs: { key: TabKey; icon: string; label: string }[] = [
    { key: "Ear", icon: "👂", label: "Ear" },
    { key: "Nose", icon: "👃", label: "Nose" },
    { key: "Throat", icon: "🗣", label: "Throat" },
    { key: "Head", icon: "🧑", label: "Head" },
  ];

  const soapLabels: Record<SOAPType, { label: string; color: string }> = {
    S: { label: "Subjective", color: "bg-blue-500" },
    O: { label: "Objective", color: "bg-green-500" },
    A: { label: "Assessment", color: "bg-orange-500" },
    P: { label: "Plan", color: "bg-purple-500" },
  };

  return (
    <Modal onClose={onClose}>
      {/* HEADER */}
      <div className="px-4 md:px-6 py-3 md:py-4 bg-linear-to-r from-slate-800 via-slate-700 to-slate-800 border-b border-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🏥</span>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">Centra Clinic</h2>
            <p className="text-xs text-slate-400 hidden sm:block">Interactive 3D Documentation</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
          <span className="hidden sm:inline">Patient:</span>
          <span className="text-white font-medium">{patientId}</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="hidden md:flex w-16 md:w-48 lg:w-56 bg-slate-800 border-r border-slate-700 flex-col flex-shrink-0">
          <div className="p-3 border-b border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Anatomy</h3>
          </div>
          <div className="flex-1 p-2 space-y-1">
            {anatomyTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setArea(null); setSelectedRegion(null); setPopup(null); }}
                className={`w-full flex items-center gap-2 md:gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${tab === t.key ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-300 hover:bg-slate-700 hover:text-white"}`}
              >
                <span className="text-lg">{t.icon}</span>
                <span className="hidden md:block font-medium">{t.label}</span>
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">SOAP</h3>
            <div className="space-y-1">
              {(Object.keys(soapLabels) as SOAPType[]).map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${soapLabels[s].color}`}></div>
                  <span className="text-xs text-slate-400">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3D VIEWER */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={viewerRef} className="relative flex-1 bg-[#0a1628] overflow-hidden">
            {/* Horizontal tabs for tablet */}
            <div className="md:hidden absolute top-0 left-0 right-0 z-20 bg-slate-800/90 backdrop-blur-sm flex items-center gap-1 p-1 overflow-x-auto border-b border-slate-700">
              {anatomyTabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setArea(null); setSelectedRegion(null); setPopup(null); }}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t.key ? "bg-blue-600 text-white shadow-md" : "text-slate-300 hover:bg-slate-700"}`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Controls Bar */}
            <div className="absolute top-10 md:top-0 left-0 right-0 p-2 md:p-3 bg-slate-800/80 backdrop-blur-sm z-10 flex flex-wrap gap-2 items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400 mr-1 hidden sm:inline">SOAP:</span>
                {(["S", "O", "A", "P"] as SOAPType[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSoap(s)}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-lg font-bold text-xs transition-colors touch-manipulation ${soap === s ? `${soapLabels[s].color} text-white shadow-md` : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}
                    title={soapLabels[s].label}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => { if (isDrawing) commitCurrentStroke(tab, area || "default"); setMode("draw"); setMeasureMode("off"); setSelectedRegion(null); setPopup(null); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors touch-manipulation ${mode === "draw" ? "bg-yellow-500 text-black" : "text-slate-400 hover:text-white"}`}
                >
                  ✍ Draw
                </button>
                <button
                  onClick={() => { if (isDrawing) commitCurrentStroke(tab, area || "default"); setMode("view"); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors touch-manipulation ${mode === "view" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  👁 View
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1 flex-wrap">
                <button
                  onClick={() => { setMeasureMode(measureMode === "distance" ? "off" : "distance"); setMeasurePoints([]); setMeasureResult(""); setSelectedRegion(null); setPopup(null); }}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium touch-manipulation ${measureMode === "distance" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"}`}
                  title="Distance"
                >📏</button>
                <button
                  onClick={() => { setMeasureMode(measureMode === "angle" ? "off" : "angle"); setMeasurePoints([]); setMeasureResult(""); setSelectedRegion(null); setPopup(null); }}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium touch-manipulation ${measureMode === "angle" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"}`}
                  title="Angle"
                >📐</button>
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium touch-manipulation ${showGrid ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"}`}
                  title="Grid"
                >📊</button>
                <button
                  onClick={() => setShowSymmetry(!showSymmetry)}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium touch-manipulation ${showSymmetry ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"}`}
                  title="Symmetry"
                >🔄</button>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                <button
                  onClick={() => { const key = area || "default"; setData((prev) => { const strokes = prev[tab][key]?.strokes || []; return { ...prev, [tab]: { ...prev[tab], [key]: { strokes: strokes.slice(0, -1) } } }; }); }}
                  className="px-2 md:px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium transition-colors touch-manipulation"
                  title="Undo"
                >↶</button>
                <button
                  onClick={() => { const key = area || "default"; setData((prev) => ({ ...prev, [tab]: { ...prev[tab], [key]: { strokes: [] } } })); }}
                  className="px-2 md:px-3 py-1.5 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 text-xs font-medium transition-colors touch-manipulation"
                  title="Clear"
                >🗑</button>
                <button
                  onClick={() => { if (onSaveDiagnostic) { const imageData = mergeCanvases(); if (imageData) { onSaveDiagnostic({ imageData, strokes: data }); onClose(); } } }}
                  className="px-3 md:px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors touch-manipulation"
                >💾 Save</button>
                {document.fullscreenEnabled && (
                  <button
                    onClick={toggleFullscreen}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white p-2 rounded-lg shadow-lg transition-colors border border-slate-600 touch-manipulation"
                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Canvas */}
            <div className="absolute inset-0">
              <Canvas ref={canvasRef} camera={{ fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
                <WebGLCanvasCapture webglRef={webglRef} />
                <ModelCenterer tab={tab} earRef={earRef} noseRef={noseRef} throatRef={throatRef} headRef={headRef} orbitRef={orbitRef} />
                <RotationAnimator targetRotation={targetRotation} headRef={headRef} />
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 5, 5]} />
                <OrbitControls ref={orbitRef} enableZoom enablePan={mode === "view" || measureMode !== "off"} enableRotate={mode === "view" || measureMode !== "off"} minDistance={2} maxDistance={100} enableDamping dampingFactor={0.1} />

                <group ref={earRef} visible={tab === "Ear"} scale={MODEL_CONFIG.Ear.scale} onPointerDown={mode === "view" && measureMode === "off" ? handlePointerDown : undefined} onPointerUp={mode === "view" && measureMode === "off" ? handlePointerUp : undefined}>
                  <EarModel />
                </group>
                <group ref={noseRef} visible={tab === "Nose"} scale={MODEL_CONFIG.Nose.scale} onPointerDown={mode === "view" && measureMode === "off" ? handlePointerDown : undefined} onPointerUp={mode === "view" && measureMode === "off" ? handlePointerUp : undefined}>
                  <NoseModel />
                </group>
                <group ref={throatRef} visible={tab === "Throat"} scale={MODEL_CONFIG.Throat.scale} onPointerDown={mode === "view" && measureMode === "off" ? handlePointerDown : undefined} onPointerUp={mode === "view" && measureMode === "off" ? handlePointerUp : undefined}>
                  <ThroatModel />
                </group>
                <group ref={headRef} visible={tab === "Head"} scale={MODEL_CONFIG.Head.scale} onPointerDown={mode === "view" && measureMode === "off" ? handlePointerDown : undefined} onPointerUp={mode === "view" && measureMode === "off" ? handlePointerUp : undefined}>
                  <HeadModal />
                </group>

                {measureMode !== "off" && (
                  <mesh position={[0, 0.8, 0]} scale={[10, 10, 10]} onPointerDown={handleMeasureClick}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
                  </mesh>
                )}

                {Object.entries(data).map(([t, areas]) => Object.values(areas).map((a, i) => a.strokes.map((stroke, j) => stroke[0]?.is3D ? <Line key={`persistent-${t}-${i}-${j}`} points={smoothPointsRealtime(stroke)} color={soapColor[stroke[0]?.soap ?? "O"]} lineWidth={STROKE_WIDTH} visible={t === tab} /> : null)))}
                {Object.values(tempData[tab]).map((a, i) => a.strokes.map((stroke, j) => stroke[0]?.is3D ? <Line key={`temp-${i}-${j}`} points={smoothPointsRealtime(stroke)} color={soapColor[stroke[0]?.soap ?? "O"]} lineWidth={STROKE_WIDTH} /> : null))}
              </Canvas>

              <canvas ref={overlayRef} className="absolute inset-0 h-full w-full" style={{ pointerEvents: mode === "draw" ? "auto" : "none", touchAction: "none" }} onPointerDown={start2DStroke} onPointerMove={draw2DStroke} onPointerUp={end2DStroke} onPointerCancel={end2DStroke} />
            </div>

            {/* Region Popup */}
            {popup && (
              <div className="fixed z-50 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg shadow-2xl p-4 max-w-xs" style={{ left: Math.min(popup.x, window.innerWidth - 240), top: Math.min(popup.y - 20, window.innerHeight - 160), pointerEvents: "auto" }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-4">
                  <div><h4 className="text-sm font-semibold text-white">{popup.region.label}</h4><p className="text-xs text-slate-400 mt-1">ID: {popup.region.id}</p></div>
                  <button onClick={() => setPopup(null)} className="text-slate-400 hover:text-white text-lg leading-none">✕</button>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      const note = `Region: ${popup.region.label}`;
                      if (!clinicalNotes.findings.includes(note)) {
                        setClinicalNotes((prev) => ({ ...prev, findings: prev.findings + (prev.findings ? "\n" : "") + note }));
                      }
                      setPopup(null);
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors touch-manipulation"
                  >
                    Add to Findings
                  </button>
                  <button onClick={() => setPopup(null)} className="py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-md transition-colors touch-manipulation">Close</button>
                </div>
              </div>
            )}

            {/* Measurement Result */}
            {measureResult && (
              <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-500/50 shadow-lg flex items-center gap-3 z-20">
                <span className="text-sm text-white font-mono">{measureResult}</span>
                <button onClick={addMeasurementToFindings} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors touch-manipulation">Add</button>
                <button onClick={() => { setMeasurePoints([]); setMeasureResult(""); setMeasureMode("off"); }} className="text-slate-400 hover:text-white text-xs">✕</button>
              </div>
            )}

            {/* Viewport Label */}
            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700 z-10">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${tab === "Ear" ? "bg-blue-500" : tab === "Nose" ? "bg-green-500" : tab === "Throat" ? "bg-orange-500" : "bg-purple-500"}`}></div>
                <span className="text-sm font-medium text-white">{tab}</span>
                {area && <><span className="text-slate-500">/</span><span className="text-sm text-slate-300">{area}</span></>}
              </div>
            </div>

            <div className="absolute top-[68px] md:top-[52px] left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700 z-10">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {measureMode !== "off" ? `📐 ${measureMode === "distance" ? "Distance" : "Angle"}` : mode === "draw" ? "✍ Draw" : "👁 View (tap model)"}
              </span>
            </div>

            {/* Patient Image Capture */}
            {["Head", "Ear", "Nose", "Throat"].includes(tab) && (
              <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700">
                <button onClick={() => setIsPatientImageCollapsed(!isPatientImageCollapsed)} className="w-full px-3 py-2 flex items-center justify-between bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-2"><span className="text-sm font-medium text-white flex items-center gap-2"><span>📷</span><span className="hidden sm:inline">Patient Image</span></span></div>
                  <div className="flex items-center gap-2">
                    {previewImage && <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">{uploadType}</span>}
                    <span className={`text-slate-400 transition-transform duration-300 ${isPatientImageCollapsed ? "rotate-180" : ""}`}>▼</span>
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isPatientImageCollapsed ? "max-h-0" : "max-h-44"}`}>
                  <div className="p-2 overflow-y-auto" style={{ maxHeight: "176px" }}>
                    <input ref={fileInputRef} type="file" id="patientImageUpload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    {previewImage ? (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-28 h-28 bg-slate-900/80 rounded-lg border border-blue-500/40 p-1 relative">
                          <img src={previewImage} alt="Patient preview" className="w-full h-full object-cover rounded-md" />
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ pointerEvents: "auto" }}>
                            {REGIONS[tab].map((region) => {
                              const isSelected = selectedRegion === region.id;
                              const points = region.polygon.map((p) => p.join(",")).join(" ");
                              return <polygon key={region.id} points={points} fill={isSelected ? "rgba(0,255,255,0.3)" : "transparent"} stroke={isSelected ? "#00ffff" : "rgba(255,255,255,0.2)"} strokeWidth="1.5" onClick={(e) => { e.stopPropagation(); const mouseEvent = e as unknown as React.MouseEvent; selectRegion(region.id, { clientX: mouseEvent.clientX, clientY: mouseEvent.clientY }); }} style={{ cursor: "pointer" }} />;
                            })}
                          </svg>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1 flex-wrap">
                            {(["front", "left", "right"] as const).map((type) => (
                              <button key={type} onClick={() => { setUploadType(type); if (type === "front") setTargetRotation(0); else if (type === "left") setTargetRotation(Math.PI / 2); else if (type === "right") setTargetRotation(-Math.PI / 2); setSelectedRegion(null); setPopup(null); }} className={`px-2 py-1.5 text-xs rounded transition-colors touch-manipulation ${uploadType === type ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </button>
                            ))}
                          </div>
                          <button onClick={() => handleRemoveImage(uploadType)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded transition-colors w-fit touch-manipulation"><span>🗑️</span> Remove</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <label htmlFor="patientImageUpload" className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors touch-manipulation"><span>📤</span> Upload</label>
                        <div className="flex gap-2 flex-1">
                          {(["front", "left", "right"] as const).map((type) => (
                            <div key={type} className="flex-1 min-w-0 group cursor-pointer" onClick={() => { setUploadType(type); if (type === "front") setTargetRotation(0); else if (type === "left") setTargetRotation(Math.PI / 2); else if (type === "right") setTargetRotation(-Math.PI / 2); document.getElementById("patientImageUpload")?.click(); }}>
                              <div className="aspect-square bg-slate-700/30 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center transition-all duration-200 group-hover:border-blue-500 group-hover:bg-slate-700/50 h-16">
                                <span className="text-xl text-slate-500 group-hover:text-blue-400">{type === "front" ? "👤" : type === "left" ? "👈" : "👉"}</span>
                                <span className="text-xs text-slate-400 group-hover:text-white capitalize">{type}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Floating Notes Button */}
            <button onClick={() => setNotesDrawerOpen(true)} className="lg:hidden absolute top-[72px] right-4 z-20 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg border border-blue-400/50 touch-manipulation" aria-label="Open notes"><span className="text-xl">📋</span></button>
          </div>
        </div>

        {/* RIGHT SIDEBAR - UPDATED */}
        <div className="hidden lg:flex w-64 md:w-72 lg:w-80 bg-slate-800 border-l border-slate-700 flex-col flex-shrink-0">
          <div className="p-3 md:p-4 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>📋</span> Clinical Notes
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
            {/* Regions */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2"><span>📍</span> Regions ({tab})</label>
              <div className="flex flex-wrap gap-1">
                {REGIONS[tab].map((region) => (
                  <button key={region.id} onClick={() => { selectRegion(region.id); setPopup({ region, x: window.innerWidth - 280, y: 120 + (REGIONS[tab].indexOf(region) * 40) }); }} className={`px-2 py-1 text-xs rounded-md transition-colors touch-manipulation ${selectedRegion === region.id ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>
                    {region.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FINDINGS - renamed from Quick Templates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span>📝</span> Findings
                </label>
                <button
                  onClick={() => setShowAddTemplate(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>➕</span> Add
                </button>
              </div>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  if (e.target.value === "") clearTemplateSelection();
                  else applyTemplate(e.target.value);
                }}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoadingTemplates}
              >
                <option value="">{isLoadingTemplates ? "Loading..." : "Select findings..."}</option>
                {allTemplates.map((template) => (
                  <option key={template.id || template.name} value={template.name}>
                    {template.name}
                  </option>
                ))}
              </select>
              {selectedTemplate && (
                <button onClick={() => clearTemplateSelection()} className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1">✕ Clear</button>
              )}
              <p className="text-xs text-slate-500">Select a findings template to auto-fill notes.</p>

              {/* Custom Templates List */}
              {dbTemplates.length > 0 && (
                <div className="mt-2 space-y-1">
                  <label className="text-xs font-medium text-slate-400">Your Templates</label>
                  {dbTemplates.map((t) => (
                    <div key={t.id} className="flex items-center justify-between bg-slate-700/30 rounded px-2 py-1">
                      <span className="text-xs text-slate-300 truncate">{t.name}</span>
                      <button onClick={() => handleDeleteTemplate(t.id!)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Findings Textarea - ONLY FINDINGS */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Findings</label>
              <textarea
                value={clinicalNotes.findings}
                onChange={(e) => setClinicalNotes((prev) => ({ ...prev, findings: e.target.value }))}
                placeholder="Document clinical findings..."
                className="w-full h-48 bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 md:p-4 border-t border-slate-700 space-y-2">
            <button onClick={handleSaveNotes} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors touch-manipulation">
              Save Notes
            </button>
            <button
              onClick={() => {
                setClinicalNotes({ findings: "" });
                setSelectedRegion(null);
                setPopup(null);
              }}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors touch-manipulation"
            >
              Clear Notes & Selection
            </button>
          </div>
        </div>
      </div>

      {/* ADD TEMPLATE MODAL */}
      {showAddTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h4 className="text-lg font-semibold text-white mb-4">Add New Findings Template</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Template Name (e.g., Normal Ear Exam)"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Findings Description"
                value={newTemplate.findings}
                onChange={(e) => setNewTemplate({ ...newTemplate, findings: e.target.value })}
                className="w-full h-32 bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddTemplate} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Save Template</button>
              <button onClick={() => setShowAddTemplate(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* NOTES DRAWER (tablet) - Updated */}
      {notesDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNotesDrawerOpen(false)} />
          <div className="relative bg-slate-900 w-full max-h-[80vh] rounded-t-2xl shadow-2xl border border-slate-700 p-4 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2"><span>📋</span> Clinical Notes</h3>
              <button onClick={() => setNotesDrawerOpen(false)} className="text-slate-400 hover:text-white text-2xl">✕</button>
            </div>

            {/* Regions */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2"><span>📍</span> Regions ({tab})</label>
              <div className="flex flex-wrap gap-1">
                {REGIONS[tab].map((region) => (
                  <button key={region.id} onClick={() => { selectRegion(region.id); setPopup({ region, x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50 }); setNotesDrawerOpen(false); }} className={`px-2 py-1 text-xs rounded-md transition-colors touch-manipulation ${selectedRegion === region.id ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>
                    {region.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Findings Templates */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Findings</label>
                <button onClick={() => setShowAddTemplate(true)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><span>➕</span> Add</button>
              </div>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  if (e.target.value === "") clearTemplateSelection();
                  else applyTemplate(e.target.value);
                }}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-sm text-white"
                disabled={isLoadingTemplates}
              >
                <option value="">{isLoadingTemplates ? "Loading..." : "Select findings..."}</option>
                {allTemplates.map((template) => (
                  <option key={template.id || template.name} value={template.name}>{template.name}</option>
                ))}
              </select>
              {dbTemplates.length > 0 && (
                <div className="mt-2 space-y-1">
                  {dbTemplates.map((t) => (
                    <div key={t.id} className="flex items-center justify-between bg-slate-700/30 rounded px-2 py-1">
                      <span className="text-xs text-slate-300 truncate">{t.name}</span>
                      <button onClick={() => handleDeleteTemplate(t.id!)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Findings Textarea only */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Findings</label>
                <textarea
                  value={clinicalNotes.findings}
                  onChange={(e) => setClinicalNotes((prev) => ({ ...prev, findings: e.target.value }))}
                  placeholder="Document clinical findings..."
                  className="w-full h-40 bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={handleSaveNotes} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg touch-manipulation">Save Notes</button>
              <button onClick={() => { setClinicalNotes({ findings: "" }); setSelectedRegion(null); setPopup(null); }} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg touch-manipulation">Clear</button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}