'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { AtSymbolIcon, KeyIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const registered = searchParams.get('registered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    setLoading(false);

    if (result?.error) {
      setErrorMsg('Invalid email or password');
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-12">
      <div className="max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-xl">O</span>
          </div>
        </div>
        
        {/* Heading */}
        <h1 className="text-2xl font-semibold text-slate-800 text-center mb-2">Welcome back</h1>
        <p className="text-slate-500 text-center mb-8">Sign in to your account</p>

        {/* Success message */}
        {registered === 'true' && (
          <div className="mb-6 px-4 py-3 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-green-700">Account created successfully!</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{errorMsg}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSymbolIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-800"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm text-slate-600 hover:text-slate-800">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-slate-600">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition duration-150 ease-in-out"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-slate-800 hover:underline">
            Sign up
          </Link>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-500 text-center">
            &copy; {new Date().getFullYear()} Obscurium. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}