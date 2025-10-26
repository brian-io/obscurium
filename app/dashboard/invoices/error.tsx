'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <motion.div 
        className="text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 max-w-md"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <FaceFrownIcon className="h-16 w-16 text-slate-400" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-slate-800">Unexpected Error</h1>
          <p className="text-slate-600 mb-6">We encountered an issue processing your request</p>
          
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all 
            flex items-center gap-2 text-sm font-medium"
          >
            <span>Try Again</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
  );
}