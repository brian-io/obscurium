'use client';

import { useState } from 'react';
import { CheckCircle, ChevronsUpDown } from 'lucide-react';
import { CustomerField } from '@/app/lib/definitions';

interface CustomerSelectorProps {
  customers: CustomerField[];
  currentCustomer?: CustomerField;
  value: string;
  error?: string;
  onChange: (customerId: string) => void;
}

export default function CustomerSelector({
  customers,
  currentCustomer,
  value,
  error,
  onChange
}: CustomerSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const handleSelectCustomer = (customerId: string) => {
    onChange(customerId);
    setIsDropdownOpen(false);
  };
  
  return (
    <div className="relative">
      <label htmlFor="customer" className="block text-sm font-medium text-slate-700 mb-2">
        Customer
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full py-3 px-4 flex items-center justify-between text-left rounded-lg border ${
            error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
          } hover:border-slate-300 transition-colors duration-200`}
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
        >
          {currentCustomer ? (
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mr-3">
                {currentCustomer.name.charAt(0)}
              </div>
              <span>{currentCustomer.name}</span>
            </div>
          ) : (
            <span className="text-slate-400">Select a customer</span>
          )}
          <ChevronsUpDown className="h-4 w-4 text-slate-400" />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            <ul
              className="py-1"
              role="listbox"
              aria-labelledby="customer-select"
            >
              {customers.map((customer) => (
                <li
                  key={customer.id}
                  role="option"
                  aria-selected={customer.id === value}
                  className={`px-3 py-2 cursor-pointer flex items-center ${
                    customer.id === value
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => handleSelectCustomer(customer.id)}
                >
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mr-3">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-xs text-slate-500">{customer.email}</p>
                  </div>
                  {customer.id === value && (
                    <CheckCircle className="h-4 w-4 ml-auto text-teal-600" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}