"use client";

import { useEffect, useState } from "react";
import { FieldBlock, ActionChips } from "./UIHelpers";
import PrescriptionModal, { Prescription } from "./PrescriptionModal";
import HeadTemplateModal from "./HeadTemplateModal";
import EducationalMaterialModal from "./EducationalMaterialModal";
import { EducationalMaterial } from "@/types/EducationalMaterial";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Patient = {
  name: string;
  id?: string;
};

type Diagnostic = {
  imageData: string;
  strokes: Record<string, Record<string, { strokes: any[][] }>>;
};

const SoapNoteModal = ({
  open,
  onClose,
  patient,
}: {
  open: boolean;
  onClose: () => void;
  patient: Patient | null;
}) => {
  const [openPrescription, setOpenPrescription] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [open3DModal, setOpen3DModal] = useState(false);
  const [openEducationalMaterial, setOpenEducationalMaterial] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<
    EducationalMaterial[]
  >([]);

  const [diagnosis, setDiagnosis] = useState("");
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState("");
  const [remarks, setRemarks] = useState("");
  const [plan, setPlan] = useState("");
  const [followUp, setFollowUp] = useState("");

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDiagnosis(localStorage.getItem("diagnosis") ?? "");
      setChiefComplaint(localStorage.getItem("chiefComplaint") ?? "");
      setHistoryOfPresentIllness(
        localStorage.getItem("historyOfPresentIllness") ?? ""
      );
      setRemarks(localStorage.getItem("remarks") ?? "");
      setPlan(localStorage.getItem("plan") ?? "");
      setFollowUp(localStorage.getItem("followUp") ?? "");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("diagnosis", diagnosis);
      localStorage.setItem("chiefComplaint", chiefComplaint);
      localStorage.setItem(
        "historyOfPresentIllness",
        historyOfPresentIllness
      );
      localStorage.setItem("remarks", remarks);
      localStorage.setItem("plan", plan);
      localStorage.setItem("followUp", followUp);
    }
  }, [
    diagnosis,
    chiefComplaint,
    historyOfPresentIllness,
    remarks,
    plan,
    followUp,
  ]);

  if (!open || !patient) return null;

  const handleAddOrUpdatePrescription = (rx: Prescription) => {
    if (editingIndex !== null) {
      setPrescriptions((prev) =>
        prev.map((p, i) => (i === editingIndex ? rx : p))
      );
      setEditingIndex(null);
    } else {
      setPrescriptions((prev) => [...prev, rx]);
    }
    setOpenPrescription(false);
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setOpenPrescription(true);
  };

  const handleDelete = (idx: number) => {
    if (confirm("Delete this prescription?")) {
      setPrescriptions((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleRemoveMaterial = (idx: number) => {
    if (confirm("Remove this educational material?")) {
      setSelectedMaterials((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSaveNote = async () => {
    try {
      const response = await fetch("/api/admin/soap-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: patient.id,
          chiefComplaint,
          historyOfIllness: historyOfPresentIllness,
          remarks,
          diagnosis,
          plan,
          followUp,
          prescriptions,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error(err);
        alert("Failed to save SOAP Note");
        return;
      }

      const data = await response.json();
      console.log("Saved SOAP Note:", data);

      alert("SOAP Note saved successfully!");
      setShowPreview(true);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
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
    setDiagnostics((prev) => [...prev, diagnostic]);
    setDiagnosis((prev) =>
      prev ? `${prev} [Diagnostic image attached]` : "[Diagnostic image attached]"
    );
  };

  const renderPreview = () => (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white shadow-md">
        <h3 className="text-lg font-bold">SOAP Note Preview</h3>
        <p className="text-sm text-violet-100">{patient.name}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-xs font-bold tracking-widest text-violet-600">
          SUBJECTIVE
        </h4>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium uppercase text-gray-500">
              Chief Complaint
            </p>
            <p className="min-h-5 text-sm text-gray-800">
              {chiefComplaint || (
                <span className="italic text-gray-300">
                  No complaint recorded
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase text-gray-500">
              History of Present Illness
            </p>
            <p className="min-h-5 text-sm text-gray-800">
              {historyOfPresentIllness || (
                <span className="italic text-gray-300">
                  No history recorded
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-xs font-bold tracking-widest text-emerald-600">
          OBJECTIVE
        </h4>
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-gray-500">
            Physical Exam Findings
          </p>
          <p className="min-h-5 text-sm text-gray-800">
            {remarks || (
              <span className="italic text-gray-300">No remarks recorded</span>
            )}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-xs font-bold tracking-widest text-amber-600">
          ASSESSMENT
        </h4>
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-gray-500">
            Diagnosis
          </p>
          <p className="min-h-5 text-sm text-gray-800">
            {diagnosis || (
              <span className="italic text-gray-300">
                No diagnosis recorded
              </span>
            )}
          </p>
        </div>

        {diagnostics.length > 0 && (
          <div className="mt-4 space-y-4">
            {diagnostics.map((d, i) => (
              <div
                key={i}
                className="flex justify-center rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <img
                  src={d.imageData}
                  alt="Diagnostic"
                  className="max-h-[420px] w-full cursor-zoom-in rounded-lg object-contain transition hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-xs font-bold tracking-widest text-cyan-600">
          PLAN
        </h4>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium uppercase text-gray-500">
              Treatment Plan
            </p>
            <p className="min-h-5 text-sm text-gray-800">
              {plan || (
                <span className="italic text-gray-300">No plan recorded</span>
              )}
            </p>
          </div>

          {prescriptions.length > 0 && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="mb-2 text-xs font-medium uppercase text-gray-500">
                Prescriptions
              </p>
              <div className="space-y-2">
                {prescriptions.map((rx, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-amber-200 bg-amber-50 p-2"
                  >
                    <p className="text-sm font-semibold text-amber-900">
                      {rx.drug}
                    </p>
                    <p className="text-xs text-amber-700">
                      {rx.dose} · {rx.frequency} · {rx.duration}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedMaterials.length > 0 && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="mb-2 text-xs font-medium uppercase text-gray-500">
                Educational Materials
              </p>
              <div className="space-y-2">
                {selectedMaterials.map((material, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2"
                  >
                    {material.thumbnail && (
                      <img
                        src={material.thumbnail}
                        alt={material.title}
                        className="h-8 w-8 rounded object-cover"
                      />
                    )}
                    <p className="text-xs font-medium text-blue-900">
                      {material.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="mb-1 text-xs font-medium uppercase text-gray-500">
              Follow-up
            </p>
            <p className="min-h-5 text-sm text-gray-800">
              {followUp || (
                <span className="italic text-gray-300">
                  No follow-up scheduled
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 p-2 backdrop-blur-sm sm:p-4">
        <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-800 shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 py-4 sm:px-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                SOAP Note
              </h2>
              <p className="text-sm text-gray-500">{patient.name}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div id="soap-modal-content" className="flex-1 overflow-y-auto">
            <div className="grid min-h-0 grid-cols-1 lg:grid-cols-2">
              <div className="overflow-y-auto bg-gray-50/50 p-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 sm:p-6">
                <div className="space-y-6">
                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-5 w-1 rounded-full bg-violet-500"></div>
                      <h3 className="text-sm font-bold tracking-wider text-gray-700">
                        SUBJECTIVE
                      </h3>
                    </div>

                    <FieldBlock
                      label="Chief Complaint"
                      placeholder="Enter patient's chief complaint"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                    />

                    <div className="mt-4">
                      <FieldBlock
                        label="History of Present Illness"
                        placeholder="Describe symptoms, duration, onset..."
                        value={historyOfPresentIllness}
                        onChange={(e) =>
                          setHistoryOfPresentIllness(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-5 w-1 rounded-full bg-emerald-500"></div>
                      <h3 className="text-sm font-bold tracking-wider text-gray-700">
                        OBJECTIVE
                      </h3>
                    </div>

                    <p className="mb-2 text-xs text-gray-500">
                      (Physical exam, labs, vitals)
                    </p>

                    <FieldBlock
                      label="Remarks"
                      placeholder="Physical exam findings..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-5 w-1 rounded-full bg-amber-500"></div>
                      <h3 className="text-sm font-bold tracking-wider text-gray-700">
                        ASSESSMENT
                      </h3>
                    </div>

                    <FieldBlock
                      label="Diagnosis"
                      placeholder="Diagnosis / impression"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                    />

                    <ActionChips
                      options={["Add Diagnosis"]}
                      onSelect={() => setOpen3DModal(true)}
                    />

                    {diagnostics.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {diagnostics.map((d, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                          >
                            <img
                              src={d.imageData}
                              alt="Diagnostic"
                              className="h-56 w-full cursor-zoom-in rounded-lg object-contain transition hover:scale-105"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-5 w-1 rounded-full bg-cyan-500"></div>
                      <h3 className="text-sm font-bold tracking-wider text-gray-700">
                        PLAN
                      </h3>
                    </div>

                    <FieldBlock
                      label="Plan"
                      placeholder="Treatment plan"
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                    />

                    <ActionChips
                      options={[
                        "Add Prescription",
                        "Add Body Diagram",
                        "Add Educational Material",
                      ]}
                      onSelect={(option) => {
                        if (option === "Add Prescription") {
                          setOpenPrescription(true);
                        } else if (option === "Add Body Diagram") {
                          setOpen3DModal(true);
                        } else if (option === "Add Educational Material") {
                          setOpenEducationalMaterial(true);
                        }
                      }}
                    />

                    {prescriptions.map((rx, idx) => (
                      <div
                        key={idx}
                        className="mt-4 flex items-start justify-between rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {rx.drug}
                          </p>
                          <p className="text-sm text-gray-600">
                            {rx.dose} · {rx.frequency} · {rx.duration}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(idx)}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(idx)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                    {selectedMaterials.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-medium text-gray-700">
                          Attached Educational Materials
                        </p>

                        {selectedMaterials.map((material, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4"
                          >
                            <div className="flex items-center gap-3">
                              {material.thumbnail && (
                                <img
                                  src={material.thumbnail}
                                  alt={material.title}
                                  className="h-12 w-12 rounded-lg object-cover shadow-sm"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {material.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {material.category}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveMaterial(idx)}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4">
                      <FieldBlock
                        label="Follow-up"
                        placeholder="Clinic and date"
                        value={followUp}
                        onChange={(e) => setFollowUp(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden overflow-y-auto border-l border-gray-200 bg-gradient-to-b from-gray-100 to-gray-50 p-6 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 lg:block">
                <div className="sticky top-0">
                  {showPreview ? (
                    renderPreview()
                  ) : (
                    <div className="flex h-64 flex-col items-center justify-center text-gray-400">
                      <svg
                        className="mb-3 h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-sm font-medium">
                        Preview will appear here
                      </p>
                      <p className="mt-1 text-xs">
                        after clicking Preview button
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 bg-gray-50 p-4 lg:hidden">
                <details className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium text-gray-700 hover:bg-gray-50">
                    <span>📋 Live Preview</span>
                    <svg
                      className="h-4 w-4 transform transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="border-t border-gray-200 p-4">
                    {renderPreview()}
                  </div>
                </details>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t bg-gray-50 p-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleShowPreview}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Preview
            </button>
            <button
              onClick={handleExportPDF}
              className="rounded-lg bg-amber-500 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
            >
              Export PDF
            </button>
            <button
              onClick={handleSaveNote}
              className="rounded-lg bg-violet-600 px-5 py-2.5 font-medium text-white shadow-md transition-colors hover:bg-violet-700"
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
        defaultValues={
          editingIndex !== null ? prescriptions[editingIndex] : undefined
        }
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
    </>
  );
};

export default SoapNoteModal;