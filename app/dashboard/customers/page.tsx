'use client';

import React, { useEffect, useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  UserPlusIcon, 
  TrashIcon, 
  EyeIcon, 
  PencilSquareIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  BanknotesIcon, 
  ChartBarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { FormattedCustomersTable } from '@/app/lib/definitions';
import { useRouter } from 'next/navigation';
import AddCustomerModal from '@/app/components/customers/AddCustomer';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<FormattedCustomersTable[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch customers from API
  const fetchCustomers = async (query: string) => {
    setLoading(true);
    try {
      // Create URL without query parameter if query is empty
      const url = query 
        ? `/api/customers?query=${encodeURIComponent(query)}`
        : '/api/customers';
        
      const response = await fetch(
        url,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics from customer data
  const calculateAnalytics = () => {
    const totalPending = customers.reduce((sum, customer) => 
      sum + Number(customer.total_pending.replace(/[^0-9.]/g, '')), 0);
    
    const totalPaid = customers.reduce((sum, customer) => 
      sum + Number(customer.total_paid.replace(/[^0-9.]/g, '')), 0);

    return {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.total_invoices > 0).length,
      totalPending,
      totalPaid,
      averageInvoices: customers.length > 0 
        ? (customers.reduce((sum, c) => sum + c.total_invoices, 0) / customers.length).toFixed(1)
        : 0
    };
  };

  // Filter customers based on activeFilter
  const filteredCustomers = () => {
    switch(activeFilter) {
      case 'active':
        return customers.filter(c => c.total_invoices > 0);
      case 'inactive':
        return customers.filter(c => c.total_invoices === 0);
      default:
        return customers;
    }
  };

  useEffect(() => {
    fetchCustomers(searchQuery);
  }, [searchQuery]);

  const { totalCustomers, activeCustomers, totalPending, totalPaid, averageInvoices } = calculateAnalytics();

  const handleAddCustomer = async (customerData: { name: string; email: string; image_url?: string }) => {
    try {
      // Create a plain object with only the necessary data to avoid circular references
      const sanitizedData = {
        name: customerData.name,
        email: customerData.email,
        image_url: customerData.image_url
      };
      
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }
      
      // Refresh the customer list
      await fetchCustomers(searchQuery);
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding customer:', error);
      return Promise.reject(error);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return;
    }
    
    setIsDeletingId(customerId);
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      
      // Refresh the customer list
      await fetchCustomers(searchQuery);
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer. Please try again.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleEditCustomer = (customerId: string) => {
    router.push(`/dashboard/customers/${customerId}/edit`);
  };

  const handleViewCustomer = (customerId: string) => {
    router.push(`/dashboard/customers/${customerId}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.15
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Page Header with subtle background */}
        <motion.div 
          variants={itemVariants}
          className="rounded-xl bg-white shadow-sm border border-slate-100 mb-6 p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">
                Customers Dashboard
              </h1>
              <p className="mt-1 text-slate-500">
                Managing {totalCustomers} customers with ${totalPaid.toLocaleString()} in total payments
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:self-end">
              <button 
                onClick={() => fetchCustomers(searchQuery)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-200 transition-all"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all"
              >
                <UserPlusIcon className="w-4 h-4" />
                <span>Add Customer</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Analytics Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6"
        >
          {/* Total Customers */}
          <motion.div 
            whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)' }}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Customers</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">{totalCustomers}</p>
              </div>
              <div className="bg-slate-100 p-2.5 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-gradient-to-r from-slate-200 to-slate-300 rounded-full"></div>
          </motion.div>

          {/* Active Customers */}
          <motion.div 
            whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)' }}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Customers</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">{activeCustomers}</p>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-full"></div>
          </motion.div>

          {/* Total Pending */}
          <motion.div 
            whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)' }}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Pending</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">
                  ${totalPending.toLocaleString()}
                </p>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-lg">
                <BanknotesIcon className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-gradient-to-r from-amber-100 to-amber-200 rounded-full"></div>
          </motion.div>

          {/* Average Invoices */}
          <motion.div 
            whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)' }}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Avg. Invoices</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">
                  {averageInvoices}
                </p>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-gradient-to-r from-blue-100 to-blue-200 rounded-full"></div>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-6"
        >
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
            <div className="relative flex-grow w-full lg:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:ring-slate-300 focus:border-slate-300"
              />
            </div>
            
            {/* Desktop filters */}
            <div className="hidden md:flex gap-2 self-start lg:self-auto">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === 'all' 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === 'active' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                }`}
              >
                Active
              </button>
              <button 
                onClick={() => setActiveFilter('inactive')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === 'inactive' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100'
                }`}
              >
                Inactive
              </button>
            </div>

            {/* Mobile filter dropdown button */}
            <div className="md:hidden flex w-full">
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="flex items-center justify-between w-full px-4 py-2.5 bg-slate-100 text-slate-800 rounded-lg border border-slate-200"
              >
                <span className="flex items-center">
                  <FunnelIcon className="w-4 h-4 mr-2" />
                  Filter: {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
                </span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileFilterOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
            </div>

            {/* Mobile filter options */}
            {isMobileFilterOpen && (
              <div className="md:hidden w-full flex flex-col gap-2 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <button 
                  onClick={() => {setActiveFilter('all'); setIsMobileFilterOpen(false);}}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === 'all' 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  All Customers
                </button>
                <button 
                  onClick={() => {setActiveFilter('active'); setIsMobileFilterOpen(false);}}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === 'active' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white text-emerald-700 border border-emerald-100'
                  }`}
                >
                  Active Customers
                </button>
                <button 
                  onClick={() => {setActiveFilter('inactive'); setIsMobileFilterOpen(false);}}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === 'inactive' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-white text-amber-700 border border-amber-100'
                  }`}
                >
                  Inactive Customers
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Customers Table */}
        <motion.div 
          variants={itemVariants}
          className="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden"
        >
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="relative">
                <div className="w-12 h-12 border-3 border-slate-200 border-t-slate-600 border-b-slate-600 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-8 text-center">
              <div className="bg-red-50 p-4 rounded-lg inline-flex mx-auto">
                <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="mt-3 text-lg font-medium text-slate-900">Error: {error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoices</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredCustomers().map((customer, index) => (
                    <motion.tr 
                      key={customer.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index, duration: 0.25 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <div className="h-10 w-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-lg">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            {customer.total_invoices > 0 && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white"></div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-800">{customer.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md inline-flex items-center">
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          {customer.total_invoices}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md inline-flex items-center">
                          <BanknotesIcon className="w-3.5 h-3.5 mr-1" />
                          {customer.total_pending}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md inline-flex items-center">
                          <CurrencyDollarIcon className="w-3.5 h-3.5 mr-1" />
                          {customer.total_paid}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end items-center space-x-1.5">
                          <button 
                            onClick={() => handleViewCustomer(customer.id)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors border border-transparent hover:border-slate-200"
                            title="View Customer"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditCustomer(customer.id)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors border border-transparent hover:border-slate-200"
                            title="Edit Customer"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100"
                            disabled={isDeletingId === customer.id}
                            title="Delete Customer"
                          >
                            {isDeletingId === customer.id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <TrashIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              
              {filteredCustomers().length === 0 && (
                <div className="text-center py-16">
                  <div className="rounded-full bg-slate-100 p-5 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800">No customers found</h3>
                  <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">Try adjusting your search or filter to find what you're looking for.</p>
                  <button 
                    onClick={() => {setSearchQuery(''); setActiveFilter('all');}}
                    className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Pagination */}
          {filteredCustomers().length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCustomers().length}</span> of{' '}
                    <span className="font-medium">{filteredCustomers().length}</span> results
                  </p>
                </div>
                <div className="hidden sm:flex">
                  <nav className="relative z-0 inline-flex shadow-sm rounded-md -space-x-px" aria-label="Pagination">
                    <button disabled className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-400 cursor-not-allowed">
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-slate-100 text-sm font-medium text-slate-700">
                      1
                    </button>
                    <button disabled className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-400 cursor-not-allowed">
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
          )}
          </motion.div>
      </motion.div>

      

        {/* Add Customer Modal */}
          <AddCustomerModal 
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddCustomer}
          />
        
    </div>
  );
}