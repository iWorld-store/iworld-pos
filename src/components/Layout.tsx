'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService } from '@/lib/auth-supabase';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (!authenticated && pathname !== '/') {
        router.push('/');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/') {
    return null;
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/inventory/add', label: 'Add Inventory' },
    { path: '/inventory/view', label: 'View Inventory' },
    { path: '/sell', label: 'Sell Phone' },
    { path: '/returns', label: 'Returns' },
    { path: '/reports', label: 'Reports' },
    { path: '/backup', label: 'Backup' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Brand Header */}
      <div className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold text-center text-white">iWorld Store</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-1 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === item.path
                    ? 'bg-gray-800 text-accent-blue border-b-2 border-accent-blue'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

