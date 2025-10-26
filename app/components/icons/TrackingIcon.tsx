import React from 'react';

export default function TrackingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      {/* Outer radar arc */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2a10 10 0 0110 10"
      />
      {/* Middle radar arc */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6a6 6 0 016 6"
      />
      {/* Inner radar arc */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 10a2 2 0 012 2"
      />
      {/* Center dot */}
      <circle
        cx="12"
        cy="12"
        r="1.5"
        fill="currentColor"
      />
      {/* Tracking pointer (like a radar beam) */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 12L16.5 7.5"
      />
    </svg>
  );
}
