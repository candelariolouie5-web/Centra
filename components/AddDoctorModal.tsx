"use client";
import { useState, useEffect } from "react";
import { FieldBlock } from "./UIHelpers";

interface AddDoctorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddDoctorModal = ({ open, onClose, onSuccess }: AddDoctorModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic"); // kept for logic

  // Toast state – lives independently of modal visibility
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Auto‑dismiss toast after 3s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.username.trim()) errors.push("Username (email) is required");
    if (!formData.password || formData.password.length < 6)
      errors.push("Password must be at least 6 characters");
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setToast({ message: errors[0], type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        if (onSuccess) onSuccess();
        setToast({ message: "Doctor added successfully!", type: "success" });
        onClose(); // modal closes immediately, toast stays visible
      } else {
        const data = await response.json();
        setToast({ message: data.error || "Failed to add doctor", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Network error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Global Toast – always rendered, independent of modal */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[999] max-w-sm px-5 py-4 rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 animate-slide-in ${
            toast.type === "success"
              ? "bg-green-50/90 text-green-800 ring-1 ring-green-200/80"
              : "bg-red-50/90 text-red-800 ring-1 ring-red-200/80"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal – only rendered when open */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 overflow-hidden">
            {/* Header */}
            <div className="px-7 py-5 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add New Doctor</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-7 space-y-5">
              <FieldBlock
                label="Full Name"
                placeholder="Enter doctor's full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              <FieldBlock
                label="Username (Email)"
                placeholder="doctor@clinic.com"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
              />
              <FieldBlock
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
            </div>

            {/* Footer */}
            <div className="px-7 py-4 bg-slate-50/80 border-t border-slate-200/80 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-200/80 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-xl shadow-sm hover:bg-teal-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                    </svg>
                    Add Doctor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for slide‑in animation */}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-1rem); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default AddDoctorModal;