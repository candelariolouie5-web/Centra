"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  SearchIcon,
  XIcon,
  CheckIcon,
  Loader2,
  Pill,
  AlertCircle,
} from "lucide-react";

type Medicine = {
  id: string;
  generic: string;
  brandName: string;
  quantity: string;
  dosage: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
};

type MedicineFormData = {
  generic: string;
  brandName: string;
  quantity: string;
  dosage: string;
  instructions: string;
};

export default function MedicinesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Medicine>("generic");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formData, setFormData] = useState<MedicineFormData>({
    generic: "",
    brandName: "",
    quantity: "",
    dosage: "",
    instructions: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "DOCTOR") {
      router.push("/dashboard");
    }
    fetchMedicines();
  }, [session, status, router]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/medicines");
      if (response.ok) {
        const data = await response.json();
        setMedicines(data.medicines || []);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
      showToast("error", "Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMedicine(null);
    setFormData({
      generic: "",
      brandName: "",
      quantity: "",
      dosage: "",
      instructions: "",
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      generic: medicine.generic,
      brandName: medicine.brandName || "",
      quantity: medicine.quantity || "",
      dosage: medicine.dosage || "",
      instructions: medicine.instructions || "",
    });
    setShowModal(true);
  };

  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMedicine) {
        // Update
        const response = await fetch(`/api/medicines/${editingMedicine.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          await fetchMedicines();
          setShowModal(false);
          showToast("success", "Medicine updated successfully!");
        } else {
          const error = await response.json();
          showToast("error", error.error || "Failed to update medicine");
        }
      } else {
        // Create
        const response = await fetch("/api/medicines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          await fetchMedicines();
          setShowModal(false);
          showToast("success", "Medicine added successfully!");
        } else {
          const error = await response.json();
          showToast("error", error.error || "Failed to add medicine");
        }
      }
    } catch (error) {
      console.error("Error saving medicine:", error);
      showToast("error", "Error saving medicine");
    }
  };

  const handleDeleteMedicine = async () => {
    if (!deleteTarget) return;
    try {
      const response = await fetch(`/api/medicines/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchMedicines();
        showToast("success", "Medicine deleted successfully!");
        setDeleteTarget(null);
      } else {
        showToast("error", "Failed to delete medicine");
      }
    } catch (error) {
      console.error("Error deleting medicine:", error);
      showToast("error", "Error deleting medicine");
    }
  };

  const handleSort = (field: keyof Medicine) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedMedicines = [...medicines]
    .filter((med) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        med.generic.toLowerCase().includes(term) ||
        (med.brandName?.toLowerCase() || "").includes(term)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortField]?.toString().toLowerCase() || "";
      const bVal = b[sortField]?.toString().toLowerCase() || "";
      return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg text-white ${
              toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckIcon className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <Pill className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Medicines Inventory
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your clinic's medicine list and stock.
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Medicine
          </button>
        </div>

        {/* Search and Table Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <SearchIcon className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="text-sm text-slate-500">
            {filteredAndSortedMedicines.length} medicine{filteredAndSortedMedicines.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredAndSortedMedicines.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Pill className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-700">No medicines found</p>
            <p className="mt-1 text-sm text-slate-400">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Click 'Add Medicine' to add your first medicine."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="bg-slate-50">
                    {[
                      { label: "Generic", field: "generic" },
                      { label: "Brand", field: "brandName" },
                      { label: "Quantity", field: "quantity" },
                      { label: "Dosage", field: "dosage" },
                      { label: "Instructions", field: "instructions" },
                    ].map((col) => (
                      <th
                        key={col.field}
                        scope="col"
                        className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort(col.field as keyof Medicine)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortField === col.field && (
                            <span className="text-emerald-600">
                              {sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredAndSortedMedicines.map((med) => (
                    <tr key={med.id} className="transition hover:bg-emerald-50/40">
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-slate-900">
                        {med.generic}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-600">
                        {med.brandName || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-600">
                        {med.quantity || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-600">
                        {med.dosage || "—"}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3.5 text-sm text-slate-600">
                        {med.instructions || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(med)}
                            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <PencilIcon className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(med)}
                            className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                          >
                            <TrashIcon className="mr-1 h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMedicine} className="p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Generic Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.generic}
                    onChange={(e) =>
                      setFormData({ ...formData, generic: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="e.g., Paracetamol"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) =>
                      setFormData({ ...formData, brandName: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="e.g., Panadol"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="e.g., 30 tablets"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) =>
                      setFormData({ ...formData, dosage: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="e.g., 500mg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="e.g., Take after meals"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  {editingMedicine ? "Update Medicine" : "Add Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Delete Medicine
              </h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-900">
                {deleteTarget.generic}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMedicine}
                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}