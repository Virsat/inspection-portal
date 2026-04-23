"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  User,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  HardHat,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function InspectorInspectionDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/inspections/${id}/results`);
        setData(res.data.inspection);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing audit data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <ClipboardCheck className="w-16 h-16 text-slate-100 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-900 uppercase">Access Restricted</h2>
        <p className="mt-2 text-slate-500 font-medium">You do not have permission to view this report or it does not exist.</p>
        <button onClick={() => router.back()} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isCompleted = data.status === 'COMPLETED';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Link href="/inspector/dashboard" className="hover:text-amber-500 transition-colors">History</Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span>Audit #{data.id}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 uppercase tracking-tight">{data.inspectionType.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          {data.sections.map((section: any, sIdx: number) => (
            <div key={section.id} className="bg-white rounded-3xl border border-slate-50 shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  <span className="text-amber-500 mr-2 opacity-50">0{sIdx + 1}.</span> {section.name}
                </h2>
              </div>

              <div className="divide-y divide-slate-50">
                {section.questions.map((q: any) => (
                  <div key={q.id} className="p-8 space-y-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <p className="font-bold text-slate-900 text-base leading-tight md:max-w-2xl">{q.text}</p>
                      <div className="shrink-0 flex items-center md:items-start">
                        {!q.answer ? (
                          <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg uppercase border border-slate-100 italic">No entry</span>
                        ) : q.answer.answer?.toLowerCase().includes('skip') ? (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase border border-emerald-100 flex items-center gap-1.5 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Skip
                          </span>
                        ) : q.answer.answer?.toLowerCase() === 'not applicable' || q.answer.answer?.toLowerCase() === 'n/a' ? (
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg uppercase border border-slate-200 flex items-center gap-1.5 whitespace-nowrap">
                            <AlertTriangle className="w-3.5 h-3.5" /> N/A
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase border border-emerald-100 flex items-center gap-1.5 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                          </span>
                        )}
                      </div>
                    </div>

                    {q.answer ? (
                      <div className={clsx(
                        "p-6 rounded-2xl border shadow-inner",
                        q.answer.answer?.toLowerCase().includes('skip') ? "bg-emerald-50/20 border-emerald-100" : "bg-slate-50/50 border-slate-100"
                      )}>
                        <div className="space-y-1">
                          <p className={clsx(
                            "text-sm font-medium leading-relaxed whitespace-pre-wrap",
                            q.answer.answer?.toLowerCase().includes('skip') ? "text-emerald-900" : "text-slate-700"
                          )}>{q.answer.answer}</p>
                          <p className="text-[10px] font-bold text-slate-400 italic">
                            Recorded on {new Date(q.answer.timestamp).toLocaleDateString()} at {new Date(q.answer.timestamp).toLocaleTimeString()}
                          </p>
                        </div>

                        {q.answer.imageUrl && (
                          <div className="mt-6">
                            <div className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-1.5 tracking-widest pl-1">
                              <ImageIcon className="w-4 h-4 text-amber-500" /> Evidentiary Image
                            </div>
                            {['no image', 'not applicable', 'n/a', 'none'].includes(q.answer.imageUrl?.toLowerCase().trim()) ? (
                              <div className="relative group max-w-md h-64 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner">
                                <div className="flex flex-col items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                    <ImageIcon className="w-5 h-5 text-slate-300" />
                                  </div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Not Required</p>
                                </div>
                                <div className="absolute top-0 right-0 p-4">
                                   <span className="px-2 py-0.5 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-md text-[7px] font-black text-slate-400 uppercase tracking-tighter shadow-sm">N/A</span>
                                </div>
                              </div>
                            ) : (
                              <div className="relative group max-w-md">
                                <img
                                  src={q.answer.imageUrl}
                                  alt="Documentation"
                                  className="rounded-2xl border border-slate-200 w-full h-64 object-cover shadow-sm transition-transform duration-500 group-hover:scale-[1.01]"
                                />
                                <a
                                  href={q.answer.imageUrl}
                                  target="_blank"
                                  className="absolute top-4 right-4 p-3 bg-slate-900/80 backdrop-blur-md text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-white/20"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/20">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Incomplete field entry</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[36px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] space-y-8 xl:sticky xl:top-6 border border-slate-800 w-full overflow-x-visible">
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Execution Identity</h3>
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800 text-amber-500 rounded-2xl shadow-inner">
                    <HardHat className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Field Operator</p>
                    <p className="text-sm font-bold text-white lowercase mt-1 truncate">{data.inspector.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "p-3 rounded-2xl shadow-inner",
                    isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                  )}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Validation Status</p>
                    <p className={clsx("text-sm font-bold mt-1 tracking-tight", isCompleted ? "text-emerald-400" : "text-amber-400 uppercase")}>{data.status}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800 text-slate-400 rounded-2xl shadow-inner">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Conducted On</p>
                    <p className="text-sm font-bold text-slate-300">{new Date(data.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                    <p className="text-[11px] font-bold text-slate-500">{new Date(data.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="w-full py-5 bg-white text-slate-900 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl shadow-slate-950 active:scale-95 duration-200"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
