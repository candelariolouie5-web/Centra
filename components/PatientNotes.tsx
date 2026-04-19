
"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Prescription = {
  id?: string;
  medicationId?: string | null;
  generic: string;
  brandName?: string | null;
  quantity?: string | null;
  dosage?: string | null;
  instructions?: string | null;
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
    .map((rx: any) => ({
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

  const [soapNote, setSoapNote] = useState<SoapNote | null>(
    normalizeSoapNote(patient?.soapNote)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const patientId = patient?.id;

  const fetchLatestSoapNote = useCallback(async () => {
    if (!patientId || status === "loading") return;

    const role = String(session?.user?.role || "").toUpperCase();

    if (role !== "ADMIN" && role !== "DOCTOR") {
      setSoapNote(normalizeSoapNote(patient?.soapNote));
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
        throw new Error(data?.error || "Failed to load SOAP note");
      }

      const latest = Array.isArray(data?.soapNotes) ? data.soapNotes[0] : null;

      if (latest) {
        setSoapNote(normalizeSoapNote(latest));
      } else {
        setSoapNote(normalizeSoapNote(patient?.soapNote));
      }
    } catch (err) {
      console.error("[PATIENT-NOTES-FETCH-ERROR]", err);
      setError(err instanceof Error ? err.message : "Failed to load SOAP note");
      setSoapNote(normalizeSoapNote(patient?.soapNote));
    } finally {
      setLoading(false);
    }
  }, [patientId, patient?.soapNote, session?.user?.role, status]);

  useEffect(() => {
    setSoapNote(normalizeSoapNote(patient?.soapNote));
  }, [patient?.soapNote, patientId]);

  useEffect(() => {
    void fetchLatestSoapNote();
  }, [fetchLatestSoapNote]);

  useEffect(() => {
    const handleSoapSaved = (event: Event) => {
      const customEvent = event as CustomEvent<{ patientId?: string }>;
      if (customEvent.detail?.patientId === patientId) {
        void fetchLatestSoapNote();
      }
    };

    window.addEventListener("soap-note-saved", handleSoapSaved as EventListener);
    return () => {
      window.removeEventListener(
        "soap-note-saved",
        handleSoapSaved as EventListener
      );
    };
  }, [fetchLatestSoapNote, patientId]);

  return (
    <>
      <div>
        <div className="px-4 sm:px-0">
          <h3 className="text-base font-semibold text-black">Patient Notes</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Additional information, prescriptions, and attachments.
          </p>
          {loading && (
            <p className="mt-2 text-xs text-blue-600">Loading latest SOAP note...</p>
          )}
          {!!error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>

        <div className="mt-6 border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="grid grid-cols-3 gap-4 px-4 py-6">
              <dt className="text-sm font-medium text-gray-600">Chief Complaint</dt>
              <dd className="col-span-2 whitespace-pre-wrap text-sm text-gray-800">
                {soapNote?.chiefComplaint || "—"}
              </dd>
            </div>

            <div className="grid grid-cols-3 gap-4 px-4 py-6">
              <dt className="text-sm font-medium text-gray-600">
                History of Present Illness
              </dt>
              <dd className="col-span-2 whitespace-pre-wrap text-sm text-gray-800">
                {soapNote?.historyOfIllness || "—"}
              </dd>
            </div>

            <div className="grid grid-cols-3 gap-4 px-4 py-6">
              <dt className="text-sm font-medium text-gray-600">Remarks</dt>
              <dd className="col-span-2 whitespace-pre-wrap text-sm text-gray-800">
                {soapNote?.remarks || "—"}
              </dd>
            </div>

            <div className="grid grid-cols-3 gap-4 px-4 py-6">
              <dt className="text-sm font-medium text-gray-600">Diagnosis</dt>
              <dd className="col-span-2 space-y-3 text-sm text-gray-800">
                <p className="whitespace-pre-wrap">{soapNote?.diagnosis || "—"}</p>

                {soapNote?.diagnosticImages &&
                  soapNote.diagnosticImages.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {soapNote.diagnosticImages.map((image, index) => (
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
                          <p className="mt-2 text-xs text-gray-500">
                            Click to preview
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
              </dd>
            </div>

            <div className="grid grid-cols-3 gap-4 px-4 py-6">
              <dt className="text-sm font-medium text-gray-600">Prescriptions</dt>
              <dd className="col-span-2">
                {soapNote?.prescriptions && soapNote.prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {soapNote.prescriptions.map((rx, index) => (
                      <div
                        key={rx.id || index}
                        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
                      >
                        <p className="font-semibold text-amber-900">
                          {getPrescriptionTitle(rx)}
                        </p>

                        {!!getPrescriptionMeta(rx) && (
                          <p className="mt-1 text-sm text-amber-800">
                            {getPrescriptionMeta(rx)}
                          </p>
                        )}

                        {!!rx.instructions?.trim() && (
                          <p className="mt-1 text-sm text-amber-700">
                            {rx.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-800">—</p>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

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
    </>
  );
};

export default PatientNotes;
