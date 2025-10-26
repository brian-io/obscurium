import { lusitana } from "@/app/lib/fonts";
import RevenueChart from "@/app/components/dashboard/RevenueChart";
import LatestInvoices from "@/app/components/dashboard/LatestInvoice";
import CardWrapper from "@/app/components/dashboard/DashboardCard";
import { Suspense } from "react";
import Breadcrumbs from "@/app/components/global/Breadcrumbs";
import { 
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
  CardSkeleton
} from "@/app/components/global/Skeletons";
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Dashboard | Obscurium',
};

export default async function Page() {
  // Define breadcrumbs for navigation
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard', active: true },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col h-16 sm:flex-row items-start sm:items-center justify-between mb-4 border-b border-slate-300">
        <h1 className={`text-2xl md:text-3xl font-semibold text-slate-800`}>
          Dashboard
        </h1>
        <div className="hidden md:block px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <Breadcrumbs
          breadcrumbs={breadcrumbs}
      />
      {/* Metric Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </div>
  );
}