"use client";
import { useState } from "react";
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
  const [currentTab, setCurrentTab] = useState("basic");

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
      alert("Please fix:\n" + errors.join("\n"));
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
        onClose();
        alert("Doctor added successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add doctor");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Add New Doctor</h2>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-1 bg-gray-100 flex">
          {[{ id: "basic", label: "Basic Info" }].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setCurrentTab(t.id)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition ${
                currentTab === t.id
                  ? "bg-white shadow-sm text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
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
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            {loading ? (
              <>Saving...</>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6l4 2"
                  />
                </svg>{" "}
                Add Doctor
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDoctorModal;