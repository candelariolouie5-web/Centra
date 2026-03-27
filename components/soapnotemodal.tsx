"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ActionChips } from "./UIHelpers";
import PrescriptionModal, { Prescription } from "./PrescriptionModal";
import HeadTemplateModal from "./HeadTemplateModal";
import EducationalMaterialModal from "./EducationalMaterialModal";
import { EducationalMaterial } from "@/types/EducationalMaterial";
import html2canvas from "html2canvas";
import ClinicalRoom from "./ClinicalRoom";
import jsPDF from "jspdf";

type Patient = {
  name: string;
  id?: string;
};

type Diagnostic = {
  imageData: string;
  strokes: Record<string, Record<string, { strokes: any[][] }>>;
};

type RoomType = "ENT" | "Aesthetics" | "Consultation";

type ScheduledProcedure = {
  procedureType: string;
  appointmentDate: string;
  appointmentTime: string;
  room?: RoomType | string | null;
  notes?: string;
  doctor?: string;
  estimatedTime?: string;
};

type TextAreaFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
};

const ROOM_LABELS: Record<RoomType, string> = {
  ENT: "ENT Room",
  Aesthetics: "Aesthetics Room",
  Consultation: "Consultation Room",
};

const PROCEDURE_LABELS: Record<string, string> = {
  ear: "Ear",
  nose: "Nose",
  throat: "Throat",
  aesthetics: "Aesthetics",
  consultation: "Consultation",
  ent: "ENT",
};

const FOLLOW_UP_MARKER = "Follow-up appointment:";

function TextAreaField({
  id,
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
}: TextAreaFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
      >
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        title={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
      />
    </div>
  );
}

function SectionCard({
  title,
  accent,
  subtitle,
  children,
}: {
  title: string;
  accent: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="mb-4 flex items-start gap-3">
        <div className={`mt-1 h-10 w-1.5 rounded-full ${accent}`} />
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-800">
            {title}
          </h3>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function PreviewBlock({
  title,
  value,
  empty,
}: {
  title: string;
  value: string;
  empty: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
      <p className="min-h-[20px] whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value || <span className="italic text-slate-300">{empty}</span>}
      </p>
    </div>
  );
}

function isRoomType(value: unknown): value is RoomType {
  return value === "ENT" || value === "Aesthetics" || value === "Consultation";
}

function formatProcedureLabel(value: string | undefined | null) {
  const trimmed = value?.trim();
  if (!trimmed) return "Procedure";

  const normalized = trimmed.toLowerCase();
  if (PROCEDURE_LABELS[normalized]) {
    return PROCEDURE_LABELS[normalized];
  }

  return trimmed
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDisplayDate(value: string) {
  if (!value) return "Date TBD";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDisplayTime(value: string) {
  if (!value) return "Time TBD";

  if (/[AP]M/i.test(value)) {
    return value.toUpperCase();
  }

  if (/^\d{1,2}:\d{2}$/.test(value)) {
    const [hours, minutes] = value.split(":").map(Number);
    const parsed = new Date();
    parsed.setHours(hours, minutes, 0, 0);

    return parsed.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return value;
}

function formatRoomLabel(value?: string | RoomType | null) {
  if (!value) return "Auto-assign room";
  if (isRoomType(value)) return ROOM_LABELS[value];
  return value;
}

function buildScheduleSummary(schedule: ScheduledProcedure) {
  const procedurePart = schedule.procedureType
    ? `${formatProcedureLabel(schedule.procedureType)} procedure`
    : "Procedure";

  const datePart = schedule.appointmentDate
    ? `on ${formatDisplayDate(schedule.appointmentDate)}`
    : "on a date to be set";

  const timePart = schedule.appointmentTime
    ? `at ${formatDisplayTime(schedule.appointmentTime)}`
    : "at a time to be set";

  const roomPart = schedule.room ? `in ${formatRoomLabel(schedule.room)}` : "";

  return [procedurePart, datePart, timePart, roomPart].filter(Boolean).join(" ");
}

function upsertLine(
  text: string,
  nextLine: string,
  matcher: (line: string) => boolean
) {
  const lines = text
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  let replaced = false;

  const updated = lines.map((line) => {
    if (matcher(line)) {
      replaced = true;
      return nextLine;
    }

    return line;
  });

  if (!replaced) {
    updated.push(nextLine);
  }

  return updated.join("\n");
}

function removeMatchingLines(text: string, matcher: (line: string) => boolean) {
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0 && !matcher(line))
    .join("\n");
}

function isFollowUpScheduleLine(line: string) {
  return line.trim().toLowerCase().startsWith(FOLLOW_UP_MARKER.toLowerCase());
}

function isPlanScheduleLine(line: string) {
  return line
    .trim()
    .replace(/^[-•]\s*/, "")
    .toLowerCase()
    .startsWith(FOLLOW_UP_MARKER.toLowerCase());
}

const SoapNoteModal = ({
  open,
  onClose,
  patient,
}: {
  open: boolean;
  onClose: () => void;
  patient: Patient | null;
}) => {
  const { data: session } = useSession();

  const [openPrescription, setOpenPrescription] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [open3DModal, setOpen3DModal] = useState(false);
  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [openEducationalMaterial, setOpenEducationalMaterial] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<EducationalMaterial[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [scheduledProcedure, setScheduledProcedure] =
    useState<ScheduledProcedure | null>(null);

  const [diagnosis, setDiagnosis] = useState("");
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState("");
  const [remarks, setRemarks] = useState("");
  const [plan, setPlan] = useState("");
  const [followUp, setFollowUp] = useState("");

  const [showPreview, setShowPreview] = useState(false);

  const storageKey = useMemo(
    () => `soap-note:${patient?.id ?? "temp"}`,
    [patient?.id]
  );

  const resetDraftFields = () => {
    setDiagnosis("");
    setChiefComplaint("");
    setHistoryOfPresentIllness("");
    setRemarks("");
    setPlan("");
    setFollowUp("");
    setSelectedRoom(null);
    setScheduledProcedure(null);
    setError(null);
  };

  const clearScheduledProcedure = () => {
    setScheduledProcedure(null);
    setSelectedRoom(null);
    setFollowUp((prev: string) => removeMatchingLines(prev, isFollowUpScheduleLine));
    setPlan((prev: string) => removeMatchingLines(prev, isPlanScheduleLine));
  };

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      resetDraftFields();
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setDiagnosis(parsed.diagnosis ?? "");
      setChiefComplaint(parsed.chiefComplaint ?? "");
      setHistoryOfPresentIllness(parsed.historyOfPresentIllness ?? "");
      setRemarks(parsed.remarks ?? "");
      setPlan(parsed.plan ?? "");
      setFollowUp(parsed.followUp ?? "");
      setSelectedRoom(
        parsed.selectedRoom && isRoomType(parsed.selectedRoom)
          ? parsed.selectedRoom
          : null
      );
      setScheduledProcedure(parsed.scheduledProcedure ?? null);
      setError(null);
    } catch {
      resetDraftFields();
    }
  }, [open, storageKey]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        diagnosis,
        chiefComplaint,
        historyOfPresentIllness,
        remarks,
        plan,
        followUp,
        selectedRoom,
        scheduledProcedure,
      })
    );
  }, [
    open,
    storageKey,
    diagnosis,
    chiefComplaint,
    historyOfPresentIllness,
    remarks,
    plan,
    followUp,
    selectedRoom,
    scheduledProcedure,
  ]);

  if (!open || !patient) return null;

  const handleAddOrUpdatePrescription = (rx: Prescription) => {
    if (editingIndex !== null) {
      setPrescriptions((prev: Prescription[]) =>
        prev.map((p: Prescription, i: number) => (i === editingIndex ? rx : p))
      );
      setEditingIndex(null);
    } else {
      setPrescriptions((prev: Prescription[]) => [...prev, rx]);
    }
    setOpenPrescription(false);
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setOpenPrescription(true);
  };

  const handleDelete = (idx: number) => {
    if (confirm("Delete this prescription?")) {
      setPrescriptions((prev: Prescription[]) =>
        prev.filter((_: Prescription, i: number) => i !== idx)
      );
    }
  };

  const handleRemoveMaterial = (idx: number) => {
    if (confirm("Remove this educational material?")) {
      setSelectedMaterials((prev: EducationalMaterial[]) =>
        prev.filter((_: EducationalMaterial, i: number) => i !== idx)
      );
    }
  };

  const handleSaveNote = async () => {
    setError(null);

    try {
      const payload = {
        patientId: patient.id,
        chiefComplaint,
        historyOfIllness: historyOfPresentIllness,
        remarks,
        diagnosis,
        plan,
        followUp,
        imageData: diagnostics[0]?.imageData || null,
        prescriptions,
      };

      const userRole = String(session?.user?.role || "").toUpperCase();

      if (userRole !== "ADMIN" && userRole !== "DOCTOR") {
        const roleError = "Unauthorized role for SOAP note saving";
        setError(roleError);
        alert(roleError);
        return;
      }

      const apiPath =
        userRole === "DOCTOR"
          ? "/api/doctor/soap-notes"
          : "/api/admin/soap-notes";

      console.log("[SOAP-SAVE-CONTEXT]", {
        sessionRole: userRole,
        apiPath,
        patientId: patient.id,
      });

      console.log("[SOAP-SAVE-PAYLOAD]", payload);

      const response = await fetch(apiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("[SOAP-SAVE-RESPONSE]", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let jsonErrorData: any = null;
        let errorTextContent = "";

        if (contentType.includes("application/json")) {
          try {
            jsonErrorData = await response.json();
          } catch (parseErr) {
            console.error("[SOAP-JSON-PARSE-ERROR]", parseErr);
          }
        } else {
          errorTextContent = await response.text();
          console.log("[SOAP-ERROR-NON-JSON]", errorTextContent.substring(0, 500));
        }

        console.error("[SOAP-SAVE-ERROR]", {
          status: response.status,
          statusText: response.statusText,
          jsonErrorData,
          htmlError: !!errorTextContent,
          errorTextPreview: errorTextContent.substring(0, 200),
        });

        const errorMessage =
          jsonErrorData?.error ||
          (errorTextContent
            ? `Server Error (${response.status}): ${errorTextContent.substring(0, 100)}...`
            : `HTTP ${response.status}: ${response.statusText}`);

        setError(errorMessage);
        alert(jsonErrorData?.error || `Failed to save SOAP Note: ${errorMessage}`);
        return;
      }

      alert("SOAP Note saved successfully!");
      setShowPreview(true);
      onClose();
    } catch (error: any) {
      console.error("[SOAP-SAVE-CATCH]", error);
      setError(`Network error: ${error?.message || "Unknown error"}`);
      alert("Network error - please check connection and try again");
    }
  };

  const handleShowPreview = () => {
    setShowPreview(true);
  };

  const handleExportPDF = async () => {
    const modalEl = document.getElementById("soap-modal-content");
    if (!modalEl) return;

    const canvas = await html2canvas(modalEl, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`SOAP_Report_${patient.name}.pdf`);
  };

  const handleSaveDiagnostic = (diagnostic: Diagnostic) => {
    setDiagnostics((prev: Diagnostic[]) => [...prev, diagnostic]);
    if (!diagnosis.trim()) {
      setDiagnosis("Diagnostic findings");
    }
  };

  const handleRoomSelect = (room: RoomType) => {
    setSelectedRoom(room);

    if (scheduledProcedure) {
      setScheduledProcedure((prev) =>
        prev
          ? {
              ...prev,
              room,
            }
          : prev
      );
    }

    setOpenRoomModal(false);
  };

  const handleScheduleProcedure = (data: any) => {
    const normalized: ScheduledProcedure = {
      procedureType: data.serviceType || data.procedureType || "Procedure",
      appointmentDate: data.appointmentDate || data.date || "",
      appointmentTime: data.appointmentTime || data.time || "",
      room: data.room || data.roomType || null,
      notes: data.notes || "",
      doctor: patient.name || "Doctor",
    };

    const normalizedRoom =
      normalized.room && isRoomType(normalized.room as any)
        ? (normalized.room as RoomType)
        : null;

    if (normalizedRoom) setSelectedRoom(normalizedRoom);

    setScheduledProcedure(normalized);

    const summary = buildScheduleSummary(normalized);
    const nextFollowUpLine = `${FOLLOW_UP_MARKER} ${summary}`;
    const nextPlanLine = `• ${FOLLOW_UP_MARKER} ${summary}`;

    setFollowUp((prev: string) =>
      upsertLine(prev, nextFollowUpLine, isFollowUpScheduleLine)
    );
    setPlan((prev: string) =>
      upsertLine(prev, nextPlanLine, isPlanScheduleLine)
    );
    setOpenRoomModal(false);
  };

  const selectedRoomLabel = scheduledProcedure?.room
    ? formatRoomLabel(scheduledProcedure.room)
    : selectedRoom
      ? ROOM_LABELS[selectedRoom]
      : null;

  const renderScheduleSummaryCard = () => {
    if (!scheduledProcedure) {
      return (
        <div className="rounded-2xl border border-dashed border-cyan-200 bg-white px-4 py-4 text-sm text-slate-500">
          <p className="font-semibold text-slate-700">
            No follow-up appointment scheduled yet.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Use this order: <span className="font-semibold">Procedure → Date → Time → Room</span>
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Scheduled Follow-up
            </p>
            <p className="mt-1 text-sm text-emerald-900">
              {buildScheduleSummary(scheduledProcedure)}
            </p>
          </div>

          <button
            type="button"
            onClick={clearScheduledProcedure}
            className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Clear
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Procedure
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatProcedureLabel(scheduledProcedure.procedureType)}
            </p>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Date
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatDisplayDate(scheduledProcedure.appointmentDate)}
            </p>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Time
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatDisplayTime(scheduledProcedure.appointmentTime)}
            </p>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Room
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {selectedRoomLabel ?? "Auto-assign room"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderPreview = () => (
    <div className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">SOAP Note Preview</h3>
            <p className="text-sm text-cyan-100">{patient.name}</p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
            Live
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-violet-500">
            Subjective
          </p>
          <div className="space-y-4">
            <PreviewBlock
              title="Chief Complaint"
              value={chiefComplaint}
              empty="No complaint recorded"
            />
            <PreviewBlock
              title="History of Present Illness"
              value={historyOfPresentIllness}
              empty="No history recorded"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">
            Objective
          </p>
          <PreviewBlock
            title="Physical Exam Findings"
            value={remarks}
            empty="No remarks recorded"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-500">
            Assessment
          </p>
          <PreviewBlock
            title="Diagnosis"
            value={diagnosis}
            empty="No diagnosis recorded"
          />

          {diagnostics.length > 0 && (
            <div className="mt-4 space-y-4">
              {diagnostics.map((d, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <img
                    src={d.imageData}
                    alt="Diagnostic"
                    className="max-h-[420px] w-full object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-500">
            Plan
          </p>
          <div className="space-y-4">
            <PreviewBlock
              title="Treatment Plan"
              value={plan}
              empty="No plan recorded"
            />

            {prescriptions.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Prescriptions
                </p>
                {prescriptions.map((rx, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-amber-900">{rx.drug}</p>
                    <p className="text-xs text-amber-700">
                      {rx.dose} · {rx.frequency} · {rx.duration}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {selectedMaterials.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Educational Materials
                </p>
                {selectedMaterials.map((material, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3"
                  >
                    {material.thumbnail && (
                      <img
                        src={material.thumbnail}
                        alt={material.title}
                        className="h-10 w-10 rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-blue-900">{material.title}</p>
                      <p className="text-xs text-blue-700">{material.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <PreviewBlock
                title="Follow-up"
                value={followUp}
                empty="No follow-up scheduled"
              />

              {scheduledProcedure && (
                <div className="grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Procedure
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatProcedureLabel(scheduledProcedure.procedureType)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Date
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDisplayDate(scheduledProcedure.appointmentDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Time
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDisplayTime(scheduledProcedure.appointmentTime)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Room
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedRoomLabel ?? "Auto-assign room"}
                    </p>
                  </div>
                </div>
              )}

              {!scheduledProcedure && selectedRoomLabel && (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  📍 {selectedRoomLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-md">
        <div className="flex max-h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_30px_90px_rgba(2,8,23,0.22)]">
          <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.10),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_22%),linear-gradient(to_right,_#ffffff,_#f8fbff)] px-5 py-5 sm:px-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
                  Patient Note Workspace
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  SOAP Note
                </h2>
                <p className="mt-1 text-sm text-slate-500">{patient.name}</p>
              </div>

              <button
                onClick={onClose}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                type="button"
              >
                Close
              </button>
            </div>
          </div>

          <div
            id="soap-modal-content"
            className="flex-1 overflow-y-auto bg-[linear-gradient(to_bottom,_#f8fbff,_#ffffff)]"
          >
            <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="overflow-y-auto p-4 sm:p-6">
                <div className="space-y-6">
                  <SectionCard
                    title="Subjective"
                    accent="bg-violet-500"
                    subtitle="Document the patient's main concerns and history."
                  >
                    <div className="space-y-4">
                      <TextAreaField
                        id="chiefComplaint"
                        label="Chief Complaint"
                        placeholder="Enter patient's chief complaint"
                        value={chiefComplaint}
                        onChange={setChiefComplaint}
                      />

                      <TextAreaField
                        id="historyOfPresentIllness"
                        label="History of Present Illness"
                        placeholder="Describe symptoms, duration, onset..."
                        value={historyOfPresentIllness}
                        onChange={setHistoryOfPresentIllness}
                        rows={5}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Objective"
                    accent="bg-emerald-500"
                    subtitle="Record physical exam findings and other observed details."
                  >
                    <TextAreaField
                      id="remarks"
                      label="Remarks"
                      placeholder="Physical exam findings..."
                      value={remarks}
                      onChange={setRemarks}
                      rows={5}
                    />
                  </SectionCard>

                  <SectionCard
                    title="Assessment"
                    accent="bg-amber-500"
                    subtitle="Save diagnoses and body diagram findings."
                  >
                    <div className="space-y-4">
                      <TextAreaField
                        id="diagnosis"
                        label="Diagnosis"
                        placeholder="Diagnosis / impression"
                        value={diagnosis}
                        onChange={setDiagnosis}
                        rows={4}
                      />

                      <ActionChips
                        options={["Add Diagnosis"]}
                        onSelect={() => setOpen3DModal(true)}
                      />

                      {diagnostics.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {diagnostics.map((d, i) => (
                            <div
                              key={i}
                              className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2"
                            >
                              <img
                                src={d.imageData}
                                alt="Diagnostic"
                                className="h-56 w-full rounded-xl object-contain"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Plan"
                    accent="bg-cyan-500"
                    subtitle="Create prescriptions, attach materials, and set follow-up plans."
                  >
                    <div className="space-y-4">
                      <TextAreaField
                        id="plan"
                        label="Plan"
                        placeholder="Treatment plan"
                        value={plan}
                        onChange={setPlan}
                        rows={4}
                      />

                      <ActionChips
                        options={["Add Prescription", "Add Educational Material"]}
                        onSelect={(option) => {
                          if (option === "Add Prescription") {
                            setOpenPrescription(true);
                          } else if (option === "Add Educational Material") {
                            setOpenEducationalMaterial(true);
                          }
                        }}
                      />

                      {prescriptions.length > 0 && (
                        <div className="space-y-3">
                          {prescriptions.map((rx, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <p className="font-semibold text-slate-900">{rx.drug}</p>
                                <p className="text-sm text-slate-600">
                                  {rx.dose} · {rx.frequency} · {rx.duration}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(idx)}
                                  className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                  type="button"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(idx)}
                                  className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                                  type="button"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedMaterials.length > 0 && (
                        <div className="space-y-3">
                          {selectedMaterials.map((material, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex items-center gap-3">
                                {material.thumbnail && (
                                  <img
                                    src={material.thumbnail}
                                    alt={material.title}
                                    className="h-14 w-14 rounded-2xl object-cover shadow-sm"
                                  />
                                )}
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {material.title}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {material.category}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleRemoveMaterial(idx)}
                                className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                                type="button"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <TextAreaField
                          id="followUp"
                          label="Follow-up"
                          placeholder="Follow-up notes or next visit instructions"
                          value={followUp}
                          onChange={setFollowUp}
                          rows={3}
                        />

                        <div className="mt-4 rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/50 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-700">
                                Appointment Flow
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                Procedure → Date → Time → Room
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Room should be last, or auto-assigned if only one room fits.
                              </p>
                            </div>

                            <div className="shrink-0">
                              <ActionChips
                                options={[
                                  scheduledProcedure
                                    ? "Reschedule Procedure"
                                    : "Schedule Procedure",
                                ]}
                                onSelect={() => setOpenRoomModal(true)}
                              />
                            </div>
                          </div>

                          <div className="mt-4">{renderScheduleSummaryCard()}</div>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              </div>

              <div className="hidden overflow-y-auto border-l border-slate-200 bg-[linear-gradient(to_bottom,_#f8fafc,_#eef6ff)] p-6 lg:block">
                <div className="sticky top-0">
                  {showPreview ? (
                    renderPreview()
                  ) : (
                    <div className="flex h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/80 text-center shadow-sm">
                      <div className="mb-4 rounded-full bg-sky-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                        Live Preview
                      </div>
                      <p className="text-base font-semibold text-slate-700">
                        Your SOAP preview will appear here
                      </p>
                      <p className="mt-2 max-w-xs text-sm text-slate-400">
                        Click the Preview button below to generate the right-side preview panel.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 p-4 lg:hidden">
                <details className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700">
                    Open Live Preview
                  </summary>
                  <div className="border-t border-slate-200 p-4">{renderPreview()}</div>
                </details>
              </div>
            </div>
          </div>

          {error && (
            <div className="border-t border-red-200 bg-red-50/80 p-4">
              <div className="flex items-start gap-2 text-sm text-red-800">
                <span className="mt-0.5 h-4 w-4 shrink-0 text-red-500">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-white/90 px-5 py-4 backdrop-blur sm:px-6">
            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleShowPreview}
              className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              type="button"
            >
              Preview
            </button>
            <button
              onClick={handleExportPDF}
              className="rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
              type="button"
            >
              Export PDF
            </button>
            <button
              onClick={handleSaveNote}
              className="rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-violet-700"
              disabled={!!error}
              type="button"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>

      <PrescriptionModal
        open={openPrescription}
        onClose={() => {
          setOpenPrescription(false);
          setEditingIndex(null);
        }}
        onSave={handleAddOrUpdatePrescription}
        defaultValues={editingIndex !== null ? prescriptions[editingIndex] : undefined}
      />

      {open3DModal && patient && (
        <HeadTemplateModal
          open={open3DModal}
          onClose={() => setOpen3DModal(false)}
          patientId={patient.id || "temp"}
          onSaveFinding={(text) =>
            setDiagnosis((prev) => (prev ? `${prev}; ${text}` : text))
          }
          onExport={handleExportPDF}
          onSaveDiagnostic={handleSaveDiagnostic}
        />
      )}

      <EducationalMaterialModal
        open={openEducationalMaterial}
        onClose={() => setOpenEducationalMaterial(false)}
        onAttach={(materials) => {
          setSelectedMaterials(materials);
          setOpenEducationalMaterial(false);
        }}
        selected={selectedMaterials}
      />

      <ClinicalRoom
        open={openRoomModal}
        onClose={() => setOpenRoomModal(false)}
        onSelectRoom={handleRoomSelect}
        onSelectSchedule={handleScheduleProcedure}
        patientId={patient.id}
        patientName={patient.name}
        selectedRoom={selectedRoom || undefined}
      />
    </>
  );
};

export default SoapNoteModal;