"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, History, Calendar, Filter, X, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';

export default function InspectorDashboard() {
  const [myInspections, setMyInspections] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
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
    fetchData();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/inspections/types');
      setTypes(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.inspectionTypeId) queryParams.append('inspectionTypeId', filters.inspectionTypeId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
      if (filters.toDate) queryParams.append('toDate', filters.toDate);

      const inspRes = await api.get(`/inspections/my?${queryParams.toString()}`);
      setMyInspections(inspRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      inspectionTypeId: '',
      status: '',
      fromDate: '',
      toDate: '',
    });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Field Log</h1>
          <p className="mt-2 text-slate-500 font-bold lowercase italic tracking-tight underline decoration-amber-500/30">Historical perspective of your personal field audits.</p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border shadow-2xl",
            showFilters || activeFilterCount > 0 
              ? "bg-slate-900 border-slate-900 text-white shadow-slate-200" 
              : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 shadow-slate-100"
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          Refine Search {activeFilterCount > 0 && `(${activeFilterCount})`}
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
            <div className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-2xl shadow-slate-200/40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Audit Type</label>
                <select
                  value={filters.inspectionTypeId}
                  onChange={(e) => setFilters({ ...filters, inspectionTypeId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-50 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                >
                  <option value="">All Categories</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Compliance Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-50 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 text-slate-400">Start Date</label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-50 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 text-slate-400">End Date</label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-50 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {activeFilterCount > 0 && (
                <div className="lg:col-span-4 flex justify-end pt-2">
                   <button 
                     onClick={clearFilters}
                     className="text-[10px] font-black text-rose-500 hover:text-rose-700 flex items-center gap-1.5 uppercase tracking-[0.1em]"
                   >
                     <X className="w-3.5 h-3.5" /> Purge Filter Logic
                   </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[40px] border border-slate-50 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
          <div className="flex items-center gap-4">
             <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-xl shadow-slate-200">
                <History className="w-6 h-6" />
             </div>
             <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Audit History</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5 tracking-widest">Personal Telemetry Ledger</p>
             </div>
          </div>
          <div className="px-5 py-2 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-inner">
             {myInspections.length} Entries
          </div>
        </div>
        
        <div className="divide-y divide-slate-50">
          {isLoading ? (
            <div className="py-32 text-center">
               <div className="w-12 h-12 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin mx-auto mb-6"></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Cryptographic Logs...</p>
            </div>
          ) : myInspections.length === 0 ? (
            <div className="py-32 text-center px-10">
               <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <ClipboardCheck className="w-10 h-10 text-slate-200" />
               </div>
               <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Zero Matches Detected</h3>
               <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto font-medium">No historical field audits match your current filtering criteria.</p>
               {activeFilterCount > 0 && (
                 <button onClick={clearFilters} className="mt-8 text-xs font-black text-amber-600 uppercase tracking-widest hover:underline">Reset All Filters</button>
               )}
            </div>
          ) : (
            myInspections.map((insp) => (
              <Link 
                key={insp.id} 
                href={`/inspector/inspections/${insp.id}`}
                className="group relative p-10 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Audit-REF #{insp.id}</span>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{insp.inspectionType.name}</h3>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <Calendar className="w-4 h-4 text-slate-300" />
                      {new Date(insp.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <Clock className="w-4 h-4 text-slate-300" />
                      {new Date(insp.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 lg:mt-0 flex items-center justify-between lg:justify-end gap-6">
                  <div className={clsx(
                    "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm transition-all flex items-center gap-2",
                    insp.status === 'COMPLETED' 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  )}>
                    {insp.status === 'COMPLETED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {insp.status}
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-xl group-hover:shadow-amber-200 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
