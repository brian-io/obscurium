import { lusitana } from '@/app/lib/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './Button';
import { authenticate } from '@/app/lib/actions';
import ObscuriumLogo from './ObscuriumLogo';

export default function LoginForm() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden md:flex md:h-[500px] w-full max-w-5xl">
      {/* Left side - Company branding */}
      <div className="bg-blue-900 md:w-1/2 flex flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-800 opacity-20">
          {/* Background pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="absolute"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              >
                <TruckIcon className="w-24 h-24 text-white" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6">
            <ObscuriumLogo className="h-12 w-auto text-white" />
          </div>
          <h1 className={`${lusitana.className} text-3xl font-bold mb-6 text-center`}>
            Global Logistics Solutions
          </h1>
          <p className="text-blue-100 text-center mb-8 max-w-sm">
            Connecting the world through efficient and reliable logistics. Log in to access your dashboard.
          </p>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Systems operational worldwide</span>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="md:w-1/2 p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h2 className={`${lusitana.className} text-2xl font-semibold text-gray-900 mb-2`}>
            Welcome back
          </h2>
          <p className="text-gray-600 mb-8">
            Please log in to your account to continue.
          </p>
          
          <form action={authenticate}>
            <div className="mb-4">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            {/* Error message */}
            <div className="mb-4 rounded-md bg-red-50 p-4 hidden">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Invalid credentials
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            </div>
            
            <LoginButton />
          </form>
        </div>
      </div>
    </div>
  );
}

function LoginButton() {
  return (
    <Button className="w-full flex justify-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
      <span>Log in</span>
      <ArrowRightIcon className="ml-2 h-5 w-5" />
    </Button>
  );
}