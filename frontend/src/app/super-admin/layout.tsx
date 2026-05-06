"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut, ShieldAlert } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      console.log('[SuperAdminLayout] Checking access:', { userEmail: user?.email, userRole: user?.role });
      if (!user) {
        console.log('[SuperAdminLayout] No user found, redirecting to login');
        router.push('/login');
      } else if (user.role !== 'SUPER_ADMIN') {
        console.log('[SuperAdminLayout] Unauthorized role:', user.role, 'redirecting...');
        router.push(user.role === 'MANAGER' ? '/manager/dashboard' : '/inspector/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'SUPER_ADMIN') {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Authenticating...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1.5 rounded-lg">
              <Logo className="w-6 h-6" />
            </div>
            <span className="font-semibold text-white tracking-tight flex items-center gap-2">
              Super Admin Portal <ShieldAlert className="w-4 h-4 text-rose-500" />
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-400">
              {user.email}
            </div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
