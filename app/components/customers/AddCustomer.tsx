'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customerData: { name: string; email: string; image_url?: string }) => Promise<void>;
}

export default function AddCustomerModal({ isOpen, onClose, onSubmit }: AddCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image_url: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({ name: '', email: '', image_url: '' });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        setErrors({ email: 'A customer with this email already exists' });
      } else {
        setErrors({ form: 'Failed to add customer. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900 bg-opacity-50 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed top-1/2 left-1/2 bg-white shadow-xl z-50 w-[90%] sm:w-full max-w-md overflow-hidden rounded-xl border border-slate-100"
            style={{ translateX: '-50%', translateY: '-50%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Add Customer</h2>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-700"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              {errors.form && (
                <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.form}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-2.5 border ${errors.name ? 'border-red-300 bg-red-50 focus:ring-red-300 focus:border-red-300' : 'border-slate-200 focus:ring-slate-300 focus:border-slate-300'} rounded-lg bg-slate-50 shadow-sm transition-colors`}
                    placeholder="Enter customer name"
                  />
                  {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-2.5 border ${errors.email ? 'border-red-300 bg-red-50 focus:ring-red-300 focus:border-red-300' : 'border-slate-200 focus:ring-slate-300 focus:border-slate-300'} rounded-lg bg-slate-50 shadow-sm transition-colors`}
                    placeholder="customer@example.com"
                  />
                  {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="image_url" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Profile Image URL <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-100 text-slate-500">
                      <UserCircleIcon className="h-5 w-5" />
                    </span>
                    <input
                      type="url"
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      className="flex-1 p-2.5 border border-slate-200 rounded-r-lg bg-slate-50 shadow-sm focus:ring-slate-300 focus:border-slate-300 transition-colors"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Adding an image URL is optional but helps identify the customer.</p>
                </div>

                {/* Footer with subtle divider */}
                <div className="pt-4 mt-6 border-t border-slate-100">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors font-medium border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-100'} shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-colors flex items-center font-medium border border-emerald-100`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 mr-2.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                          Processing
                        </>
                      ) : (
                        'Add Customer'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}