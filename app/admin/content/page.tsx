'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  MegaphoneIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

// ============================================================
// TYPES
// ============================================================

interface ServiceFAQ {
  question: string;
  answer: string;
}

interface ServiceDetails {
  overview: string;
  idealCandidates: string[];
  procedureOptions: string[];
  benefits: string[];
  recoveryTimeline: string;
  beforeSurgery: string;
  aftercare: string;
  risks: string;
  faqs: ServiceFAQ[];
}

interface ManageService {
  id: string;
  name: string;
  code?: string;
  category: string;
  description: string;
  status: 'Active' | 'Inactive';
  image?: string;
  details: ServiceDetails;
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  bannerImage: string;
  publishDate: string;
  expiryDate: string;
  status: 'Published' | 'Draft' | 'Archived';
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  status: 'Published' | 'Draft';
  embedUrl?: string;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AdminContentPage() {
  const [activeSection, setActiveSection] = useState<'services' | 'announcements' | 'faqs' | 'blog'>('services');

  const [services, setServices] = useState<ManageService[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const [loading, setLoading] = useState({
    services: false,
    announcements: false,
    faqs: false,
    blog: false,
  });

  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<ManageService | null>(null);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isAddFaqOpen, setIsAddFaqOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [isAddBlogOpen, setIsAddBlogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  // ============================================================
  // FETCH FUNCTIONS
  // ============================================================

  const fetchServices = async () => {
    setLoading(prev => ({ ...prev, services: true }));
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(prev => ({ ...prev, announcements: true }));
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, announcements: false }));
    }
  };

  const fetchFaqs = async () => {
    setLoading(prev => ({ ...prev, faqs: true }));
    try {
      const res = await fetch('/api/faqs');
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, faqs: false }));
    }
  };

  const fetchBlogPosts = async () => {
    setLoading(prev => ({ ...prev, blog: true }));
    try {
      const res = await fetch('/api/blog');
      if (res.ok) {
        const data = await res.json();
        setBlogPosts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, blog: false }));
    }
  };

  useEffect(() => {
    fetchServices();
    fetchAnnouncements();
    fetchFaqs();
    fetchBlogPosts();
  }, []);

  // ============================================================
  // SERVICES CRUD
  // ============================================================

  const handleAddService = async (data: Omit<ManageService, 'id'>) => {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchServices();
        setIsAddServiceOpen(false);
      } else {
        alert('Failed to create service');
      }
    } catch (error) {
      alert('Error creating service');
    }
  };

  const handleEditService = async (service: ManageService) => {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      });
      if (res.ok) {
        fetchServices();
        setEditingService(null);
      } else {
        alert('Failed to update service');
      }
    } catch (error) {
      alert('Error updating service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchServices();
      } else {
        alert('Failed to delete service');
      }
    } catch (error) {
      alert('Error deleting service');
    }
  };

  // ============================================================
  // ANNOUNCEMENTS CRUD
  // ============================================================

  const handleAddAnnouncement = async (data: Omit<Announcement, 'id'>) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchAnnouncements();
        setIsAddAnnouncementOpen(false);
      } else {
        alert('Failed to create announcement');
      }
    } catch (error) {
      alert('Error creating announcement');
    }
  };

  const handleEditAnnouncement = async (ann: Announcement) => {
    try {
      const res = await fetch(`/api/announcements/${ann.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ann),
      });
      if (res.ok) {
        fetchAnnouncements();
        setEditingAnnouncement(null);
      } else {
        alert('Failed to update announcement');
      }
    } catch (error) {
      alert('Error updating announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAnnouncements();
      } else {
        alert('Failed to delete announcement');
      }
    } catch (error) {
      alert('Error deleting announcement');
    }
  };

  // ============================================================
  // FAQS CRUD
  // ============================================================

  const handleAddFaq = async (data: Omit<FAQItem, 'id'>) => {
    try {
      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchFaqs();
        setIsAddFaqOpen(false);
      } else {
        alert('Failed to create FAQ');
      }
    } catch (error) {
      alert('Error creating FAQ');
    }
  };

  const handleEditFaq = async (faq: FAQItem) => {
    try {
      const res = await fetch(`/api/faqs/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq),
      });
      if (res.ok) {
        fetchFaqs();
        setEditingFaq(null);
      } else {
        alert('Failed to update FAQ');
      }
    } catch (error) {
      alert('Error updating FAQ');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/faqs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchFaqs();
      } else {
        alert('Failed to delete FAQ');
      }
    } catch (error) {
      alert('Error deleting FAQ');
    }
  };

  // ============================================================
  // BLOG CRUD
  // ============================================================

  const handleAddBlog = async (data: Omit<BlogPost, 'id'>) => {
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchBlogPosts();
        setIsAddBlogOpen(false);
      } else {
        alert('Failed to create blog post');
      }
    } catch (error) {
      alert('Error creating blog post');
    }
  };

  const handleEditBlog = async (blog: BlogPost) => {
    try {
      const res = await fetch(`/api/blog/${blog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blog),
      });
      if (res.ok) {
        fetchBlogPosts();
        setEditingBlog(null);
      } else {
        alert('Failed to update blog post');
      }
    } catch (error) {
      alert('Error updating blog post');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBlogPosts();
      } else {
        alert('Failed to delete blog post');
      }
    } catch (error) {
      alert('Error deleting blog post');
    }
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const navItems = [
    { id: 'services', label: 'Services', icon: ClipboardDocumentListIcon, description: 'Manage clinic services' },
    { id: 'announcements', label: 'Announcements', icon: MegaphoneIcon, description: 'Manage announcements & promotions' },
    { id: 'faqs', label: 'FAQs', icon: QuestionMarkCircleIcon, description: 'Manage frequently asked questions' },
    { id: 'blog', label: 'Blog', icon: DocumentTextIcon, description: 'Manage blog posts & insights' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto p-6">
      <aside className="w-full md:w-56 bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4 flex-shrink-0 h-fit">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Content Sections</h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as typeof activeSection)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-teal-50 text-teal-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        {activeSection === 'services' && (
          <ServicesManager
            services={services}
            loading={loading.services}
            onAdd={() => setIsAddServiceOpen(true)}
            onEdit={(svc) => setEditingService(svc)}
            onDelete={handleDeleteService}
            isAddOpen={isAddServiceOpen}
            onCloseAdd={() => setIsAddServiceOpen(false)}
            onAddService={handleAddService}
            editingService={editingService}
            onCloseEdit={() => setEditingService(null)}
            onEditService={handleEditService}
          />
        )}
        {activeSection === 'announcements' && (
          <AnnouncementsManager
            announcements={announcements}
            loading={loading.announcements}
            onAdd={() => setIsAddAnnouncementOpen(true)}
            onEdit={(ann) => setEditingAnnouncement(ann)}
            onDelete={handleDeleteAnnouncement}
            isAddOpen={isAddAnnouncementOpen}
            onCloseAdd={() => setIsAddAnnouncementOpen(false)}
            onAddAnnouncement={handleAddAnnouncement}
            editingAnnouncement={editingAnnouncement}
            onCloseEdit={() => setEditingAnnouncement(null)}
            onEditAnnouncement={handleEditAnnouncement}
          />
        )}
        {activeSection === 'faqs' && (
          <FAQsManager
            faqs={faqs}
            loading={loading.faqs}
            onAdd={() => setIsAddFaqOpen(true)}
            onEdit={(faq) => setEditingFaq(faq)}
            onDelete={handleDeleteFaq}
            isAddOpen={isAddFaqOpen}
            onCloseAdd={() => setIsAddFaqOpen(false)}
            onAddFaq={handleAddFaq}
            editingFaq={editingFaq}
            onCloseEdit={() => setEditingFaq(null)}
            onEditFaq={handleEditFaq}
          />
        )}
        {activeSection === 'blog' && (
          <BlogManager
            blogPosts={blogPosts}
            loading={loading.blog}
            onAdd={() => setIsAddBlogOpen(true)}
            onEdit={(blog) => setEditingBlog(blog)}
            onDelete={handleDeleteBlog}
            isAddOpen={isAddBlogOpen}
            onCloseAdd={() => setIsAddBlogOpen(false)}
            onAddBlog={handleAddBlog}
            editingBlog={editingBlog}
            onCloseEdit={() => setEditingBlog(null)}
            onEditBlog={handleEditBlog}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// SERVICES MANAGER
// ============================================================

function ServicesManager({
  services,
  loading,
  onAdd,
  onEdit,
  onDelete,
  isAddOpen,
  onCloseAdd,
  onAddService,
  editingService,
  onCloseEdit,
  onEditService,
}: {
  services: ManageService[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (s: ManageService) => void;
  onDelete: (id: string) => void;
  isAddOpen: boolean;
  onCloseAdd: () => void;
  onAddService: (s: Omit<ManageService, 'id'>) => void;
  editingService: ManageService | null;
  onCloseEdit: () => void;
  onEditService: (s: ManageService) => void;
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', ...new Set(services.map(s => s.category))];
  const filtered = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        (s.code && s.code.toLowerCase().includes(search.toLowerCase())) ||
                        s.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const total = services.length;
  const active = services.filter(s => s.status === 'Active').length;
  const inactive = services.filter(s => s.status === 'Inactive').length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-teal-500 px-6 py-5">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Service Management</h1>
            <p className="text-sm text-teal-100 mt-0.5"><span className="font-semibold text-white">{total}</span> services available</p>
          </div>
          <button onClick={onAdd} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 backdrop-blur-sm border border-white/20">
            <PlusIcon className="w-4 h-4" /> Add New Service
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 pb-0">
        <div className="bg-teal-50 rounded-xl p-4 flex items-center gap-3 border border-teal-100/50">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><ChartBarIcon className="w-5 h-5" /></div>
          <div><p className="text-xs text-teal-600 font-medium">Total</p><p className="text-xl font-bold text-teal-700">{total}</p></div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3 border border-emerald-100/50">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircleIcon className="w-5 h-5" /></div>
          <div><p className="text-xs text-emerald-600 font-medium">Active</p><p className="text-xl font-bold text-emerald-700">{active}</p></div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border border-gray-100/50">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><XCircleIcon className="w-5 h-5" /></div>
          <div><p className="text-xs text-gray-500 font-medium">Inactive</p><p className="text-xl font-bold text-gray-600">{inactive}</p></div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <input type="text" placeholder="Search by name or description..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none">
            {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-lg font-medium text-gray-500">No services found</p>
              <p className="text-sm mt-1">Click "Add New Service" to create your first service</p>
            </div>
          ) : (
            filtered.map(s => (
              <div key={s.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 group">
                <div className="h-40 bg-gray-100 overflow-hidden relative">
                  {s.image ? <img src={s.image} alt={s.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><PhotoIcon className="w-12 h-12" /></div>}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800">{s.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{s.status === 'Active' ? '● Active' : '○ Inactive'}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{s.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">{s.category}</span>
                    <div className="flex gap-1">
                      <button onClick={() => onEdit(s)} className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isAddOpen && <ServiceFormModal title="Add New Service" onClose={onCloseAdd} onSave={onAddService} initialData={null} />}
      {editingService && <ServiceFormModal title="Edit Service" onClose={onCloseEdit} onSave={(data) => onEditService({ ...editingService, ...data, id: editingService.id })} initialData={editingService} />}
    </div>
  );
}

// ============================================================
// SERVICE FORM MODAL
// ============================================================

function ServiceFormModal({
  title,
  onClose,
  onSave,
  initialData,
}: {
  title: string;
  onClose: () => void;
  onSave: (data: Omit<ManageService, 'id'>) => void;
  initialData: ManageService | null;
}) {
  const [form, setForm] = useState<Omit<ManageService, 'id'>>(
    initialData || {
      name: '',
      category: 'ENT Services',
      description: '',
      status: 'Active',
      image: '',
      details: {
        overview: '',
        idealCandidates: [''],
        procedureOptions: [''],
        benefits: [''],
        recoveryTimeline: '',
        beforeSurgery: '',
        aftercare: '',
        risks: '',
        faqs: [{ question: '', answer: '' }],
      },
    }
  );

  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      const newData = { ...form };
      let current: any = newData;
      for (let i = 0; i < parts.length - 1; i++) current = current[parts[i]];
      current[parts[parts.length - 1]] = value;
      setForm(newData);
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const parts = field.split('.');
    const newData = { ...form };
    let current: any = newData;
    for (let i = 0; i < parts.length; i++) {
      if (i === parts.length - 1) current[parts[i]][index] = value;
      else current = current[parts[i]];
    }
    setForm(newData);
  };

  const handleAddArrayItem = (field: string) => {
    const parts = field.split('.');
    const newData = { ...form };
    let current: any = newData;
    for (let i = 0; i < parts.length; i++) {
      if (i === parts.length - 1) current[parts[i]] = [...current[parts[i]], ''];
      else current = current[parts[i]];
    }
    setForm(newData);
  };

  const handleRemoveArrayItem = (field: string, index: number) => {
    const parts = field.split('.');
    const newData = { ...form };
    let current: any = newData;
    for (let i = 0; i < parts.length; i++) {
      if (i === parts.length - 1) current[parts[i]] = current[parts[i]].filter((_: any, idx: number) => idx !== index);
      else current = current[parts[i]];
    }
    setForm(newData);
  };

  const handleFAQChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newData = { ...form };
    newData.details.faqs[index][field] = value;
    setForm(newData);
  };

  const handleAddFAQ = () => {
    setForm({ ...form, details: { ...form.details, faqs: [...form.details.faqs, { question: '', answer: '' }] } });
  };

  const handleRemoveFAQ = (index: number) => {
    setForm({ ...form, details: { ...form.details, faqs: form.details.faqs.filter((_, idx) => idx !== index) } });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, image: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm({ ...form, image: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form); };

  const sections = [
    { id: 'overview', label: 'Overview', field: 'details.overview', type: 'textarea', placeholder: 'Describe what this service is about...' },
    { id: 'idealCandidates', label: 'Ideal Candidates', field: 'details.idealCandidates', type: 'array', placeholder: 'e.g., Patients with chronic nasal congestion' },
    { id: 'procedureOptions', label: 'Procedure Options', field: 'details.procedureOptions', type: 'array', placeholder: 'e.g., Nasal endoscopy' },
    { id: 'benefits', label: 'Benefits', field: 'details.benefits', type: 'array', placeholder: 'e.g., Clearer breathing' },
    { id: 'recoveryTimeline', label: 'Recovery Timeline', field: 'details.recoveryTimeline', type: 'textarea', placeholder: 'e.g., Most patients resume normal activities within 1–2 days...' },
    { id: 'beforeSurgery', label: 'Before Surgery / Preparation', field: 'details.beforeSurgery', type: 'textarea', placeholder: 'e.g., Avoid eating or drinking for 6 hours before...' },
    { id: 'aftercare', label: 'Aftercare', field: 'details.aftercare', type: 'textarea', placeholder: 'e.g., Keep the area clean and dry...' },
    { id: 'risks', label: 'Risks & Complications', field: 'details.risks', type: 'textarea', placeholder: 'e.g., Infection, bleeding, or allergic reactions...' },
    { id: 'faqs', label: 'Frequently Asked Questions', field: 'details.faqs', type: 'faqs' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-8 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div><h2 className="text-2xl font-bold text-gray-800">{title}</h2><p className="text-sm text-gray-500 mt-1">Fill in the service details below</p></div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Service Name *</label>
              <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required placeholder="e.g., Ear Consultation" className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select value={form.category} onChange={(e) => handleChange('category', e.target.value)} className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                <option value="ENT Services">ENT Services</option>
                <option value="Aesthetic Services">Aesthetic Services</option>
                <option value="Ultrasound">Ultrasound</option>
                <option value="Imaging">Imaging</option>
                <option value="Drug Testing">Drug Testing</option>
                <option value="Consultation">Consultation</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Short Description</label>
            <input type="text" value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Brief summary of the service (shown in list view)" className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>

          <div className="border border-gray-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Image</label>
            <div className="flex items-center gap-4">
              {form.image ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={form.image} alt="Service" className="w-full h-full object-cover" />
                  <button type="button" onClick={handleRemoveImage} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"><XMarkIcon className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400"><PhotoIcon className="w-8 h-8" /></div>
              )}
              <div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                <p className="text-xs text-gray-400 mt-1">Upload a representative image for the service (JPG, PNG, GIF)</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Details</h3>
            {sections.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-xl mb-3 overflow-hidden">
                <button type="button" onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left">
                  <span className="font-medium text-gray-700">{section.label}</span>
                  {expandedSections.includes(section.id) ? <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
                </button>
                {expandedSections.includes(section.id) && (
                  <div className="px-4 py-4 space-y-3">
                    {section.type === 'textarea' && (
                      <textarea value={(section.field.split('.').reduce((obj: any, key: string) => obj?.[key], form) as string) || ''} onChange={(e) => handleChange(section.field, e.target.value)} rows={4} placeholder={section.placeholder} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none" />
                    )}
                    {section.type === 'array' && (
                      <div>
                        {(section.field.split('.').reduce((obj: any, key: string) => obj?.[key], form) as string[])?.map((item, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <input type="text" value={item} onChange={(e) => handleArrayChange(section.field, idx, e.target.value)} placeholder={section.placeholder} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            <button type="button" onClick={() => handleRemoveArrayItem(section.field, idx)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition"><TrashIcon className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button type="button" onClick={() => handleAddArrayItem(section.field)} className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"><PlusIcon className="w-4 h-4" /> Add {section.label.slice(0, -1)}</button>
                      </div>
                    )}
                    {section.type === 'faqs' && (
                      <div>
                        {form.details.faqs.map((faq, idx) => (
                          <div key={idx} className="border border-gray-100 rounded-xl p-4 mb-3">
                            <div className="flex justify-between items-start mb-2"><span className="text-xs font-medium text-gray-400">FAQ #{idx + 1}</span><button type="button" onClick={() => handleRemoveFAQ(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition"><TrashIcon className="w-4 h-4" /></button></div>
                            <div className="space-y-2">
                              <input type="text" value={faq.question} onChange={(e) => handleFAQChange(idx, 'question', e.target.value)} placeholder="e.g., How long does the consultation take?" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                              <input type="text" value={faq.answer} onChange={(e) => handleFAQChange(idx, 'answer', e.target.value)} placeholder="e.g., Typically 30-45 minutes" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={handleAddFAQ} className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"><PlusIcon className="w-4 h-4" /> Add FAQ</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-8 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-teal-700/25 transition-all duration-200 hover:shadow-xl hover:scale-[1.02]">Save Service</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// ANNOUNCEMENTS MANAGER
// ============================================================

function AnnouncementsManager({
  announcements,
  loading,
  onAdd,
  onEdit,
  onDelete,
  isAddOpen,
  onCloseAdd,
  onAddAnnouncement,
  editingAnnouncement,
  onCloseEdit,
  onEditAnnouncement,
}: {
  announcements: Announcement[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (a: Announcement) => void;
  onDelete: (id: string) => void;
  isAddOpen: boolean;
  onCloseAdd: () => void;
  onAddAnnouncement: (a: Omit<Announcement, 'id'>) => void;
  editingAnnouncement: Announcement | null;
  onCloseEdit: () => void;
  onEditAnnouncement: (a: Announcement) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = announcements.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));

  const total = announcements.length;
  const published = announcements.filter(a => a.status === 'Published').length;
  const drafts = announcements.filter(a => a.status === 'Draft').length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-teal-500 px-6 py-5">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Announcements</h1>
            <p className="text-sm text-teal-100 mt-0.5"><span className="font-semibold text-white">{total}</span> announcements</p>
          </div>
          <button onClick={onAdd} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 backdrop-blur-sm border border-white/20"><PlusIcon className="w-4 h-4" /> Add Announcement</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 pb-0">
        <div className="bg-teal-50 rounded-xl p-4 flex items-center gap-3 border border-teal-100/50"><div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><ChartBarIcon className="w-5 h-5" /></div><div><p className="text-xs text-teal-600 font-medium">Total</p><p className="text-xl font-bold text-teal-700">{total}</p></div></div>
        <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3 border border-emerald-100/50"><div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircleIcon className="w-5 h-5" /></div><div><p className="text-xs text-emerald-600 font-medium">Published</p><p className="text-xl font-bold text-emerald-700">{published}</p></div></div>
        <div className="bg-amber-50 rounded-xl p-4 flex items-center gap-3 border border-amber-100/50"><div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><DocumentTextIcon className="w-5 h-5" /></div><div><p className="text-xs text-amber-600 font-medium">Drafts</p><p className="text-xl font-bold text-amber-700">{drafts}</p></div></div>
      </div>

      <div className="p-6">
        <input type="text" placeholder="Search announcements..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-64 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none mb-4" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200/60">
              <tr><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Publish Date</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Expiry Date</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No announcements found.</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-gray-500">{a.publishDate}</td>
                  <td className="px-4 py-3 text-gray-500">{a.expiryDate}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${a.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : a.status === 'Draft' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{a.status}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => onEdit(a)} className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg transition"><PencilIcon className="w-4 h-4" /></button><button onClick={() => onDelete(a.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition"><TrashIcon className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && <AnnouncementFormModal title="Add New Announcement" onClose={onCloseAdd} onSave={onAddAnnouncement} initialData={null} />}
      {editingAnnouncement && <AnnouncementFormModal title="Edit Announcement" onClose={onCloseEdit} onSave={(data) => onEditAnnouncement({ ...editingAnnouncement, ...data, id: editingAnnouncement.id })} initialData={editingAnnouncement} />}
    </div>
  );
}

// ============================================================
// ANNOUNCEMENT FORM MODAL
// ============================================================

function AnnouncementFormModal({
  title,
  onClose,
  onSave,
  initialData,
}: {
  title: string;
  onClose: () => void;
  onSave: (data: Omit<Announcement, 'id'>) => void;
  initialData: Announcement | null;
}) {
  const [form, setForm] = useState<Omit<Announcement, 'id'>>(initialData || { title: '', description: '', bannerImage: '', publishDate: '', expiryDate: '', status: 'Draft' });
  const handleChange = (field: keyof Omit<Announcement, 'id'>, value: any) => setForm({ ...form, [field]: value });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4"><h3 className="text-lg font-bold">{title}</h3><button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><XMarkIcon className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700">Title *</label><input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)} required placeholder="e.g., New Botox Promo" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Description</label><textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} placeholder="Brief description of the announcement" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Banner Image URL</label><input type="text" value={form.bannerImage} onChange={(e) => handleChange('bannerImage', e.target.value)} placeholder="e.g., /promo1.jpg" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Publish Date</label><input type="date" value={form.publishDate} onChange={(e) => handleChange('publishDate', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Expiry Date</label><input type="date" value={form.expiryDate} onChange={(e) => handleChange('expiryDate', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700">Status</label><select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white"><option value="Published">Published</option><option value="Draft">Draft</option><option value="Archived">Archived</option></select></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// FAQS MANAGER
// ============================================================

function FAQsManager({
  faqs,
  loading,
  onAdd,
  onEdit,
  onDelete,
  isAddOpen,
  onCloseAdd,
  onAddFaq,
  editingFaq,
  onCloseEdit,
  onEditFaq,
}: {
  faqs: FAQItem[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (f: FAQItem) => void;
  onDelete: (id: string) => void;
  isAddOpen: boolean;
  onCloseAdd: () => void;
  onAddFaq: (f: Omit<FAQItem, 'id'>) => void;
  editingFaq: FAQItem | null;
  onCloseEdit: () => void;
  onEditFaq: (f: FAQItem) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = faqs.filter(f => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase()));
  const total = faqs.length;
  const active = faqs.filter(f => f.isActive).length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-teal-500 px-6 py-5">
        <div className="flex flex-wrap justify-between items-center">
          <div><h1 className="text-xl font-bold text-white">FAQs</h1><p className="text-sm text-teal-100 mt-0.5"><span className="font-semibold text-white">{total}</span> FAQs</p></div>
          <button onClick={onAdd} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 backdrop-blur-sm border border-white/20"><PlusIcon className="w-4 h-4" /> Add FAQ</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 pb-0">
        <div className="bg-teal-50 rounded-xl p-4 flex items-center gap-3 border border-teal-100/50"><div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><ChartBarIcon className="w-5 h-5" /></div><div><p className="text-xs text-teal-600 font-medium">Total</p><p className="text-xl font-bold text-teal-700">{total}</p></div></div>
        <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3 border border-emerald-100/50"><div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircleIcon className="w-5 h-5" /></div><div><p className="text-xs text-emerald-600 font-medium">Active</p><p className="text-xl font-bold text-emerald-700">{active}</p></div></div>
      </div>
      <div className="p-6">
        <input type="text" placeholder="Search FAQs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-64 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none mb-4" />
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl"><p className="text-lg font-medium text-gray-500">No FAQs found</p><p className="text-sm mt-1">Click "Add FAQ" to create your first frequently asked question</p></div>
          ) : filtered.map((f, index) => (
            <div key={f.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2"><span className="text-sm font-medium text-gray-400">#{index + 1}</span><h4 className="font-semibold text-gray-800">{f.question}</h4><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{f.isActive ? 'Active' : 'Inactive'}</span></div>
                  <p className="text-sm text-gray-600 mt-1">{f.answer}</p>
                </div>
                <div className="flex gap-1 ml-4"><button onClick={() => onEdit(f)} className="p-1 text-gray-400 hover:text-teal-600"><PencilIcon className="w-4 h-4" /></button><button onClick={() => onDelete(f.id)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isAddOpen && <FAQFormModal title="Add FAQ" onClose={onCloseAdd} onSave={onAddFaq} initialData={null} />}
      {editingFaq && <FAQFormModal title="Edit FAQ" onClose={onCloseEdit} onSave={(data) => onEditFaq({ ...editingFaq, ...data, id: editingFaq.id })} initialData={editingFaq} />}
    </div>
  );
}

// ============================================================
// FAQ FORM MODAL
// ============================================================

function FAQFormModal({
  title,
  onClose,
  onSave,
  initialData,
}: {
  title: string;
  onClose: () => void;
  onSave: (data: Omit<FAQItem, 'id'>) => void;
  initialData: FAQItem | null;
}) {
  const [form, setForm] = useState<Omit<FAQItem, 'id'>>(initialData || { question: '', answer: '', isActive: true });
  const handleChange = (field: keyof Omit<FAQItem, 'id'>, value: any) => setForm({ ...form, [field]: value });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4"><h3 className="text-lg font-bold">{title}</h3><button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><XMarkIcon className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700">Question *</label><input type="text" value={form.question} onChange={(e) => handleChange('question', e.target.value)} required placeholder="e.g., Do you accept walk-ins?" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Answer *</label><textarea value={form.answer} onChange={(e) => handleChange('answer', e.target.value)} rows={3} required placeholder="e.g., No, appointments are required. Please book online." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none" /></div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Active</label>
            <button type="button" onClick={() => handleChange('isActive', !form.isActive)} className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-teal-600' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// BLOG MANAGER
// ============================================================

function BlogManager({
  blogPosts,
  loading,
  onAdd,
  onEdit,
  onDelete,
  isAddOpen,
  onCloseAdd,
  onAddBlog,
  editingBlog,
  onCloseEdit,
  onEditBlog,
}: {
  blogPosts: BlogPost[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (b: BlogPost) => void;
  onDelete: (id: string) => void;
  isAddOpen: boolean;
  onCloseAdd: () => void;
  onAddBlog: (b: Omit<BlogPost, 'id'>) => void;
  editingBlog: BlogPost | null;
  onCloseEdit: () => void;
  onEditBlog: (b: BlogPost) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = blogPosts.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt.toLowerCase().includes(search.toLowerCase()) || b.content.toLowerCase().includes(search.toLowerCase()));

  const total = blogPosts.length;
  const published = blogPosts.filter(b => b.status === 'Published').length;

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      let videoId = '';
      if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      else { const params = new URLSearchParams(new URL(url).search); videoId = params.get('v') || ''; }
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('facebook.com')) return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&width=500&show_text=true&appId=`;
    return url;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-teal-500 px-6 py-5">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">From the Blog</h1>
            <p className="text-sm text-teal-100 mt-0.5">Write formatted case studies and blog posts</p>
          </div>
          <button onClick={onAdd} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 backdrop-blur-sm border border-white/20"><PlusIcon className="w-4 h-4" /> Write New Post</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 pb-0">
        <div className="bg-teal-50 rounded-xl p-4 flex items-center gap-3 border border-teal-100/50"><div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><ChartBarIcon className="w-5 h-5" /></div><div><p className="text-xs text-teal-600 font-medium">Total</p><p className="text-xl font-bold text-teal-700">{total}</p></div></div>
        <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3 border border-emerald-100/50"><div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircleIcon className="w-5 h-5" /></div><div><p className="text-xs text-emerald-600 font-medium">Published</p><p className="text-xl font-bold text-emerald-700">{published}</p></div></div>
      </div>

      <div className="p-6">
        <input type="text" placeholder="Search blog posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-64 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none mb-6" />
        <div className="space-y-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl"><p className="text-lg font-medium text-gray-500">No blog posts found</p><p className="text-sm mt-1">Click "Write New Post" to create your first blog entry</p></div>
          ) : filtered.map((blog) => {
            const embedSrc = blog.embedUrl ? getEmbedUrl(blog.embedUrl) : null;
            return (
              <div key={blog.id} className="flex flex-col sm:flex-row gap-4 items-start border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                {embedSrc ? (
                  <div className="w-full sm:w-64 flex-shrink-0">
                    <div className="relative" style={{ minHeight: '180px' }}>
                      <iframe src={embedSrc} width="100%" height="100%" style={{ border: 'none', overflow: 'hidden', minHeight: '180px' }} scrolling="no" frameBorder="0" allowFullScreen={true} allow="encrypted-media; picture-in-picture" title={blog.title}></iframe>
                    </div>
                  </div>
                ) : (
                  <div className="w-full sm:w-48 h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                    {blog.image ? <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><PhotoIcon className="w-10 h-10" /></div>}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800">{blog.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{blog.excerpt || blog.content.substring(0, 120) + '...'}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="text-xs text-gray-400">{blog.author} • {blog.date}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${blog.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{blog.status}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => onEdit(blog)} className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition"><PencilIcon className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(blog.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAddOpen && <BlogFormModal title="Write New Post" onClose={onCloseAdd} onSave={onAddBlog} initialData={null} />}
      {editingBlog && <BlogFormModal title="Edit Blog Post" onClose={onCloseEdit} onSave={(data) => onEditBlog({ ...editingBlog, ...data, id: editingBlog.id })} initialData={editingBlog} />}
    </div>
  );
}

// ============================================================
// BLOG FORM MODAL
// ============================================================

function BlogFormModal({
  title,
  onClose,
  onSave,
  initialData,
}: {
  title: string;
  onClose: () => void;
  onSave: (data: Omit<BlogPost, 'id'>) => void;
  initialData: BlogPost | null;
}) {
  const [form, setForm] = useState<Omit<BlogPost, 'id'>>(
    initialData || {
      title: '',
      excerpt: '',
      content: '',
      image: '',
      date: new Date().toISOString().split('T')[0],
      author: '',
      status: 'Draft',
      embedUrl: '',
    }
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        excerpt: initialData.excerpt,
        content: initialData.content,
        image: initialData.image,
        date: initialData.date,
        author: initialData.author,
        status: initialData.status,
        embedUrl: initialData.embedUrl || '',
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof Omit<BlogPost, 'id'>, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm({ ...form, image: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Article Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              placeholder="The Art of Frontend Development: Turning Designs into Real Experiences"
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="border border-gray-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <div className="flex items-center gap-4">
              {form.image ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  <img src={form.image} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <PhotoIcon className="w-8 h-8" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
                <p className="text-xs text-gray-400 mt-1">Choose a cover image (JPG, PNG, GIF)</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Content *</label>
            <textarea
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={8}
              required
              placeholder="You can write formatted case studies and blog posts here..."
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Excerpt (summary)</label>
            <input
              type="text"
              value={form.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              placeholder="Short summary shown in list view"
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Video / Embed URL</label>
            <input
              type="text"
              value={form.embedUrl || ''}
              onChange={(e) => handleChange('embedUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or Facebook post URL"
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Supports YouTube, Facebook, or any iframe URL</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => handleChange('author', e.target.value)}
                placeholder="e.g., Dr. Maria Santos"
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Publish Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white"
            >
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-teal-700/25 transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
            >
              Save Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}