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
  AlertCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function InspectionDetails() {
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
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Auditing session telemetry...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 px-8 bg-white rounded-3xl border border-slate-100 shadow-xl">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-slate-900 uppercase">Inspection Not Found</h2>
        <p className="mt-2 text-slate-500 font-medium">The requested audit log is invalid or has been purged from core storage.</p>
        <Link href="/manager/inspections" className="mt-8 inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-100">
          <ArrowLeft className="w-4 h-4" /> Back to Logs
        </Link>
      </div>
    );
  }

  const isCompleted = data.status === 'COMPLETED';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-600 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Link href="/manager/inspections" className="hover:text-indigo-600 transition-colors">Digital Vault</Link>
              <ChevronRight className="w-3 h-3" />
              <span>Report Artifact #{data.id}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mt-1 uppercase tracking-tight">{data.inspectionType.name}</h1>
          </div>
        </div>

        {!isCompleted && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl border border-amber-100">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Ongoing Audit</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-3 space-y-10">
          {data.sections.map((section: any, sIdx: number) => {
            const hasFailure = section.questions.some((q: any) => q.answer?.answer?.toLowerCase() === 'no');

            return (
              <div
                key={section.id}
                className={clsx(
                  "bg-white rounded-[32px] border shadow-2xl transition-all duration-500",
                  hasFailure ? "border-rose-200 shadow-rose-100/50" : "border-slate-100 shadow-slate-200/50"
                )}
              >
                <div className={clsx(
                  "px-10 py-8 border-b flex items-center justify-between",
                  hasFailure ? "bg-rose-50/50 border-rose-100" : "bg-slate-50/30 border-slate-100"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner",
                      hasFailure ? "bg-rose-600 text-white" : "bg-indigo-600 text-white"
                    )}>
                      0{sIdx + 1}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{section.name}</h2>
                      {hasFailure && (
                        <div className="flex items-center gap-1.5 text-rose-600 text-[10px] font-black uppercase mt-1 tracking-widest">
                          <AlertTriangle className="w-3.5 h-3.5" /> Safety Deficiency Detected
                        </div>
                      )}
                    </div>
                  </div>
                  {hasFailure && (
                    <span className="bg-rose-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg shadow-rose-200">Critical Priority</span>
                  )}
                </div>

                <div className="divide-y divide-slate-50">
                  {section.questions.map((q: any) => {
                    const isFailing = q.answer?.answer?.toLowerCase() === 'no';
                    const isSkip = q.answer?.answer?.toLowerCase().includes('skip');
                    const isNA = q.answer?.answer?.toLowerCase() === 'not applicable';

                    return (
                      <div key={q.id} className={clsx("p-10 space-y-6 transition-colors", isFailing && "bg-rose-50/20")}>
                        <div className="flex items-start justify-between gap-8">
                          <p className="font-extrabold text-slate-800 text-lg leading-tight max-w-xl">{q.text}</p>
                          {!q.answer ? (
                            <span className="text-[10px] font-black text-slate-300 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-widest">Unresponsive</span>
                          ) : isFailing ? (
                            <span className="text-[10px] font-black text-rose-600 bg-rose-100 border border-rose-200 px-4 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" /> Fail
                            </span>
                          ) : isNA ? (
                            <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" /> N/A
                            </span>
                          ) : isSkip ? (
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 border border-emerald-200 px-4 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" /> Skip
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 border border-emerald-200 px-4 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" /> Compliance
                            </span>
                          )}
                        </div>

                        {q.answer ? (
                          <div className={clsx(
                            "p-6 rounded-3xl border transition-all",
                            isFailing ? "bg-white border-rose-200 shadow-xl shadow-rose-100" : "bg-slate-50 border-slate-100 shadow-inner"
                          )}>
                            <div className="flex items-start gap-4">
                              <div className={clsx(
                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                                isFailing ? "bg-rose-50 text-rose-600" : isNA ? "bg-slate-200 text-slate-500" : "bg-emerald-50 text-emerald-600"
                              )}>
                                {isNA ? <AlertCircle className="w-5 h-5" /> : isSkip ? <CheckCircle className="w-5 h-5" /> : <ClipboardCheck className="w-5 h-5" />}
                              </div>
                              <div className="space-y-1 pt-2">
                                <p className={clsx(
                                  "text-sm font-bold leading-relaxed",
                                  isFailing ? "text-rose-900" : isSkip ? "text-emerald-900" : "text-slate-700"
                                )}>{q.answer.answer}</p>
                                <p className="text-[10px] font-medium text-slate-400 italic">
                                  Recorded on {new Date(q.answer.timestamp).toLocaleDateString()} at {new Date(q.answer.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>

                            {q.answer.imageUrl && (
                              <div className="mt-8 pt-8 border-t border-slate-100">
                                <div className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-widest">
                                  <ImageIcon className="w-4 h-4" /> Image Evidence
                                </div>
                                {['no image', 'not applicable', 'n/a', 'none'].includes(q.answer.imageUrl?.toLowerCase().trim()) ? (
                                  <div className="relative group max-w-md aspect-video rounded-[24px] border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner">
                                    <div className="flex flex-col items-center gap-3">
                                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                        <ImageIcon className="w-6 h-6 text-slate-300" />
                                      </div>
                                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Verification Not Required</p>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4">
                                       <span className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-tighter shadow-sm">N/A</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative group max-w-md aspect-video">
                                    <img
                                      src={q.answer.imageUrl}
                                      alt="Field Evidence"
                                      className="rounded-[24px] border border-slate-200 w-full h-full object-cover shadow-2xl group-hover:scale-[1.02] transition-transform duration-500"
                                    />
                                    <a
                                      href={q.answer.imageUrl}
                                      target="_blank"
                                      className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-white rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]"
                                    >
                                      <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-2xl border border-white/30 backdrop-blur-md">
                                        <ExternalLink className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Expand Evidence</span>
                                      </div>
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Insufficient Data for Verification</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8 sticky top-12">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Audit Context</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Field Operator</p>
                    <p className="text-sm font-black text-slate-900 lowercase">{data.inspector.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                    isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Audit Status</p>
                    <p className={clsx("text-sm font-black uppercase tracking-tight", isCompleted ? "text-emerald-700" : "text-amber-700")}>{data.status}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Starting Date</p>
                    <p className="text-sm font-black text-slate-900">{new Date(data.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p className="text-[11px] font-bold text-slate-400">{new Date(data.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex flex-col gap-3">
              <button
                onClick={() => window.print()}
                className="w-full py-5 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95"
              >
                Generate PDF Report
              </button>
              <p className="text-[9px] text-slate-400 text-center font-bold px-4">Authorized managerial access only. High-fidelity audit logs are encrypted for safety compliance.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
