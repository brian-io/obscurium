'use client';

import { CustomerField } from '@/app/lib/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/global/Button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateCustomer({ customers }: { customers: CustomerField[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    customerId: '',
    amount: '',
    status: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const data = {
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    };

    try {
      setLoading(true);
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      router.push('/dashboard/invoices');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-1">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Selection */}
            <div className="space-y-4">
              <label htmlFor="customer" className="block text-sm font-medium text-slate-700">
                Customer
              </label>
              <div className="relative bg-slate-50 rounded-lg overflow-hidden transition-all hover:bg-slate-100 group">
                <select
                  id="customer"
                  name="customerId"
                  value={formState.customerId}
                  onChange={handleInputChange}
                  className="appearance-none block w-full bg-transparent border-0 focus:ring-0 py-3.5 pl-12 pr-10 text-slate-700"
                  required
                >
                  <option value="" disabled>
                    Select a customer
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-teal-100 group-hover:bg-teal-200 transition-colors">
                    <UserCircleIcon className="h-4 w-4 text-teal-600" />
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Invoice Amount */}
            <div className="space-y-4">
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
                Amount
              </label>
              <div className="relative bg-slate-50 rounded-lg overflow-hidden transition-all hover:bg-slate-100 group">
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formState.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="block w-full bg-transparent border-0 focus:ring-0 py-3.5 pl-12 pr-4 text-slate-700"
                  required
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-teal-100 group-hover:bg-teal-200 transition-colors">
                    <CurrencyDollarIcon className="h-4 w-4 text-teal-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Status */}
          <div className="mt-8">
            <span className="block text-sm font-medium text-slate-700 mb-4">
              Invoice Status
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label 
                htmlFor="pending" 
                className={`flex items-center p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                  formState.status === "pending" 
                    ? "border-amber-300 bg-amber-50" 
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  checked={formState.status === "pending"}
                  onChange={handleInputChange}
                  className="sr-only"
                  required
                />
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    formState.status === "pending" ? "bg-amber-200" : "bg-slate-200"
                  }`}>
                    <ClockIcon className={`h-4 w-4 ${
                      formState.status === "pending" ? "text-amber-600" : "text-slate-500"
                    }`} />
                  </div>
                  <div>
                    <span className={`font-medium ${
                      formState.status === "pending" ? "text-amber-800" : "text-slate-700"
                    }`}>Pending</span>
                    <p className="text-xs text-slate-500">Invoice awaiting payment</p>
                  </div>
                </div>
              </label>
              
              <label 
                htmlFor="paid" 
                className={`flex items-center p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                  formState.status === "paid" 
                    ? "border-teal-300 bg-teal-50" 
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  checked={formState.status === "paid"}
                  onChange={handleInputChange}
                  className="sr-only"
                  required
                />
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    formState.status === "paid" ? "bg-teal-200" : "bg-slate-200"
                  }`}>
                    <CheckIcon className={`h-4 w-4 ${
                      formState.status === "paid" ? "text-teal-600" : "text-slate-500"
                    }`} />
                  </div>
                  <div>
                    <span className={`font-medium ${
                      formState.status === "paid" ? "text-teal-800" : "text-slate-700"
                    }`}>Paid</span>
                    <p className="text-xs text-slate-500">Payment has been received</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-xl flex flex-col sm:flex-row sm:justify-between gap-3">
          <Link
            href="/dashboard/invoices"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Cancel
          </Link>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white py-2.5 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}