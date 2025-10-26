'use client';

import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex items-center justify-center mb-3">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-red-600 text-xl font-semibold mb-2">Error</h2>
      <p className="text-red-800">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}