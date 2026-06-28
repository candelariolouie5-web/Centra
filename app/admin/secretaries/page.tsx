"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Play,
  Pause,
  Search,
  Users,
  RefreshCcw,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import { useSession } from "next-auth/react";
import SecretaryDetailsModal from "@/components/SecretaryDetailsModal";
import AddSecretaryModal from "@/components/AddSecretaryModal";
import { Th, Td } from "@/components/UIHelpers";

interface Secretary {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SecretariesPage = () => {
  const { data: session, status } = useSession();

  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSecretary, setSelectedSecretary] = useState<Secretary | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deletingSecretaries, setDeletingSecretaries] = useState(new Set<string>());

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const secretariesPerPage = 10;

  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddSecretarySuccess = () => {
    fetchSecretaries();
    setShowAddModal(false);
  };

  const fetchSecretaries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/secretaries");
      if (res.ok) {
        const data = await res.json();
        setSecretaries(data.secretaries || []);
        setActiveCount(data.activeCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch secretaries", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSecretaries();
  }, []);

  const handleToggleActive = async (secretaryId: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/secretaries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: secretaryId, isActive: !currentActive }),
      });
      if (res.ok) {
        fetchSecretaries();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update secretary");
      }
    } catch {
      alert("Network error");
    }
  };

  const handleDelete = async (secretaryId: string) => {
    setDeletingSecretaries((prev) => new Set(prev).add(secretaryId));
    try {
      const res = await fetch(`/api/admin/secretaries/${secretaryId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSecretaries((prev) => prev.filter((s) => s.id !== secretaryId));
        fetchSecretaries();
        return;
      }
      const errorData = await res.json();
      alert(errorData.error || "Failed to delete secretary");
    } catch {
      alert("Network error");
    } finally {
      setDeletingSecretaries((prev) => {
        const newSet = new Set(prev);
        newSet.delete(secretaryId);
        return newSet;
      });
    }
  };

  const filteredSecretaries = useMemo(() => {
    return secretaries.filter(
      (sec) =>
        sec.name.toLowerCase().includes(search.toLowerCase()) ||
        sec.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [secretaries, search]);

  const indexOfLast = currentPage * secretariesPerPage;
  const indexOfFirst = indexOfLast - secretariesPerPage;
  const currentSecretaries = filteredSecretaries.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredSecretaries.length / secretariesPerPage);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-emerald-500",
      "bg-teal-500",
      "bg-green-500",
      "bg-cyan-500",
      "bg-sky-500",
      "bg-indigo-500",
    ];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const inactiveCount = secretaries.length - activeCount;
  const shownFrom = filteredSecretaries.length === 0 ? 0 : indexOfFirst + 1;
  const shownTo = Math.min(indexOfLast, filteredSecretaries.length);

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.08),_transparent_22%),linear-gradient(to_bottom,_#f8fafc,_#eef6ff)]">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Secretary Management
            </h1>
            <p className="text-sm text-slate-500">
              View, manage, and monitor secretary accounts in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 shadow-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <button
              onClick={fetchSecretaries}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700"
            >
              <Plus className="h-4 w-4" />
              Add Secretary
            </button>
          </div>
        </div>
      </header>

      {/* ---------- Main Content ---------- */}
      <main className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Gradient card */}
          <div className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_24px_60px_-28px_rgba(16,185,129,0.28)]">
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 px-6 py-8 text-white md:px-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.08),_transparent_28%)]" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                    <Users className="h-4 w-4" />
                    Centra Clinic Secretary Overview
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                    Secretaries Directory
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-emerald-50/90 md:text-base">
                    Search, review, activate, deactivate, and manage secretary accounts.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">Total</p>
                    <p className="mt-1 text-lg font-bold">{secretaries.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">Active</p>
                    <p className="mt-1 text-lg font-bold">{activeCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">Results</p>
                    <p className="mt-1 text-lg font-bold">{filteredSecretaries.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Total Secretaries</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{secretaries.length}</p>
                  <p className="mt-2 text-sm text-slate-500">Total registered secretary accounts</p>
                </div>
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-green-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">Active Secretaries</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{activeCount}</p>
                  <p className="mt-2 text-sm text-slate-500">Currently active secretary accounts</p>
                </div>
                <div className="rounded-2xl bg-green-100 p-3 text-green-700">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Inactive Secretaries</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{inactiveCount}</p>
                  <p className="mt-2 text-sm text-slate-500">Accounts currently not active</p>
                </div>
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Search & Table header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Secretary Directory</h3>
              <p className="text-sm text-slate-500">
                Search by secretary name or email and manage accounts quickly.
              </p>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search secretary name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <Th className="py-4">Secretary</Th>
                    <Th>Email</Th>
                    <Th>Status</Th>
                    <Th>Joined</Th>
                    <Th className="pr-6 text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                            <Users className="h-6 w-6" />
                          </div>
                          <p className="text-base font-medium text-slate-700">Loading secretaries...</p>
                        </div>
                      </td>
                    </tr>
                  ) : currentSecretaries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                            <Users className="h-6 w-6" />
                          </div>
                          <p className="text-base font-medium text-slate-700">No secretaries available</p>
                          <p className="mt-1 text-sm text-slate-400">
                            Try a different search keyword or add a new secretary.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentSecretaries.map((secretary) => (
                      <tr key={secretary.id} className="transition hover:bg-emerald-50/40">
                        <Td className="py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm ${getAvatarColor(secretary.name)}`}
                            >
                              {secretary.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{secretary.name}</p>
                              <p className="text-xs text-slate-400">Sec ID: {secretary.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <span className="text-slate-600">{secretary.email}</span>
                        </Td>
                        <Td>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              secretary.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {secretary.isActive ? "🟢 Active" : "⭕ Inactive"}
                          </span>
                        </Td>
                        <Td>
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {new Date(secretary.createdAt).toLocaleDateString()}
                          </span>
                        </Td>
                        <Td>
                          <div className="flex justify-end gap-2 pr-4">
                            <button
                              onClick={() => {
                                setSelectedSecretary(secretary);
                                setShowDetails(true);
                              }}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                              title="View Secretary"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(secretary.id, secretary.isActive)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                              title={secretary.isActive ? "Deactivate Secretary" : "Activate Secretary"}
                            >
                              {secretary.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(secretary.id)}
                              disabled={deletingSecretaries.has(secretary.id)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete Secretary"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredSecretaries.length > 0 && (
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-800">{shownFrom}</span> to{" "}
                <span className="font-semibold text-slate-800">{shownTo}</span> of{" "}
                <span className="font-semibold text-slate-800">{filteredSecretaries.length}</span> secretaries
              </p>
              <div className="flex items-center gap-1 rounded-2xl bg-slate-50 p-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`min-w-[40px] rounded-xl px-3 py-2 text-sm font-medium transition ${
                        currentPage === page
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <SecretaryDetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        secretary={selectedSecretary}
      />
      <AddSecretaryModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSecretarySuccess}
      />
    </div>
  );
};

export default SecretariesPage;