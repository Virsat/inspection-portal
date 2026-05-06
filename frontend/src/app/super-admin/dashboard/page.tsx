"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Key, Plus, RefreshCw, Smartphone, Server, Calendar, Hash, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuperAdminDashboard() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [renewingId, setRenewingId] = useState<number | null>(null);
  const [newExpiry, setNewExpiry] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    deviceName: '',
    deviceId: '',
    expirationDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLicenses = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/licenses');
      setLicenses(res.data);
    } catch (err: any) {
      // Error handled in UI if needed
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      await api.post('/licenses', formData);
      setSuccess('License generated successfully!');
      setFormData({ customerName: '', deviceName: '', deviceId: '', expirationDate: '' });
      setShowForm(false);
      fetchLicenses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate license');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRenew = async (id: number) => {
    if (!newExpiry) return;
    setIsSubmitting(true);
    setError('');
    
    try {
      await api.patch(`/licenses/${id}/renew`, { expirationDate: newExpiry });
      setSuccess('License renewed successfully!');
      setRenewingId(null);
      setNewExpiry('');
      fetchLicenses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to renew license');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setIsSubmitting(true);
    setError('');
    try {
      await api.patch(`/licenses/${id}/status`, { isActive: !currentStatus });
      setSuccess(`License ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchLicenses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">License Management</h1>
          <p className="text-slate-500 mt-1">Generate and monitor device licenses.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchLicenses}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setRenewingId(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg shadow-sm hover:bg-slate-800 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'New License'}
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3 text-green-700">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" /> Generate New License
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={e => setFormData({...formData, customerName: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Device Name</label>
              <input
                type="text"
                required
                value={formData.deviceName}
                onChange={e => setFormData({...formData, deviceName: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Navigator 500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Device ID (Hardware ID)</label>
              <input
                type="text"
                required
                value={formData.deviceId}
                onChange={e => setFormData({...formData, deviceId: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="SN-123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expiration Date</label>
              <input
                type="date"
                required
                value={formData.expirationDate}
                onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Generating...' : 'Generate License'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Device Info</th>
                <th className="px-6 py-4">License Key</th>
                <th className="px-6 py-4">Expiration</th>
                <th className="px-6 py-4 text-center">Logins</th>
                <th className="px-6 py-4 text-center">Failed</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    {isLoading ? 'Loading licenses...' : 'No licenses found.'}
                  </td>
                </tr>
              ) : (
                licenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        lic.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {lic.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{lic.customerName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">{lic.deviceName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <Hash className="w-3 h-3" />
                        <span>{lic.deviceId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                        {lic.key}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {renewingId === lic.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="date"
                            value={newExpiry}
                            onChange={(e) => setNewExpiry(e.target.value)}
                            className="px-2 py-1 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button 
                            onClick={() => handleRenew(lic.id)}
                            disabled={isSubmitting || !newExpiry}
                            className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setRenewingId(null)}
                            className="p-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className={new Date(lic.expirationDate) < new Date() ? 'text-red-600 font-medium' : 'text-slate-700'}>
                            {new Date(lic.expirationDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                        {lic.totalLogin}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {lic.totalFailedLogin > 0 ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">
                          {lic.totalFailedLogin}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            setRenewingId(lic.id);
                            setNewExpiry(new Date(lic.expirationDate).toISOString().split('T')[0]);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 font-medium text-xs transition-colors"
                        >
                          Renew
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(lic.id, lic.isActive)}
                          disabled={isSubmitting}
                          className={`font-medium text-xs transition-colors ${
                            lic.isActive 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {lic.isActive ? 'Deactivate' : 'Activate'}
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
    </div>
  );
}
