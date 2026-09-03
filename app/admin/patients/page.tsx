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
    Clock,
    TrendingUp,
    UserCheck,
    UserX,
    Activity,
  } from "lucide-react";

  type AppointmentStatus = "PENDING" | "CONFIRMED" | "ACCEPTED" | "CANCELLED" | "COMPLETED" | string;

  // ---- FIX: name is required (string) to match SoapNoteModal's Patient type ----
  interface Patient {
    id: string;
    name: string;               // changed from string | null
    email: string | null;
    image?: string | null;
    age?: number | null;
    phone?: string | null;
    createdAt: string;
    latestAppointmentStatus?: AppointmentStatus | null;
    hasTodayAppointment?: boolean;
  }

  export default function PatientsPage() {
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
    const [activeFilter, setActiveFilter] = useState<FilterKey>("today");

    useEffect(() => {
      fetchPatients();
    }, []);

    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/patients");
        if (!res.ok) throw new Error("Failed to fetch patients");
        const data = await res.json();
        // ---- FIX: map to ensure name is never null ----
        setPatients(
          (data.patients || []).map((p: any) => ({
            ...p,
            name: p.name || "N/A",
          }))
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load patients");
      } finally {
        setLoading(false);
      }
    };

    const refreshPatient = () => {
      fetchPatients();
    };

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
        "bg-gradient-to-br from-cyan-400 to-cyan-600",
        "bg-gradient-to-br from-sky-400 to-sky-600",
        "bg-gradient-to-br from-blue-400 to-blue-600",
        "bg-gradient-to-br from-teal-400 to-teal-600",
        "bg-gradient-to-br from-indigo-400 to-indigo-600",
        "bg-gradient-to-br from-emerald-400 to-emerald-600",
        "bg-gradient-to-br from-rose-400 to-rose-600",
        "bg-gradient-to-br from-amber-400 to-amber-600",
      ];
      return colors[name.charCodeAt(0) % colors.length];
    };

    const deletePatient = async (patient: Patient) => {
      if (!confirm(`Delete ${patient.name}?`)) return;
      try {
        const res = await fetch(`/api/admin/patients/${patient.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete patient");
        fetchPatients();
      } catch (err: any) {
        alert(err.message);
      }
    };

    const getStatusBadge = (status?: string | null) => {
      if (!status) return null;
      switch (status) {
        case "CONFIRMED":
          return { color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
        case "PENDING":
          return { color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" };
        case "CANCELLED":
          return { color: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" };
        case "COMPLETED":
          return { color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" };
        default:
          return { color: "bg-slate-50 text-slate-700 border-slate-200", dot: "bg-slate-500" };
      }
    };

    const totalPatients = patients.length;
    const shownFrom = filteredPatients.length === 0 ? 0 : indexOfFirstPatient + 1;
    const shownTo = Math.min(indexOfLastPatient, filteredPatients.length);
    const todayDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-lg">
              <div className="animate-pulse space-y-4">
                <div className="h-8 w-64 rounded-lg bg-slate-200" />
                <div className="h-4 w-96 rounded-lg bg-slate-100" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-6 shadow-lg"
                >
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="h-10 w-20 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-12 text-center shadow-lg">
              <p className="text-slate-400 font-medium">Loading patients...</p>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 p-6">
          <div className="mx-auto flex max-w-7xl items-center justify-center">
            <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white/80 backdrop-blur-sm p-10 text-center shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <Trash2 className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-red-500">{error}</p>
              <button
                onClick={fetchPatients}
                className="mt-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-sm">
          <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Activity className="h-6 w-6 text-cyan-600" />
                Patient Management
              </h1>
              <p className="text-sm text-slate-500">
                View, manage, and monitor patient records in one place.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
                <CalendarDays className="h-4 w-4 text-cyan-600" />
                {todayDate}
              </div>

              <button
                onClick={refreshPatient}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:from-cyan-700 hover:to-blue-700"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>

              <button
                onClick={() => setShowAddPatient(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:from-cyan-700 hover:to-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Add Patient
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-xl shadow-cyan-600/5">
              <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 px-6 py-8 text-white md:px-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.05),_transparent_40%)]" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur">
                      <Users className="h-4 w-4" />
                      Centra Clinic Patient Overview
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                      Patient Directory
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm text-cyan-50/90 md:text-base">
                      Search, review, and manage registered patients with quick access to their records and appointments.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur text-center">
                      <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">
                        Total
                      </p>
                      <p className="mt-1 text-2xl font-bold">{totalPatients}</p>
                    </div>

                    <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur text-center">
                      <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">
                        Filtered
                      </p>
                      <p className="mt-1 text-2xl font-bold">
                        {filteredPatients.length}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur text-center">
                      <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">
                        Page
                      </p>
                      <p className="mt-1 text-2xl font-bold">
                        {filteredPatients.length === 0 ? 0 : currentPage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="group rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-600/5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
                      Total Patients
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {totalPatients}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Registered records
                    </p>
                  </div>
                  <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-600/5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                      Today's Patients
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {todayCount}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Scheduled today
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 group-hover:scale-110 transition-transform">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                      Search Results
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {filteredPatients.length}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Matching patients
                    </p>
                  </div>
                  <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 group-hover:scale-110 transition-transform">
                    <Search className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-600/5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                      Current Page
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {filteredPatients.length === 0 ? 0 : currentPage}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      of {totalPages || 1} pages
                    </p>
                  </div>
                  <div className="rounded-2xl bg-violet-100 p-3 text-violet-700 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Patient Directory
                </h3>
                <p className="text-sm text-slate-500">
                  Search by patient name or email and manage records quickly.
                </p>
              </div>

              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 focus:shadow-md"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-700">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Appointment Filters
                      </p>
                      <p className="text-sm text-slate-600">
                        Filter patients by appointment status
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter("ongoing");
                        setCurrentPage(1);
                      }}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                        activeFilter === "ongoing"
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <UserCheck className="h-4 w-4" />
                      Ongoing ({ongoingCount})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter("today");
                        setCurrentPage(1);
                      }}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                        activeFilter === "today"
                          ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <CalendarDays className="h-4 w-4" />
                      Today ({todayCount})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter("cancelled");
                        setCurrentPage(1);
                      }}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                        activeFilter === "cancelled"
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <UserX className="h-4 w-4" />
                      Cancelled ({cancelledCount})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter("completed");
                        setCurrentPage(1);
                      }}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                        activeFilter === "completed"
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Completed ({completedCount})
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-xs uppercase tracking-[0.18em] text-slate-500">
                      <tr>
                        <Th className="py-4">Patient</Th>
                        <Th>Email</Th>
                        <Th>Registered Date</Th>
                        <Th>Status</Th>
                        <Th className="pr-6 text-right">Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPatients.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-16 text-center">
                            <div className="mx-auto flex max-w-sm flex-col items-center">
                              <div className="mb-4 rounded-2xl bg-slate-100 p-5 text-slate-400">
                                <Users className="h-8 w-8" />
                              </div>
                              <p className="text-base font-semibold text-slate-700">
                                No patients found
                              </p>
                              <p className="mt-1 text-sm text-slate-400">
                                {activeFilter === "today" 
                                  ? "There are no patients scheduled for today." 
                                  : "Try a different search keyword or add a new patient."}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentPatients.map((p) => {
                          const statusBadge = getStatusBadge(p.latestAppointmentStatus);
                          return (
                            <tr key={p.id} className="group transition-all hover:bg-cyan-50/60 hover:shadow-inner">
                              <Td className="py-4">
                                <div className="flex items-center gap-3">
                                  {p.image ? (
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      className="h-11 w-11 rounded-full border-2 border-slate-200 object-cover shadow-sm group-hover:border-cyan-400 transition-colors"
                                    />
                                  ) : (
                                    <div
                                      className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white shadow-md ${getAvatarColor(
                                        p.name
                                      )}`}
                                    >
                                      {p.name?.charAt(0)?.toUpperCase() || "A"}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-slate-800 group-hover:text-cyan-700 transition-colors">
                                      {p.name}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      ID: {p.id.slice(0, 8)}
                                    </p>
                                  </div>
                                </div>
                              </Td>
                              <Td>
                                <span className="text-slate-600">
                                  {p.email || "No email"}
                                </span>
                              </Td>
                              <Td>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                                  <CalendarDays className="h-3 w-3" />
                                  {new Date(p.createdAt).toLocaleDateString()}
                                </span>
                              </Td>
                              <Td>
                                {statusBadge && (
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border ${statusBadge.color}`}>
                                    <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                                    {p.latestAppointmentStatus}
                                  </span>
                                )}
                              </Td>
                              <Td>
                                <div className="flex justify-end gap-2 pr-4">
                                  <button
                                    title="View Patient"
                                    onClick={() => {
                                      setSelected(p);
                                      setTab("info");
                                      setShowDetails(true);
                                    }}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-600 hover:shadow-md"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    title="SOAP Note"
                                    onClick={() => {
                                      setSelected(p);
                                      setShowSoap(true);
                                    }}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-md"
                                  >
                                    <FileText className="h-4 w-4" />
                                  </button>
                                  <button
                                    title="Delete"
                                    onClick={() => deletePatient(p)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition-all hover:bg-red-100 hover:shadow-md"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </Td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredPatients.length > 0 && (
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-800">{shownFrom}</span>{" "}
                    to{" "}
                    <span className="font-semibold text-slate-800">{shownTo}</span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-800">
                      {filteredPatients.length}
                    </span>{" "}
                    patients
                  </p>

                  <div className="flex items-center gap-1 rounded-2xl bg-slate-50 p-1">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-all hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`min-w-[40px] rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                            currentPage === page
                              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md"
                              : "text-slate-600 hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    {totalPages > 5 && (
                      <>
                        <span className="px-1 text-slate-400">...</span>
                        <button
                          onClick={() => goToPage(totalPages)}
                          className={`min-w-[40px] rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                            currentPage === totalPages
                              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md"
                              : "text-slate-600 hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-all hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <PatientDetailsModal
          key={`details-${medicalHistoryKey}`}
          open={showDetails}
          onClose={() => setShowDetails(false)}
          patient={selected}
          tab={tab}
          setTab={setTab}
          onCreateMedicalHistory={() => setShowMedicalHistoryModal(true)}
          onRefreshMedicalHistory={handleMedicalHistorySuccess}
          onPatientUpdated={fetchPatients}
        />

        <SoapNoteModal
          open={showSoap}
          onClose={() => {
            setShowSoap(false);
            fetchPatients();
          }}
          patient={selected}
        />

        <AddPatientModal
          open={showAddPatient}
          onClose={() => setShowAddPatient(false)}
          onSuccess={fetchPatients}
        />

        <MedicalHistoryModal
          key={`medical-history-${medicalHistoryKey}`}
          open={showMedicalHistoryModal}
          onClose={() => setShowMedicalHistoryModal(false)}
          patientId={selected?.id}
          onSuccess={handleMedicalHistorySuccess}
        />
      </div>
    );
  }

  const CheckCircle = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );