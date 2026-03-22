"use client";

import { useState, useEffect } from "react";
import { FieldBlock } from "./UIHelpers";

export type Prescription = {
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type DrugData = {
  name: string;
  category: "ENT" | "Aesthetics";
  dose: string;
  frequency: string;
  duration: string;
};

const DRUG_LIST: DrugData[] = [
  { name: "Amoxicillin", category: "ENT", dose: "500mg", frequency: "3 times daily", duration: "7 days" },
  { name: "Azithromycin", category: "ENT", dose: "250mg", frequency: "Once daily", duration: "5 days" },
  { name: "Cefuroxime", category: "ENT", dose: "500mg", frequency: "2 times daily", duration: "7 days" },
  { name: "Dexamethasone", category: "ENT", dose: "4mg", frequency: "Once daily", duration: "3 days" },
  { name: "Hyaluronic Acid", category: "Aesthetics", dose: "1 vial", frequency: "Once", duration: "Single session" },
  { name: "Botulinum Toxin", category: "Aesthetics", dose: "20 units", frequency: "Once", duration: "Single session" },
  { name: "Vitamin C Serum", category: "Aesthetics", dose: "Apply 2 drops", frequency: "Daily", duration: "2 weeks" },
  { name: "Retinol Cream", category: "Aesthetics", dose: "Pea-sized amount", frequency: "Daily", duration: "4 weeks" },
];

const PrescriptionModal = ({
  open,
  onClose,
  onSave,
  defaultValues,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (rx: Prescription) => void;
  defaultValues?: Prescription;
}) => {
  const [drug, setDrug] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [filtered, setFiltered] = useState<DrugData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setDrug(defaultValues.drug);
      setDose(defaultValues.dose);
      setFrequency(defaultValues.frequency);
      setDuration(defaultValues.duration);
      setInstructions(defaultValues.instructions);
    } else {
      setDrug("");
      setDose("");
      setFrequency("");
      setDuration("");
      setInstructions("");
    }
  }, [defaultValues, open]);

  useEffect(() => {
    if (!drug.trim()) {
      setFiltered([]);
      setShowSuggestions(false);
      return;
    }

    const matches = DRUG_LIST.filter((d) =>
      d.name.toLowerCase().includes(drug.toLowerCase())
    );

    setFiltered(matches);
    setShowSuggestions(matches.length > 0);
  }, [drug]);

  const handleSelect = (drugName: string) => {
    const selected = DRUG_LIST.find((d) => d.name === drugName);
    if (!selected) return;

    setDrug(selected.name);
    setDose(selected.dose);
    setFrequency(selected.frequency);
    setDuration(selected.duration);
    setShowSuggestions(false);
  };

  const handleSave = () => {
    if (!drug.trim()) return;
    onSave({ drug, dose, frequency, duration, instructions });
    setShowSuggestions(false);
  };

  if (!open) return null;

  const groupedSuggestions: Record<string, DrugData[]> = {};
  filtered.forEach((d) => {
    if (!groupedSuggestions[d.category]) groupedSuggestions[d.category] = [];
    groupedSuggestions[d.category].push(d);
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-[620px] max-h-[90vh] bg-white text-gray-900 rounded-2xl shadow-2xl border overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {defaultValues ? "Edit Prescription" : "Add Prescription"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 space-y-5 relative">

          {/* Drug Search */}
          <div className="relative">
            <FieldBlock
              label="Drug Name"
              placeholder="Search medication..."
              value={drug}
              onChange={(e) => setDrug(e.target.value)}
            />

            {showSuggestions && (
              <div className="absolute top-[5.25rem] left-0 right-0 bg-white border rounded-xl shadow-lg max-h-64 overflow-y-auto z-50">
                {Object.entries(groupedSuggestions).map(([cat, drugs]) => (
                  <div key={cat}>
                    <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase">
                      {cat}
                    </div>
                    {drugs.map((d) => (
                      <div
                        key={d.name}
                        onClick={() => handleSelect(d.name)}
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-violet-50 transition"
                      >
                        {d.name}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldBlock label="Dose" value={dose} onChange={(e) => setDose(e.target.value)} />
            <FieldBlock label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
            <FieldBlock label="Duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>

          <FieldBlock
            label="Instructions"
            type="textarea"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!drug.trim()}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
          >
            {defaultValues ? "Save Changes" : "Add Prescription"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PrescriptionModal;