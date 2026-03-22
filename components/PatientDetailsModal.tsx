"use client";

import { useState, useEffect } from "react";
import PatientNotes from "./PatientNotes";

/* ---------------- ICON ---------------- */

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    close: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    medical: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547" />
      </svg>
    ),
  };
  return icons[name] || null;
};

/* ---------------- FIELD ---------------- */

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value || "-"}</p>
  </div>
);

/* ---------------- PLACEHOLDER ---------------- */

const Placeholder = ({ text }: { text: string }) => (
  <div className="text-gray-400 text-center py-10 text-sm">{text}</div>
);

/* ---------------- VITAL SIGNS ---------------- */

const VitalSigns = () => {
  const vitals = [
    { label: "Blood Pressure", value: "120/80", unit: "mmHg" },
    { label: "Heart Rate", value: "72", unit: "bpm" },
    { label: "Temperature", value: "36.8", unit: "°C" },
    { label: "SpO2", value: "98", unit: "%" },
    { label: "Respiratory", value: "16", unit: "/min" },
    { label: "Weight", value: "68", unit: "kg" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">Vital Signs</h3>

      <div className="grid grid-cols-3 gap-4">
        {vitals.map((vital) => (
          <div key={vital.label} className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">{vital.label}</p>
            <p className="text-lg font-bold text-gray-900">
              {vital.value}
              <span className="text-xs text-gray-500 ml-1">{vital.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- TYPES ---------------- */

interface MedicalHistory {
  id: string;
  type: string;
  resultDate: string;
  lab: string | null;
  remarks: string;
  photos: string[];
  createdAt: string;
}

/* ---------------- MODAL ---------------- */

const PatientDetailsModal = ({
  open,
  onClose,
  patient,
  tab,
  setTab,
  onCreateMedicalHistory,
  onRefreshMedicalHistory,
}: any) => {
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([]);
  const [loadingMedicalHistory, setLoadingMedicalHistory] = useState(false);

  useEffect(() => {
    if (tab === "medical" && patient?.id) {
      fetchMedicalHistories();
    }
  }, [tab, patient?.id]);

  useEffect(() => {
    if (tab === "medical" && patient?.id && onRefreshMedicalHistory) {
      fetchMedicalHistories();
    }
  }, [onRefreshMedicalHistory]);

  const fetchMedicalHistories = async () => {
    if (!patient?.id) return;

    setLoadingMedicalHistory(true);

    try {
      const response = await fetch(`/api/admin/patients/${patient.id}/medical-history`);
      const data = await response.json();

      if (response.ok) {
        setMedicalHistories(data.medicalHistories || []);
      }
    } catch (err) {
      console.error("Failed to fetch medical histories:", err);
    } finally {
      setLoadingMedicalHistory(false);
    }
  };

  if (!open || !patient) return null;

  const tabs = [
    { id: "info", label: "Patient Information" },
    { id: "notes", label: "Notes" },
    { id: "treatment", label: "Next Treatment" },
    { id: "medical", label: "Medical History" },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-[1100px] max-h-[95vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">

        {/* HEADER */}

        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
              {patient.name?.charAt(0)}
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">{patient.name}</h2>
              <p className="text-sm text-gray-500">{patient.email}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200">
            <Icon name="close" className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* TABS */}

        <div className="flex gap-1 px-6 border-b bg-gray-50">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                tab === t.id
                  ? "text-teal-600 border-teal-600 bg-white"
                  : "text-gray-500 border-transparent hover:text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">

          {tab === "info" && (
            <div className="space-y-6">

              <VitalSigns />

              <div className="bg-white border rounded-xl p-6 shadow-sm grid grid-cols-2 gap-6">
                <Field label="Age" value={patient.age} />
                <Field label="Gender" value={patient.gender} />
                <Field label="Mobile Number" value={patient.phone} />
                <Field label="Address" value={patient.address} />
                <Field label="Email Address" value={patient.email} />
              </div>

            </div>
          )}

          {tab === "notes" && (
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <PatientNotes patient={patient} />
            </div>
          )}

          {tab === "treatment" && (
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <Placeholder text="Next treatment information will appear here." />
            </div>
          )}

          {tab === "medical" && (
            <div className="bg-white border rounded-xl p-6 shadow-sm">

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Icon name="medical" className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-800">Medical History</h3>
                </div>

                <button
                  onClick={onCreateMedicalHistory}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium"
                >
                  + Create Medical History
                </button>
              </div>

              {loadingMedicalHistory ? (
                <p className="text-gray-400 text-center py-6">
                  Loading medical histories...
                </p>
              ) : medicalHistories.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No medical history records found
                </p>
              ) : (
                <div className="space-y-4">

                  {medicalHistories.map((record) => (
                    <div
                      key={record.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >

                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {record.type}
                          </h4>

                          <p className="text-sm text-gray-500">
                            Date: {new Date(record.resultDate + "T12:00:00").toLocaleDateString()}
                            {record.lab && ` • Lab: ${record.lab}`}
                          </p>
                        </div>

                        <span className="text-xs text-gray-400">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-gray-700 mt-3">{record.remarks}</p>

                      {record.photos && record.photos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {record.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Medical record ${index}`}
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                          ))}
                        </div>
                      )}

                    </div>
                  ))}

                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default PatientDetailsModal; 