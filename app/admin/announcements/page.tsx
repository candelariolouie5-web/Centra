"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import AdminAnnouncementModal from "@/components/AdminAnnouncementModal";

interface Announcement {
  id: string;
  title: string;
  description: string;
  bannerImage: string | null;
  status: string;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") router.push("/login");
  }, [session, status, router]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/announcements");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAnnouncements(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchAnnouncements();
        setModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed");
      }
    } catch (error) {
      alert("Failed");
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchAnnouncements();
        setModalOpen(false);
        setEditing(null);
      } else {
        const err = await res.json();
        alert(err.error || "Failed");
      }
    } catch (error) {
      alert("Failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (res.ok) fetchAnnouncements();
      else alert("Failed");
    } catch (error) {
      alert("Failed");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "text-green-600 bg-green-50";
      case "Draft": return "text-yellow-600 bg-yellow-50";
      case "Archived": return "text-gray-500 bg-gray-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0c2222]">Manage Announcements</h1>
            <p className="text-sm text-gray-500 mt-1">Create, edit, and manage announcements shown on the homepage banner.</p>
          </div>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <PlusIcon className="w-5 h-5" /> New Announcement
          </button>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No announcements yet.</p>
            <button onClick={() => { setEditing(null); setModalOpen(true); }} className="mt-3 text-teal-600 hover:text-teal-700 font-medium">
              Create your first announcement →
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-[#0c2222] truncate">{ann.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(ann.status)}`}>{ann.status}</span>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm line-clamp-2">{ann.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Created: {new Date(ann.createdAt).toLocaleDateString()}</span>
                      {ann.bannerImage && (
                        <span className="flex items-center gap-1"><EyeIcon className="w-3 h-3" /> Has banner image</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button onClick={() => { setEditing(ann); setModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(ann.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminAnnouncementModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={(data: any) => {
          if (editing) {
            handleUpdate(editing.id, data);
          } else {
            handleCreate(data);
          }
        }}
        editing={editing}
      />
    </div>
  );
}