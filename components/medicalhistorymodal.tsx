"use client";
import { useState } from "react";
import { FieldBlock } from "./UIHelpers";

interface MedicalHistory {
  id: string;
  type: string;
  resultDate: string;
  lab: string | null;
  remarks: string;
  photos: string[];
  createdAt: string;
}

const MedicalHistoryModal = ({
  open,
  onClose,
  patientId,
  onSuccess
}: {
  open: boolean;
  onClose: () => void;
  patientId?: string;
  onSuccess?: () => void;
}) => {
  const [formData, setFormData] = useState({
    type: "",
    resultDate: "",
    lab: "",
    remarks: "",
    photos: [] as File[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, photos: files }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.type.trim()) errors.type = "Type is required";
    if (!formData.resultDate.trim()) errors.resultDate = "Result date is required";
    if (!formData.remarks.trim()) errors.remarks = "Remarks are required";
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors).join("\n"));
      return;
    }

    if (!patientId) {
      setError("Patient ID is missing");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("type", formData.type);
      formDataToSend.append("resultDate", formData.resultDate);
      formDataToSend.append("lab", formData.lab);
      formDataToSend.append("remarks", formData.remarks);

      formData.photos.forEach((photo) => {
        formDataToSend.append("photos", photo);
      });

      const response = await fetch(
        `/api/admin/patients/${patientId}/medical-history`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("Medical history saved successfully!");

        setFormData({
          type: "",
          resultDate: "",
          lab: "",
          remarks: "",
          photos: [],
        });

        if (onSuccess) onSuccess();

        setTimeout(() => {
          onClose();
          setSuccess("");
        }, 1500);
      } else {
        setError(data.error || "Failed to save medical history");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-200/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="w-full max-w-xl bg-white text-gray-900 rounded-2xl shadow-xl overflow-y-auto transform transition-all duration-300 scale-95 animate-scaleUp max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            New Medical History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-600 text-sm whitespace-pre-line">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-600 text-sm">
            {success}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-6 space-y-5">

          <FieldBlock
            label="Type"
            placeholder="Type of medical history"
            value={formData.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
          />

          <FieldBlock
            label="Result Date"
            type="date"
            value={formData.resultDate}
            onChange={(e) => handleInputChange("resultDate", e.target.value)}
          />

          <FieldBlock
            label="Lab (Optional)"
            placeholder="Lab name or leave blank"
            value={formData.lab}
            onChange={(e) => handleInputChange("lab", e.target.value)}
          />

          <FieldBlock
            label="Remarks"
            placeholder="Additional notes..."
            type="textarea"
            value={formData.remarks}
            onChange={(e) => handleInputChange("remarks", e.target.value)}
          />

          {/* File Upload */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Add Photos (Optional)
            </p>

            <input
              type="file"
              multiple
              accept="image/*"
              title="Upload medical history photos"
              className="w-full text-gray-900 bg-gray-100 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
              onChange={handleFileChange}
            />

            {formData.photos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.photos.map((file, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 border border-gray-300 rounded-lg overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-300 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save History"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryModal;