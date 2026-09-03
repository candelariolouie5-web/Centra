"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import SoapNoteModal from "./soapnotemodal";

type Prescription = {
  id?: string;
  medicationId?: string | null;
  generic: string;
  brandName?: string | null;
  quantity?: string | null;
  dosage?: string | null;
  instructions?: string | null;
};

type RawPrescription = {
  id?: string;
  medicationId?: string | null;
  generic?: string;
  drug?: string;
  brandName?: string;
  quantity?: string;
  dosage?: string;
  dose?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
};

type SoapNote = {
  id?: string;
  chiefComplaint?: string | null;
  historyOfIllness?: string | null;
  remarks?: string | null;
  diagnosis?: string | null;
  plan?: string | null;
  followUp?: string | null;
  imageData?: string | null;
  diagnosticImages?: string[];
  prescriptions?: Prescription[];
  createdAt?: string;
};

function getPrescriptionTitle(rx: Prescription) {
  return rx.brandName?.trim()
    ? `${rx.generic} (${rx.brandName})`
    : rx.generic;
}

function getPrescriptionMeta(rx: Prescription) {
  return [rx.quantity, rx.dosage].filter(Boolean).join(" • ");
}

function safeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function normalizeSoapNote(note: any): SoapNote | null {
  if (!note) return null;

  const rawPrescriptions = Array.isArray(note?.prescriptions)
    ? note.prescriptions
    : Array.isArray(note?.prescriptionsList)
      ? note.prescriptionsList
      : [];

  const prescriptions: Prescription[] = rawPrescriptions
    .map((rx: RawPrescription) => ({
      id: rx?.id,
      medicationId: rx?.medicationId ?? null,
      generic: safeText(rx?.generic || rx?.drug),
      brandName: safeText(rx?.brandName),
      quantity: safeText(rx?.quantity),
      dosage:
        safeText(rx?.dosage) ||
        [safeText(rx?.dose), safeText(rx?.frequency), safeText(rx?.duration)]
          .filter(Boolean)
          .join(" • "),
      instructions: safeText(rx?.instructions),
    }))
    .filter((rx) => rx.generic.trim().length > 0);

  const fallbackImage = safeText(note?.imageData);
  const diagnosticImages = normalizeStringArray(note?.diagnosticImages);

  return {
    id: note?.id,
    chiefComplaint: safeText(note?.chiefComplaint),
    historyOfIllness: safeText(note?.historyOfIllness),
    remarks: safeText(note?.remarks),
    diagnosis: safeText(note?.diagnosis),
    plan: safeText(note?.plan),
    followUp: safeText(note?.followUp),
    imageData: diagnosticImages[0] || fallbackImage || null,
    diagnosticImages:
      diagnosticImages.length > 0
        ? diagnosticImages
        : fallbackImage
          ? [fallbackImage]
          : [],
    prescriptions,
    createdAt: note?.createdAt,
  };
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

const PatientNotes = ({ patient }: any) => {
  const { data: session, status } = useSession();

  const [soapNotes, setSoapNotes] = useState<SoapNote[]>([]);
  const [selectedSoapNote, setSelectedSoapNote] = useState<SoapNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSoapModalOpen, setIsSoapModalOpen] = useState(false);

  const patientId = patient?.id;

  const fetchSoapNotes = useCallback(async () => {
    if (!patientId || status === "loading") return;

    const role = String(session?.user?.role || "").toUpperCase();

    if (role !== "ADMIN" && role !== "DOCTOR") {
      const note = normalizeSoapNote(patient?.soapNote);
      setSoapNotes(note ? [note] : []);
      setSelectedSoapNote(note);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const apiPath =
        role === "DOCTOR"
          ? `/api/doctor/soap-notes?patientId=${patientId}`
          : `/api/admin/soap-notes?patientId=${patientId}`;

      const res = await fetch(apiPath, { cache: "no-store" });
      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load SOAP notes");
      }

      const notes = Array.isArray(data?.soapNotes) ? data.soapNotes : [];
      const normalizedNotes = notes.map(normalizeSoapNote).filter(Boolean) as SoapNote[];

      setSoapNotes(normalizedNotes);

      if (normalizedNotes.length > 0) {
        setSelectedSoapNote(normalizedNotes[0]);
      } else {
        const fallback = normalizeSoapNote(patient?.soapNote);
        setSelectedSoapNote(fallback);
        if (fallback) {
          setSoapNotes([fallback]);
        }
      }
    } catch (err) {
      console.error("[PATIENT-NOTES-FETCH-ERROR]", err);
      setError(err instanceof Error ? err.message : "Failed to load SOAP notes");
      const fallback = normalizeSoapNote(patient?.soapNote);
      setSelectedSoapNote(fallback);
      if (fallback) {
        setSoapNotes([fallback]);
      }
    } finally {
      setLoading(false);
    }
  }, [patientId, patient?.soapNote, session?.user?.role, status]);

  useEffect(() => {
    void fetchSoapNotes();
  }, [fetchSoapNotes]);

  useEffect(() => {
    const handleSoapSaved = (event: Event) => {
      const customEvent = event as CustomEvent<{ patientId?: string }>;
      if (customEvent.detail?.patientId === patientId) {
        void fetchSoapNotes();
      }
    };

    window.addEventListener("soap-note-saved", handleSoapSaved as EventListener);
    return () => {
      window.removeEventListener(
        "soap-note-saved",
        handleSoapSaved as EventListener
      );
    };
  }, [fetchSoapNotes, patientId]);

  const handleSoapNoteSaved = () => {
    void fetchSoapNotes();
  };

  const renderPrescriptions = (prescriptions?: Prescription[]) => {
    if (!prescriptions || prescriptions.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Prescriptions
        </p>
        {prescriptions.map((rx, idx) => (
          <div
            key={rx.id || idx}
            className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3"
          >
            <p className="text-sm font-semibold text-amber-900">
              {getPrescriptionTitle(rx)}
            </p>
            {!!getPrescriptionMeta(rx) && (
              <p className="text-xs text-amber-700">
                {getPrescriptionMeta(rx)}
              </p>
            )}
            {rx.instructions?.trim() && (
              <p className="mt-1 text-xs text-amber-800">{rx.instructions}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderDiagnosticImages = (diagnosticImages?: string[]) => {
    if (!diagnosticImages || diagnosticImages.length === 0) return null;

    return (
      <div className="grid gap-3 sm:grid-cols-2 mt-2">
        {diagnosticImages.map((image, index) => (
          <button
            key={`${index}-${image.slice(0, 20)}`}
            type="button"
            onClick={() => setPreviewImage(image)}
            className="block w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-left transition hover:border-cyan-400 hover:shadow-sm"
          >
            <img
              src={image}
              alt={`Diagnostic image ${index + 1}`}
              className="mx-auto block max-h-48 w-full rounded object-contain shadow-sm"
            />
            <p className="mt-2 text-xs text-gray-500">Click to preview</p>
          </button>
        ))}
      </div>
    );
  };

  const renderSoapNoteCard = (note: SoapNote, index: number) => {
    const isSelected = selectedSoapNote?.id === note.id;

    return (
      <div
        key={note.id || index}
        className={`rounded-xl border transition cursor-pointer ${
          isSelected
            ? "border-cyan-400 bg-cyan-50/70 ring-2 ring-cyan-200"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
        }`}
        onClick={() => setSelectedSoapNote(note)}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                {index + 1}
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {note.createdAt
                  ? new Date(note.createdAt).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Date unknown"}
              </span>
              {note.createdAt && (
                <span className="text-xs text-slate-400">
                  {new Date(note.createdAt).toLocaleTimeString("en-PH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            {note.chiefComplaint && (
              <span className="text-xs text-slate-500 truncate max-w-[200px]">
                {note.chiefComplaint}
              </span>
            )}
          </div>

          {isSelected && (
            <div className="mt-3 space-y-3 border-t border-slate-200 pt-3">
              {note.chiefComplaint && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Chief Complaint
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {note.chiefComplaint}
                  </p>
                </div>
              )}

              {note.historyOfIllness && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    History of Present Illness
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {note.historyOfIllness}
                  </p>
                </div>
              )}

              {note.remarks && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Remarks
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {note.remarks}
                  </p>
                </div>
              )}

              {note.diagnosis && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Diagnosis
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {note.diagnosis}
                  </p>
                  {renderDiagnosticImages(note.diagnosticImages)}
                </div>
              )}

              {note.plan && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Plan
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {note.plan}
                  </p>
                </div>
              )}

              {note.followUp && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Follow-up
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {note.followUp}
                  </p>
                </div>
              )}

              {renderPrescriptions(note.prescriptions)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">
              {soapNotes.length > 0
                ? `${soapNotes.length} consultation(s) recorded`
                : "No consultations recorded yet"}
            </p>
            {loading && (
              <p className="mt-1 text-xs text-blue-600">Loading consultations...</p>
            )}
            {!!error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
      
        </div>

        {/* Loading State */}
        {loading && soapNotes.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            <span className="ml-3 text-sm text-slate-500">Loading consultations...</span>
          </div>
        )}

        {/* No Notes State */}
        {!loading && !error && soapNotes.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
            <p className="text-sm text-slate-500">
              No SOAP notes found for this patient.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Click the "Add SOAP Note" button to create the first consultation record.
            </p>
          </div>
        )}

        {/* SOAP Notes List */}
        {!loading && soapNotes.length > 0 && (
          <div className="space-y-3">
            {soapNotes.map((note, index) => renderSoapNoteCard(note, index))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-slate-100"
            >
              Close
            </button>

            <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-2xl">
              <img
                src={previewImage}
                alt="Diagnostic preview"
                className="max-h-[85vh] w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* SOAP Note Modal */}
      <SoapNoteModal
        open={isSoapModalOpen}
        onClose={() => {
          setIsSoapModalOpen(false);
          handleSoapNoteSaved();
        }}
        patient={patient}
        onSaved={handleSoapNoteSaved}
      />
    </>
  );
};

export default PatientNotes;