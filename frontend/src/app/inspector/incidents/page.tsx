"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, AlertTriangle, X, MessageSquare, MapPin, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function InspectorIncidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    fromDate: '',
    toDate: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, [filters]);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
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

  const clearFilters = () => {
    setFilters({
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
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3 uppercase">
            <AlertTriangle className="text-rose-600" /> My Reports
          </h1>
          <p className="mt-2 text-slate-500 font-medium tracking-tight lowercase italic">Track the status of incidents you have submitted from the field.</p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border shadow-xl shadow-slate-100",
            showFilters || activeFilterCount > 0 
              ? "bg-slate-900 border-slate-900 text-white" 
              : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
          )}
        >
          <Filter className="w-3.5 h-3.5" />
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
            <div className="bg-white p-8 rounded-3xl border border-slate-50 shadow-xl shadow-slate-100/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                  <MessageSquare className="w-3 h-3 text-amber-500" /> Incident Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-50 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
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

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                  <Filter className="w-3 h-3 text-amber-500" /> Current Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-50 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                  <Calendar className="w-3 h-3 text-amber-500" /> From
                </label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-50 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                  <Calendar className="w-3 h-3 text-amber-500" /> To
                </label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-50 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>

              {activeFilterCount > 0 && (
                <div className="lg:col-span-4 flex justify-end">
                   <button 
                     onClick={clearFilters}
                     className="text-[10px] font-black text-rose-500 hover:text-rose-700 flex items-center gap-1.5 uppercase tracking-widest"
                   >
                     <X className="w-3.5 h-3.5" /> Reset Personal Filters
                   </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="bg-white p-20 rounded-3xl border border-slate-50 flex items-center justify-center text-slate-400 font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-100">
             <div className="w-5 h-5 border-2 border-slate-100 border-t-amber-500 rounded-full animate-spin mr-3"></div>
             Auditing your reports...
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border border-slate-50 text-center shadow-xl shadow-slate-100">
             <AlertTriangle className="w-16 h-16 text-slate-100 mx-auto mb-6" />
             <p className="text-slate-500 font-bold uppercase tracking-tight">Access Log: 0 Results</p>
             <p className="text-sm text-slate-400 mt-2">No incidents match your current filtering logic.</p>
          </div>
        ) : (
          incidents.map((incident) => (
            <motion.div 
              layout
              key={incident.id} 
              className="bg-white p-8 rounded-3xl border border-slate-50 shadow-xl shadow-slate-200/40 hover:shadow-indigo-100/30 transition-all group overflow-hidden"
            >
              <Link href={`/inspector/incidents/${incident.id}`} className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                <div className="w-full lg:w-max flex flex-col items-center">
                  <div className={clsx(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                    incident.status === 'RESOLVED' ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-rose-500 text-white shadow-rose-100"
                  )}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-tighter italic">Log #{incident.id}</span>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={clsx(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                      ['NEAR_MISS', 'INJURY', 'SAFETY_VIOLATION'].includes(incident.type) ? "bg-red-50 text-red-700 border-red-100" :
                      incident.type === 'EQUIPMENT_DAMAGE' ? "bg-orange-50 text-orange-700 border-orange-100" :
                      incident.type === 'ENVIRONMENTAL_SPILL' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      "bg-blue-50 text-blue-700 border-blue-100"
                    )}>
                      {incident.type?.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 leading-none tracking-tight group-hover:text-amber-500 transition-colors uppercase">{incident.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">{incident.description}</p>
                  <div className="flex flex-col gap-1 pt-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" /> {new Date(incident.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1">
                        <Clock className="w-3.5 h-3.5 text-slate-300" /> {new Date(incident.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-max flex items-center justify-between lg:block shrink-0">
                  <div className={clsx(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                    incident.status === 'OPEN' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                    incident.status === 'IN_PROGRESS' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                    "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  )}>
                    {incident.status.replace('_', ' ')}
                  </div>
                  <div className="lg:mt-4 p-2 bg-slate-50 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                     <ChevronRight className="w-5 h-5" />
                  </div>
                </div>

                {incident.imageUrls?.length > 0 && (
                  <div className="flex -space-x-3 overflow-hidden shrink-0 mt-4 lg:mt-0">
                    {incident.imageUrls.map((url: string, idx: number) => (
                      <img 
                        key={idx} 
                        src={url} 
                        className="inline-block h-12 w-12 rounded-xl ring-4 ring-white object-cover border border-slate-100 shadow-xl"
                        alt={`Evidence ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
