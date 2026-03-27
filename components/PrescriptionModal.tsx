"use client";
 
import { useState, useEffect } from "react";
import { FieldBlock } from "./UIHelpers";
 
export type Prescription = {
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
  form: string;
};
 
type DrugData = {
  name: string;
  category: "ENT" | "Aesthetics";
  dose: string;
  frequency: string;
  duration: string;
  form: string;
};
 
const INITIAL_DRUG_LIST: DrugData[] = [
  { name: "Amoxicillin", category: "ENT", dose: "500mg", frequency: "3 times daily", duration: "7 days", form: "Tablet" },
  { name: "Azithromycin", category: "ENT", dose: "250mg", frequency: "Once daily", duration: "5 days", form: "Tablet" },
  { name: "Cefuroxime", category: "ENT", dose: "500mg", frequency: "2 times daily", duration: "7 days", form: "Syrup" },
  { name: "Dexamethasone", category: "ENT", dose: "4mg", frequency: "Once daily", duration: "3 days", form: "Tablet" },
  { name: "Hyaluronic Acid", category: "Aesthetics", dose: "1 vial", frequency: "Once", duration: "Single session", form: "Vial" },
  { name: "Botulinum Toxin", category: "Aesthetics", dose: "20 units", frequency: "Once", duration: "Single session", form: "Injection" },
  { name: "Vitamin C Serum", category: "Aesthetics", dose: "Apply 2 drops", frequency: "Daily", duration: "2 weeks", form: "Topical" },
  { name: "Retinol Cream", category: "Aesthetics", dose: "Pea-sized amount", frequency: "Daily", duration: "4 weeks", form: "Topical" },
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
  // Main modal state
  const [drug, setDrug] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [form, setForm] = useState("");
 
  const [drugs, setDrugs] = useState<DrugData[]>(INITIAL_DRUG_LIST);
  const [filtered, setFiltered] = useState<DrugData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
 
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [newDrug, setNewDrug] = useState("");
  const [newDose, setNewDose] = useState("");
  const [newFrequency, setNewFrequency] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [newForm, setNewForm] = useState("");
 
  // Load defaultValues
  useEffect(() => {
    if (defaultValues) {
      setDrug(defaultValues.drug);
      setDose(defaultValues.dose);
      setFrequency(defaultValues.frequency);
      setDuration(defaultValues.duration);
      setInstructions(defaultValues.instructions);
      setForm(defaultValues.form || "");
    } else {
      setDrug("");
      setDose("");
      setFrequency("");
      setDuration("");
      setInstructions("");
      setForm("");
    }
  }, [defaultValues, open]);
 
  // Filter suggestions
  useEffect(() => {
    if (!drug.trim()) {
      setFiltered([]);
      setShowSuggestions(false);
      return;
    }
 
    const matches = drugs.filter((d) =>
      d.name.toLowerCase().includes(drug.toLowerCase())
    );
 
    setFiltered(matches);
    setShowSuggestions(matches.length > 0);
  }, [drug, drugs]);
 
  const handleSelect = (drugName: string) => {
    const selected = drugs.find((d) => d.name === drugName);
    if (!selected) return;
 
    setDrug(selected.name);
    setDose(selected.dose);
    setFrequency(selected.frequency);
    setDuration(selected.duration);
    setForm(selected.form);
    setShowSuggestions(false);
  };
 
  const handleSavePrescription = () => {
    if (!drug.trim()) return;
    onSave({ drug, dose, frequency, duration, instructions, form });
    setShowSuggestions(false);
  };
 
  const handleAddMedication = () => {
    if (!newDrug.trim()) return;
 
    const newMed: DrugData = {
      name: newDrug,
      category: "ENT",
      dose: newDose,
      frequency: newFrequency,
      duration: newDuration,
      form: newForm,
    };
 
    setDrugs((prev) => [...prev, newMed]);
 
    setNewDrug("");
    setNewDose("");
    setNewFrequency("");
    setNewDuration("");
    setNewInstructions("");
    setNewForm("");
    setShowAddMedication(false);
  };
 
  if (!open) return null;
 
  const groupedSuggestions: Record<string, DrugData[]> = {};
  filtered.forEach((d) => {
    if (!groupedSuggestions[d.category]) groupedSuggestions[d.category] = [];
    groupedSuggestions[d.category].push(d);
  });
 
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      {/* Backdrop for side panel */}
      {showAddMedication && (
        <div
          className="absolute inset-0 bg-black/20 z-40"
          onClick={() => setShowAddMedication(false)}
        />
      )}
     
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-linear-to-r from-white to-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {defaultValues ? "Edit Prescription" : "Add Prescription"}
              </h2>
              <p className="text-xs text-gray-500">Enter medication details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
 
        {/* BODY */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* Drug Search */}
          <div className="relative">
            <FieldBlock
              label="Drug Name"
              placeholder="Search medication..."
              value={drug}
              onChange={(e) => setDrug(e.target.value)}
            />
 
            {showSuggestions && (
              <div className="absolute top-[4.5rem] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto z-50">
                {Object.entries(groupedSuggestions).map(([cat, drugsList]) => (
                  <div key={cat}>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100 sticky top-0">
                      {cat} Medications
                    </div>
                    {drugsList.map((d) => (
                      <div
                        key={d.name}
                        onClick={() => handleSelect(d.name)}
                        className="px-4 py-3 cursor-pointer hover:bg-indigo-50/70 border-b border-gray-50 last:border-b-0 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">{d.name}</span>
                          <span className="text-xs text-gray-400 group-hover:text-indigo-500">{d.form}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {d.dose} • {d.frequency}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
 
          {/* Grid Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Dose</label>
              <input
                type="text"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="e.g., 500mg"
                className="w-full rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Frequency</label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g., 3 times daily"
                className="w-full rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 7 days"
                className="w-full rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Form</label>
              <input
                type="text"
                value={form}
                onChange={(e) => setForm(e.target.value)}
                placeholder="e.g., Tablet"
                className="w-full rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
 
          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Instructions</label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Additional instructions for the patient..."
              className="w-full rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-900 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
            />
          </div>
        </div>
 
        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <button
            onClick={() => setShowAddMedication(true)}
            className="px-4 py-2.5 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 text-sm font-medium transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Medication
          </button>
 
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePrescription}
              disabled={!drug.trim()}
              className="px-5 py-2.5 bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm hover:shadow"
            >
              {defaultValues ? "Save Changes" : "Add Prescription"}
            </button>
          </div>
        </div>
 
        {/* SIDE PANEL - SLIDING DRAWER */}
        {showAddMedication && (
          <div className="absolute top-0 right-0 h-full w-full sm:w-[360px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col animate-slide-in-right">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-linear-to-r from-white to-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Add New Medication</h3>
              </div>
              <button
                onClick={() => setShowAddMedication(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
 
            <div className="px-5 py-5 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Drug Name *</label>
                <input
                  type="text"
                  value={newDrug}
                  onChange={(e) => setNewDrug(e.target.value)}
                  placeholder="Enter medication name"
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Dose</label>
                <input
                  type="text"
                  value={newDose}
                  onChange={(e) => setNewDose(e.target.value)}
                  placeholder="e.g., 500mg"
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Frequency</label>
                <input
                  type="text"
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  placeholder="e.g., 3 times daily"
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Duration</label>
                <input
                  type="text"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  placeholder="e.g., 7 days"
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Form</label>
                <input
                  type="text"
                  value={newForm}
                  onChange={(e) => setNewForm(e.target.value)}
                  placeholder="e.g., Tablet, Syrup, Injection"
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Instructions</label>
                <textarea
                  rows={3}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Additional instructions..."
                  className="w-full rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-900 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none transition-all"
                />
              </div>
            </div>
 
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 gap-3">
              <button
                onClick={() => setShowAddMedication(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMedication}
                disabled={!newDrug.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm"
              >
                Add Medication
              </button>
            </div>
          </div>
        )}
      </div>
 
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
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
};
 
export default PrescriptionModal;