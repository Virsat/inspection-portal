"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  ShieldCheck,
  Mail,
  Key,
  Trash2,
  AlertCircle,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import clsx from 'clsx';

export default function ManageManagers() {
  const [managers, setManagers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Registration Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Delete Confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resp = await api.get('/users/managers');
      setManagers(resp.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post('/users/manager', {
        email,
        password,
        name
      });

      setIsModalOpen(false);
      resetCreateForm();
      fetchData();
    } catch (e) {
      alert("Failed to create manager");
    } finally {
      setIsCreating(false);
    }
  };

  const resetCreateForm = () => {
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/users/manager/${id}`);
      setDeleteConfirmId(null);
      fetchData();
    } catch (e) {
      alert("Failed to delete manager");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Administrators</h1>
          <p className="mt-2 text-slate-500 font-medium leading-relaxed lowercase">Platform governance and manager access control.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4" />
          Add Manager
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">Manager Profile</th>
                <th className="px-8 py-6">Security Status</th>
                <th className="px-8 py-6 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={3} className="p-20 text-center">
                  <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating Registry...</p>
                </td></tr>
              ) : managers.length === 0 ? (
                <tr><td colSpan={3} className="p-20 text-center font-bold text-slate-400 uppercase text-xs tracking-widest">No additional managers registered.</td></tr>
              ) : (
                managers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-lg bg-indigo-600 shadow-indigo-100">
                          {m.name ? m.name.substring(0, 2).toUpperCase() : m.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-sm uppercase tracking-tight">{m.name || 'Admin'}</div>
                          <div className="text-[10px] font-medium text-slate-400 lowercase">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {m.mustChangePassword ? (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 w-fit">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Pending Password Reset</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 w-fit">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Security Verified</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => setDeleteConfirmId(m.id)}
                        className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 ml-auto flex"
                        title="Revoke Permission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setDeleteConfirmId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-100">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Revoke Access</h3>
              <p className="mt-3 text-slate-500 text-sm font-medium leading-relaxed">This will permanently delete the administrative profile. The user will lose all portal access immediately.</p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="py-4 font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all text-[10px] uppercase tracking-widest border border-slate-100">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirmId)} className="py-4 font-black text-white bg-rose-600 rounded-2xl shadow-2xl shadow-rose-100 text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all">Revoke</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Registration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight"><ShieldCheck className="text-indigo-600" /> New Manager</h2>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg uppercase tracking-widest">SysAdmin</span>
              </div>

              <form onSubmit={handleCreateManager} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Display Name</label>
                    <div className="relative">
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm" placeholder="Manager Name" />
                      <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email ID</label>
                    <div className="relative">
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm" placeholder="admin@company.com" />
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">One-Time Password</label>
                    <div className="relative">
                      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm" placeholder="••••••••" />
                      <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                    <p className="text-[9px] font-bold text-amber-600 mt-2 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> User will be forced to change this at first login
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all text-[10px] uppercase tracking-widest">Cancel</button>
                  <button type="submit" disabled={isCreating} className="flex-[2] py-4 font-black text-white bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-100 disabled:opacity-50 text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all">{isCreating ? 'Provisioning...' : 'Provision Account'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
