'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon,
  ShieldCheckIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Session } from 'next-auth';

// Types
interface UserData {
  id: string;
  name: string;
  email: string;
  image_url?: string;
}

interface FormData {
  name: string;
  email: string;
}

interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

// Custom hook for profile data management
function useUserProfile(session: Session | null) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user data
  useEffect(() => {
    if (session?.user?.email) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const res = await fetch(`/api/user?email=${encodeURIComponent(session.user?.email!)}`);
          
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to load profile');
          }
          
          const data = await res.json();
          setUser(data);
          setFormData({ name: data.name, email: data.email });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const cancelEdit = () => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
      setIsEditing(false);
    }
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          name: formData.name,
          email: formData.email 
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const updatedUser = await res.json();
      setUser(updatedUser.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch('/api/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete account');
      }
      
      await signOut({ callbackUrl: '/' });
      toast.success('Account deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  const handleUploadSuccess = (imageUrl: string) => {
    if (user) {
      setUser({ ...user, image_url: imageUrl });
      toast.success('Profile picture updated');
    }
  };

  return {
    user,
    loading,
    error,
    formData,
    isEditing,
    isSaving,
    setIsEditing,
    handleChange,
    cancelEdit,
    handleSave,
    handleDeleteAccount,
    handleUploadSuccess
  };
}

// Shared components
const Button = ({ children, onClick, className = '', type = 'button', disabled = false }: ButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${className}`}
  >
    {children}
  </button>
);

const Breadcrumbs = ({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) => (
  <nav className="flex mb-6" aria-label="Breadcrumb">
    <ol className="inline-flex items-center space-x-1 md:space-x-3">
      {breadcrumbs.map((item, index) => (
        <li key={index} className="inline-flex items-center">
          {index > 0 && <span className="mx-2 text-slate-400">/</span>}
          {item.active ? (
            <span className="text-slate-600 font-medium">{item.label}</span>
          ) : (
            <a href={item.href} className="text-slate-500 hover:text-slate-700">
              {item.label}
            </a>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

// Profile page component sections
const ProfileHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="relative overflow-hidden rounded-xl mb-8 border border-slate-200">
    <div className="absolute inset-0 bg-teal-50"></div>
    <div className="relative z-10 px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
      <p className="text-slate-500 mt-2">{subtitle}</p>
    </div>
  </div>
);

const ProfileUpload = ({ 
  userId, 
  currentImageUrl, 
  onUploadSuccess,
  isEditing 
}: { 
  userId: string; 
  currentImageUrl?: string; 
  onUploadSuccess: (url: string) => void;
  isEditing: boolean;
}) => {
  // In a real component, you would implement file upload logic here
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200">
          {currentImageUrl ? (
            <img 
              src={currentImageUrl} 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <UserIcon className="w-12 h-12 text-slate-400" />
            </div>
          )}
        </div>
        {isEditing && (
          <button 
            className="absolute bottom-0 right-0 bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600 transition-colors"
            onClick={() => document.getElementById('profile-upload')?.click()}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {isEditing && (
        <input 
          id="profile-upload"
          type="file" 
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            // In a real component, you would handle file upload here
            // and then call onUploadSuccess with the new URL
            console.log('File selected:', e.target.files?.[0]);
          }}
        />
      )}
      
      <p className="text-sm text-slate-500 text-center mt-2">
        {isEditing 
          ? "Click the edit button to upload a new profile picture" 
          : currentImageUrl 
            ? "Your profile picture" 
            : "No profile picture set"
        }
      </p>
    </div>
  );
};

const ProfilePictureSection = ({ 
  userId, 
  imageUrl, 
  onUploadSuccess, 
  isEditing 
}: { 
  userId: string; 
  imageUrl?: string; 
  onUploadSuccess: (imageUrl: string) => void; 
  isEditing: boolean;
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <h2 className="text-lg font-medium text-slate-700">Profile Picture</h2>
    <div className="mt-6 flex flex-col items-center">
      <ProfileUpload
        userId={userId}
        currentImageUrl={imageUrl}
        onUploadSuccess={onUploadSuccess}
        isEditing={isEditing}
      />
    </div>
  </div>
);

const PersonalInfoSection = ({
  formData,
  isEditing,
  isSaving,
  setIsEditing,
  handleChange,
  cancelEdit,
  handleSave
}: {
  formData: { name: string; email: string };
  isEditing: boolean;
  isSaving: boolean;
  setIsEditing: (isEditing: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cancelEdit: () => void;
  handleSave: (e: FormEvent<HTMLFormElement>) => void;
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-medium text-slate-700">Personal Information</h2>
      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center text-teal-600 hover:text-teal-700 transition-colors"
        >
          <PencilIcon className="w-4 h-4 mr-1" /> Edit
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={cancelEdit}
            className="flex items-center text-slate-500 hover:text-slate-700 transition-colors"
          >
            <XMarkIcon className="w-4 h-4 mr-1" /> Cancel
          </button>
          <button
            type="submit"
            form="profile-form"
            disabled={isSaving}
            className="flex items-center text-teal-600 hover:text-teal-700 transition-colors"
          >
            <CheckIcon className="w-4 h-4 mr-1" /> {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>

    <form id="profile-form" onSubmit={handleSave} className="space-y-6">
      <div className="group">
        <label className="block text-sm font-medium text-slate-600 mb-2">Full Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing}
            required
            className={`pl-10 block w-full rounded-lg border ${!isEditing ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200'} py-3 text-slate-700 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-100 focus:ring-opacity-50 transition-all duration-200`}
          />
        </div>
      </div>

      <div className="group">
        <label className="block text-sm font-medium text-slate-600 mb-2">Email Address</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EnvelopeIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
            required
            className={`pl-10 block w-full rounded-lg border ${!isEditing ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200'} py-3 text-slate-700 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-100 focus:ring-opacity-50 transition-all duration-200`}
          />
        </div>
      </div>
    </form>
  </div>
);

const SecuritySection = ({ router }: { router: AppRouterInstance }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
    <h2 className="text-lg font-medium text-slate-700 mb-6">Security Settings</h2>
    <div className="space-y-4">
      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg">
            <ShieldCheckIcon className="h-5 w-5 text-teal-500" />
          </div>
          <div>
            <h3 className="font-medium text-slate-700">Password</h3>
            <p className="text-sm text-slate-500">Change your account password</p>
          </div>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/change-password')}
          className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
        >
          Change
        </Button>
      </div>

      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg">
            <ShieldCheckIcon className="h-5 w-5 text-teal-500" />
          </div>
          <div>
            <h3 className="font-medium text-slate-700">Two-Factor Authentication</h3>
            <p className="text-sm text-slate-500">Add an extra layer of security</p>
          </div>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/security/2fa')}
          className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
        >
          Enable
        </Button>
      </div>
    </div>
  </div>
);

const DangerZoneSection = ({ onDeleteAccount }: { onDeleteAccount: () => void }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
    <h2 className="text-lg font-medium text-red-500 mb-6">Danger Zone</h2>
    <div className="p-4 border border-red-100 bg-red-50 rounded-lg">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrashIcon className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-medium text-red-600">Delete Account</h3>
            <p className="text-sm text-red-500">Permanently delete your account and all data</p>
          </div>
        </div>
        <Button 
          onClick={onDeleteAccount}
          className="bg-white text-red-500 border border-red-200 hover:bg-red-50 transition-colors px-4"
        >
          Delete Account
        </Button>
      </div>
    </div>
  </div>
);

const SignOutButton = () => (
  <div className="flex justify-end mt-8">
    <Button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="group flex items-center gap-2 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
    >
      <ArrowRightOnRectangleIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      Sign Out
    </Button>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-900 border-r-blue-800 border-b-blue-700 border-l-blue-600 rounded-full animate-spin"></div>
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-center p-8 bg-slate-50 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-slate-700">{message}</h2>
      <button 
        onClick={onRetry}
        className="mt-6 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300"
      >
        Retry
      </button>
    </div>
  </div>
);

// Main Profile Page Component
export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  // Define breadcrumbs for navigation
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/dashboard/profile', active: true },
  ];

  // Redirect if unauthenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/login');
    }
  }, [authStatus, router]);

  // Use custom hook for profile data management
  const {
    user,
    loading,
    error,
    formData,
    isEditing,
    isSaving,
    setIsEditing,
    handleChange,
    cancelEdit,
    handleSave,
    handleDeleteAccount,
    handleUploadSuccess
  } = useUserProfile(session);

  // Show loading state
  if (loading || authStatus === 'loading') {
    return <LoadingSpinner />;
  }

  // Show error state if user data failed to load
  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  // Show not found state if user doesn't exist
  if (!user) {
    return <ErrorState message="Profile not found" onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <ProfileHeader title="My Profile" subtitle="Manage your personal information and account preferences" />
      <Breadcrumbs breadcrumbs={breadcrumbs}/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Picture */}
        <div className="lg:col-span-1">
          <ProfilePictureSection
            userId={user.id}
            imageUrl={user.image_url}
            onUploadSuccess={handleUploadSuccess}
            isEditing={isEditing}
          />
        </div>

        {/* Right Column - User Info & Settings */}
        <div className="lg:col-span-2">
          {/* Personal Information */}
          <PersonalInfoSection
            formData={formData}
            isEditing={isEditing}
            isSaving={isSaving}
            setIsEditing={setIsEditing}
            handleChange={handleChange}
            cancelEdit={cancelEdit}
            handleSave={handleSave}
          />

          {/* Security Section */}
          <SecuritySection router={router} />

          {/* Danger Zone */}
          <DangerZoneSection onDeleteAccount={handleDeleteAccount} />

          {/* Sign Out */}
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}