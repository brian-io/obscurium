'use client'

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon,
  EnvelopeIcon, 
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  BellIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import ProfileUpload from '@/app/components/user/ProfileUpload';
import { User } from '@/app/lib/definitions';

// Define form field types for better type safety
type FormFields = {
  name: string;
  email: string;
};

// Status types for the component
type FormStatus = 'idle' | 'editing' | 'submitting' | 'success' | 'error';

// Error message interface
interface ErrorMessage {
  field?: string;
  message: string;
}

export default function ProfileForm({ user }: { user: User | null }) {
  const router = useRouter();
  
  // Form state management
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [formData, setFormData] = useState<FormFields>({
    name: '',
    email: '',
  });
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize form with user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Derived state
  const isEditing = formStatus === 'editing';
  const isSubmitting = formStatus === 'submitting';
  const hasError = formStatus === 'error';
  const isDataChanged = user && (formData.name !== user.name || formData.email !== user.email);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error if it exists
    if (errorMessage?.field === name) {
      setErrorMessage(null);
    }
  };

  // Begin editing mode
  const startEditing = () => {
    setFormStatus('editing');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Cancel editing and reset form
  const cancelEditing = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
    setFormStatus('idle');
    setErrorMessage(null);
  };

  // Form validation
  const validateForm = (): boolean => {
    // Email validation with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.name.trim()) {
      setErrorMessage({ field: 'name', message: 'Please enter your name' });
      return false;
    }
    
    if (!formData.email.trim()) {
      setErrorMessage({ field: 'email', message: 'Please enter your email address' });
      return false;
    }
    
    if (!emailRegex.test(formData.email)) {
      setErrorMessage({ field: 'email', message: 'Please enter a valid email address' });
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Skip if no changes were made
    if (!isDataChanged) {
      setFormStatus('idle');
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setFormStatus('submitting');
    setErrorMessage(null);

    try {
      // Only send request if user is defined
      if (!user?.id) {
        throw new Error('User information is missing');
      }
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Something went wrong. Please try again later.');
      }

      setFormStatus('success');
      setSuccessMessage('Your profile has been updated successfully!');
      
      // Show success message briefly before returning to idle state
      setTimeout(() => {
        setFormStatus('idle');
        setSuccessMessage(null);
        router.refresh(); // Refresh the page to show updated data
      }, 2000);
      
    } catch (err) {
      console.error('Update error:', err);
      setFormStatus('error');
      setErrorMessage({ 
        message: err instanceof Error 
          ? err.message 
          : 'We couldn\'t update your profile. Please try again later.'
      });
    }
  };

  // Loading state when no user data is available
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-950 rounded-t-lg p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 L100,0 L100,100 Z" fill="white" fillOpacity="0.1" />
                <path d="M0,0 L0,100 L100,0 Z" fill="white" fillOpacity="0.1" />
              </svg>
            </div>
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-xs text-blue-100">Manage your personal information and preferences</p>
          </div>
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-b-lg shadow-md">
          {/* Success message */}
          {successMessage && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckIcon className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="md:flex">
            {/* Profile Image Column */}
            <div className="md:w-1/3 p-6 border-r border-gray-200">
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">Profile Picture</h2>
                <ProfileUpload 
                  userId={user.id} 
                  currentImageUrl={user.image_url}
                />
              </div>
            </div>
            
            {/* Profile Info Column */}
            <div className="md:w-2/3 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={startEditing}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition duration-150"
                  >
                    <PencilSquareIcon className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={cancelEditing}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition duration-150"
                      disabled={isSubmitting}
                    >
                      <XMarkIcon className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !isDataChanged}
                      className={`flex items-center text-sm transition duration-150 ${
                        isDataChanged 
                          ? 'text-blue-600 hover:text-blue-800' 
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <CheckIcon className="w-4 h-4 mr-1" />
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
              
              {/* General error message */}
              {errorMessage && !errorMessage.field && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-md flex items-start">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage.message}</span>
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
                            className={`pl-10 block w-full rounded-md border ${
                              errorMessage?.field === 'name' 
                                ? 'border-red-300 pr-10 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            } py-2 px-3 shadow-sm`}
                            disabled={isSubmitting}
                            aria-invalid={errorMessage?.field === 'name'}
                            aria-describedby={errorMessage?.field === 'name' ? "name-error" : undefined}
                          />
                          {errorMessage?.field === 'name' && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-800">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                          {user.name || 'Not set'}
                        </div>
                      )}
                      {errorMessage?.field === 'name' && (
                        <p className="mt-2 text-sm text-red-600" id="name-error">
                          {errorMessage.message}
                        </p>
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
                            className={`pl-10 block w-full rounded-md border ${
                              errorMessage?.field === 'email' 
                                ? 'border-red-300 pr-10 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            } py-2 px-3 shadow-sm`}
                            disabled={isSubmitting}
                            aria-invalid={errorMessage?.field === 'email'}
                            aria-describedby={errorMessage?.field === 'email' ? "email-error" : undefined}
                          />
                          {errorMessage?.field === 'email' && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-800">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                          {user.email || 'Not set'}
                        </div>
                      )}
                      {errorMessage?.field === 'email' && (
                        <p className="mt-2 text-sm text-red-600" id="email-error">
                          {errorMessage.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Buttons - only show when editing */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !isDataChanged}
                      className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium transition duration-150 ${
                        isDataChanged
                          ? 'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
          
          {/* Additional profile sections */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition duration-150">
                <div className="flex items-start">
                  <KeyIcon className="h-6 w-6 text-gray-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-800">Password</h3>
                    <p className="text-sm text-gray-500">Change your account password</p>
                  </div>
                </div>
                <button className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150">
                  Change
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition duration-150">
                <div className="flex items-start">
                  <ShieldCheckIcon className="h-6 w-6 text-gray-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-800">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <button className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150">
                  Enable
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition duration-150">
                <div className="flex items-start">
                  <BellIcon className="h-6 w-6 text-gray-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-800">Notification Settings</h3>
                    <p className="text-sm text-gray-500">Manage your notification preferences</p>
                  </div>
                </div>
                <button className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150">
                  Configure
                </button>
              </div>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Danger Zone</h2>
            
            <div className="p-4 border border-red-200 rounded-md bg-red-50">
              <div className="flex items-start">
                <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-3 mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-800">Delete Account</h3>
                  <p className="text-sm text-red-600 mb-4">
                    Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
                  </p>
                  <button 
                    className="py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
                    onClick={() => window.confirm('Are you sure you want to delete your account? This action cannot be undone.')}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}