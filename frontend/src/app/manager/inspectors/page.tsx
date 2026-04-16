"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  ShieldCheck,
  Mail,
  Key,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Briefcase,
  QrCode,
  Power,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

export default function ManageInspectors() {
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Registration Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [unit, setUnit] = useState('');
  const [permitExpiry, setPermitExpiry] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [canReportIncidents, setCanReportIncidents] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInspector, setEditingInspector] = useState<any>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editPermitExpiry, setEditPermitExpiry] = useState('');
  const [editQrCode, setEditQrCode] = useState('');
  const [editSelectedTypes, setEditSelectedTypes] = useState<number[]>([]);
  const [editCanReportIncidents, setEditCanReportIncidents] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inspRes, typesRes] = await Promise.all([
        api.get('/users/inspectors'),
        api.get('/inspections/types')
      ]);
      setInspectors(inspRes.data);
      setTypes(typesRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleType = (id: number, isEdit: boolean = false) => {
    if (isEdit) {
      setEditSelectedTypes(prev =>
        prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
      );
    } else {
      setSelectedTypes(prev =>
        prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
      );
    }
  };

  const handleCreateInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data: newUser } = await api.post('/users/inspector', {
        email,
        password,
        name,
        designation,
        unit,
        permitExpiry: permitExpiry || undefined,
        qrCode,
        canReportIncidents
      });

      if (selectedTypes.length > 0) {
        await api.post('/users/permissions/sync', { inspectorId: newUser.id, typeIds: selectedTypes });
      }

      setIsModalOpen(false);
      resetCreateForm();
      fetchData();
    } catch (e) {
      alert("Failed to create inspector");
    } finally {
      setIsCreating(false);
    }
  };

  const resetCreateForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setDesignation('');
    setUnit('');
    setPermitExpiry('');
    setQrCode('');
    setSelectedTypes([]);
    setCanReportIncidents(true);
  };

  const openEditModal = (inspector: any) => {
    setEditingInspector(inspector);
    setEditEmail(inspector.email);
    setEditPassword('');
    setEditName(inspector.name || '');
    setEditDesignation(inspector.designation || '');
    setEditUnit(inspector.unit || '');
    setEditPermitExpiry(inspector.permitExpiry ? new Date(inspector.permitExpiry).toISOString().split('T')[0] : '');
    setEditQrCode(inspector.qrCode || '');
    setEditSelectedTypes(inspector.permissions.map((p: any) => p.inspectionTypeId));
    setEditCanReportIncidents(inspector.canReportIncidents !== false);
    setIsEditModalOpen(true);
  };

  const handleUpdateInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.patch(`/users/inspector/${editingInspector.id}`, {
        email: editEmail,
        password: editPassword || undefined,
        name: editName,
        designation: editDesignation,
        unit: editUnit,
        permitExpiry: editPermitExpiry || null,
        qrCode: editQrCode,
        canReportIncidents: editCanReportIncidents
      });

      await api.post('/users/permissions/sync', {
        inspectorId: editingInspector.id,
        typeIds: editSelectedTypes
      });

      setIsEditModalOpen(false);
      fetchData();
    } catch (e) {
      alert("Failed to update inspector");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleStatus = async (inspector: any) => {
    try {
      await api.patch(`/users/inspector/${inspector.id}/status`, { isActive: !inspector.isActive });
      fetchData();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/users/inspector/${id}`);
      setDeleteConfirmId(null);
      fetchData();
    } catch (e) {
      alert("Failed to delete inspector");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Inspectors</h1>
          <p className="mt-2 text-slate-500 font-medium leading-relaxed lowercase">Deployment logistics and credential management for inspectors.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4" />
          Add Inspector
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">Inspector Profile</th>
                <th className="px-8 py-6">Operational Unit</th>
                <th className="px-8 py-6">Field Authority</th>
                <th className="px-8 py-6 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={4} className="p-20 text-center">
                  <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auditing Credentials...</p>
                </td></tr>
              ) : inspectors.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center font-bold text-slate-400 uppercase text-xs tracking-widest">No operators registered.</td></tr>
              ) : (
                inspectors.map((inspector) => (
                  <tr key={inspector.id} className={clsx("hover:bg-slate-50/50 transition-colors group", !inspector.isActive && "opacity-60")}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={clsx(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-lg",
                            inspector.isActive ? "bg-slate-900 shadow-slate-200" : "bg-slate-400 shadow-none"
                          )}>
                            {inspector.name ? inspector.name.substring(0, 2).toUpperCase() : inspector.email.charAt(0).toUpperCase()}
                          </div>
                          <div className={clsx(
                            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                            inspector.isActive ? "bg-emerald-500" : "bg-slate-300"
                          )} title={inspector.isActive ? "Active" : "Inactive"} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-black text-slate-900 text-sm uppercase tracking-tight">{inspector.name || 'Anonymous Operating'}</div>
                            {!inspector.isActive && (
                              <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md uppercase tracking-widest">Inactive</span>
                            )}
                          </div>
                          <div className="text-[10px] font-medium text-slate-400 lowercase">{inspector.email}</div>
                          {inspector.designation && (
                            <div className="mt-1 flex items-center gap-1.5 text-[9px] font-black text-indigo-600 uppercase tracking-tighter">
                              <Briefcase className="w-3 h-3" /> {inspector.designation}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" /> {inspector.unit || 'Global Sector'}
                        </div>
                        {inspector.permitExpiry && (
                          <div className={clsx(
                            "flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-md w-max",
                            new Date(inspector.permitExpiry) < new Date() ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                            <Calendar className="w-3 h-3" />
                            Exp: {new Date(inspector.permitExpiry).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {inspector.permissions?.length > 0 ? (
                          inspector.permissions.slice(0, 3).map((p: any) => (
                            <span key={p.inspectionTypeId} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-black bg-slate-50 border border-slate-100 text-slate-600 uppercase tracking-tighter">
                              <ShieldCheck className="w-3 h-3 text-indigo-500" />
                              {p.inspectionType.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic opacity-50">Stationary Observer</span>
                        )}
                        {inspector.permissions?.length > 3 && (
                          <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">+{inspector.permissions.length - 3}</span>
                        )}
                      </div>
                      {inspector.canReportIncidents && (
                        <div className="mt-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Incident Reporting Enabled
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(inspector)}
                          className={clsx(
                            "p-3 rounded-2xl transition-all border",
                            inspector.isActive
                              ? "text-slate-300 hover:text-rose-500 hover:bg-rose-50 border-transparent hover:border-rose-100"
                              : "text-emerald-500 bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                          )}
                          title={inspector.isActive ? "Deactivate Account" : "Activate Account"}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditModal(inspector)}
                          className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-xl hover:shadow-indigo-100 rounded-2xl transition-all border border-transparent hover:border-slate-100"
                          title="Edit Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(inspector.id)}
                          className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Purge</h3>
              <p className="mt-3 text-slate-500 text-sm font-medium leading-relaxed">This will permanently revoke all field access and delete the operator identity. This action is irreversible.</p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="py-4 font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all text-[10px] uppercase tracking-widest border border-slate-100">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirmId)} className="py-4 font-black text-white bg-rose-600 rounded-2xl shadow-2xl shadow-rose-100 text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all">Delete</button>
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight"><UserPlus className="text-indigo-600" /> New Operator</h2>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg uppercase tracking-widest">Account Creation</span>
              </div>

              <form onSubmit={handleCreateInspector} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Identity Name</label>
                    <div className="relative">
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm" placeholder="John Doe" />
                      <UserPlus className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Job Designation</label>
                    <div className="relative">
                      <input type="text" required value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm" placeholder="Field Engineer" />
                      <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Operational Unit</label>
                    <div className="relative">
                      <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm" placeholder="Sector 7" />
                      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Permit Expiry</label>
                    <div className="relative">
                      <input type="date" value={permitExpiry} onChange={(e) => setPermitExpiry(e.target.value)} className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm" />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Access</label>
                    <div className="relative">
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm" placeholder="name@company.com" />
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Security Key</label>
                    <div className="relative">
                      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm" placeholder="••••••••" />
                      <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">QR Scan Identifier (HID/Wearable)</label>
                    <div className="relative">
                      <input type="text" value={qrCode} onChange={(e) => setQrCode(e.target.value)} className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm" placeholder="RW-SCAN-XXXX" />
                      <QrCode className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-50">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Operational Authority</label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {types.map(t => (
                        <label key={t.id} className={clsx("flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all cursor-pointer group", selectedTypes.includes(t.id) ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-300" : "bg-white border-slate-100 hover:border-indigo-200 text-slate-600 shadow-sm")}>
                          <input type="checkbox" className="sr-only" checked={selectedTypes.includes(t.id)} onChange={() => toggleType(t.id)} />
                          {selectedTypes.includes(t.id) ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-indigo-300 transition-colors" />}
                          <span className="text-xs font-black uppercase tracking-tight">{t.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Compliance Authority</label>
                    <label className={clsx("flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all cursor-pointer group", canReportIncidents ? "bg-emerald-500 border-emerald-500 text-white shadow-2xl shadow-emerald-200" : "bg-white border-slate-100 hover:border-indigo-200 text-slate-600 shadow-sm")}>
                      <input type="checkbox" className="sr-only" checked={canReportIncidents} onChange={() => setCanReportIncidents(!canReportIncidents)} />
                      {canReportIncidents ? <ShieldCheck className="w-5 h-5 text-white" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                      <span className="text-xs font-black uppercase tracking-tight">Incident Reporting Authority</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all text-[10px] uppercase tracking-widest">Cancel</button>
                  <button type="submit" disabled={isCreating} className="flex-[2] py-5 font-black text-white bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-100 disabled:opacity-50 text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all">{isCreating ? 'Synchronizing...' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Update Profile</h2>
                  <p className="text-[10px] uppercase font-black text-indigo-600 mt-1">Modifying Identifier: {editingInspector.id}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateInspector} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Identity Name</label>
                    <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Job Designation</label>
                    <input type="text" required value={editDesignation} onChange={(e) => setEditDesignation(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Operational Unit</label>
                    <input type="text" value={editUnit} onChange={(e) => setEditUnit(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Permit Expiry</label>
                    <input type="date" value={editPermitExpiry} onChange={(e) => setEditPermitExpiry(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Access</label>
                    <input type="email" required value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">New Security Key (Optional)</label>
                    <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" placeholder="••••••••" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">QR Scan Identifier</label>
                    <input type="text" value={editQrCode} onChange={(e) => setEditQrCode(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" />
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-50">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Manage Authority</label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {types.map(t => (
                        <label key={t.id} className={clsx("flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all cursor-pointer group", editSelectedTypes.includes(t.id) ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" : "bg-white border-slate-100 hover:border-indigo-200 text-slate-600 shadow-sm")}>
                          <input type="checkbox" className="sr-only" checked={editSelectedTypes.includes(t.id)} onChange={() => toggleType(t.id, true)} />
                          {editSelectedTypes.includes(t.id) ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                          <span className="text-xs font-black uppercase tracking-tight">{t.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Compliance Authority</label>
                    <label className={clsx("flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all cursor-pointer group", editCanReportIncidents ? "bg-emerald-500 border-emerald-500 text-white shadow-2xl shadow-emerald-200" : "bg-white border-slate-100 hover:border-indigo-200 text-slate-600 shadow-sm")}>
                      <input type="checkbox" className="sr-only" checked={editCanReportIncidents} onChange={() => setEditCanReportIncidents(!editCanReportIncidents)} />
                      {editCanReportIncidents ? <ShieldCheck className="w-5 h-5 text-white" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                      <span className="text-xs font-black uppercase tracking-tight">Incident Reporting Authority</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all text-[10px] uppercase tracking-widest">Cancel</button>
                  <button type="submit" disabled={isUpdating} className="flex-[2] py-5 font-black text-white bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-100 disabled:opacity-50 text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all">{isUpdating ? 'Storing Changes...' : 'Save'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
