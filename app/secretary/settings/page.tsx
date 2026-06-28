'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Simulated user data – replace with real fetch from your API
const fetchUserProfile = async () => {
  // In reality, call your backend: const res = await fetch('/api/secretary/profile');
  // For demo, return mock data:
  return {
    fullName: 'Jane Doe',
    email: 'jane.doe@centraclinic.com',
    phone: '+1 234 567 890',
    profilePicture: '/default-avatar.png', // can be a URL or base64
  };
};

// Simulated save function – replace with actual API call
const saveUserProfile = async (data: {
  fullName: string;
  phone: string;
  profilePicture?: File | string;
}) => {
  // Example: const res = await fetch('/api/secretary/profile', { method: 'PUT', body: formData });
  console.log('Saving profile data:', data);
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true };
};

export default function SecretarySettingsPage() {
  const router = useRouter();

  // State for form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null); // for preview
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data on mount
  useEffect(() => {
    fetchUserProfile()
      .then((data) => {
        setFullName(data.fullName);
        setEmail(data.email);
        setPhone(data.phone);
        setProfilePicture(data.profilePicture);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        setError('Could not load profile data.');
        setLoading(false);
      });
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
        setProfilePictureFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleChangePictureClick = () => {
    fileInputRef.current?.click();
  };

  // Validate and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Basic validation
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    setSaving(true);
    try {
      // Prepare data – if a new file is selected, include it; otherwise, keep existing.
      const payload: any = {
        fullName: fullName.trim(),
        phone: phone.trim(),
      };
      if (profilePictureFile) {
        payload.profilePicture = profilePictureFile; // or convert to base64 / FormData
      }
      await saveUserProfile(payload);
      setSuccess(true);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile & Account</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Profile Picture */}
        <div className="mb-6 flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg
                    className="w-12 h-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={handleChangePictureClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Change Picture
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: Square image, max 2MB
            </p>
          </div>
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your full name"
            required
          />
        </div>

        {/* Email (display only) */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Contact your administrator to change this.</p>
        </div>

        {/* Phone Number */}
        <div className="mb-6">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. +1 234 567 890"
            required
          />
        </div>

        {/* Save / Cancel Buttons */}
        <div className="flex items-center space-x-4 border-t pt-4">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/secretary/dashboard')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}