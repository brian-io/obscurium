'use client';

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function Loader({ message = 'Loading data...' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">{message}</p>
      </div>
    </div>
  );
}