'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { authService } from '@/lib/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/');
      return;
    }
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

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
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
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
              className="ml-auto px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800"
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

