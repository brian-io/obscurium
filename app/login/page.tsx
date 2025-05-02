import AcmeLogo from '@/app/components/global/AcmeLogo';
import LoginForm from '@/app/components/global/LoginForm';
import { Metadata } from 'next';
import { TruckIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Login | Global Logistics Solutions',
};

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-blue-100/30" />
        
        {/* Decorative truck icons */}
        <div className="absolute top-10 left-10 text-gray-200 opacity-20">
          <TruckIcon className="h-24 w-24 transform -rotate-12" />
        </div>
        <div className="absolute bottom-10 right-10 text-gray-200 opacity-20">
          <TruckIcon className="h-32 w-32 transform rotate-12" />
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-500/10" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-blue-500/10" />
      </div>
      
      <div className="relative z-10 p-8 sm:mx-auto sm:w-full sm:max-w-5xl">
        <LoginForm />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Global Logistics Solutions. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="text-gray-500 hover:text-gray-700">Terms</a>
            <a href="#" className="text-gray-500 hover:text-gray-700">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-gray-700">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}