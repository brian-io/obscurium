'use client'

import Link from 'next/link';
import NavLinks from '@/app/components/dashboard/NavLink';
import { PowerIcon, UserCircleIcon, CogIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';
import ObscuriumLogo from '../global/ObscuriumLogo';
import Image from 'next/image';
import { getUser } from '@/app/lib/data';
import { signOutAction } from '@/app/lib/actions';

export default async function SideNav() {
  const session = await auth();
  const userEmail = session?.user?.email || ''

  // Fetch additional user data based on the email
  let userData = null;
  if(userEmail){
    try{
      userData = await getUser(userEmail);

    } catch (error) {
      console.error('Error fetching user data: ', error);
    }
  }
  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200 shadow-sm">
      {/* Logo section */}
      <Link
        className="flex h-20 items-center justify-center md:h-24 bg-gradient-to-r from-blue-700 to-blue-950 relative overflow-hidden"
        href="/"
      >
        <div className="absolute inset-0 opacity-10">
          {/* Abstract pattern */}
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,100 Z" fill="white" fillOpacity="0.1" />
              <path d="M0,0 L0,100 L100,0 Z" fill="white" fillOpacity="0.1" />
            </svg>
          </div>
        </div>
        
        <div className="w-32 text-white md:w-40 relative z-10">
          <ObscuriumLogo />
        </div>
      </Link>
      
      {/* User profile section */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
        {userData?.image_url ? (
            <div className="flex-shrink-0">
              <Image 
                src={userData.image_url} 
                alt="User profile" 
                width={40} 
                height={40}
                className="rounded-full" 
              />
            </div>
          ) : (
            <div className="bg-blue-100 text-blue-600 rounded-full p-2">
              <UserCircleIcon className="w-6 h-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userData?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userEmail || 'No email available'}
            </p>
          </div>
          <Link href="/profile" className="text-gray-400 hover:text-gray-500">
            <CogIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
      
      {/* Navigation section */}
      <div className="flex grow flex-col px-3 py-2 overflow-y-auto">
        <div className="space-y-1 mb-4">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Navigation
          </p>
          <NavLinks />
        </div>
        
        {/* Quick actions section */}
        <div className="space-y-1 mb-4">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </p>
          <Link 
            href="/reports" 
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
          >
            <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Generate Reports
          </Link>
          <Link 
            href="/tracking" 
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
          >
            <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            Track Shipments
          </Link>
        </div>
        
        <div className="flex-1"></div>
        
        {/* Help section */}
        <div className="mb-2">
          <Link 
            href="/help" 
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <QuestionMarkCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
            Help & Support
          </Link>
        </div>
        
        {/* Sign out button */}
        <div className="px-3 pb-2">
          <form 
            action={signOutAction}
          >
            <button className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-100 p-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
              <PowerIcon className="w-5 h-5" />
              <div>Sign Out</div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}