'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  AtSymbolIcon, 
  KeyIcon, 
  UserIcon, 
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export default function SignUp() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [errors, setErrors] = useState<FormErrors>();
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  const validateForm = () => {
    const newErrors : FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.terms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Redirect to login page with success message
      router.push('/login?registered=true');
      
    } catch (error) {
      console.error('Registration error:', error);
      setGeneralError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-12">
      <div className="max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-xl">O</span>
          </div>
        </div>
        
        {/* Heading */}
        <h1 className="text-2xl font-semibold text-slate-800 text-center mb-2">Create your account</h1>
        <p className="text-slate-500 text-center mb-8">Join Obscurium to access our platform</p>

        {/* General error message */}
        {generalError && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{generalError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-800"
                placeholder="John Doe"
              />
            </div>
            {errors?.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSymbolIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-800"
                placeholder="you@example.com"
              />
            </div>
            {errors?.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-800"
                placeholder="Min. 8 characters"
              />
            </div>
            {errors?.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-800"
                placeholder="Confirm your password"
              />
            </div>
            {errors?.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>
          
          <div>
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                className="h-4 w-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-600">
                I agree to the <a href="/terms" className="text-slate-800 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-slate-800 hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors?.terms && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                {errors.terms}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition duration-150 ease-in-out"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-slate-800 hover:underline">
            Sign in
          </Link>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-500 text-center">
            &copy; {new Date().getFullYear()} Obscurium. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}