'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface CustomerData {
  id: string;
  name: string;
  email: string;
  image_url?: string;
}

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image_url: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/customers/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch customer');
        }
        const data = await response.json();
        setCustomer(data);
        setFormData({
          name: data.name,
          email: data.email,
          image_url: data.image_url || ''
        });
      } catch (error) {
        console.error('Error fetching customer:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update customer');
      }

      setSaveMessage({ type: 'success', text: 'Customer updated successfully!' });
      setTimeout(() => {
        router.push('/customers');
      }, 1500);
    } catch (error) {
      console.error('Error updating customer:', error);
      if (error instanceof Error) {
        setSaveMessage({ 
          type: 'error', 
          text: error.message.includes('already exists') 
            ? 'A customer with this email already exists' 
            : 'Failed to update customer. Please try again.' 
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-8">
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-full bg-gray-50 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-8">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Customer Not Found</h2>
              <p className="text-gray-600 mb-6">The customer you're looking for doesn't exist or has been removed.</p>
              <button
                onClick={() => router.push('/customers')}
                className="inline-flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Customers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push('/customers')}
            className="inline-flex items-center mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Edit Customer</h1>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-8">
          {saveMessage && (
            <div 
              className={`mb-6 p-4 rounded-lg ${
                saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter customer name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="customer@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="mb-8">
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image URL (Optional)
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/customers')}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`px-5 py-2 bg-indigo-500 text-white rounded-lg ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-600'} transition-colors flex items-center`}
              >
                {isSaving && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}