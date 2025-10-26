'use client';

import {
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import ReportIcon from '../icons/ReportIcon';
import TrackingIcon from '../icons/TrackingIcon';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, id: 'dashboard' },
  { name: 'Invoices', href: '/dashboard/invoices', icon: DocumentTextIcon, id: 'invoices' },
  { name: 'Customers', href: '/dashboard/customers', icon: UsersIcon, id: 'customers' },
];
  
// Quick action items
const quickActions = [
  { name: 'Generate Reports', href: '/#', icon: ReportIcon, id: 'reports' },
  { name: 'Track Shipments', href: '/#', icon: TrackingIcon, id: 'tracking' },
];

export default function NavLinks({navClickHandler, collapsed, isMobile} : {navClickHandler: (id: string)=> void, collapsed: boolean, isMobile: boolean}) {
  const pathname = usePathname();
  
  // If we're on mobile, we don't render this component as mobile navigation is handled separately
  if (isMobile) {
    return null;
  }
  
  return (
    <>
      {navItems.map((item) => (
        <div key={item.id} className="group relative">
          <Link
            href={item.href}
            onClick={() => navClickHandler(item.id)}
            className={clsx(
              "flex items-center px-3 py-2.5 rounded-xl transition-all duration-300",
              "hover:bg-zinc-200/40 hover:text-zinc-800",
              {
                'bg-slate-800 text-white shadow-sm': pathname === item.href || 
                  (pathname === '/dashboard' && item.id === 'dashboard') ||
                  (pathname.includes(item.id) && item.id !== 'dashboard'),
              }
            )}
            style={{
              // Add explicit transition properties for colors
              transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease'
            }}
          >
            <item.icon 
              className={clsx(
                "w-5 h-5 transition-all duration-300",
                (pathname === item.href || 
                  (pathname === '/dashboard' && item.id === 'dashboard') ||
                  (pathname.includes(item.id) && item.id !== 'dashboard')) 
                  ? 'stroke-[2] text-white' : 'stroke-[1.5] text-zinc-600',
                collapsed ? 'mx-auto' : 'mr-3'
              )}
              style={{
                // Add explicit transition for stroke color
                transition: 'color 0.3s ease, stroke-width 0.3s ease, margin 0.3s ease'
              }}
            />
            {!collapsed && (
              <span 
                className={clsx(
                  "text-sm transition-all duration-300 ease-in-out overflow-hidden",
                  (pathname === item.href || 
                    (pathname === '/dashboard' && item.id === 'dashboard') ||
                    (pathname.includes(item.id) && item.id !== 'dashboard')) 
                    ? 'font-medium' : '',
                  collapsed ? 'opacity-0 w-0' : 'opacity-100'
                )}
                style={{
                  // Add explicit transition for text color
                  transition: 'opacity 0.3s ease, color 0.3s ease, font-weight 0.3s ease, width 0.3s ease'
                }}
              >
                {item.name}
              </span>
            )}
            {collapsed && (
              <div 
                className="absolute left-full ml-3 p-2 overflow-hidden bg-zinc-800 text-white text-sm rounded-md shadow-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{
                  transition: 'opacity 0.2s ease-in-out'
                }}
              >
                {item.name}
              </div>
            )}
          </Link>
        </div>
      ))}
      
      {/* Quick Actions Section */}
      <div className="mt-6 pt-6 border-t border-zinc-200/80 overflow-hidden">
        {!collapsed && (
          <h3 className="px-3 mb-3 text-xs font-medium text-zinc-400 uppercase tracking-wider overflow-hidden">
            Quick Actions
          </h3>
        )}
        
        {/* Quick Action Links */}
        {quickActions.map((action) => (
          <div key={action.id} className="group relative">
            <Link
              href={action.href}
              onClick={() => navClickHandler(action.id)}
              className={clsx(
                "flex items-center px-3 py-2.5 rounded-xl transition-all duration-300",
                "hover:bg-zinc-200/40 hover:text-zinc-800",
                {
                  'bg-slate-800 text-white shadow-sm': pathname === action.href,
                }
              )}
              style={{
                // Add explicit transition properties for colors
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              <action.icon 
                className={clsx(
                  "w-5 h-5 transition-all duration-300",
                  pathname === action.href ? 'stroke-[2] text-white' : 'stroke-[1.5] text-zinc-600',
                  collapsed ? 'mx-auto' : 'mr-3'
                )}
                style={{
                  // Add explicit transition for stroke color
                  transition: 'color 0.3s ease, stroke-width 0.3s ease, margin 0.3s ease'
                }}
              />
              {!collapsed && (
                <span 
                  className={clsx(
                    "text-sm transition-all duration-300 ease-in-out overflow-hidden",
                    pathname === action.href ? 'font-medium' : '',
                    collapsed ? 'opacity-0 w-0' : 'opacity-100'
                  )}
                  style={{
                    // Add explicit transition for text color
                    transition: 'opacity 0.3s ease, color 0.3s ease, font-weight 0.3s ease, width 0.3s ease'
                  }}
                >
                  {action.name}
                </span>
              )}
              {collapsed && (
                <div 
                  className="absolute left-full ml-3 p-2 overflow-hidden bg-zinc-800 text-white text-sm rounded-md shadow-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none"
                  style={{
                    transition: 'opacity 0.2s ease-in-out'
                  }}
                >
                  {action.name}
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}