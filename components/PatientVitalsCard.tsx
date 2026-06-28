"use client";

import { useEffect, useState } from "react";

type PatientVitalsCardProps = {
  patientId?: string | null;
};

type VitalRecord = {
  id: string;
  height?: string | null;
  weight?: string | null;
  bloodPressure?: string | null;
  temperature?: string | null;
  pulse?: string | null;
  respiratoryRate?: string | null;
  oxygenSaturation?: string | null;
  notes?: string | null;
  updatedAt: string;
  appointment: {
    id: string;
    fullName: string;
    serviceType: string;
    appointmentDate: string;
    appointmentTime: string;
    secretaryStatus: string;
  };
};

export default function PatientVitalsCard({ patientId }: PatientVitalsCardProps) {
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVitals() {
      try {
        if (!patientId) return;

        const res = await fetch(`/api/admin/patients/${patientId}/vitals`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (res.ok) {
          setVitals(data.vitals || []);
        }
      } catch (error) {
        console.error("Failed to load patient vitals:", error);
      } finally {
        setLoading(false);
      }
    }

    loadVitals();
  }, [patientId]);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Vital Signs</h2>
        <p className="mt-2 text-sm text-slate-500">Loading latest vitals...</p>
      </div>
    );
  }

  if (!patientId || vitals.length === 0) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Vital Signs</h2>
        <p className="mt-2 text-sm text-slate-500">
          No secretary-recorded vitals yet.
        </p>
      </div>
    );
  }

  const latest = vitals[0];

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Vital Signs</h2>
        <p className="mt-1 text-sm text-slate-600">
          Latest captured measurements for this patient.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          From {latest.appointment.serviceType} on{" "}
          {new Date(latest.appointment.appointmentDate).toLocaleDateString()} at{" "}
          {latest.appointment.appointmentTime}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <VitalBox label="Blood Pressure" value={latest.bloodPressure} unit="mmHg" />
        <VitalBox label="Heart Rate" value={latest.pulse} unit="bpm" />
        <VitalBox label="Temperature" value={latest.temperature} unit="°C" />
        <VitalBox label="SpO2" value={latest.oxygenSaturation} unit="%" />
        <VitalBox label="Respiratory" value={latest.respiratoryRate} unit="/min" />
        <VitalBox label="Weight" value={latest.weight} unit="kg" />
        <VitalBox label="Height" value={latest.height} unit="cm" />
      </div>

      {latest.notes ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Notes</p>
          <p className="mt-1 text-sm text-slate-600">{latest.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

function VitalBox({
  label,
  value,
  unit,
}: {
  label: string;
  value?: string | null;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-3xl font-bold text-slate-950">
          {value || "--"}
        </span>
        <span className="pb-1 text-sm font-semibold text-slate-600">{unit}</span>
      </div>
    </div>
  );
}