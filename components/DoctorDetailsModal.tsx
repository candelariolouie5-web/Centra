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

  const statusColor = doctor.isActive ? "text-green-600" : "text-red-600";
  const statusBg = doctor.isActive ? "bg-green-100" : "bg-red-100";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-[600px] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
              {doctor.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{doctor.name}</h2>
              <p className="text-sm text-gray-500">Doctor Profile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Icon name="close" className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          
          {/* BASIC INFO */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-6">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Full Name" value={doctor.name} />
              <Field label="Email" value={doctor.email} />
              <Field label="Status" value={doctor.isActive ? "Active" : "Inactive"} />
              <Field label="Member Since" value={new Date(doctor.createdAt).toLocaleDateString()} />
            </div>
          </div>

          {/* STATUS BADGE */}
          <div className="bg-gradient-to-r from-gray-50 to-indigo-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${doctor.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
              </div>
              <span className={`font-semibold ${statusColor}`}>
                {doctor.isActive ? '✅ Active Doctor' : '❌ Inactive Doctor'}
              </span>
            </div>
            <p className={`text-sm mt-2 ${statusColor}`}>
              {doctor.isActive 
                ? 'Available for appointments' 
                : 'Currently not accepting new patients'
              }
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorDetailsModal;

