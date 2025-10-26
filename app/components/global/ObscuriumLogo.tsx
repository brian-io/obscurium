// components/global/ObscuriumLogo.tsx
import React from 'react';

export interface ObscuriumLogoProps {
  className?: string;
  collapsed?: boolean;
}

export default function ObscuriumLogo({
  className = '',
  collapsed = false,
}: ObscuriumLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* SVG only ever 40×40 */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <circle cx="20" cy="20" r="18" stroke="#60A5FA" strokeWidth="4" fill="none" />
        <circle cx="20" cy="20" r="4" fill="#3B82F6" />
      </svg>

      {/* text hidden when collapsed */}
      {!collapsed && (
        <div className="ml-2 flex flex-col leading-tight">
          <span className="text-lg font-semibold text-blue-100">Obscurium</span>
          <span className="text-xs text-blue-50 -mt-0.5">Logistics</span>
        </div>
      )}
    </div>
  );
}
