'use client'

import * as React from 'react';
import Link from 'next/link';
import { useState } from 'react';
import ObscuriumLogo from '@/app/components/global/ObscuriumLogo';

const pages = ['Product', 'About', 'Contact Us'];
const authPages = [
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' }
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 w-full bg-blue-50 border-b border-white/20 transition-all duration-300 hover:bg-opacity-2 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <ObscuriumLogo />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="flex space-x-4">
              {pages.map((page) => (
                <Link 
                  key={page} 
                  href={`#${page.toLowerCase()}`}
                  className="px-3 py-2 text-gray-800  hover:text-gray-600  text-base font-medium"
                >
                  {page}
                </Link>
              ))}
            </div>
            <div className="ml-6 flex items-center space-x-4">
              {authPages.map((page) => (
                <Link 
                  key={page.name} 
                  href={page.path}
                  className={`px-4 py-2 rounded-md text-base font-medium ${
                    page.name === 'Signup'
                      ? 'bg-blue-800 text-white hover:bg-blue-950'
                      : 'border border-gray-300 text-gray-800  hover:bg-gray-100 dark:hover:bg-gray-100'
                  }`}
                >
                  {page.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800  hover:text-gray-600 "
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute w-full z-50" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-50 dark:bg-blue-900 shadow-lg">
            {pages.map((page) => (
              <Link
                key={page}
                href={`#${page.toLowerCase()}`}
                className="block px-3 py-2 text-base font-medium text-gray-800  hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                {page}
              </Link>
            ))}
            {authPages.map((page) => (
              <Link
                key={page.name}
                href={page.path}
                className="block px-3 py-2 text-base font-medium text-blue-950  hover:bg-blue-100 dark:hover:bg-gray-800 rounded-md"
              >
                {page.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}