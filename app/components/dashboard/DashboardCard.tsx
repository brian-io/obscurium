'use client';

import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

// Define types
type CardType = 'collected' | 'pending' | 'invoices' | 'customers';

type CardData = {
  numberOfInvoices: number;
  numberOfCustomers: number;
  totalPaidInvoices: number;
  totalPendingInvoices: number;
};

type CardConfig = {
  title: string;
  value: (data: CardData) => number;
  type: CardType;
  format: (value: number) => string;
};

type CardStyle = {
  iconBg: string;
  iconColor: string;
  valueBg: string;
  textColor: string;
};

// Status type to handle different states
type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

// Hook for fetching dashboard data
function useDashboardData() {
  const [data, setData] = useState<CardData | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setStatus('loading');
      try {
        const res = await fetch('/api/dashboard');
        
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        
        const jsonRes = await res.json();
        setData(jsonRes.cardData);
        setStatus('success');
        setError(null);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setStatus('error');
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    }

    fetchData();
  }, []);

  return { data, status, error };
}

// Format utility functions
const formatters = {
  currency: (value: number) => {
    // return new Intl.NumberFormat('en-US', {
    //   style: 'currency',
    //   currency: 'USD',
    //   minimumFractionDigits: 2,
    //   maximumFractionDigits: 2,
    // }).format(value);
    return value.toString();
  },
  number: (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
};

// Constant configurations
const CARD_STYLES: Record<CardType, CardStyle> = {
  collected: {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    valueBg: 'from-emerald-50 to-teal-50',
    textColor: 'text-emerald-800'
  },
  pending: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    valueBg: 'from-amber-50 to-yellow-50',
    textColor: 'text-amber-800'
  },
  invoices: {
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    valueBg: 'from-indigo-50 to-blue-50',
    textColor: 'text-indigo-800'
  },
  customers: {
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    valueBg: 'from-violet-50 to-purple-50',
    textColor: 'text-violet-800'
  }
};

const ICON_MAP: Record<CardType, React.ElementType> = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

const CARD_CONFIGS: CardConfig[] = [
  {
    title: 'Collected',
    value: (data) => data.totalPaidInvoices,
    type: 'collected',
    format: formatters.currency
  },
  {
    title: 'Pending',
    value: (data) => data.totalPendingInvoices,
    type: 'pending',
    format: formatters.currency
  },
  {
    title: 'Total Invoices',
    value: (data) => data.numberOfInvoices,
    type: 'invoices',
    format: formatters.number
  },
  {
    title: 'Total Customers',
    value: (data) => data.numberOfCustomers,
    type: 'customers',
    format: formatters.number
  }
];

// Card component
function Card({ title, formattedValue, type }: { title: string; formattedValue: string; type: CardType }) {
  const Icon = ICON_MAP[type];
  const style = CARD_STYLES[type];
  
  return (
    <div className="rounded-xl bg-white p-2 shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
      <div className="flex items-center justify-between p-4">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        <div className={`${style.iconBg} p-2 rounded-lg`}>
          <Icon className={`h-5 w-5 ${style.iconColor}`} />
        </div>
      </div>
      <div
        className={`truncate rounded-xl bg-gradient-to-r ${style.valueBg} px-4 py-8 text-center text-2xl font-semibold ${style.textColor}`}
      >
        {formattedValue}
      </div>
    </div>
  );
}

// Skeleton loader component
function CardSkeleton({ type }: { type: CardType }) {
  return (
    <div className="rounded-xl bg-white p-2 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between p-4">
        <div className="h-4 w-20 bg-slate-100 animate-pulse rounded"></div>
        <div className="h-9 w-9 bg-slate-100 animate-pulse rounded-lg"></div>
      </div>
      <div className="h-20 rounded-xl bg-slate-50 animate-pulse"></div>
    </div>
  );
}

// Error card component
function ErrorCard({ message, type }: { message: string; type: CardType }) {
  const style = CARD_STYLES[type];
  
  return (
    <div className="rounded-xl bg-white p-2 shadow-sm border border-red-100">
      <div className="flex items-center justify-between p-4">
        <h3 className="text-sm font-medium text-slate-600">Error</h3>
        <div className="bg-red-50 p-2 rounded-lg">
          <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
        </div>
      </div>
      <div className="truncate rounded-xl bg-gradient-to-r from-red-50 to-rose-50 px-4 py-8 text-center text-sm font-medium text-red-800">
        {message || 'Failed to load data'}
      </div>
    </div>
  );
}

// Main component
export default function CardWrapper() {
  const { data, status, error } = useDashboardData();

  if (status === 'loading') {
    return (
      <>
        {CARD_CONFIGS.map((config) => (
          <CardSkeleton key={config.type} type={config.type} />
        ))}
      </>
    );
  }

  if (status === 'error') {
    return (
      <>
        {CARD_CONFIGS.map((config) => (
          <ErrorCard 
            key={config.type} 
            type={config.type} 
            message={error || 'Failed to load data'} 
          />
        ))}
      </>
    );
  }

  if (!data) {
    return (
      <>
        {CARD_CONFIGS.map((config) => (
          <ErrorCard 
            key={config.type} 
            type={config.type} 
            message="No data available" 
          />
        ))}
      </>
    );
  }

  return (
    <>
      {CARD_CONFIGS.map((config) => (
        <Card
          key={config.type}
          title={config.title}
          formattedValue={config.format(config.value(data))}
          type={config.type}
        />
      ))}
    </>
  );
}