'use client';

import { useEffect, useState } from 'react';
import CreateForm from '@/app/components/invoices/CreateForm';
import Breadcrumbs from '@/app/components/invoices/Breadcrumbs';


export default function Page() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error('Failed to fetch customers');
        const data = await res.json();
        setCustomers(data.customers || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-400 border-r-blue-300 border-b-blue-200 border-l-blue-100 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center p-8 bg-rose-50 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-slate-700">Error Loading page! </h2>
          <h6 className="text-lg text-slate-700">{error}</h6>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-rose-600 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  };

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      <CreateForm customers={customers} />
    </main>
  );
}
