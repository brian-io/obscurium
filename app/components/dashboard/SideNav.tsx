'use client';

import { useMemo, useState, useEffect, SetStateAction } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PowerIcon,
  UserCircleIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/app/hooks/useMediaQuery'; 
import NavLink from './NavLink';

export default function SideNav({ onStateChange } : { onStateChange: (collapsed: boolean) => void}) {
  const { data: session } = useSession();
  const user = useMemo(() => session?.user, [session]);
  const [userImage, setUserImage] = useState(null);
  const pathname = usePathname();
  
  // Screen size detection
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  // State
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Auto-collapse sidebar on tablet
  useEffect(() => {
    if (isTablet && !isMobile) {
      setCollapsed(true);
    } else if (!isTablet && !isMobile) {
      setCollapsed(false);
    }
    
    // After initial detection, disable initial load state
    if (isInitialLoad) {
      setTimeout(() => {
        setIsInitialLoad(false);
      }, 50);
    }
  }, [isTablet, isMobile, isInitialLoad]);
  
  // Notify parent component of sidebar state changes
  useEffect(() => {
    if (!isInitialLoad && onStateChange) {
      onStateChange(collapsed);
    }
  }, [collapsed, isInitialLoad, onStateChange]);

  // Fetch user image
  useEffect(() => {
    async function fetchUserImage() {
      if (user?.id) {
        try {
          const res = await fetch(`/api/user/${user.id}`);
          const data = await res.json();
          if (data.image_url) setUserImage(data.image_url);
        } catch { /* ignore */ }
      }
    }
    fetchUserImage();
  }, [user?.id]);

  // Sync active item with URL
  useEffect(() => {
    const p = pathname.split('/')[2] || 'dashboard';
    setActiveItem(p);
  }, [pathname]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  
  // Handle navigation item click
  const handleNavClick = (id: SetStateAction<string>) => {
    setActiveItem(id);
  };

  // Navigation content - shared between desktop and mobile views
  const NavContent = () => (
    <>
      {/* Collapse toggle button */}
      <div className={`flex items-center ${collapsed && "justify-center"} h-12 px-2 border-b border-zinc-200`}>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50"
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? 
            <ChevronRightIcon className="w-5 h-5" /> : 
            <ChevronLeftIcon className="w-5 h-5" />
          }
        </button>
      </div>

      {/* User profile section with elegant styling */}
      <div className={`px-4 py-5 border-b border-zinc-300/80 ${collapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="relative">
            {userImage ? (
              <div className="relative rounded-full">
                <Image
                  src={userImage}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border-2 border-zinc-400 shadow-sm object-cover"
                  alt={user?.name || 'User'}
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></div>
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-500 flex items-center justify-center shadow-sm">
                <UserCircleIcon className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden transition-all duration-300">
              {user?.name ? (
                <div className="transition-opacity duration-300" style={{ opacity: collapsed ? 0 : 1 }}>
                  <p className="truncate font-medium text-zinc-800">{user.name}</p>
                  <p className="truncate text-xs text-zinc-500">{user.email}</p>
                </div>
              ) : (
                <div className="space-y-1.5 transition-opacity duration-300" style={{ opacity: collapsed ? 0 : 1 }}>
                  <div className="h-2.5 w-24 bg-zinc-200 rounded-full"></div>
                  <div className="h-2 w-16 bg-zinc-200/80 rounded-full"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation links  */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1">
        <NavLink navClickHandler={handleNavClick} collapsed={collapsed} isMobile={false} />
      </div>

      {/* Settings and sign out footer */}
      <div className={`px-4 py-4 border-t border-zinc-200/80 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button 
                onClick={toggleSettings} 
                className="p-2 rounded-lg hover:bg-zinc-200/50 transition-colors"
              >
                <CogIcon className="w-5 h-5 text-zinc-500 hover:text-zinc-700" />
              </button>
              <Link href="/help" className="p-2 rounded-lg hover:bg-zinc-200/50 transition-colors block">
                <QuestionMarkCircleIcon className="w-5 h-5 text-zinc-500 hover:text-zinc-700" />
              </Link>
            </div>
            <button 
              onClick={() => signOut()} 
              className="p-2 rounded-lg hover:bg-zinc-200/50 transition-colors"
            >
              <PowerIcon className="w-5 h-5 text-zinc-500 hover:text-red-500" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => signOut()} 
            className="p-2 rounded-lg hover:bg-zinc-200/50 transition-colors"
          >
            <PowerIcon className="w-5 h-5 text-zinc-500 hover:text-red-500" />
          </button>
        )}
      </div>

      {/* Settings dropdown  */}
      {isSettingsOpen && !collapsed && (
        <div className="px-4 py-3 bg-zinc-50/80 border-t border-zinc-100">
          <Link 
            href="/dashboard/profile" 
            className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-zinc-200/50 text-zinc-700 transition-colors"
          >
            <UserCircleIcon className="w-4 h-4 mr-3 text-zinc-500" />
            <span className="transition-opacity duration-300" style={{ opacity: collapsed ? 0 : 1 }}>Profile</span>
          </Link>
          
          <Link 
            href="/#" 
            className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-zinc-200/50 text-zinc-700 transition-colors"
          >
            <CogIcon className="w-4 h-4 mr-3 text-zinc-500" />
            <span className="transition-opacity duration-300" style={{ opacity: collapsed ? 0 : 1 }}>Security</span>
          </Link>
        </div>
      )}
    </>
  );

  // Mobile Bottom Navigation
  const MobileNavigation = () => {
    // Only get the main 3 navigation items for mobile
    const navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'HomeIcon', id: 'dashboard' },
      { name: 'Invoices', href: '/dashboard/invoices', icon: 'DocumentTextIcon', id: 'invoices' },
      { name: 'Customers', href: '/dashboard/customers', icon: 'UsersIcon', id: 'customers' },
    ];

    return (
      <div className="fixed bottom-4 h-14 left-0 right-0 z-50 flex justify-center">
        <div className="flex space-x-2 py-2 px-4 bg-slate-800/80 backdrop-blur-lg rounded-full shadow-lg border border-slate-700/50">
          {navItems.map((item) => {
            // Get the current active state
            const isActive = pathname === item.href ;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute inset-0 rounded-full animate-pulse" 
                    style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} 
                  />
                )}
                
                {/* Dynamic icon rendering based on item name */}
                {item.icon === 'HomeIcon' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2 : 1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                )}
                {item.icon === 'DocumentTextIcon' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2 : 1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                )}
                {item.icon === 'UsersIcon' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2 : 1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  // If mobile, render bottom navigation bar
  if (isMobile) {
    return (
      <>
        {/* Content area with additional bottom padding to account for nav bar */}
        <div className="pb-16">
          {/* Your page content goes here */}
        </div>
        
        {/* Mobile bottom navigation */}
        <MobileNavigation />
      </>
    );
  }

  // Desktop navigation
  return (
    <aside
      style={{ 
        width: collapsed ? '76px' : '280px',
        transition: 'width 0.3s ease-in-out'
      }}
      className="flex h-full flex-col border-r border-zinc-300/60 relative z-20 overflow-hidden"
    >
      <NavContent />
    </aside>
  );
}