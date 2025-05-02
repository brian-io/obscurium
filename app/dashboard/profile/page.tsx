'use client'

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon,
  EnvelopeIcon, 
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ProfileUpload from '@/app/components/user/ProfileUpload';

export default function ProfilePage({ userData }: { 
  userData: {
    id: string;
    name: string;
    email: string;
    image_url?: string;
  }
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          ...formData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setIsEditing(false);
      router.refresh(); // Refresh the page to show updated data
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: userData.name,
      email: userData.email,
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-950 rounded-t-lg p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {/* Abstract pattern - similar to SideNav */}
            <div className="absolute top-0 left-0 w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 L100,0 L100,100 Z" fill="white" fillOpacity="0.1" />
                <path d="M0,0 L0,100 L100,0 Z" fill="white" fillOpacity="0.1" />
              </svg>
            </div>
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-blue-100">Manage your personal information and preferences</p>
          </div>
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-b-lg shadow-md">
          <div className="md:flex">
            {/* Profile Image Column */}
            <div className="md:w-1/3 p-6 border-r border-gray-200">
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">Profile Picture</h2>
                <ProfileUpload 
                  userId={userData.id} 
                  currentImageUrl={userData.image_url}
                />
              </div>
            </div>
            
            {/* Profile Info Column */}
            <div className="md:w-2/3 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <PencilSquareIcon className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={cancelEdit}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                    >
                      <XMarkIcon className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <CheckIcon className="w-4 h-4 mr-1" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-800">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                          {userData.name}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-800">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                          {userData.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
               
                
                
                {/* Buttons - only show when editing */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
          
          {/* Additional profile sections could go here */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <h3 className="font-medium text-gray-800">Password</h3>
                  <p className="text-sm text-gray-500">Change your account password</p>
                </div>
                <button className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                  Change Password
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <h3 className="font-medium text-gray-800">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <button className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                  Enable 2FA
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <h3 className="font-medium text-gray-800">Notification Settings</h3>
                  <p className="text-sm text-gray-500">Manage your notification preferences</p>
                </div>
                <button className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                  Configure
                </button>
              </div>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Danger Zone</h2>
            
            <div className="p-4 border border-red-200 rounded-md bg-red-50">
              <h3 className="font-medium text-red-800">Delete Account</h3>
              <p className="text-sm text-red-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="py-2 px-4 bg-white border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}