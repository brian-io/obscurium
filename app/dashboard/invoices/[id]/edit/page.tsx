// app/dashboard/invoices/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Breadcrumbs from '@/app/components/invoices/Breadcrumbs';
import { useRouter, useParams } from 'next/navigation';
import EditForm from '@/app/components/invoices/EditForm';
import { InvoiceForm } from '@/app/lib/definitions';
import { Loader } from '@/app/components/global/Loader';
import { ErrorState } from '@/app/components/global/Error'
export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [invoice, setInvoice] = useState<InvoiceForm | undefined>();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch both invoice and customers in parallel
        const [invoiceResponse, customersResponse] = await Promise.all([
          fetch(`/api/invoices/${id}`),
          fetch('/api/customers')
        ]);
        
        // Handle invoice response
        if (!invoiceResponse.ok) {
          if (invoiceResponse.status === 404) {
            router.push('/404');
            return;
          }
          throw new Error('Failed to fetch invoice');
        }
        
        // Handle customers response
        if (!customersResponse.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        // Parse responses
        const invoiceData = await invoiceResponse.json();
        const customersData = await customersResponse.json();
        
        setInvoice(invoiceData);
        setCustomers(customersData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load required data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id, router]);
  
  // Handle page states
  if (loading) {
    return (
      <main className="px-4 py-6 max-w-6xl mx-auto">
        <Loader message="Loading invoice data..." />
      </main>
    );
  }
  
  if (error) {
    return (
      <main className="px-4 py-6 max-w-6xl mx-auto">
        <ErrorState 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </main>
    );
  }
  
  if (!invoice) {
    return null; // This should rarely happen as we redirect to 404 if invoice not found
  }

  return (
    <main className="px-4 py-6 max-w-6xl mx-auto">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <EditForm invoice={invoice} customers={customers} />
    </main>
  );
}