"use client";

import { useState, useEffect } from 'react';

interface Doctor {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    close: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };
  return icons[name] || null;
};

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value || "-"}</p>
  </div>
);

interface DoctorDetailsModalProps {
  open: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

const DoctorDetailsModal = ({ open, onClose, doctor }: DoctorDetailsModalProps) => {
  if (!open || !doctor) return null;

  const statusColor = doctor.isActive ? "text-emerald-600" : "text-red-600";
  const statusBg = doctor.isActive ? "bg-emerald-50" : "bg-red-50";
  const statusDot = doctor.isActive ? "bg-emerald-500" : "bg-red-500";

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="w-[640px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden animate-fadeIn">
        
        {/* HEADER with gradient background */}
        <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-6">
          <button 
            onClick={onClose} 
            className="absolute right-4 top-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {doctor.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{doctor.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-teal-100 font-medium">Doctor</span>
                <span className="w-1 h-1 rounded-full bg-teal-300" />
                <span className={`text-sm font-medium ${doctor.isActive ? 'text-emerald-300' : 'text-red-300'}`}>
                  {doctor.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
          
          {/* BASIC INFO – modern card with icons */}
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
                  <p className="text-sm font-semibold text-slate-800">{doctor.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Email</p>
                  <p className="text-sm font-semibold text-slate-800">{doctor.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Member Since</p>
                  <p className="text-sm font-semibold text-slate-800">{new Date(doctor.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Status</p>
                  <p className={`text-sm font-semibold ${statusColor}`}>
                    {doctor.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STATUS CARD – larger and more prominent */}
          <div className={`rounded-2xl border p-6 ${doctor.isActive ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${statusDot} shadow-sm`} />
              <span className={`text-base font-bold ${statusColor}`}>
                {doctor.isActive ? '✅ Active Doctor' : '⛔ Inactive Doctor'}
              </span>
            </div>
            <p className={`text-sm mt-2 ml-7 ${statusColor}`}>
              {doctor.isActive 
                ? 'Available for appointments – accepting new patients' 
                : 'Currently not accepting new patients'
              }
            </p>
          </div>

        </div>
      </div>

      {/* Add subtle animation */}
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
};

export default DoctorDetailsModal;