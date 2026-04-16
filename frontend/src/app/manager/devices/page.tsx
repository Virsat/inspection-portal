"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Laptop,
  Plus,
  Trash2,
  Smartphone,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';

export default function ManageDevices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Device Form
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await api.get('/devices');
      setDevices(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/devices', { id: deviceId, name: deviceName });
      setIsModalOpen(false);
      setDeviceId('');
      setDeviceName('');
      fetchDevices();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to register device");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to de-authorize this device? Field scanners will stop working immediately.")) return;
    try {
      await api.delete(`/devices/${id}`);
      fetchDevices();
    } catch (e) {
      alert("Failed to delete device");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Registered Devices</h1>
          <p className="mt-2 text-slate-500 font-medium">List of Registered Devices.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Register Device
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 animate-pulse h-48" />
          ))
        ) : devices.length === 0 ? (
          <div className="md:col-span-3 py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Smartphone className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No hardware registered</p>
          </div>
        ) : (
          devices.map((device) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 group relative overflow-hidden"
            >
              <div className="absolute bottom-12 right-0 p-8 opacity-5 pointer-events-none">
                <Laptop className="w-24 h-24" />
              </div>

              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <button
                  onClick={() => handleDelete(device.id)}
                  className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">{device.name}</h3>
              <p className="mt-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded w-max">ID: {device.id}</p>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Registered On</span>
                <span className="text-[9px] font-black text-slate-900">{new Date(device.createdAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Register Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                <AlertCircle className="text-indigo-600" /> Identity Enrollment
              </h2>
              <p className="mt-2 text-slate-500 text-sm font-medium">Link new field hardware to the security mesh.</p>

              <form onSubmit={handleRegister} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Hardware ID (UUID/Serial)</label>
                  <input
                    required
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    placeholder="HS-500-XXX"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Friendly Name</label>
                  <input
                    required
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="Abu Dhabi Site"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all text-[10px] uppercase tracking-widest border border-slate-100">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 font-black text-white bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all">Register</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
