"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Prescription = {
  medicationId?: string | null;
  generic: string;
  brandName: string;
  quantity: string;
  dosage: string;
  instructions: string;
};

type Medication = {
  id: string;
  generic: string;
  brandName: string;
  quantity: string;
  dosage: string;
  instructions: string;
};

type PrescriptionModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (rx: Prescription) => void;
  defaultValues?: Prescription;
};

export default function PrescriptionModal({
  open,
  onClose,
  onSave,
  defaultValues,
}: PrescriptionModalProps) {
  const [medicationId, setMedicationId] = useState<string | null>(null);

  const [generic, setGeneric] = useState("");
  const [brandName, setBrandName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");

  const [medications, setMedications] = useState<Medication[]>([]);
  const [loadingMedications, setLoadingMedications] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [showAddMedication, setShowAddMedication] = useState(false);
  const [savingMedication, setSavingMedication] = useState(false);

  const [newGeneric, setNewGeneric] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newInstructions, setNewInstructions] = useState("");

  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    if (defaultValues) {
      setMedicationId(defaultValues.medicationId ?? null);
      setGeneric(defaultValues.generic ?? "");
      setBrandName(defaultValues.brandName ?? "");
      setQuantity(defaultValues.quantity ?? "");
      setDosage(defaultValues.dosage ?? "");
      setInstructions(defaultValues.instructions ?? "");
    } else {
      resetPrescriptionForm();
    }
  }, [defaultValues, open]);

  useEffect(() => {
    if (!open) return;
    void fetchMedications();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!showSuggestions) return;
      if (!panelRef.current) return;
      if (!panelRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  const filteredMedications = useMemo(() => {
    const query = generic.trim().toLowerCase();

    if (!query) return [];

    return medications.filter((med) => {
      const genericMatch = med.generic.toLowerCase().includes(query);
      const brandMatch = med.brandName.toLowerCase().includes(query);
      return genericMatch || brandMatch;
    });
  }, [generic, medications]);

  useEffect(() => {
    if (!generic.trim()) {
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(filteredMedications.length > 0);
  }, [generic, filteredMedications]);

  function resetPrescriptionForm() {
    setMedicationId(null);
    setGeneric("");
    setBrandName("");
    setQuantity("");
    setDosage("");
    setInstructions("");
    setShowSuggestions(false);
  }

  function resetAddMedicationForm() {
    setNewGeneric("");
    setNewBrandName("");
    setNewQuantity("");
    setNewDosage("");
    setNewInstructions("");
  }

  async function fetchMedications() {
    try {
      setLoadingMedications(true);

      const res = await fetch("/api/medications", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error || "Failed to load medications");
      }

      const data = await safeJson(res);
      const meds = Array.isArray(data?.medications) ? data.medications : [];
      setMedications(meds);
    } catch (error) {
      console.error("Failed to fetch medications:", error);
      setMedications([]);
    } finally {
      setLoadingMedications(false);
    }
  }

  function handleSelectMedication(med: Medication) {
    setMedicationId(med.id);
    setGeneric(med.generic || "");
    setBrandName(med.brandName || "");
    setQuantity(med.quantity || "");
    setDosage(med.dosage || "");
    setInstructions(med.instructions || "");
    setShowSuggestions(false);
  }

  function handleGenericChange(value: string) {
    setMedicationId(null);
    setGeneric(value);
  }

  function handleSavePrescription() {
    if (!generic.trim()) return;

    onSave({
      medicationId,
      generic: generic.trim(),
      brandName: brandName.trim(),
      quantity: quantity.trim(),
      dosage: dosage.trim(),
      instructions: instructions.trim(),
    });

    setShowSuggestions(false);
  }

  async function handleAddMedication() {
    if (!newGeneric.trim()) return;

    try {
      setSavingMedication(true);

      const payload = {
        generic: newGeneric.trim(),
        brandName: newBrandName.trim(),
        quantity: newQuantity.trim(),
        dosage: newDosage.trim(),
        instructions: newInstructions.trim(),
      };

      const res = await fetch("/api/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save medication");
      }

      const createdMedication: Medication | undefined = data?.medication;

      if (createdMedication) {
        setMedications((prev) => {
          const exists = prev.some((item) => item.id === createdMedication.id);
          if (exists) return prev;
          return [createdMedication, ...prev];
        });

        handleSelectMedication(createdMedication);
      } else {
        await fetchMedications();

        setMedicationId(null);
        setGeneric(payload.generic);
        setBrandName(payload.brandName);
        setQuantity(payload.quantity);
        setDosage(payload.dosage);
        setInstructions(payload.instructions);
      }

      resetAddMedicationForm();
      setShowAddMedication(false);
    } catch (error) {
      console.error("Failed to add medication:", error);
      alert(error instanceof Error ? error.message : "Failed to add medication");
    } finally {
      setSavingMedication(false);
    }
  }

  async function safeJson(res: Response) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in">
      {showAddMedication && (
        <div
          className="absolute inset-0 z-40 bg-black/20"
          onClick={() => setShowAddMedication(false)}
        />
      )}

      <div
        ref={panelRef}
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-white to-gray-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
              <svg
                className="h-5 w-5 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {defaultValues ? "Edit Prescription" : "Add Prescription"}
              </h2>
              <p className="text-xs text-gray-500">
                Search saved medications or add a new one
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="relative">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Generic
            </label>
            <input
              type="text"
              value={generic}
              onChange={(e) => handleGenericChange(e.target.value)}
              onFocus={() => {
                if (filteredMedications.length > 0) setShowSuggestions(true);
              }}
              placeholder="Search generic or brand name..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {showSuggestions && (
              <div className="absolute left-0 right-0 top-[4.5rem] z-50 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                {loadingMedications ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Loading medications...
                  </div>
                ) : filteredMedications.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No saved medications found.
                  </div>
                ) : (
                  filteredMedications.map((med) => (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => handleSelectMedication(med)}
                      className="w-full border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-indigo-50/70"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-gray-800">
                          {med.generic}
                        </span>
                        <span className="text-xs text-gray-400">
                          {med.brandName || "No brand"}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-400">
                        {med.dosage || "No dosage"}
                        {med.quantity ? ` • ${med.quantity}` : ""}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => {
                  setMedicationId(null);
                  setBrandName(e.target.value);
                }}
                placeholder="e.g., Biogesic"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => {
                  setMedicationId(null);
                  setQuantity(e.target.value);
                }}
                placeholder="e.g., 10 tablets"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Dosage
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => {
                  setMedicationId(null);
                  setDosage(e.target.value);
                }}
                placeholder="e.g., 500mg twice a day"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Medication ID
              </label>
              <input
                type="text"
                value={medicationId ?? ""}
                readOnly
                placeholder="Auto-filled when selecting saved medication"
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Instructions
            </label>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => {
                setMedicationId(null);
                setInstructions(e.target.value);
              }}
              placeholder="Additional instructions for the patient..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            type="button"
            onClick={() => setShowAddMedication(true)}
            className="flex items-center gap-2 rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-medium text-indigo-600 transition-all hover:border-indigo-300 hover:bg-indigo-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Medication
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSavePrescription}
              disabled={!generic.trim()}
              className="rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {defaultValues ? "Save Changes" : "Add Prescription"}
            </button>
          </div>
        </div>

        {showAddMedication && (
          <div className="absolute right-0 top-0 z-50 flex h-full w-full flex-col border-l border-gray-200 bg-white shadow-xl animate-slide-in-right sm:w-[380px]">
            <div className="flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-white to-gray-50/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                  <svg
                    className="h-4 w-4 text-violet-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">
                  Add New Medication
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAddMedication(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Generic *
                </label>
                <input
                  type="text"
                  value={newGeneric}
                  onChange={(e) => setNewGeneric(e.target.value)}
                  placeholder="Enter generic name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Enter brand name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="text"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  placeholder="e.g., 10 tablets"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Dosage
                </label>
                <input
                  type="text"
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  placeholder="e.g., 500mg twice a day"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Instructions
                </label>
                <textarea
                  rows={4}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Additional instructions..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowAddMedication(false)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMedication}
                disabled={!newGeneric.trim() || savingMedication}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingMedication ? "Saving..." : "Add Medication"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}