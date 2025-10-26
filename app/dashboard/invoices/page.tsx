'use client';

import { SetStateAction, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/app/components/invoices/Pagination';
import Search from '@/app/components/dashboard/Search';
import { CreateInvoice } from '@/app/components/invoices/Buttons';
import { InvoicesTableSkeleton } from '@/app/components/global/Skeletons';
import { Suspense } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import InvoiceTable from '@/app/components/invoices/InvoiceTable';
import Breadcrumbs from '@/app/components/global/Breadcrumbs';
import Link from 'next/link';

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [invoiceStats, setInvoiceStats] = useState({
    totalInvoices: 0,
    pending: 0,
    paid: 0,
    total: 0
  });

  // Define breadcrumbs for navigation
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Invoices', href: '/dashboard/invoices', active: true },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (query) {
          params.set('query', query);
        }
        
        // Fetch invoices data
        const url = `/api/invoices/${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch invoice data');
        }

        const data = await response.json();
        setTotalPages(data.totalPages);
        
        // Set mock stats (in real app, this would come from the API)
        setInvoiceStats({
          totalInvoices: data.totalInvoices || 150,
          pending: data.pendingAmount || 35,
          paid: data.paidAmount || 115,
          total: data.totalAmount || 25678.45
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load data';
        setError(message as any as SetStateAction<null>);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const refreshData = () => {
    setIsLoading(true);
    // This would trigger the useEffect by changing query slightly
    // In a real app, you might want a better way to force refresh
    toast.success('Refreshing data...');
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-50 to-teal-50 p-6 md:p-8 shadow-sm border border-slate-100">
      <div className="absolute right-0 bottom-0 opacity-10">
          <svg width="218" height="109" viewBox="0 0 218 109" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M144.969 37.1747C144.969 36.4691 144.551 36.089 143.716 36.089C142.88 36.089 142.463 36.4691 142.463 37.1747V39.5363H140.173C139.269 39.5363 138.852 39.9163 138.852 40.6219C138.852 41.3275 139.269 41.7075 140.173 41.7075H142.463V44.0691C142.463 44.7747 142.88 45.1547 143.716 45.1547C144.551 45.1547 144.969 44.7747 144.969 44.0691V41.7075H147.259C148.164 41.7075 148.581 41.3275 148.581 40.6219C148.581 39.9163 148.164 39.5363 147.259 39.5363H144.969V37.1747Z" fill="#14B8A6"/>
            <path d="M28.1085 31.5764C28.107 27.2756 29.458 23.0934 31.9836 19.6123C34.5093 16.1312 38.0809 13.549 42.15 12.2192C46.219 10.8894 50.5863 10.8744 54.6649 12.1766C58.7435 13.4788 62.3336 16.0375 64.8834 19.5033" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.7271 31.5764H28.1085V23.195" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M65.0916 66.9035C65.0931 71.2043 63.7421 75.3865 61.2165 78.8676C58.6908 82.3486 55.1192 84.9309 51.0501 86.2607C46.9811 87.5905 42.6138 87.6055 38.5352 86.3033C34.4566 85.0011 30.8665 82.4424 28.3167 78.9766" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M73.4729 66.9036H65.0915V75.285" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M34.5151 49.2399C34.5151 48.5343 34.0981 48.1543 33.2621 48.1543C32.4261 48.1543 32.0091 48.5343 32.0091 49.2399V51.6015H29.7191C28.8156 51.6015 28.3986 51.9815 28.3986 52.6871C28.3986 53.3927 28.8156 53.7727 29.7191 53.7727H32.0091V56.1343C32.0091 56.8399 32.4261 57.2199 33.2621 57.2199C34.0981 57.2199 34.5151 56.8399 34.5151 56.1343V53.7727H36.8051C37.7086 53.7727 38.1256 53.3927 38.1256 52.6871C38.1256 51.9815 37.7086 51.6015 36.8051 51.6015H34.5151V49.2399Z" fill="#14B8A6"/>
            <path d="M86.8768 83.2432C86.8768 82.5376 86.4598 82.1576 85.6238 82.1576C84.7878 82.1576 84.3708 82.5376 84.3708 83.2432V85.6048H82.0808C81.1773 85.6048 80.7603 85.9848 80.7603 86.6904C80.7603 87.396 81.1773 87.776 82.0808 87.776H84.3708V90.1376C84.3708 90.8432 84.7878 91.2232 85.6238 91.2232C86.4598 91.2232 86.8768 90.8432 86.8768 90.1376V87.776H89.1668C90.0703 87.776 90.4873 87.396 90.4873 86.6904C90.4873 85.9848 90.0703 85.6048 89.1668 85.6048H86.8768V83.2432Z" fill="#14B8A6"/>
            <path d="M197.766 49.2399C197.766 48.5343 197.349 48.1543 196.513 48.1543C195.677 48.1543 195.26 48.5343 195.26 49.2399V51.6015H192.97C192.067 51.6015 191.649 51.9815 191.649 52.6871C191.649 53.3927 192.067 53.7727 192.97 53.7727H195.26V56.1343C195.26 56.8399 195.677 57.2199 196.513 57.2199C197.349 57.2199 197.766 56.8399 197.766 56.1343V53.7727H200.056C200.96 53.7727 201.377 53.3927 201.377 52.6871C201.377 51.9815 200.96 51.6015 200.056 51.6015H197.766V49.2399Z" fill="#14B8A6"/>
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-slate-800">Invoice Management</h1>
              <p className="text-slate-500 mt-2">Manage and track all financial transactions</p>
            </motion.div>
            
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <button 
                onClick={refreshData}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                title="Refresh data"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border ${showFilters ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} transition-colors`}
                title="Show filters"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
              </button>
              
              <button 
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                title="Export invoices"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Breadcrumbs */}
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      {/* Filters Section - Conditionally rendered */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-medium text-slate-700 mb-4">Filter Invoices</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                  <select 
                    id="status" 
                    className="w-full rounded-lg border-slate-200 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="dateFrom" className="block text-sm font-medium text-slate-600 mb-1">Date From</label>
                  <input 
                    type="date" 
                    id="dateFrom" 
                    className="w-full rounded-lg border-slate-200 shadow-sm focus:border-teal-500 focus:ring-teal-500" 
                  />
                </div>
                
                <div>
                  <label htmlFor="dateTo" className="block text-sm font-medium text-slate-600 mb-1">Date To</label>
                  <input 
                    type="date" 
                    id="dateTo" 
                    className="w-full rounded-lg border-slate-200 shadow-sm focus:border-teal-500 focus:ring-teal-500" 
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  Reset
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Action Area */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 w-full">
          <div className="md:col-span-6 bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-100">
            <Search placeholder="Search invoices by customer name, email or invoice number..." />
          </div>
          <div className="md:col-span-2 bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-100 flex items-center justify-center">
            <CreateInvoice />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <Suspense 
            key={`${query}-${currentPage}`} 
            fallback={<InvoicesTableSkeleton />}
          >
            <InvoiceTable query={query} currentPage={currentPage} />
          </Suspense>
        </div>

        {/* Error Handling & Pagination */}
        <div className="flex flex-col items-center gap-4">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3"
            >
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">Error loading invoices</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </motion.div>
          )}
          
          {!isLoading && totalPages > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
            >
              <Pagination totalPages={totalPages} />
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Help Card */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-slate-800">Need help with invoices?</h3>
            <p className="text-sm text-slate-500 mt-1">Check out our documentation for detailed guides on invoice management</p>
          </div>
          <Link
            href="/help/invoices"
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            View Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}