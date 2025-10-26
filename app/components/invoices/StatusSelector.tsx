'use client';

import { useState } from 'react';
import { CheckCircle, ChevronsUpDown } from 'lucide-react';

interface StatusSelectorProps {
  value: string;
  error?: string;
  onChange: (status: string) => void;
}

export default function StatusSelector({ value, error, onChange }: StatusSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  ];
  
  const currentStatus = statusOptions.find(s => s.value === value);
  
  const handleSelectStatus = (status: string) => {
    onChange(status);
    setIsDropdownOpen(false);
  };
  
  return (
    <div>
      <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
        Status
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
          {currentStatus ? (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
          ) : (
            <span className="text-slate-400">Select status</span>
          )}
          <ChevronsUpDown className="h-4 w-4 text-slate-400" />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
            <ul
              className="py-1"
              role="listbox"
              aria-labelledby="status-select"
            >
              {statusOptions.map((status) => (
                <li
                  key={status.value}
                  role="option"
                  aria-selected={status.value === value}
                  className={`px-3 py-2 cursor-pointer flex items-center ${
                    status.value === value
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => handleSelectStatus(status.value)}
                >
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color} mr-2`}>
                    {status.label}
                  </span>
                  {status.value === value && (
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