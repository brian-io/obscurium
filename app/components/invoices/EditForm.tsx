// app/components/invoices/EditForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, ChevronsUpDown, Loader2 } from 'lucide-react';
import { CustomerField, InvoiceForm } from '@/app/lib/definitions';
import { useToast } from '@/app/hooks/useToast';
import CustomerSelector from './CustomerSelector';
import StatusSelector from './StatusSelector';
import AmountInput from './AmountInput';

export default function EditForm({
  invoice,
  customers,
}: {
  invoice: InvoiceForm;
  customers: CustomerField[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    customer_id?: string;
    amount?: string;
    status?: string;
  }>({});
  const [formData, setFormData] = useState({
    id: invoice.id,
    customer_id: invoice.customer_id,
    amount: invoice.amount,
    status: invoice.status,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for the field
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: {
      customer_id?: string;
      amount?: string;
      status?: string;
    } = {};
    
    if (!formData.customer_id) {
      newErrors.customer_id = 'Please select a customer';
    }
    
    if (!formData.amount || isNaN(Number(formData.amount))) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.status) {
      newErrors.status = 'Please select a status';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: formData.customer_id,
          amount: Number(formData.amount),
          status: formData.status,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update invoice');
      }
      
      toast({
        title: 'Success',
        description: 'Invoice updated successfully',
        variant: 'success',
      });
      
      router.push('/dashboard/invoices');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update invoice',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Find the current customer
  const currentCustomer = customers.find(c => c.id === formData.customer_id);
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Edit Invoice</h1>
        <p className="text-slate-500">Update invoice information and submit changes</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {/* Customer Selection */}
          <CustomerSelector 
            customers={customers}
            currentCustomer={currentCustomer}
            value={formData.customer_id}
            error={errors.customer_id}
            onChange={(id: any) => updateField('customer_id', id)}
          />

          {/* Amount Input */}
          <AmountInput
            value={formData.amount as any as string}
            error={errors.amount}
            onChange={handleInputChange}
          />

          {/* Status Selection */}
          <StatusSelector
            value={formData.status}
            error={errors.status}
            onChange={(status: any) => updateField('status', status)}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Link
            href="/dashboard/invoices"
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Link>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}