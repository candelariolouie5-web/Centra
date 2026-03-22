"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PatientDetailsModal from "@/components/PatientDetailsModal";
import SoapNoteModal from "@/components/soapnotemodal";
import AddPatientModal from "@/components/AddPatientModal";
import MedicalHistoryModal from "@/components/medicalhistorymodal";
import { Th, Td } from "@/components/UIHelpers";

interface Patient {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null;
  createdAt: string;
}

export default function DoctorPatientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "DOCTOR") {
      router.push("/doctorlogin");
      return;
    }

    fetchPatients();
  }, [session, status, router]);

  const fetchPatients = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/patients");

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

  const refreshPatient = fetchPatients;

  const handleMedicalHistorySuccess = () => {
    setMedicalHistoryKey((prev) => prev + 1);
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

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
      "bg-indigo-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-orange-500",
    ];

    return colors[name.charCodeAt(0) % colors.length];
  };

  if (loading) {
    return (
      <section className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400">Loading patients...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Doctor Patient Management</h2>
          <p className="text-sm opacity-90">
            View and manage all registered patients
          </p>
        </div>

        <button
          onClick={() => setShowAddPatient(true)}
          className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
        >
          + Add Patient
        </button>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Total Patients:{" "}
          <span className="font-semibold">{filteredPatients.length}</span>
        </p>

        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search patient name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-4 py-2 w-72 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <Th className="py-4">Patient</Th>
                <Th>Email</Th>
                <Th>Registered Date</Th>
                <Th className="text-right pr-6">Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {currentPatients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400">
                    No patients found
                  </td>
                </tr>
              ) : (
                currentPatients.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-indigo-50 transition duration-150"
                  >
                    <Td className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold shadow ${
                            getAvatarColor(p.name || "A")
                          }`}
                        >
                          {p.name?.charAt(0) || "A"}
                        </div>

                        <div>
                          <p className="font-medium text-gray-800">
                            {p.name || "N/A"}
                          </p>
                        </div>
                      </div>
                    </Td>

                    <Td>{p.email}</Td>

                    <Td>
                      {new Date(p.createdAt).toLocaleDateString()}
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
                          className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-indigo-100 flex items-center justify-center"
                        >
                          👁
                        </button>

                        <button
                          title="SOAP Note"
                          onClick={() => {
                            setSelected(p);
                            setShowSoap(true);
                          }}
                          className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-green-100 flex items-center justify-center"
                        >
                          ✏️
                        </button>

                        <button
                          title="Delete"
                          onClick={() => alert("Delete record")}
                          className="w-9 h-9 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center"
                        >
                          🗑
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

      {filteredPatients.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">{indexOfFirstPatient + 1}</span>
            -
            <span className="font-medium">
              {Math.min(indexOfLastPatient, filteredPatients.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium">{filteredPatients.length}</span>
          </p>

          <div className="flex items-center gap-1 bg-white border border-gray-200 shadow-sm rounded-xl p-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 disabled:opacity-40"
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => {
              const page = i + 1;

              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1.5 text-sm rounded-lg ${
                    currentPage === page
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      )}

      <PatientDetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        patient={selected}
        tab={tab}
        setTab={setTab}
        onCreateMedicalHistory={() => setShowMedicalHistoryModal(true)}
        onRefreshMedicalHistory={handleMedicalHistorySuccess}
        onRefreshPatient={refreshPatient}
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
        open={showMedicalHistoryModal}
        onClose={() => setShowMedicalHistoryModal(false)}
        patientId={selected?.id}
        onSuccess={handleMedicalHistorySuccess}
      />
    </section>
  );
}
