import React from 'react';

export default function ObscuriumLogo ({ className = '' }) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* SVG Logo */}
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <path 
          d="M20 0C8.954 0 0 8.954 0 20C0 31.046 8.954 40 20 40C31.046 40 40 31.046 40 20C40 8.954 31.046 0 20 0ZM20 8C26.627 8 32 13.373 32 20C32 26.627 26.627 32 20 32C13.373 32 8 26.627 8 20C8 13.373 13.373 8 20 8Z" 
          fill="#2563EB" 
        />
        <path 
          d="M20 12C15.582 12 12 15.582 12 20C12 24.418 15.582 28 20 28C24.418 28 28 24.418 28 20C28 15.582 24.418 12 20 12ZM20 22C18.895 22 18 21.105 18 20C18 18.895 18.895 18 20 18C21.105 18 22 18.895 22 20C22 21.105 21.105 22 20 22Z" 
          fill="#1E40AF" 
        />
      </svg>
      
      {/* Logo Text */}
      <div className="ml-2 flex flex-col">
        <span className="text-xl font-bold text-blue-600">Obscurium</span>
        <span className="text-sm text-gray-100 -mt-1">Logistics</span>
      </div>
    </div>
  );
};

