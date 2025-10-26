'use client';

import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { ToastContext } from '@/app/hooks/useToast';

type ToastVariant = 'default' | 'success' | 'destructive';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, description, variant }]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-start p-4 rounded-lg shadow-md animate-in fade-in slide-in-from-right-5 ${
              t.variant === 'success' ? 'bg-green-50 border border-green-100' :
              t.variant === 'destructive' ? 'bg-red-50 border border-red-100' :
              'bg-white border border-slate-100'
            }`}
            role="alert"
          >
            <div className="flex-shrink-0 mr-3">
              {t.variant === 'success' && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {t.variant === 'destructive' && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="flex-grow">
              <h3 className={`text-sm font-medium ${
                t.variant === 'success' ? 'text-green-800' :
                t.variant === 'destructive' ? 'text-red-800' :
                'text-slate-800'
              }`}>
                {t.title}
              </h3>
              {t.description && (
                <p className={`mt-1 text-sm ${
                  t.variant === 'success' ? 'text-green-700' :
                  t.variant === 'destructive' ? 'text-red-700' :
                  'text-slate-500'
                }`}>
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className={`flex-shrink-0 ml-2 p-1 rounded-full ${
                t.variant === 'success' ? 'text-green-500 hover:bg-green-100' :
                t.variant === 'destructive' ? 'text-red-500 hover:bg-red-100' :
                'text-slate-400 hover:bg-slate-100'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}