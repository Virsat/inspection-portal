"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ShieldCheck, HardHat, Loader2, DatabaseZap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      // To get the user details nicely without an extra endpoint, we could decode the JWT
      // but for simulation, we'll extract the payload encoded inside the token
      const token = response.data.access_token;
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      login(token, {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        mustChangePassword: payload.mustChangePassword
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid credentials');
      } else {
        setError('Connection error. Is your nest server running?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const attemptSeed = async () => {
    setSeedStatus('Seeding database...');
    try {
      await api.post('/seed');
      setSeedStatus('Success! You can now log in using manager@example.com / password123');
    } catch (e: any) {
      if (e.response?.status === 409) {
        setSeedStatus('Database is already seeded.');
      } else {
        setSeedStatus('Failed to seed database. Check nested server.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="bg-indigo-600 p-8 text-center text-white relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white opacity-10" />
          
          <div className="relative z-10">
            <div className="bg-white p-3 rounded-xl inline-block mb-4 shadow-sm">
              <Logo className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Inspection Portal</h1>
            <p className="text-indigo-100 mt-2 text-sm">Secure sign in for Managers and Inspectors</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="manager@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-medium hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log in to account'}
          </button>
        </form>

        <div className="px-8 pb-8 text-center text-xs text-slate-400 font-medium">
          Authorised Personnel Only. All access attempts are logged.
        </div>
      </motion.div>
    </div>
  );
}
