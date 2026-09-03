"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

export default function MedicinesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
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
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchMedicines();
        setShowForm(false);
        setFormData({
          generic: "",
          brandName: "",
          quantity: "",
          dosage: "",
          instructions: "",
        });
        alert("Medicine added successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add medicine");
      }
    } catch (error) {
      console.error("Error saving medicine:", error);
      alert("Error saving medicine");
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    try {
      const response = await fetch(`/api/medicines/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchMedicines();
        alert("Medicine deleted!");
      } else {
        alert("Failed to delete medicine");
      }
    } catch (error) {
      console.error("Error deleting medicine:", error);
      alert("Error deleting medicine");
    }
  };

  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.brandName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              💊 My Medicines
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View and manage your personal list of medicines.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ${
              showForm
                ? "bg-slate-600 hover:bg-slate-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {showForm ? (
              <>
                <span className="mr-1.5">✕</span> Cancel
              </>
            ) : (
              <>
                <span className="mr-1.5">+</span> Add New Medicine
              </>
            )}
          </button>
        </div>

        {/* Add Form (slide-down) */}
        <div
          className={`mb-8 overflow-hidden transition-all duration-300 ${
            showForm ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              New Medicine Entry
            </h3>
            <form onSubmit={handleSaveMedicine} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Generic Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.generic}
                    onChange={(e) =>
                      setFormData({ ...formData, generic: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="e.g., Paracetamol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) =>
                      setFormData({ ...formData, brandName: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="e.g., Panadol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="e.g., 30 tablets"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) =>
                      setFormData({ ...formData, dosage: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="e.g., 500mg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="e.g., Take after meals"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <span className="mr-1.5">✓</span> Add Medicine
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      generic: "",
                      brandName: "",
                      quantity: "",
                      dosage: "",
                      instructions: "",
                    });
                  }}
                  className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by generic or brand name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Table / List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <p className="text-sm text-slate-500">Loading medicines...</p>
            </div>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
              📋
            </div>
            <p className="text-lg font-medium text-slate-700">
              No medicines found
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Click 'Add New Medicine' to add your first medicine."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Generic
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Brand
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Dosage
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Instructions
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredMedicines.map((med) => (
                    <tr
                      key={med.id}
                      className="transition hover:bg-emerald-50/50"
                    >
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
                      <td className="whitespace-nowrap px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleDeleteMedicine(med.id)}
                          className="inline-flex items-center rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
                        >
                          <span className="mr-1">🗑</span> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}