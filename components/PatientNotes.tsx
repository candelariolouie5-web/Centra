"use client";

import { PaperClipIcon } from "@heroicons/react/20/solid";

const PatientNotes = ({ patient }: any) => {
  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold text-black">Patient Notes</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-400">
          Additional information and attachments.
        </p>
      </div>

      <div className="mt-6 border-t border-white/10">
        <dl className="divide-y divide-white/10">
          <div className="grid grid-cols-3 gap-4 px-4 py-6">
            <dt className="text-sm font-medium text-gray-500">
              Chief Complaints
            </dt>
            <dd className="col-span-2 text-sm text-gray-400">
              {patient?.soapNote?.chiefComplaint || "—"}
            </dd>
          </div>

          <div className="grid grid-cols-3 gap-4 px-4 py-6">
            <dt className="text-sm font-medium text-gray-500">
              History of Present Illness
            </dt>
            <dd className="col-span-2 text-sm text-gray-400">
              {patient?.soapNote?.historyOfIllness || "—"}
            </dd>
          </div>

          <div className="grid grid-cols-3 gap-4 px-4 py-6">
            <dt className="text-sm font-medium text-gray-500">Remarks</dt>
            <dd className="col-span-2 text-sm text-gray-400">
              {patient?.soapNote?.remarks || "—"}
            </dd>
          </div>

          <div className="grid grid-cols-3 gap-4 px-4 py-6">
            <dt className="text-sm font-medium text-gray-500">Diagnosis / Notes</dt>
            <dd className="col-span-2 text-sm text-gray-400 space-y-2">
              <p>{patient?.soapNote?.diagnosis || "—"}</p>
              {patient?.soapNote?.imageData && (
                <div className="mt-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
                  <img 
                    src={patient.soapNote.imageData} 
                    alt="Diagnostic image"
                    className="max-h-48 w-full max-w-sm object-contain rounded shadow-sm mx-auto block"
                  />
                </div>
              )}
            </dd>
          </div>


        </dl>
      </div>
    </div>
  );
};

export default PatientNotes;