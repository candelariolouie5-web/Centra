"use client";

import { X } from "lucide-react";

interface Secretary {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SecretaryDetailsModalProps {
  open: boolean;
  onClose: () => void;
  secretary: Secretary | null;
}

export default function SecretaryDetailsModal({
  open,
  onClose,
  secretary,
}: SecretaryDetailsModalProps) {
  if (!open || !secretary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Secretary Details</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
              {secretary.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{secretary.name}</p>
              <p className="text-sm text-slate-500">{secretary.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  secretary.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {secretary.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500">Joined</p>
              <p className="text-sm font-medium text-slate-800">
                {new Date(secretary.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Last Updated</p>
              <p className="text-sm font-medium text-slate-800">
                {new Date(secretary.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">ID</p>
              <p className="text-sm font-mono text-slate-600">
                {secretary.id.slice(0, 12)}...
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}