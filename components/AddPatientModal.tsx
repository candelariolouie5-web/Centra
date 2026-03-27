"use client";

import { useState } from "react";
import { FieldBlock } from "./UIHelpers";
import {
  UserRound,
  ShieldAlert,
  Stethoscope,
  FileCheck2,
  X,
  ChevronRight,
} from "lucide-react";

/* ----------------------- ADD PATIENT MODAL ----------------------- */
const AddPatientModal = ({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) => {
  const [tab, setTab] = useState("personal");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    emergencyAltPhone: "",
    physicianName: "",
    physicianClinic: "",
    physicianPhone: "",
    physicianEmail: "",
    consent: "",
    consentChecked: false,
  });

  const [loading, setLoading] = useState(false);

  const tabs = [
    {
      id: "personal",
      label: "Personal Information",
      shortLabel: "Personal",
      icon: UserRound,
    },
    {
      id: "emergency",
      label: "Emergency Contact",
      shortLabel: "Emergency",
      icon: ShieldAlert,
    },
    {
      id: "physician",
      label: "Physician Info",
      shortLabel: "Physician",
      icon: Stethoscope,
    },
    {
      id: "consent",
      label: "Patient Consent",
      shortLabel: "Consent",
      icon: FileCheck2,
    },
  ];

  const currentTabIndex = tabs.findIndex((t) => t.id === tab);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";
    if (!formData.age.trim()) errors.age = "Age is required";
    if (!formData.gender.trim()) errors.gender = "Gender is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.consentChecked) errors.consent = "You must consent to proceed";

    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      alert(
        "Please fix the following errors:\n" + Object.values(errors).join("\n")
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Patient saved successfully");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save patient");
      }
    } catch (err) {
      console.error("Error saving patient:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_-25px_rgba(15,23,42,0.35)]">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-start justify-between gap-4 px-6 py-5 md:px-8">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                New Patient Registration
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Add New Patient
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Complete the patient record details before saving.
              </p>
            </div>

            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress/Tabs */}
          <div className="px-6 pb-5 md:px-8">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {tabs.map((t, index) => {
                const Icon = t.icon;
                const isActive = tab === t.id;
                const isDone = currentTabIndex > index;

                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`group rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-violet-200 bg-violet-50 shadow-sm"
                        : isDone
                        ? "border-emerald-200 bg-emerald-50/70"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isActive
                            ? "bg-violet-600 text-white"
                            : isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-slate-500"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                          Step {index + 1}
                        </p>
                        <p
                          className={`truncate text-sm font-semibold ${
                            isActive
                              ? "text-violet-700"
                              : isDone
                              ? "text-emerald-700"
                              : "text-slate-700"
                          }`}
                        >
                          {t.shortLabel}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="px-6 py-6 md:px-8">
            <div className="mb-6 rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 p-6 text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                {tabs[currentTabIndex]?.label}
              </p>
              <h3 className="mt-2 text-xl font-bold">
                {tab === "personal" && "Enter the patient’s basic information"}
                {tab === "emergency" && "Add emergency contact details"}
                {tab === "physician" && "Record physician and clinic information"}
                {tab === "consent" && "Confirm consent and additional notes"}
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-white/85">
                {tab === "personal" &&
                  "Provide the main patient identity and contact information required for the record."}
                {tab === "emergency" &&
                  "Include who should be contacted immediately when urgent assistance is needed."}
                {tab === "physician" &&
                  "Add the patient’s attending physician details for better clinical reference."}
                {tab === "consent" &&
                  "Review the consent details and confirm before saving the patient record."}
              </p>
            </div>

            {tab === "personal" && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h4 className="text-lg font-semibold text-slate-900">
                    Personal Information
                  </h4>
                  <p className="text-sm text-slate-500">
                    Fill in the patient’s main profile and contact details.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FieldBlock
                    label="Full Name"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                  />
                  <FieldBlock
                    label="Email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                  <FieldBlock
                    label="Age"
                    placeholder="Enter age"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                  />
                  <FieldBlock
                    label="Gender"
                    placeholder="Male/Female/Other"
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                  />
                  <FieldBlock
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                  <FieldBlock
                    label="Address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {tab === "emergency" && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h4 className="text-lg font-semibold text-slate-900">
                    Emergency Contact
                  </h4>
                  <p className="text-sm text-slate-500">
                    Add the primary person to contact in case of emergency.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FieldBlock
                    label="Contact Name"
                    placeholder="Enter contact name"
                    value={formData.emergencyName}
                    onChange={(e) =>
                      handleInputChange("emergencyName", e.target.value)
                    }
                  />
                  <FieldBlock
                    label="Relationship"
                    placeholder="Relationship to patient"
                    value={formData.emergencyRelationship}
                    onChange={(e) =>
                      handleInputChange("emergencyRelationship", e.target.value)
                    }
                  />
                  <FieldBlock
                    label="Phone Number"
                    placeholder="Enter contact number"
                    value={formData.emergencyPhone}
                    onChange={(e) =>
                      handleInputChange("emergencyPhone", e.target.value)
                    }
                  />
                  <FieldBlock
                    label="Alternate Phone"
                    placeholder="Optional"
                    value={formData.emergencyAltPhone}
                    onChange={(e) =>
                      handleInputChange("emergencyAltPhone", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {tab === "physician" && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h4 className="text-lg font-semibold text-slate-900">
                    Physician Information
                  </h4>
                  <p className="text-sm text-slate-500">
                    Add the patient’s clinic and attending physician details.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FieldBlock
                    label="Primary Physician"
                    placeholder="Physician name"
                    value={formData.physicianName}
                    onChange={(e) =>
                      handleInputChange("physicianName", e.target.value)
                    }
                  />
                  <FieldBlock
                    label="Clinic/Hospital"
                    placeholder="Clinic or hospital"
                    value={formData.physicianClinic}
                    onChange={(e) =>
                      handleInputChange("physicianClinic", e.target.value)
                    }
                  />
                  <FieldBlock
                    label="Phone Number"
                    placeholder="Physician phone"
                    value={formData.physicianPhone}
                    onChange={(e) =>
                      handleInputChange("physicianPhone", e.target.value)
                    }
                  />
                  <FieldBlock
                    label="Email"
                    placeholder="Physician email"
                    value={formData.physicianEmail}
                    onChange={(e) =>
                      handleInputChange("physicianEmail", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {tab === "consent" && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h4 className="text-lg font-semibold text-slate-900">
                    Patient Consent
                  </h4>
                  <p className="text-sm text-slate-500">
                    Record notes or consent details, then confirm agreement.
                  </p>
                </div>

                <div className="space-y-5">
                  <FieldBlock
                    label="Consent Form"
                    placeholder="Type patient consent or notes here..."
                    type="textarea"
                    value={formData.consent}
                    onChange={(e) =>
                      handleInputChange("consent", e.target.value)
                    }
                  />

                  <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        id="consent"
                        checked={formData.consentChecked}
                        onChange={(e) =>
                          handleInputChange("consentChecked", e.target.checked)
                        }
                        className="mt-1 h-4 w-4 rounded border-slate-300 accent-violet-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Confirm patient consent
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          I hereby consent to the treatment and data collection.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Step{" "}
              <span className="font-semibold text-slate-800">
                {currentTabIndex + 1}
              </span>{" "}
              of <span className="font-semibold text-slate-800">{tabs.length}</span>
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Patient"}
                {!loading && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPatientModal;