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
              {patient?.chiefComplaints || "—"}
            </dd>
          </div>

          <div className="grid grid-cols-3 gap-4 px-4 py-6">
            <dt className="text-sm font-medium text-gray-500">Remarks</dt>
            <dd className="col-span-2 text-sm text-gray-400">
              {patient?.remarks || "—"}
            </dd>
          </div>

          <div className="grid grid-cols-3 gap-4 px-4 py-6">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="col-span-2 text-sm text-gray-400">
              {patient?.notes || "—"}
            </dd>
          </div>

          <div className="grid grid-cols-3 gap-4 px-4 py-6">
            <dt className="text-sm font-medium text-gray-500">Attachments</dt>
            <dd className="col-span-2">
              {patient?.attachments?.length ? (
                <ul className="divide-y divide-white/5 rounded-md border border-white/10">
                  {patient.attachments.map((file: any, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between px-4 py-4"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <PaperClipIcon className="h-5 w-5 text-gray-500" />
                        <span className="truncate text-sm font-medium text-black">
                          {file.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {file.size || "—"}
                        </span>
                      </div>

                      <a
                        href={file.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No attachments</p>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default PatientNotes;