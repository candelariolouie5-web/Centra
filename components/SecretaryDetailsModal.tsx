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

  const statusColor = secretary.isActive ? "text-emerald-600" : "text-red-600";
  const statusBg = secretary.isActive ? "bg-emerald-50" : "bg-red-50";
  const statusDot = secretary.isActive ? "bg-emerald-500" : "bg-red-500";

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="w-[640px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden animate-fadeIn">
        
        {/* HEADER with gradient background */}
        <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-6">
          <button 
            onClick={onClose} 
            className="absolute right-4 top-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {secretary.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{secretary.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-teal-100 font-medium">Secretary</span>
                <span className="w-1 h-1 rounded-full bg-teal-300" />
                <span className={`text-sm font-medium ${secretary.isActive ? 'text-emerald-300' : 'text-red-300'}`}>
                  {secretary.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
          
          {/* PERSONAL INFORMATION – modern card with icons */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-5 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Full Name</p>
                  <p className="text-sm font-semibold text-slate-800">{secretary.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Email</p>
                  <p className="text-sm font-semibold text-slate-800">{secretary.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Joined</p>
                  <p className="text-sm font-semibold text-slate-800">{new Date(secretary.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Status</p>
                  <p className={`text-sm font-semibold ${statusColor}`}>
                    {secretary.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ADDITIONAL DETAILS – last updated and ID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Last Updated
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                {new Date(secretary.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0h4" />
                </svg>
                ID
              </p>
              <p className="text-sm font-mono text-slate-600 mt-1">
                {secretary.id.slice(0, 12)}…
              </p>
            </div>
          </div>

          {/* STATUS CARD – prominent and colour-coded */}
          <div className={`rounded-2xl border p-6 ${secretary.isActive ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${statusDot} shadow-sm`} />
              <span className={`text-base font-bold ${statusColor}`}>
                {secretary.isActive ? '✅ Active Secretary' : '⛔ Inactive Secretary'}
              </span>
            </div>
            <p className={`text-sm mt-2 ml-7 ${statusColor}`}>
              {secretary.isActive 
                ? 'Available for administrative duties' 
                : 'Currently unavailable'
              }
            </p>
          </div>

          {/* CLOSE BUTTON – subtle and consistent */}
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Subtle fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}