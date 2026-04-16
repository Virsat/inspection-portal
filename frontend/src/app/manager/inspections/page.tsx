"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, User, ClipboardList, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function ManagerInspections() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    inspectorId: '',
    inspectionTypeId: '',
    status: '',
    fromDate: '',
    toDate: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [typesRes, inspRes] = await Promise.all([
        api.get('/inspections/types'),
        api.get('/users/inspectors')
      ]);
      setTypes(typesRes.data);
      setInspectors(inspRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInspections = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.inspectorId) queryParams.append('inspectorId', filters.inspectorId);
      if (filters.inspectionTypeId) queryParams.append('inspectionTypeId', filters.inspectionTypeId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
      if (filters.toDate) queryParams.append('toDate', filters.toDate);

      const { data } = await api.get(`/inspections?${queryParams.toString()}`);
      setInspections(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      inspectorId: '',
      inspectionTypeId: '',
      status: '',
      fromDate: '',
      toDate: '',
    });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inspections</h1>
          <p className="mt-2 text-slate-500 font-medium">Review and monitor all inspection activity.</p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all border",
            showFilters || activeFilterCount > 0 
              ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
        >
          <Filter className="w-4 h-4" />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Inspector
                </label>
                <select
                  value={filters.inspectorId}
                  onChange={(e) => setFilters({ ...filters, inspectorId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">All Inspectors</option>
                  {inspectors.map(i => <option key={i.id} value={i.id}>{i.email}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <ClipboardList className="w-3 h-3" /> Type
                </label>
                <select
                  value={filters.inspectionTypeId}
                  onChange={(e) => setFilters({ ...filters, inspectionTypeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">All Types</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Filter className="w-3 h-3" /> Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> From
                </label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> To
                </label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {activeFilterCount > 0 && (
                <div className="md:col-span-3 lg:col-span-5 flex justify-end">
                   <button 
                     onClick={clearFilters}
                     className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1"
                   >
                     <X className="w-3 h-3" /> Clear All Filters
                   </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm font-semibold tracking-wide">
                <th className="px-6 py-4">Inspection Type</th>
                <th className="px-6 py-4">Inspector</th>
                <th className="px-6 py-4">Date Created</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Updating list...</td></tr>
              ) : inspections.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500">No inspections match your current filters.</td></tr>
              ) : (
                inspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{insp.inspectionType.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ID: {insp.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{insp.inspector.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{new Date(insp.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{new Date(insp.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        insp.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {insp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/manager/inspections/${insp.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
