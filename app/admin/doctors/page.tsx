"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Eye, Play, Pause } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DoctorDetailsModal from "@/components/DoctorDetailsModal";
import AddDoctorModal from "@/components/AddDoctorModal";
import { Th, Td } from "@/components/UIHelpers";

interface Doctor {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DoctorsPage() {
const { data: session, status } = useSession();
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deletingDoctors, setDeletingDoctors] = useState(new Set<string>());

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 10;

  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddDoctorSuccess = () => {
    fetchDoctors();
    setShowAddModal(false);
  };



  /* ---------------- FETCH DOCTORS ---------------- */

  const fetchDoctors = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/doctors");

      if (res.ok) {
        const data = await res.json();
        setDoctors(data.doctors || []);
        setActiveCount(data.activeCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  /* ---------------- TOGGLE ACTIVE ---------------- */

  const handleToggleActive = async (doctorId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/doctors`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doctorId,
          isActive: !currentActive,
        }),
      });

      if (res.ok) {
        fetchDoctors();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update doctor");
      }
    } catch {
      alert("Network error");
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (doctorId: string) => {
    setDeletingDoctors((prev) => new Set(prev).add(doctorId));

    try {
      let res = await fetch(`/api/admin/doctors/${doctorId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
        fetchDoctors();
        return;
      }

      const errorData = await res.json();
      const errorMsg = errorData.error || "Failed to delete doctor";

      if (errorMsg.includes("bookings exceed new capacity")) {
        const confirmed = confirm(
          `⚠️ Capacity Warning\n\n${errorMsg}\n\nForce delete this doctor anyway?\nThis may overload some appointment slots.`
        );

        if (!confirmed) return;

        res = await fetch(`/api/admin/doctors/${doctorId}?force=true`, {
          method: "DELETE",
        });

        if (res.ok) {
          setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
          fetchDoctors();
          return;
        } else {
          const forceError = await res.json();
          alert(`Force delete failed: ${forceError.error || "Unknown error"}`);
          return;
        }
      }

      alert(errorMsg);
    } catch {
      alert("Network error");
    } finally {
      setDeletingDoctors((prev) => {
        const newSet = new Set(prev);
        newSet.delete(doctorId);
        return newSet;
      });
    }
  };

  /* ---------------- SEARCH ---------------- */

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(search.toLowerCase()) ||
      doctor.email.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;

  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );

  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

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

    if (!name) return colors[0];

    return colors[name.charCodeAt(0) % colors.length];
  };

  /* ---------------- UI ---------------- */

  if (status === "loading") {
    return null;
  }

  return (
    <section className="p-6 bg-gray-50 min-h-screen space-y-6">

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Doctors Directory</h2>
          <p className="text-indigo-100 mt-1">
            Total Doctors: {doctors.length} | Active:
            <span className="font-semibold ml-1">{activeCount}</span>
          </p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredDoctors.length}</span> of {doctors.length} doctors
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg"
          >
            <Plus className="w-4 h-4"/>
            Add New Doctor
          </button>

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e)=>{
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full sm:w-72 px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
          />

        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">
              <tr>
                <Th>Doctor</Th>
                <Th>Email</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th className="text-right pr-6">Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    Loading doctors...
                  </td>
                </tr>
              ) : currentDoctors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No doctors available
                  </td>
                </tr>
              ) : (
                currentDoctors.map((doctor) => (

                  <tr key={doctor.id} className="hover:bg-indigo-50">

                    <Td>
                      <div className="flex items-center gap-3">

                        <div className={`w-12 h-12 rounded-full text-white flex items-center justify-center font-semibold ${getAvatarColor(doctor.name)}`}>
                          {doctor.name?.charAt(0).toUpperCase()}
                        </div>

                        <p className="font-semibold text-gray-900">
                          {doctor.name}
                        </p>

                      </div>
                    </Td>

                    <Td>{doctor.email}</Td>

                    <Td>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        doctor.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-700"
                      }`}>
                        {doctor.isActive ? "🟢 Active" : "⭕ Inactive"}
                      </span>
                    </Td>

                    <Td className="text-sm text-gray-500">
                      {new Date(doctor.createdAt).toLocaleDateString()}
                    </Td>

                    <Td>

                      <div className="flex justify-end gap-2 pr-4">

                        <button
                          onClick={()=>{
                            setSelectedDoctor(doctor)
                            setShowDetails(true)
                          }}
                          className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center"
                        >
                          <Eye className="w-5 h-5"/>
                        </button>

                        <button
                          onClick={()=>handleToggleActive(doctor.id, doctor.isActive)}
                          className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"
                        >
                          {doctor.isActive ? <Pause/> : <Play/>}
                        </button>

                        <button
                          onClick={()=>handleDelete(doctor.id)}
                          disabled={deletingDoctors.has(doctor.id)}
                          className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"
                        >
                          <Trash2/>
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

      <DoctorDetailsModal
        open={showDetails}
        onClose={()=>setShowDetails(false)}
        doctor={selectedDoctor}
      />

      <AddDoctorModal
        open={showAddModal}
        onClose={()=>setShowAddModal(false)}
        onSuccess={handleAddDoctorSuccess}
      />

    </section>
  );
}