"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ClipboardList, LogOut, HardHat, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { Logo } from '@/components/Logo';

export default function InspectorLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'INSPECTOR')) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (!mounted || isLoading || !user || user.role !== 'INSPECTOR') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <Logo className="w-16 h-16 mb-4" />
          <p className="text-slate-500 font-medium">Verifying Access...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'My Inspections', href: '/inspector/dashboard', icon: ClipboardList },
    { name: 'Incidents', href: '/inspector/incidents', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <div className="w-full lg:w-64 bg-slate-900 text-white lg:min-h-screen flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Logo className="w-8 h-8" />
            </div>
            <span className="font-bold text-lg tracking-tight">Inspector</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-amber-500/10 text-amber-500" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "text-amber-500" : "text-slate-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 px-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-medium text-slate-300 truncate mt-1">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      <main className="flex-1 p-6 lg:p-10 lg:max-w-4xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
