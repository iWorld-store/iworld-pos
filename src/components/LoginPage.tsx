'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authService.login(password, rememberMe)) {
      router.push('/dashboard');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8 border border-gray-800">
          <h1 className="text-3xl font-bold text-center mb-2 text-white">
            iPhone POS System
          </h1>
          <p className="text-gray-400 text-center mb-8">Enter password to continue</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hidden username field for accessibility and password managers */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              value="pos-user"
              readOnly
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            />
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                placeholder="Enter password"
                autoComplete="current-password"
                autoFocus
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-accent-blue bg-gray-800 border-gray-700 rounded focus:ring-accent-blue focus:ring-2"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
                Remember me
              </label>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-accent-blue hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
