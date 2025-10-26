'use client';

import { useEffect, useState } from 'react';
import { ArrowPathIcon, ArrowTrendingUpIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';

// Define types
interface Invoice {
  id: string;
  name: string;
  email: string;
  image_url: string;
  amount: number;
}

// Status type to handle different states
type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

// Custom hook for fetching invoice data
function useLatestInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchInvoices = async () => {
    setStatus('loading');

    try {
      const res = await fetch('/api/dashboard');
      
      if (!res.ok) {
        throw new Error(`Failed to fetch latest invoices: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setInvoices(data.latestInvoices || []);
      setLastUpdated(new Date());
      setStatus('success');
      setError(null);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError((err as Error).message);
      setStatus('error');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchInvoices();
  }, []);

  return { 
    invoices, 
    status, 
    error, 
    lastUpdated,
    refresh: fetchInvoices 
  };
}

// SVG shimmer effect for image placeholders
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="0%" />
      <stop stop-color="#edeef1" offset="20%" />
      <stop stop-color="#f6f7f8" offset="40%" />
      <stop stop-color="#f6f7f8" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
</svg>`;

const toBase64 = (str: string) => 
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

// Format currency value
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format relative time for "last updated"
const formatLastUpdated = (date: Date | null): string => {
  if (!date) return 'Not yet updated';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Updated just now';
  if (diffInSeconds < 3600) return `Updated ${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `Updated ${Math.floor(diffInSeconds / 3600)} hours ago`;
  
  return `Updated on ${date.toLocaleDateString()}`;
};

// Invoice list item component
function InvoiceItem({ invoice, isLast }: { invoice: Invoice; isLast: boolean }) {
  return (
    <div
      className={clsx(
        'flex flex-row items-center justify-between py-3 px-4 transition-colors hover:bg-slate-50',
        {
          'border-b border-slate-100': !isLast,
        },
      )}
    >
      <div className="flex items-center">
        <div className="relative h-10 w-10 mr-4">
          <Image
            src={invoice.image_url}
            alt={`${invoice.name}'s profile picture`}
            className="rounded-full object-cover border border-slate-200"
            fill
            sizes="40px"
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(40, 40))}`}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700">
            {invoice.name}
          </p>
          <p className="hidden text-xs text-slate-500 sm:block">
            {invoice.email}
          </p>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-700">
        {invoice.amount}
      </p>
    </div>
  );
}

// Skeleton loader component
function InvoiceSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-row items-center justify-between py-4 px-4 border-b border-slate-100">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse mr-4"></div>
            <div className="flex flex-col gap-2">
              <div className="h-4 w-24 bg-slate-100 animate-pulse rounded"></div>
              <div className="h-3 w-32 bg-slate-100 animate-pulse rounded"></div>
            </div>
          </div>
          <div className="h-4 w-16 bg-slate-100 animate-pulse rounded"></div>
        </div>
      ))}
    </>
  );
}

// Error message component
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-4 text-red-600 bg-red-50 rounded-lg m-2 flex items-center">
      <ExclamationCircleIcon className="h-5 w-5 mr-2" />
      <p>{message}</p>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-slate-100 p-3 rounded-full mb-3">
        <ArrowPathIcon className="h-6 w-6 text-slate-500" />
      </div>
      <h3 className="text-slate-700 font-medium mb-1">No invoices found</h3>
      <p className="text-slate-500 text-sm">There are no recent invoices to display</p>
    </div>
  );
}

// Main component
export default function LatestInvoices() {
  const { invoices, status, error, lastUpdated, refresh } = useLatestInvoices();

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-700">
          Latest Invoices
        </h2>
        <div className="flex gap-2">
          {status !== 'loading' && (
            <button 
              className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-700 transition-colors"
              onClick={refresh}
              // disabled={status === ''}
              aria-label="Refresh invoices"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          )}
          <button 
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            onClick={() => window.location.href = '/dashboard/invoices'}
          >
            View all
            <ArrowTrendingUpIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex grow flex-col justify-between rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-2 py-1">
          {status === 'error' && error && <ErrorMessage message={error} />}
          
          {status === 'loading' ? (
            <InvoiceSkeleton />
          ) : status === 'success' && (!invoices || invoices.length === 0) ? (
            <EmptyState />
          ) : (
            invoices.map((invoice, i) => (
              <InvoiceItem 
                key={invoice.id} 
                invoice={invoice} 
                isLast={i === invoices.length - 1} 
              />
            ))
          )}
        </div>

        <div className="flex items-center p-4 bg-slate-50">
          <ArrowPathIcon className="h-4 w-4 text-slate-500" />
          <h3 className="ml-2 text-xs text-slate-500">
            {formatLastUpdated(lastUpdated)}
          </h3>
        </div>
      </div>
    </div>
  );
}