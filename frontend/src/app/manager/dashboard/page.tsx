"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { ClipboardCheck, FileWarning, Clock, Users, ArrowRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ManagerDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, inspectors: 0, incidents: 0 });
  const [analytics, setAnalytics] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [inspRes, incRes, analyticsRes] = await Promise.all([
          api.get('/inspections'),
          api.get('/incidents/stats'),
          api.get('/inspections/analytics')
        ]);

        const completed = inspRes.data.filter((d: any) => d.status === 'COMPLETED').length;
        setStats({
          total: inspRes.data.length,
          pending: inspRes.data.length - completed,
          completed,
          inspectors: incRes.data.inspectorsCount,
          incidents: incRes.data.total
        });
        setRecent(inspRes.data.slice(0, 5));
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = [
    { name: 'Total Inspections', value: stats.total, icon: ClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Completed Audits', value: stats.completed, icon: FileWarning, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Active Inspectors', value: stats.inspectors, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Open Incidents', value: stats.incidents, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Executive Dashboard</h1>
          <p className="mt-2 text-slate-500 font-medium">Real-time organizational performance and field authorization status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between"
            >
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3">{stat.name}</p>
                <p className="text-4xl font-black text-slate-900">{isLoading ? '-' : stat.value}</p>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg}`}>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Monthly Trends */}
        {/* 
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Inspection Velocity (6 Months)</h3>
          <div className="h-[300px]">
            {isLoading || !analytics ? (
              <div className="h-full flex items-center justify-center text-slate-300">Calculating trends...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyTrends}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div> */}



        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">
            Inspection Frequency
          </h3>

          <div className="h-[300px]">
            {isLoading || !analytics ? (
              <div className="h-full flex items-center justify-center text-slate-300">
                Calculating trends...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                  <XAxis
                    dataKey="type"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: '1rem',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                    }}
                  />

                  <Bar
                    dataKey="count"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Per Inspector */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Inspections per Inspector</h3>
          <div className="h-[300px]">
            {isLoading || !analytics ? (
              <div className="h-full flex items-center justify-center text-slate-300">Auditing personnel...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.inspectorStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis dataKey="inspector" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={80} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Per Unit */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Operational Unit Distribution</h3>
          <div className="h-[300px]">
            {isLoading || !analytics ? (
              <div className="h-full flex items-center justify-center text-slate-300">Mapping logistics...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.unitStats}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="unit"
                  >
                    {analytics.unitStats.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity</h3>
            <Link href="/manager/inspections" className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">
              View Log
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {isLoading ? (
              <div className="p-8 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest italic animate-pulse">Syncing...</div>
            ) : recent.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium">No system activity detected.</div>
            ) : (
              recent.map((inspection) => (
                <Link
                  key={inspection.id}
                  href={`/manager/inspections/${inspection.id}`}
                  className="p-8 flex items-center justify-between hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-3 h-3 rounded-full shadow-lg ${inspection.status === 'COMPLETED' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-amber-500 shadow-amber-100'}`} />
                    <div>
                      <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">{inspection.inspectionType.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">ID #{inspection.id} • {inspection.inspector.email}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
