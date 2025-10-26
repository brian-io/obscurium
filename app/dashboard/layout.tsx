'use client';

import { useState, useEffect } from 'react';
import SideNav from '@/app/components/dashboard/SideNav';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@/app/hooks/useMediaQuery';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Match the sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 768px)');

  // This effect handles the initial loading state
  useEffect(() => {
    // Determine initial collapsed state based on screen size
    if (isTablet && !isMobile) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
    
  }, [isTablet, isMobile]);

  // Handle sidebar state changes
  const handleSidebarStateChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex h-screen flex-col bg-charcoal-600 md:flex-row md:overflow-hidden">
      <div className={`flex-none ${isMobile ? 'w-0' : ''}`}>
        <SideNav onStateChange={handleSidebarStateChange} />
      </div>
      
      <div 
        className="flex-grow md:overflow-y-auto px-6"
      >
        {children}
      </div>
    </div>
  );
}