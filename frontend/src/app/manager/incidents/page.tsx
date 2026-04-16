"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, User, AlertTriangle, ArrowRight, X, MessageSquare, MapPin } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function ManagerIncidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    inspectorId: '',
    status: '',
    type: '',
    fromDate: '',
    toDate: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/users/inspectors');
      setInspectors(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.inspectorId) queryParams.append('inspectorId', filters.inspectorId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
      if (filters.toDate) queryParams.append('toDate', filters.toDate);

      const { data } = await api.get(`/incidents?${queryParams.toString()}`);
      setIncidents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/incidents/${id}/status`, { status });
      fetchIncidents(); // Refresh
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const clearFilters = () => {
    setFilters({
      inspectorId: '',
      status: '',
      type: '',
      fromDate: '',
      toDate: '',
    });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <AlertTriangle className="text-rose-600" /> Incidents
          </h1>
          <p className="mt-2 text-slate-500 font-medium tracking-tight">Reported safety concerns and equipment failures.</p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border",
            showFilters || activeFilterCount > 0 
              ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm shadow-indigo-100" 
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
          )}
        >
          <Filter className="w-4 h-4" />
          Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
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
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Reported By
                </label>
                <select
                  value={filters.inspectorId}
                  onChange={(e) => setFilters({ ...filters, inspectorId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">All Inspectors</option>
                  {inspectors.map(i => <option key={i.id} value={i.id}>{i.email}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" /> Incident Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">All Types</option>
                  <option value="NEAR_MISS">Near Miss</option>
                  <option value="INJURY">Injury</option>
                  <option value="ENVIRONMENTAL_SPILL">Environmental Spill</option>
                  <option value="EQUIPMENT_DAMAGE">Equipment Damage</option>
                  <option value="SAFETY_VIOLATION">Safety Violation</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Filter className="w-3 h-3" /> Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> From
                </label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> To
                </label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              {activeFilterCount > 0 && (
                <div className="lg:col-span-5 flex justify-end">
                   <button 
                     onClick={clearFilters}
                     className="text-[10px] font-black text-rose-500 hover:text-rose-700 flex items-center gap-1 uppercase tracking-widest"
                   >
                     <X className="w-3 h-3" /> Reset Filters
                   </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="bg-white p-20 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 font-bold">
             Refreshing list...
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-white p-20 rounded-2xl border border-slate-100 text-center">
             <AlertTriangle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-500 font-medium">No incidents match your current filter criteria.</p>
          </div>
        ) : (
          incidents.map((incident) => (
            <motion.div 
              layout
              key={incident.id} 
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-6 items-start lg:items-center"
            >
              <div className="w-full lg:w-max flex flex-col items-center">
                 <div className={clsx(
                   "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                   incident.status === 'RESOLVED' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                 )}>
                   <AlertTriangle className="w-6 h-6" />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 mt-2 uppercase">#{incident.id}</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
                    ['NEAR_MISS', 'INJURY', 'SAFETY_VIOLATION'].includes(incident.type) ? "bg-red-50 text-red-700 border-red-100" :
                    incident.type === 'EQUIPMENT_DAMAGE' ? "bg-orange-50 text-orange-700 border-orange-100" :
                    incident.type === 'ENVIRONMENTAL_SPILL' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                    "bg-blue-50 text-blue-700 border-blue-100"
                  )}>
                    {incident.type?.replace(/_/g, ' ')}
                  </span>
                  <Link href={`/manager/incidents/${incident.id}`} className="hover:underline decoration-slate-300 underline-offset-4">
                    <h3 className="text-lg font-bold text-slate-900 leading-none">{incident.title}</h3>
                  </Link>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{incident.description}</p>
                <div className="flex flex-wrap gap-4 pt-1">
                   <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                      <User className="w-3.5 h-3.5" /> {incident.inspector.email}
                   </div>
                   {incident.location && (
                     <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                        <MapPin className="w-3.5 h-3.5" /> {incident.location}
                     </div>
                   )}
                   <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(incident.createdAt).toLocaleDateString()}
                   </div>
                </div>
              </div>

              <div className="w-full lg:w-max flex flex-col md:flex-row lg:flex-col gap-3 shrink-0">
                <div className="flex items-center gap-2 mb-2 lg:mb-0">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-xs font-bold ring-1",
                    incident.status === 'OPEN' ? "bg-rose-100 text-rose-700 ring-rose-200" :
                    incident.status === 'IN_PROGRESS' ? "bg-amber-100 text-amber-700 ring-amber-200" :
                    "bg-emerald-100 text-emerald-700 ring-emerald-200"
                  )}>
                    {incident.status.replace('_', ' ')}
                  </span>
                </div>
                
                <select
                  value={incident.status}
                  onChange={(e) => updateStatus(incident.id, e.target.value)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="OPEN">Mark as Open</option>
                  <option value="IN_PROGRESS">Investigating</option>
                  <option value="RESOLVED">Resolve Issue</option>
                </select>
              </div>

              {incident.imageUrls?.length > 0 && (
                <div className="flex -space-x-3 overflow-hidden shrink-0 mt-4 lg:mt-0">
                  {incident.imageUrls.map((url: string, idx: number) => (
                    <img 
                      key={idx} 
                      src={url} 
                      className="inline-block h-12 w-12 rounded-xl ring-4 ring-white object-cover border border-slate-100 shadow-sm"
                      alt={`Evidence ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
