"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Announcement {
  id: string;
  title: string;
  description: string;
  bannerImage: string | null;
  status: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editing?: Announcement | null;
}

export default function AdminAnnouncementModal({ isOpen, onClose, onSave, editing }: Props) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    bannerImage: "",
    status: "Published",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        description: editing.description,
        bannerImage: editing.bannerImage || "",
        status: editing.status,
      });
    } else {
      setForm({ title: "", description: "", bannerImage: "", status: "Published" });
    }
  }, [editing, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      alert("Title and description are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-[#0c2222]">
            {editing ? "Edit Announcement" : "New Announcement"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter announcement title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter announcement description"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL (optional)</label>
            <input
              type="text"
              value={form.bannerImage}
              onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition disabled:opacity-50">
              {isSubmitting ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}