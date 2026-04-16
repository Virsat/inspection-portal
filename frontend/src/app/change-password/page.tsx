"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { ShieldAlert, Key, Loader2, CheckCircle2, LogOut } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function ChangePassword() {
  const { user, login, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/change-password', { password });
      setIsSuccess(true);
      
      // Update local user state
      if (user) {
        const updatedUser = { ...user, mustChangePassword: false };
        // We re-login basically to refresh the localstorage and state
        const token = localStorage.getItem('token') || '';
        login(token, updatedUser);
      }
    } catch (err: any) {
      setError('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden"
      >
        <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white p-3 rounded-2xl mb-6 shadow-xl">
              <Logo className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Security Protocol</h1>
            <p className="text-slate-400 mt-2 text-xs font-bold uppercase tracking-widest">Mandatory Password Update</p>
          </div>
        </div>

        <div className="p-10">
          {isSuccess ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase">Verification Complete</h3>
                <p className="text-slate-500 text-sm font-medium mt-2">Your credentials have been hardened successfully.</p>
              </div>
              <button
                onClick={() => window.location.href = user.role === 'MANAGER' ? '/manager/dashboard' : '/inspector/dashboard'}
                className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                Enter Portal
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                  For your protection, you must establish a new secure password before accessing the system.
                </p>
              </div>

              {error && (
                <div className="p-4 text-xs font-black text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl uppercase tracking-widest">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">New Secure Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-300 font-bold text-sm"
                      placeholder="••••••••"
                    />
                    <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-300 font-bold text-sm"
                      placeholder="••••••••"
                    />
                    <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Update & Verify <CheckCircle2 className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={logout}
                  className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest py-2 hover:text-rose-500 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
