'use client';

import { useEffect, useState } from 'react';
import { generateYAxis } from '@/app/lib/utils';
import { CalendarIcon, CurrencyDollarIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface Revenue {
  month: string;
  revenue: number;
}

export default function RevenueChart() {
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const res = await fetch('/api/revenue');
        if (!res.ok) throw new Error('Failed to fetch revenue');
        const data = await res.json();
        setRevenue(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  const chartHeight = 350;
  const { yAxisLabels, topLabel } = generateYAxis(revenue);

  // Calculate trend percentage (comparing last two months)
  const calculateTrend = () => {
    if (revenue.length < 2) return { percentage: 0, positive: true };
    
    const lastMonth = revenue[revenue.length - 1].revenue;
    const previousMonth = revenue[revenue.length - 2].revenue;
    const difference = lastMonth - previousMonth;
    
    if (previousMonth === 0) return { percentage: 100, positive: true };
    
    const percentage = Math.round((difference / previousMonth) * 100);
    return { percentage, positive: percentage >= 0 };
  };

  const trend = calculateTrend();

  if (error) {
    return (
      <div className="w-full md:col-span-4">
        <h2 className={`mb-4 text-xl md:text-2xl font-semibold text-slate-700`}>
          Recent Revenue
        </h2>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:col-span-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl md:text-2xl font-semibold text-slate-700`}>
          Recent Revenue
        </h2>
        {!loading && revenue.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className={`flex items-center px-2 py-1 rounded-full ${trend.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {trend.positive ? (
                <ArrowUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 mr-1" />
              )}
              <span className="text-xs font-medium">{Math.abs(trend.percentage)}%</span>
            </div>
            <span className="text-xs text-slate-500">vs last month</span>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-6 flex flex-col items-center justify-center h-80">
            <div className="w-full h-64 bg-slate-100 animate-pulse rounded-lg"></div>
          </div>
        ) : !revenue || revenue.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center h-80">
            <CurrencyDollarIcon className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">No revenue data available.</p>
          </div>
        ) : (
          <>
            <div className="p-6">
              <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 md:gap-4">
                <div
                  className="mb-6 hidden flex-col justify-between text-xs text-slate-500 sm:flex"
                  style={{ height: `${chartHeight}px` }}
                >
                  {yAxisLabels.map((label) => (
                    <p key={label}>{label}</p>
                  ))}
                </div>

                {revenue.map((month) => {
                  const height = `${(chartHeight / topLabel) * month.revenue}px`;
                  
                  // Determine gradient based on comparison to previous month
                  const index = revenue.indexOf(month);
                  const isGrowing = index > 0 && month.revenue > revenue[index - 1].revenue;
                  const isLatest = index === revenue.length - 1;
                  
                  const barColorClass = isLatest 
                    ? 'bg-gradient-to-t from-teal-600 to-teal-400' 
                    : isGrowing 
                      ? 'bg-gradient-to-t from-emerald-500 to-emerald-300' 
                      : 'bg-gradient-to-t from-slate-400 to-slate-300';
                  
                  return (
                    <div key={month.month} className="flex flex-col items-center gap-2">
                      <div className="relative w-full group">
                        <div
                          className={`w-full rounded-t-md ${barColorClass}`}
                          style={{ height }}
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0
                            }).format(month.revenue)}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-slate-600">
                        {month.month}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center px-6 py-4 bg-slate-50">
              <CalendarIcon className="h-4 w-4 text-slate-500" />
              <h3 className="ml-2 text-xs text-slate-500">Last 12 months</h3>
            </div>
          </>
        )}
      </div>
    </div>
  );
}