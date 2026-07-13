"use client";

import { useEffect, useMemo, useState } from "react";
import PatientDetailsModal from "@/components/PatientDetailsModal";
import SoapNoteModal from "@/components/soapnotemodal";
import AddPatientModal from "@/components/AddPatientModal";
import MedicalHistoryModal from "@/components/medicalhistorymodal";
import { Th, Td } from "@/components/UIHelpers";
import {
  Search,
  UserPlus,
  Eye,
  FileText,
  Trash2,
  Users,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "ACCEPTED" | "CANCELLED" | "COMPLETED" | string;

interface Patient {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null;
  createdAt: string;
  latestAppointmentStatus?: AppointmentStatus | null;
  hasTodayAppointment?: boolean;
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);

  const [showDetails, setShowDetails] = useState(false);
  const [showSoap, setShowSoap] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false);

  const [tab, setTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 5;
  const [medicalHistoryKey, setMedicalHistoryKey] = useState(0);

  type FilterKey = "ongoing" | "today" | "cancelled" | "completed";
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ongoing");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/doctor/patients");
      if (!res.ok) throw new Error("Failed to fetch patients");
      const data = await res.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const refreshPatient = () => fetchPatients();

  const handleMedicalHistorySuccess = () => {
    setMedicalHistoryKey((prev) => prev + 1);
    fetchPatients();
  };

  const filteredPatients = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    const matchesFilter = (p: Patient) => {
      const status = p.latestAppointmentStatus;
      switch (activeFilter) {
        case "ongoing":
          return status && status !== "CANCELLED" && status !== "COMPLETED";
        case "today":
          return p.hasTodayAppointment === true;
        case "cancelled":
          return status === "CANCELLED";
        case "completed":
          return status === "COMPLETED";
        default:
          return true;
      }
    };

    return patients.filter((p) => {
      if (!matchesFilter(p)) return false;
      return (
        p.name?.toLowerCase().includes(normalizedSearch) ||
        p.email?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [patients, search, activeFilter]);

  const ongoingCount = patients.filter(p => {
    const s = p.latestAppointmentStatus;
    return s && s !== "CANCELLED" && s !== "COMPLETED";
  }).length;
  const todayCount = patients.filter(p => p.hasTodayAppointment === true).length;
  const cancelledCount = patients.filter(p => p.latestAppointmentStatus === "CANCELLED").length;
  const completedCount = patients.filter(p => p.latestAppointmentStatus === "COMPLETED").length;

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-cyan-500",
      "bg-sky-500",
      "bg-blue-500",
      "bg-teal-500",
      "bg-indigo-500",
      "bg-emerald-500",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const deletePatient = async (patient: Patient) => {
    if (!confirm(`Delete ${patient.name}?`)) return;
    try {
      const res = await fetch(`/api/doctor/patients/${patient.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete patient");
      fetchPatients();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalPatients = patients.length;
  const shownFrom = filteredPatients.length === 0 ? 0 : indexOfFirstPatient + 1;
  const shownTo = Math.min(indexOfLastPatient, filteredPatients.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_22%),linear-gradient(to_bottom,_#f8fafc,_#eef6ff)] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-7 w-56 rounded bg-slate-200" />
              <div className="h-4 w-80 rounded bg-slate-100" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="h-8 w-16 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-400">Loading patients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_22%),linear-gradient(to_bottom,_#f8fafc,_#eef6ff)] p-6">
        <div className="mx-auto flex max-w-7xl items-center justify-center">
          <div className="w-full max-w-lg rounded-[28px] border border-red-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
            <p className="mt-2 text-sm text-red-500">{error}</p>
            <button onClick={fetchPatients} className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_22%),linear-gradient(to_bottom,_#f8fafc,_#eef6ff)]">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patient Management</h1>
            <p className="text-sm text-slate-500">View, manage, and monitor patient records in one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 shadow-sm">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>
            <button onClick={fetchPatients} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:-translate-y-0.5 hover:from-cyan-700 hover:to-blue-700">
              <RefreshCcw className="h-4 w-4" /> Refresh
            </button>
            <button onClick={() => setShowAddPatient(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:-translate-y-0.5 hover:from-cyan-700 hover:to-blue-700">
              <UserPlus className="h-4 w-4" /> Add Patient
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header cards */}
          <div className="overflow-hidden rounded-[28px] border border-cyan-100 bg-white shadow-[0_24px_60px_-28px_rgba(14,165,233,0.28)]">
            <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 px-6 py-8 text-white md:px-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.08),_transparent_28%)]" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                    <Users className="h-4 w-4" /> Centra Clinic Patient Overview
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Patient Directory</h2>
                  <p className="mt-2 max-w-2xl text-sm text-cyan-50/90 md:text-base">Search, review, and manage registered patients with the same dashboard-style visual design.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur"><p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Total</p><p className="mt-1 text-lg font-bold">{totalPatients}</p></div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur"><p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Results</p><p className="mt-1 text-lg font-bold">{filteredPatients.length}</p></div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur"><p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Page</p><p className="mt-1 text-lg font-bold">{filteredPatients.length === 0 ? 0 : currentPage}</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-cyan-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">Total Patients</p><p className="mt-3 text-3xl font-bold text-slate-900">{totalPatients}</p><p className="mt-2 text-sm text-slate-500">Total registered patient records</p></div>
                <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700"><Users className="h-5 w-5" /></div>
              </div>
            </div>
            <div className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Search Results</p><p className="mt-3 text-3xl font-bold text-slate-900">{filteredPatients.length}</p><p className="mt-2 text-sm text-slate-500">Matching patients from your search</p></div>
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-700"><Search className="h-5 w-5" /></div>
              </div>
            </div>
            <div className="rounded-[24px] border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Current Page</p><p className="mt-3 text-3xl font-bold text-slate-900">{filteredPatients.length === 0 ? 0 : currentPage}</p><p className="mt-2 text-sm text-slate-500">Active page in patient directory</p></div>
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><CalendarDays className="h-5 w-5" /></div>
              </div>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><h3 className="text-lg font-semibold text-slate-900">Patient Directory</h3><p className="text-sm text-slate-500">Search by patient name or email and manage records quickly.</p></div>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search patient name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" />
            </div>
          </div>

          {/* Filter buttons */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Appointment Filters</p><p className="mt-2 text-sm text-slate-600">Use filters to show patients based on their latest appointment status.</p></div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setActiveFilter("ongoing"); setCurrentPage(1); }} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition border ${activeFilter === "ongoing" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Ongoing ({ongoingCount})
                </button>
                <button onClick={() => { setActiveFilter("today"); setCurrentPage(1); }} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition border ${activeFilter === "today" ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" /> Today ({todayCount})
                </button>
                <button onClick={() => { setActiveFilter("cancelled"); setCurrentPage(1); }} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition border ${activeFilter === "cancelled" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Cancelled ({cancelledCount})
                </button>
                <button onClick={() => { setActiveFilter("completed"); setCurrentPage(1); }} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition border ${activeFilter === "completed" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Completed ({completedCount})
                </button>
              </div>
            </div>
          </div>

          {/* Patient Table */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <tr><Th className="py-4">Patient</Th><Th>Email</Th><Th>Registered Date</Th><Th className="pr-6 text-right">Actions</Th></tr>
                </thead>
                <tbody>
                  {currentPatients.length === 0 ? (
                    <tr><td colSpan={4} className="py-16 text-center"><div className="mx-auto flex max-w-sm flex-col items-center"><div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400"><Users className="h-6 w-6" /></div><p className="text-base font-medium text-slate-700">No patients found</p><p className="mt-1 text-sm text-slate-400">Try a different search keyword or add a new patient.</p></div></td></tr>
                  ) : (
                    currentPatients.map((p) => (
                      <tr key={p.id} className="transition hover:bg-cyan-50/40">
                        <Td className="py-4"><div className="flex items-center gap-3">{p.image ? <img src={p.image} alt={p.name || "Patient"} className="h-11 w-11 rounded-full border border-slate-200 object-cover shadow-sm" /> : <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm ${getAvatarColor(p.name || "A")}`}>{p.name?.charAt(0)?.toUpperCase() || "A"}</div>}<div><p className="font-semibold text-slate-800">{p.name || "N/A"}</p><p className="text-xs text-slate-400">Patient ID: {p.id.slice(0, 8)}</p></div></div></Td>
                        <Td><span className="text-slate-600">{p.email || "No email"}</span></Td>
                        <Td><span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{new Date(p.createdAt).toLocaleDateString()}</span></Td>
                        <Td><div className="flex justify-end gap-2 pr-4">
                          <button title="View Patient" onClick={() => { setSelected(p); setTab("info"); setShowDetails(true); }} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-600"><Eye className="h-4 w-4" /></button>
                          <button title="SOAP Note" onClick={() => { setSelected(p); setShowSoap(true); }} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"><FileText className="h-4 w-4" /></button>
                          <button title="Delete" onClick={() => deletePatient(p)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                        </div></Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredPatients.length > 0 && (
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">Showing <span className="font-semibold text-slate-800">{shownFrom}</span> to <span className="font-semibold text-slate-800">{shownTo}</span> of <span className="font-semibold text-slate-800">{filteredPatients.length}</span> patients</p>
              <div className="flex items-center gap-1 rounded-2xl bg-slate-50 p-1">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: totalPages }, (_, i) => { const page = i + 1; return <button key={page} onClick={() => goToPage(page)} className={`min-w-[40px] rounded-xl px-3 py-2 text-sm font-medium transition ${currentPage === page ? "bg-cyan-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}>{page}</button>; })}
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}

          {/* Modals */}
          <PatientDetailsModal key={`details-${medicalHistoryKey}`} open={showDetails} onClose={() => setShowDetails(false)} patient={selected} tab={tab} setTab={setTab} onCreateMedicalHistory={() => setShowMedicalHistoryModal(true)} onRefreshMedicalHistory={handleMedicalHistorySuccess} onRefreshPatient={refreshPatient} />
          <SoapNoteModal open={showSoap} onClose={() => { setShowSoap(false); fetchPatients(); }} patient={selected} />
          <AddPatientModal open={showAddPatient} onClose={() => setShowAddPatient(false)} onSuccess={fetchPatients} />
          <MedicalHistoryModal key={`medical-history-${medicalHistoryKey}`} open={showMedicalHistoryModal} onClose={() => setShowMedicalHistoryModal(false)} patientId={selected?.id} onSuccess={handleMedicalHistorySuccess} />
        </div>
      </main>
    </div>
  );
}