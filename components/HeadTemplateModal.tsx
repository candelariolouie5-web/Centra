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

type ClinicalTemplate = {
  name: string;
  findings: string;
  impression: string;
  recommendation: string;
};

const CLINICAL_TEMPLATES: Record<TabKey, ClinicalTemplate[]> = {
  Ear: [
    {
      name: "Normal Ear Examination",
      findings: "External ear canal appears normal. No signs of inflammation or infection. Tympanic membrane is intact with proper light reflex. No discharge or debris noted.",
      impression: "Normal ear examination findings.",
      recommendation: "No treatment required. Continue routine ear care.",
    },
    {
      name: "Otitis Media",
      findings: "Redness and inflammation noted in the middle ear. Tympanic membrane appears bulging with reduced mobility. Fluid level visible behind the membrane.",
      impression: "Findings suggest acute otitis media.",
      recommendation: "Recommend antibiotic therapy. Follow-up in 7 days. Consider pain management.",
    },
    {
      name: "Impacted Cerumen",
      findings: "Cerumen impaction observed blocking the external auditory canal. Cerumen is dark, hard, and completely occluding the canal wall.",
      impression: "Impacted cerumen (ear wax).",
      recommendation: "Recommend cerumen removal. Use ear drops for softening. Schedule follow-up for irrigation if needed.",
    },
    {
      name: "Ear Infection",
      findings: "Signs of infection present including redness, swelling, and warmth in the ear canal. Possible discharge noted with foul odor.",
      impression: "External ear infection (Otitis Externa).",
      recommendation: "Prescribe antibiotic ear drops. Keep ear dry. Follow-up in 5-7 days.",
    },
  ],
  Nose: [
    {
      name: "Normal Nasal Examination",
      findings: "Nasal passages are clear and symmetrical. No visible inflammation or discharge. Nasal septum is midline. Turbinates appear normal in size and color.",
      impression: "Normal nasal examination findings.",
      recommendation: "No treatment required.",
    },
    {
      name: "Deviated Nasal Septum",
      findings: "Nasal septum is displaced to the left/right, causing narrowing of one nasal passage. Cartilaginous deviation noted.",
      impression: "Deviated nasal septum.",
      recommendation: "Consider surgical correction (septoplasty) if symptomatic. Refer to ENT specialist.",
    },
    {
      name: "Nasal Polyps",
      findings: "Smooth, pale, gelatinous masses observed in the nasal cavity. Polyps are bilateral and originating from the ethmoid region.",
      impression: "Nasal polyps.",
      recommendation: "Prescribe nasal corticosteroids. Schedule ENT consultation for further management.",
    },
    {
      name: "Allergic Rhinitis",
      findings: "Pale, boggy nasal mucosa with clear watery discharge. Swollen turbinates noted. Allergic shiners present.",
      impression: "Allergic rhinitis.",
      recommendation: "Prescribe antihistamines and nasal corticosteroids. Identify and avoid allergens. Follow-up in 2 weeks.",
    },
  ],
  Throat: [
    {
      name: "Normal Throat",
      findings: "Pharynx is pink and moist. Tonsils are normal in size without exudate. Uvula is midline. No erythema or swelling noted.",
      impression: "Normal throat examination findings.",
      recommendation: "No treatment required.",
    },
    {
      name: "Tonsillitis",
      findings: "Enlarged and erythematous tonsils with white/yellow exudate. Tender cervical lymph nodes. Patient reports pain on swallowing.",
      impression: "Acute tonsillitis.",
      recommendation: "Prescribe antibiotics. Recommend rest and hydration. Soft diet. Follow-up in 1 week.",
    },
    {
      name: "Pharyngitis",
      findings: "Red and inflamed pharyngeal walls. No exudate on tonsils. Tender anterior cervical lymphadenopathy.",
      impression: "Acute pharyngitis.",
      recommendation: "Symptomatic treatment. Analgesics and warm saline gargles. Increase fluid intake.",
    },
    {
      name: "Enlarged Tonsils",
      findings: "Tonsils are enlarged (grade 2-3) without signs of acute infection. No exudate present. May cause airway obstruction symptoms.",
      impression: "Tonsillar hypertrophy.",
      recommendation: "Monitor for obstructive symptoms. Consider tonsillectomy if severe. Refer to ENT if indicated.",
    },
  ],
  Head: [
    {
      name: "Normal Facial Examination",
      findings: "Facial symmetry is preserved. Skin appears healthy with normal color and texture. No lesions, discoloration, or abnormalities noted.",
      impression: "Normal facial examination findings.",
      recommendation: "No treatment required. Continue routine skincare.",
    },
    {
      name: "Acne Vulgaris",
      findings: "Multiple comedones, papules, and pustules noted on face. Inflammation present. Scarring may be starting to form.",
      impression: "Acne vulgaris - moderate severity.",
      recommendation: "Prescribe topical retinoids and benzoyl peroxide. Consider oral antibiotics for severe cases. Recommend non-comedogenic products.",
    },
    {
      name: "Facial Asymmetry",
      findings: "Noticeable asymmetry of facial features. Possible underlying bone structure difference or soft tissue volume loss on one side.",
      impression: "Facial asymmetry.",
      recommendation: "Further evaluation needed. Consider imaging if structural cause suspected. Refer to plastic surgery if cosmetic concern.",
    },
    {
      name: "Skin Irritation",
      findings: "Erythematous patches with mild scaling noted. Skin appears irritated with possible allergic contact dermatitis pattern.",
      impression: "Skin irritation / contact dermatitis.",
      recommendation: "Identify and avoid irritant/allergen. Prescribe topical corticosteroid. Recommend gentle skincare products.",
    },
    {
      name: "Post Aesthetic Procedure",
      findings: "Expected post-procedure findings: mild swelling, pinpoint bruising at injection sites. No signs of infection or vascular compromise.",
      impression: "Post-aesthetic procedure - expected recovery phase.",
      recommendation: "Continue post-procedure care instructions. Avoid direct sunlight. Follow-up as scheduled. Contact clinic if unusual symptoms develop.",
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
  Ear: { scale: 4.0 },
  Nose: { scale: 1.0 },
  Throat: { scale: 1.0 },
  Head: { scale: 6.0 },
};

const STROKE_WIDTH = 2;

const templates: Record<TabKey, { name: string; position: Vec3 }[]> = {
  Ear: [{ name: "Outer Ear", position: [1.2, 1.5, 0] }],
  Nose: [{ name: "Septum", position: [0, 1.6, 1.2] }],
  Throat: [
    { name: "Tonsils", position: [0, 1.2, 0.8] },
    { name: "Larynx", position: [0, 0.6, 0.5] },
  ],
  Head: [
    { name: "Scalp", position: [0, 2.0, 0] },
    { name: "Face", position: [0, 1.4, 0.8] },
    { name: "Neck", position: [0, 0.8, 0.3] },
  ],
};

/* ================= MODELS ================= */
const EarModel = () => {
  const { scene } = useGLTF("/models/ear-anatomy/source/ear_model/scene.gltf");
  return <primitive object={scene} />;
};

const HeadModal = () => {
  const { scene } = useGLTF("/models/ear-anatomy/Head/head/scene.gltf");
  return <primitive object={scene} />;
};


const NoseModel = () => {
  const { scene } = useGLTF(
    "/models/ear-anatomy/nose/anatomi_hidung_nose_anatomy/Nose.glb"
  );
  
  // Apply materials to meshes - differentiate internal vs external parts
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        const originalMaterial = child.material;
        const meshName = child.name.toLowerCase();
        
        // Determine if internal or external mesh based on name
        const isInternal = meshName.includes('cartilage') || 
                          meshName.includes('bone') || 
                          meshName.includes('tissue') || 
                          meshName.includes('membrane') ||
                          meshName.includes('sinus') ||
                          meshName.includes('cavity') ||
                          meshName.includes('septum') ||
                          meshName.includes('turbinate');
        
        const isOuter = meshName.includes('skin') || 
                       meshName.includes('outer') || 
                       meshName.includes('surface') ||
                       meshName.includes('exterior') ||
                       meshName.includes('shell') ||
                       meshName.includes('cover');
        
        if (isOuter) {
          // Outer mesh: FrontSide, depthWrite false, renderOrder 2
          const outerMaterial = new THREE.MeshStandardMaterial({
            color: originalMaterial.color || 0xffffff,
            map: originalMaterial.map || null,
            transparent: true,
            opacity: 0.3,
            depthWrite: false,
            roughness: originalMaterial.roughness || 0.5,
            metalness: originalMaterial.metalness || 0,
            side: THREE.FrontSide,
          });
          child.material = outerMaterial;
          (child as any).renderOrder = 2;
        } else {
          // Internal mesh: DoubleSide, depthWrite true, renderOrder 1
          const internalMaterial = new THREE.MeshStandardMaterial({
            color: originalMaterial.color || 0xffffff,
            map: originalMaterial.map || null,
            transparent: true,
            opacity: 0.9,
            depthWrite: true,
            roughness: originalMaterial.roughness || 0.5,
            metalness: originalMaterial.metalness || 0,
            side: THREE.DoubleSide,
          });
          child.material = internalMaterial;
          (child as any).renderOrder = 1;
        }
      }
    });
  }, [scene]);
  
  return <primitive object={scene} />;
};

const ThroatModel = ({ onLoad }: { onLoad?: (scene: THREE.Group) => void }) => {
  const { scene } = useGLTF(
    "/models/ear-anatomy/throat/textures/ThroatNew.glb"
  ); 
  
  // Callback when model is loaded to trigger camera adjustment
  useEffect(() => {
    if (onLoad) {
      onLoad(scene);
    }
  }, [scene, onLoad]);
  
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        const originalMaterial = child.material;
        const meshName = child.name.toLowerCase();
        
        // Determine if internal or external mesh based on name
        const isInternal = meshName.includes('cartilage') || 
                          meshName.includes('bone') || 
                          meshName.includes('tissue') || 
                          meshName.includes('membrane') ||
                          meshName.includes('sinus') ||
                          meshName.includes('cavity') ||
                          meshName.includes('septum') ||
                          meshName.includes('turbinate');
        
        const isOuter = meshName.includes('skin') || 
                       meshName.includes('outer') || 
                       meshName.includes('surface') ||
                       meshName.includes('exterior') ||
                       meshName.includes('shell') ||
                       meshName.includes('cover');
        
        if (isOuter) {
          // Outer mesh: FrontSide, depthWrite false, renderOrder 2
          const outerMaterial = new THREE.MeshStandardMaterial({
            color: originalMaterial.color || 0xffffff,
            map: originalMaterial.map || null,
            transparent: true,
            opacity: 0.3,
            depthWrite: false,
            roughness: originalMaterial.roughness || 0.5,
            metalness: originalMaterial.metalness || 0,
            side: THREE.FrontSide,
          });
          child.material = outerMaterial;
          (child as any).renderOrder = 2;
        } else {
          // Internal mesh: DoubleSide, depthWrite true, renderOrder 1
          const internalMaterial = new THREE.MeshStandardMaterial({
            color: originalMaterial.color || 0xffffff,
            map: originalMaterial.map || null,
            transparent: true,
            opacity: 0.9,
            depthWrite: true,
            roughness: originalMaterial.roughness || 0.5,
            metalness: originalMaterial.metalness || 0,
            side: THREE.DoubleSide,
          });
          child.material = internalMaterial;
          (child as any).renderOrder = 1;
        }
      }
    });
  }, [scene]);
  
  return <primitive object={scene} />;
};

/* ================= MODEL CENTERER COMPONENT ================= */
// Generic ModelCenterer that works for ALL anatomy tabs (Ear, Nose, Throat, Head)
const ModelCenterer = ({ 
  tab, 
  earRef,
  noseRef,
  throatRef,
  headRef,
  orbitRef 
}: { 
  tab: TabKey; 
  earRef: React.RefObject<THREE.Group | null>;
  noseRef: React.RefObject<THREE.Group | null>;
  throatRef: React.RefObject<THREE.Group | null>;
  headRef: React.RefObject<THREE.Group | null>;
  orbitRef: React.RefObject<any>;
}) => {
  const { camera } = useThree();
  const isCentered = useRef(false);
  
  // Get the appropriate ref based on current tab
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
    if (!activeModelRef) {
      isCentered.current = false;
      return;
    }
    
    // Wait for model to be loaded
    const timer = setTimeout(() => {
      if (!activeModelRef || isCentered.current) return;
      
      const model = activeModelRef;
      
      // Calculate bounding box of the model using THREE.Box3
      const box = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      box.getCenter(center);
      
      // Center the model
      model.position.sub(center);
      
      // Add slight Y offset for better visual centering (adjust per anatomy)
      if (tab === "Throat") {
        model.position.y += 0.5;
      } else if (tab === "Nose") {
        model.position.y += 0.3;
      } else if (tab === "Ear") {
        model.position.y += 0.2;
      } else if (tab ==="Head"){
        model.position.y += 0.4;
      }
      
      // Auto-fit the camera after centering
      const size = new THREE.Vector3();
      box.getSize(size);
      
      // Set camera distance based on the max dimension
      const maxDim = Math.max(size.x, size.y, size.z);
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      const fov = perspectiveCamera.fov * (Math.PI / 180);
      
      // Calculate camera distance using trigonometry
      let cameraDistance = Math.abs(maxDim / Math.tan(fov / 2)) * 1.5;
      
      // Clamp camera distance to reasonable values
      cameraDistance = Math.max(2, Math.min(cameraDistance, 20));
      
      // Reset camera position based on model size
      camera.position.set(0, size.y * 0.2, cameraDistance);
      camera.lookAt(0, 0, 0);
      
      // Reset OrbitControls.target to (0,0,0)
      if (orbitRef.current) {
        orbitRef.current.target.set(0, 0, 0);
        orbitRef.current.update();
      }
      
      isCentered.current = true;
    }, 500); // Delay to ensure model is loaded
    
    return () => clearTimeout(timer);
  }, [tab, camera, earRef, noseRef, throatRef, headRef, orbitRef]);
  
  // Reset centering flag when tab changes
  useEffect(() => {
    isCentered.current = false;
  }, [tab]);
  
  return null;
};

/* ================= WEBGL CANVAS CAPTURE ================= */
const WebGLCanvasCapture = ({ webglRef }: { webglRef: React.RefObject<HTMLCanvasElement | null> }) => {
  const { gl } = useThree();
  useEffect(() => {
    if (webglRef.current !== gl.domElement) {
      webglRef.current = gl.domElement;
    }
  }, [gl.domElement, webglRef]);
  return null;
};

/* ================= ROTATION ANIMATOR ================= */
// Component to smoothly animate the head model rotation based on targetRotation
const RotationAnimator = ({ 
  targetRotation, 
  headRef 
}: { 
  targetRotation: number; 
  headRef: React.RefObject<THREE.Group | null>;
}) => {
  useFrame(() => {
    if (!headRef.current) return;
    
    // Smoothly interpolate the rotation.y towards the target
    // Using lerp with a factor of 0.05 for smooth animation
    const currentRotation = headRef.current.rotation.y;
    const newRotation = THREE.MathUtils.lerp(currentRotation, targetRotation, 0.05);
    headRef.current.rotation.y = newRotation;
  });
  
  return null;
};

/* ================= HELPERS ================= */
const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

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

/* ================= MAIN COMPONENT ================= */
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
  onSaveFinding?: (text: string) => void;
  onExport?: () => void;
  initialStrokes?: Record<string, Record<string, AreaData>>;
}) {
  const [tab, setTab] = useState<TabKey>("Ear");
  const [area, setArea] = useState<string | null>(null);
  const [soap, setSoap] = useState<SOAPType>("O");
  const [mode, setMode] = useState<"draw" | "view">("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Clinical Notes State
  const [clinicalNotes, setClinicalNotes] = useState({
    findings: "",
    impression: "",
    recommendation: "",
  });

  // Selected template state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // Get templates for current tab
  const currentTemplates = CLINICAL_TEMPLATES[tab];

  // Apply template to clinical notes
  const applyTemplate = (templateName: string) => {
    const template = currentTemplates.find(t => t.name === templateName);
    if (template) {
      setClinicalNotes({
        findings: template.findings,
        impression: template.impression,
        recommendation: template.recommendation,
      });
      setSelectedTemplate(templateName);
    }
  };

  // Clear template selection
  const clearTemplateSelection = () => {
    setSelectedTemplate("");
  };

  // Patient Image Preview State - Store up to 3 images (front, left, right)
  const [patientImages, setPatientImages] = useState<{
    front: string | null;
    left: string | null;
    right: string | null;
  }>({
    front: null,
    left: null,
    right: null,
  });

  // Track which view type is currently selected for upload
  const [uploadType, setUploadType] = useState<"front" | "left" | "right">("front");

  // Target rotation for the 3D head model
  const [targetRotation, setTargetRotation] = useState<number>(0);

  // Collapsible state for Patient Image Capture section
  const [isPatientImageCollapsed, setIsPatientImageCollapsed] = useState(false);

  // Computed preview image based on current upload type
  const previewImage = patientImages[uploadType];

  // Loading state for images
  const [imageLoadingStates, setImageLoadingStates] = useState<{
    front: boolean;
    left: boolean;
    right: boolean;
  }>({
    front: false,
    left: false,
    right: false,
  });

  // Handle image loading states
  const handleImageLoad = (type: "front" | "left" | "right") => {
    setImageLoadingStates(prev => ({ ...prev, [type]: false }));
  };

  const handleImageError = (type: "front" | "left" | "right") => {
    setImageLoadingStates(prev => ({ ...prev, [type]: false }));
  };

  // Set loading state when image URL changes
  useEffect(() => {
    if (patientImages[uploadType]) {
      setImageLoadingStates(prev => ({ ...prev, [uploadType]: true }));
    }
  }, [patientImages, uploadType]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image file selection
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if image already exists for this type - revoke old URL
      if (patientImages[uploadType]) {
        URL.revokeObjectURL(patientImages[uploadType]!);
      }

      const objectUrl = URL.createObjectURL(file);
      setPatientImages((prev) => ({
        ...prev,
        [uploadType]: objectUrl,
      }));
      setImageLoadingStates(prev => ({ ...prev, [uploadType]: false }));
    }
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove uploaded image for specific type
  const handleRemoveImage = (type: "front" | "left" | "right") => {
    if (patientImages[type]) {
      URL.revokeObjectURL(patientImages[type]!);
      setPatientImages((prev) => ({
        ...prev,
        [type]: null,
      }));
    }
  };

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

  // Persistent strokes
  const [data, setData] = useState<Record<TabKey, Record<string, AreaData>>>(initialStrokes || {
    Ear: {},
    Nose: {},
    Throat: {},
    Head: {},
  });

  const loadDiagnostic = (savedData: { imageData: string; strokes: Record<TabKey, Record<string, AreaData>> }) => {
    setData(savedData.strokes);
  };

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem('diagnostic');
      if (saved) {
        loadDiagnostic(JSON.parse(saved));
      }
    }
  }, [open]);

  // Temporary strokes for real-time drawing
  const [tempData, setTempData] = useState<Record<TabKey, Record<string, AreaData>>>( {
    Ear: {},
    Nose: {},
    Throat: {},
    Head: {},
  });

  const soapColor: Record<SOAPType, string> = {
    S: "#3b82f6",
    O: "#22c55e",
    A: "#f97316",
    P: "#a855f7",
  };

  /* ================= 3D DRAW HANDLERS ================= */
  const start3DStroke = () => {
    if (mode !== "draw" || !area) return;
    setIsDrawing(true);
    currentStroke.current = [];
  };

  const draw3DStroke = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isDrawing || mode !== "draw" || !area) return;
      e.stopPropagation();
      const p = e.point;
      const pressure = e.pointerType === "pen" ? e.pressure || 0.5 : 0.5;
      currentStroke.current.push({ x: p.x, y: p.y, z: p.z, soap, pressure, is3D: true });

      setTempData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          [area]: {
            strokes: [...(prev[tab][area]?.strokes || []), [...currentStroke.current]],
          },
        },
      }));
    },
    [mode, isDrawing, area, soap, tab]
  );

  const end3DStroke = () => {
    if (area && currentStroke.current.length > 0) {
      setData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          [area]: {
            strokes: [...(prev[tab][area]?.strokes || []), [...currentStroke.current]],
          },
        },
      }));
      setTempData((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], [area]: { strokes: [] } },
      }));
    }
    currentStroke.current = [];
    setIsDrawing(false);
  };

  /* ================= 2D DRAW HANDLERS ================= */
  const start2DStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return;
    setIsDrawing(true);
    const canvas = overlayRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    currentStroke.current = [{ x, y, soap, pressure: e.pressure || 0.5, is3D: false }];

    setTempData((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [area || "default"]: {
          strokes: [...(prev[tab][area || "default"]?.strokes || []), [...currentStroke.current]],
        },
      },
    }));
  };

  const draw2DStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = overlayRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const last = currentStroke.current[currentStroke.current.length - 1];
    const newPoint = { x, y, soap, pressure: e.pressure || 0.5, is3D: false };
    currentStroke.current.push(newPoint);

    if (last) {
      ctx.strokeStyle = soapColor[soap];
      ctx.lineWidth = STROKE_WIDTH;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(last.x * canvas.width, last.y * canvas.height);
      ctx.lineTo(newPoint.x * canvas.width, newPoint.y * canvas.height);
      ctx.stroke();
    }

    setTempData((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [area || "default"]: {
          strokes: [...(prev[tab][area || "default"]?.strokes || []), [...currentStroke.current]],
        },
      },
    }));
  };

  const end2DStroke = () => {
    if (area && currentStroke.current.length > 0) {
      setData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          [area || "default"]: {
            strokes: [...(prev[tab][area || "default"]?.strokes || []), [...currentStroke.current]],
          },
        },
      }));
      setTempData((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], [area || "default"]: { strokes: [] } },
      }));
    }
    currentStroke.current = [];
    setIsDrawing(false);
  };

  /* ================= MERGE CANVASES ================= */
  const mergeCanvases = () => {
    const webglCanvas = webglRef.current;
    const overlayCanvas = overlayRef.current;
    if (!webglCanvas || !overlayCanvas) return null;

    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = webglCanvas.width;
    mergedCanvas.height = webglCanvas.height;
    const ctx = mergedCanvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(webglCanvas, 0, 0);
    ctx.drawImage(overlayCanvas, 0, 0);

    return mergedCanvas.toDataURL('image/png');
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    if (!overlayRef.current) return;
    const canvas = overlayRef.current;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tabData = data[tab];
    Object.values(tabData).forEach((areaData) => {
      areaData.strokes.forEach((stroke) => {
        if (!stroke[0]?.is3D) {
          ctx.beginPath();
          for (let i = 0; i < stroke.length; i++) {
            const p = stroke[i];
            const x = p.x * canvas.width;
            const y = p.y * canvas.height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = soapColor[stroke[0]?.soap ?? "O"];
          ctx.lineWidth = STROKE_WIDTH;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      });
    });
  }, [mode, tab, data]);

  /* ================= RENDER ================= */
  if (!open) return null;

  // Anatomy tabs with icons
  const anatomyTabs: { key: TabKey; icon: string; label: string }[] = [
    { key: "Ear", icon: "👂", label: "Ear" },
    { key: "Nose", icon: "👃", label: "Nose" },
    { key: "Throat", icon: "🗣", label: "Throat" },
    { key: "Head", icon: "🧑", label: "Head" },
  ];

  // SOAP labels
  const soapLabels: Record<SOAPType, { label: string; color: string }> = {
    S: { label: "Subjective", color: "bg-blue-500" },
    O: { label: "Objective", color: "bg-green-500" },
    A: { label: "Assessment", color: "bg-orange-500" },
    P: { label: "Plan", color: "bg-purple-500" },
  };

  return (
    <Modal onClose={onClose}>
      {/* HEADER - Professional Medical Diagnostic Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 bg-linear-to-r from-slate-800 via-slate-700 to-slate-800 border-b border-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🏥</span>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">Centra Clinic Diagnostic System</h2>
            <p className="text-xs md:text-sm text-slate-400">Interactive 3D Model Documentation</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
          <span>Patient ID:</span>
          <span className="text-white font-medium">{patientId}</span>
        </div>
      </div>

      {/* MAIN CONTENT - 3 Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT SIDEBAR - Anatomical Navigation */}
        <div className="w-16 md:w-48 lg:w-56 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-3 border-b border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Anatomy</h3>
          </div>
          <div className="flex-1 p-2 space-y-1">
            {anatomyTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setArea(null); }}
                className={`w-full flex items-center gap-2 md:gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  tab === t.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                <span className="hidden md:block font-medium">{t.label}</span>
              </button>
            ))}
          </div>
          
          {/* SOAP Legend */}
          <div className="p-3 border-t border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">SOAP Notes</h3>
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

        {/* CENTER - 3D Viewer Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Controls Bar */}
          <div className="p-2 md:p-3 bg-slate-800/50 border-b border-slate-700 flex flex-wrap gap-2 md:gap-4 items-center justify-between">
            {/* Left: Anatomy & SOAP */}
            <div className="flex flex-wrap gap-2 md:gap-4 items-center">
              {/* SOAP Selection */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400 mr-1 hidden sm:inline">SOAP:</span>
                {(["S", "O", "A", "P"] as SOAPType[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSoap(s)}
                    className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                      soap === s
                        ? `${soapLabels[s].color} text-white shadow-md`
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}
                    title={soapLabels[s].label}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => {
                    if (isDrawing && area && currentStroke.current.length > 0) {
                      setData((prev) => ({
                        ...prev,
                        [tab]: {
                          ...prev[tab],
                          [area]: {
                            strokes: [...(prev[tab][area]?.strokes || []), [...currentStroke.current]],
                          },
                        },
                      }));
                      setTempData((prev) => ({
                        ...prev,
                        [tab]: { ...prev[tab], [area]: { strokes: [] } },
                      }));
                      currentStroke.current = [];
                      setIsDrawing(false);
                    }
                    setMode("draw");
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    mode === "draw"
                      ? "bg-yellow-500 text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ✍ Draw
                </button>
                <button
                  onClick={() => {
                    if (isDrawing && area && currentStroke.current.length > 0) {
                      setData((prev) => ({
                        ...prev,
                        [tab]: {
                          ...prev[tab],
                          [area]: {
                            strokes: [...(prev[tab][area]?.strokes || []), [...currentStroke.current]],
                          },
                        },
                      }));
                      setTempData((prev) => ({
                        ...prev,
                        [tab]: { ...prev[tab], [area]: { strokes: [] } },
                      }));
                      currentStroke.current = [];
                      setIsDrawing(false);
                    }
                    setMode("view");
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    mode === "view"
                      ? "bg-blue-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  👁 View
                </button>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => {
                  const key = area || "default";
                  setData((prev) => {
                    const strokes = prev[tab][key]?.strokes || [];
                    return { ...prev, [tab]: { ...prev[tab], [key]: { strokes: strokes.slice(0, -1) } } };
                  });
                }}
                className="px-2 md:px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium transition-colors"
                title="Undo"
              >
                ↶
              </button>
              <button
                onClick={() => {
                  const key = area || "default";
                  setData((prev) => ({ ...prev, [tab]: { ...prev[tab], [key]: { strokes: [] } } }));
                }}
                className="px-2 md:px-3 py-1.5 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 text-xs font-medium transition-colors"
                title="Clear"
              >
                🗑
              </button>
              <button
                onClick={() => {
                  if (onSaveDiagnostic) {
                    const imageData = mergeCanvases();
                    if (imageData) {
                      onSaveDiagnostic({ imageData, strokes: data });
                      onClose();
                    }
                  }
                }}
                className="px-3 md:px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
              >
                💾 Save
              </button>
            </div>
          </div>

          {/* 3D Canvas - Diagnostic Imaging Viewport */}
          <div className="relative flex-1 bg-[#0a1628] overflow-hidden">
            {/* Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            ></div>
            
            {/* Canvas Border Effect */}
            <div className="absolute inset-2 md:inset-4 border-2 border-blue-500/20 rounded-lg pointer-events-none"></div>
            
            <Canvas ref={canvasRef} camera={{ fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
              <WebGLCanvasCapture webglRef={webglRef} />
              <ModelCenterer tab={tab} earRef={earRef} noseRef={noseRef} throatRef={throatRef} headRef={headRef} orbitRef={orbitRef} />
              <RotationAnimator targetRotation={targetRotation} headRef={headRef} />
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 5, 5]} />
              <OrbitControls
                ref={orbitRef}
                enableZoom
                enablePan={mode === "view"}
                enableRotate={mode === "view"}
                minDistance={2}
                maxDistance={100}
                enableDamping
                dampingFactor={0.1}
              />

              {/* Models */}
              <group ref={earRef} visible={tab === "Ear"} scale={MODEL_CONFIG.Ear.scale}><EarModel /></group>
              <group ref={noseRef} visible={tab === "Nose"} scale={MODEL_CONFIG.Nose.scale}><NoseModel /></group>
              <group ref={throatRef} visible={tab === "Throat"} scale={MODEL_CONFIG.Throat.scale}><ThroatModel /></group>
              <group ref={headRef} visible={tab === "Head"} scale={MODEL_CONFIG.Head.scale}><HeadModal /></group>

              {/* Hotspots */}
              {templates[tab].map((h) => (
                <mesh
                  key={h.name}
                  position={h.position}
                  onPointerDown={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setArea(h.name); }}
                >
                  <sphereGeometry args={[0.0, 0, 0]} />
                  <meshStandardMaterial color={area === h.name ? "yellow" : "red"} />
                </mesh>
              ))}

              {/* Transparent plane for 3D drawing - with depthWrite/depthTest disabled to not occlude model */}
              {mode === "draw" && (
                <mesh
                  position={[0, 0.8, 0]}
                  scale={[5, 5, 5]}
                  onPointerDown={start3DStroke}
                  onPointerMove={draw3DStroke}
                  onPointerUp={end3DStroke}
                >
                  <boxGeometry args={[1, 1, 1]} />
                  <meshBasicMaterial 
                    transparent 
                    opacity={0} 
                    depthWrite={false} 
                    depthTest={false} 
                  />
                </mesh>
              )}

              {/* Persistent 3D strokes */}
              {Object.entries(data).map(([t, areas]) =>
                Object.values(areas).map((a, i) =>
                  a.strokes.map((stroke, j) =>
                    stroke[0]?.is3D ? (
                      <Line
                        key={`persistent-${t}-${i}-${j}`}
                        points={smoothPointsRealtime(stroke)}
                        color={soapColor[stroke[0]?.soap ?? "O"]}
                        lineWidth={STROKE_WIDTH}
                        visible={t === tab}
                      />
                    ) : null
                  )
                )
              )}

              {/* Temporary 3D strokes */}
              {Object.values(tempData[tab]).map((a, i) =>
                a.strokes.map((stroke, j) =>
                  stroke[0]?.is3D ? (
                    <Line
                      key={`temp-${i}-${j}`}
                      points={smoothPointsRealtime(stroke)}
                      color={soapColor[stroke[0]?.soap ?? "O"]}
                      lineWidth={STROKE_WIDTH}
                    />
                  ) : null
                )
              )}
            </Canvas>

            {/* 2D overlay */}
            {mode === "draw" && (
              <canvas
                ref={overlayRef}
                className="absolute inset-0 w-full h-full pointer-events-auto"
                onPointerDown={start2DStroke}
                onPointerMove={draw2DStroke}
                onPointerUp={end2DStroke}
                onPointerLeave={end2DStroke}
              />
            )}

            {/* Viewport Label */}
            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${tab === "Ear" ? "bg-blue-500" : tab === "Nose" ? "bg-green-500" : tab === "Throat" ? "bg-orange-500" : "bg-purple-500"}`}></div>
                <span className="text-sm font-medium text-white">{tab} Anatomy</span>
                {area && (
                  <>
                    <span className="text-slate-500">/</span>
                    <span className="text-sm text-slate-300">{area}</span>
                  </>
                )}
              </div>
            </div>

            {/* Mode Indicator */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {mode === "draw" ? "✍ Drawing Mode" : "👁 View Mode"}
              </span>
            </div>
          </div>

          {/* Patient Image Capture Section - Only for Head Tab */}
          {["Head", "Ear", "Nose", "Throat"].includes(tab) && (
            <div className="bg-[#0a1628] border-t border-slate-700">
              {/* Collapsible Header */}
              <button
                onClick={() => setIsPatientImageCollapsed(!isPatientImageCollapsed)}
                className="w-full px-3 py-2 flex items-center justify-between bg-slate-800/50 hover:bg-slate-700/50 transition-colors border-b border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <span>📷</span>
                    Patient Image Capture
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {previewImage && (
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">
                      {uploadType}: 1
                    </span>
                  )}
                  <span className={`text-slate-400 transition-transform duration-300 ${isPatientImageCollapsed ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {/* Collapsible Content */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isPatientImageCollapsed ? 'max-h-0' : 'max-h-40'
                }`}
              >
                <div className="p-2 overflow-y-auto" style={{ maxHeight: '160px' }}>
                  {/* Hidden file input for upload */}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    id="patientImageUpload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />

                  {/* Conditional Rendering: Image Preview or Upload UI */}
                  {previewImage ? (
                    /* Uploaded Image Display - Small 120x120 Card */
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-28 h-28 bg-slate-900/80 rounded-lg border border-blue-500/40 p-1">
                        <img 
                          src={previewImage} 
                          alt="Patient upload preview" 
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                          {(['front', 'left', 'right'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => { 
                                setUploadType(type);
                                // Set target rotation based on orientation type
                                if (type === 'front') setTargetRotation(0);
                                else if (type === 'left') setTargetRotation(Math.PI / 2);
                                else if (type === 'right') setTargetRotation(-Math.PI / 2);
                              }}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                uploadType === type 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                              }`}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => handleRemoveImage(uploadType)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded transition-colors w-fit"
                        >
                          <span>🗑️</span>
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Upload Button and Placeholder Cards (when no image) - Compact */
                    <div className="flex items-center gap-3">
                      {/* Upload Button */}
                      <label
                        htmlFor="patientImageUpload"
                        className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors"
                      >
                        <span>📤</span>
                        Upload
                      </label>

                      {/* Placeholder Cards - Small 120x120 */}
                      <div className="flex gap-2 flex-1">
                        {/* Front View */}
                        <div 
                          className="flex-1 min-w-0 group cursor-pointer"
                          onClick={() => { setUploadType('front'); setTargetRotation(0); document.getElementById('patientImageUpload')?.click(); }}
                        >
                          <div className="aspect-square bg-slate-700/30 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center transition-all duration-200 group-hover:border-blue-500 group-hover:bg-slate-700/50 h-20">
                            <span className="text-xl text-slate-500 group-hover:text-blue-400">👤</span>
                            <span className="text-xs text-slate-400 group-hover:text-white">Front</span>
                          </div>
                        </div>

                        {/* Left Side */}
                        <div 
                          className="flex-1 min-w-0 group cursor-pointer"
                          onClick={() => { setUploadType('left'); setTargetRotation(Math.PI / 2); document.getElementById('patientImageUpload')?.click(); }}
                        >
                          <div className="aspect-square bg-slate-700/30 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center transition-all duration-200 group-hover:border-blue-500 group-hover:bg-slate-700/50 h-20">
                            <span className="text-xl text-slate-500 group-hover:text-blue-400">👈</span>
                            <span className="text-xs text-slate-400 group-hover:text-white">Left</span>
                          </div>
                        </div>

                        {/* Right Side */}
                        <div 
                          className="flex-1 min-w-0 group cursor-pointer"
                          onClick={() => { setUploadType('right'); setTargetRotation(-Math.PI / 2); document.getElementById('patientImageUpload')?.click(); }}
                        >
                          <div className="aspect-square bg-slate-700/30 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center transition-all duration-200 group-hover:border-blue-500 group-hover:bg-slate-700/50 h-20">
                            <span className="text-xl text-slate-500 group-hover:text-blue-400">👉</span>
                            <span className="text-xs text-slate-400 group-hover:text-white">Right</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR - Clinical Notes Panel */}
        <div className="w-64 md:w-72 lg:w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          <div className="p-3 md:p-4 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>📋</span>
              Clinical Notes
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
            {/* Quick Templates Section */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span>📝</span>
                Quick Templates
              </label>
              <div className="space-y-2">
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      clearTemplateSelection();
                    } else {
                      applyTemplate(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a template...</option>
                  {currentTemplates.map((template) => (
                    <option key={template.name} value={template.name}>
                      {template.name}
                    </option>
                  ))}
                </select>
                {selectedTemplate && (
                  <button
                    onClick={() => clearTemplateSelection()}
                    className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1"
                  >
                    ✕ Clear template
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Select a template to auto-fill clinical notes. You can edit the text after.
              </p>
            </div>

            {/* Findings Section */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Findings
              </label>
              <textarea
                value={clinicalNotes.findings}
                onChange={(e) => setClinicalNotes(prev => ({ ...prev, findings: e.target.value }))}
                placeholder="Document clinical findings..."
                className="w-full h-24 md:h-32 bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Impression Section */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Impression
              </label>
              <textarea
                value={clinicalNotes.impression}
                onChange={(e) => setClinicalNotes(prev => ({ ...prev, impression: e.target.value }))}
                placeholder="Clinical impression..."
                className="w-full h-24 md:h-32 bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Recommendation Section */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Recommendation
              </label>
              <textarea
                value={clinicalNotes.recommendation}
                onChange={(e) => setClinicalNotes(prev => ({ ...prev, recommendation: e.target.value }))}
                placeholder="Recommendations..."
                className="w-full h-24 md:h-32 bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-3 md:p-4 border-t border-slate-700 space-y-2">
            <button
              onClick={() => {
                if (onSaveFinding) {
                  const notesText = `Findings: ${clinicalNotes.findings}\n\nImpression: ${clinicalNotes.impression}\n\nRecommendation: ${clinicalNotes.recommendation}`;
                  onSaveFinding(notesText);
                }
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save Notes
            </button>
            <button
              onClick={() => {
                setClinicalNotes({ findings: "", impression: "", recommendation: "" });
              }}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              Clear Notes
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}