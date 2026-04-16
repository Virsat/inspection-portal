"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Calendar, User, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function InspectorIncidentDetails() {
  const params = useParams();
  const router = useRouter();

  const [incident, setIncident] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIncident();
  }, [params.id]);

  const fetchIncident = async () => {
    try {
      const { data } = await api.get(`/incidents/${params.id}`);
      setIncident(data);
    } catch (e) {
      console.error(e);
      alert('Failed to load incident details');
      router.push('/inspector/incidents');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post(`/incidents/${params.id}/comments`, { content: commentText });
      setCommentText('');
      fetchIncident(); // Refresh to get new comments
    } catch (e) {
      console.error(e);
      alert('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400 font-black tracking-widest text-xs uppercase shadow-xl shadow-slate-100 rounded-3xl bg-white border border-slate-50">
        <div className="w-5 h-5 border-2 border-slate-100 border-t-amber-500 rounded-full animate-spin mr-3"></div>
        Loading Log Details...
      </div>
    );
  }

  if (!incident) return null;

  const severityData = incident.severity ? (typeof incident.severity === 'string' ? JSON.parse(incident.severity) : incident.severity) : null;
  const analysisData = incident.analysis ? (typeof incident.analysis === 'string' ? JSON.parse(incident.analysis) : incident.analysis) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6 pb-20">

      {/* Header Navigation */}
      <div className="flex items-center gap-4 pb-4">
        <Link href="/inspector/incidents" className="p-3 hover:bg-slate-200 bg-slate-100 rounded-2xl transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
            Log #{incident.id}
          </h1>
          <p className="text-sm font-bold text-slate-400">Detailed Report Viewer</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-50 shadow-xl shadow-slate-200/40 relative overflow-hidden">

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <span className={clsx(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                ['NEAR_MISS', 'INJURY', 'SAFETY_VIOLATION'].includes(incident.type) ? "bg-red-500 text-white shadow-red-100" :
                  incident.type === 'EQUIPMENT_DAMAGE' ? "bg-orange-500 text-white shadow-orange-100" :
                    incident.type === 'ENVIRONMENTAL_SPILL' ? "bg-emerald-500 text-white shadow-emerald-100" :
                      "bg-blue-500 text-white shadow-blue-100"
              )}>
                {incident.type?.replace(/_/g, ' ')}
              </span>

              <span className={clsx(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-dashed",
                incident.status === 'OPEN' ? "text-rose-600 border-rose-200 bg-rose-50" :
                  incident.status === 'IN_PROGRESS' ? "text-amber-600 border-amber-200 bg-amber-50" :
                    "text-emerald-600 border-emerald-200 bg-emerald-50"
              )}>
                {incident.status.replace('_', ' ')}
              </span>
            </div>

            <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4 uppercase relative z-10">{incident.title}</h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium mb-8 relative z-10">
              {incident.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-900 rounded-2xl relative z-10">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Reported By</p>
                <p className="text-sm font-black text-white flex items-center gap-1.5"><User className="w-4 h-4 text-amber-500" /> {(incident.inspector.name) || incident.inspector.email.split('@')[0]}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Date</p>
                <p className="text-sm font-black text-white flex items-center gap-1.5"><Calendar className="w-4 h-4 text-amber-500" /> {new Date(incident.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Time</p>
                <p className="text-sm font-black text-white flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {incident.location && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Location</p>
                  <p className="text-sm font-black text-white flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-500" /> {incident.location}</p>
                </div>
              )}
            </div>

            {/* Background decoration */}
            <AlertTriangle className="absolute -bottom-10 -right-10 w-64 h-64 text-slate-50 opacity-50 -rotate-12 pointer-events-none" />
          </div>

          {/* Structured Data rendering if present */}
          {(severityData || analysisData) && (
            <div className="bg-white p-8 rounded-3xl border border-slate-50 shadow-xl shadow-slate-200/40">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6 flex items-center gap-3"><AlertTriangle className="w-6 h-6 text-amber-500" /> Technical Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {severityData && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-2">Severity Metrics</h4>
                    {Object.entries(severityData).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-500">{k.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-black text-slate-900">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {analysisData && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-2">Root Cause Analysis</h4>
                    {Object.entries(analysisData).map(([k, v]) => (
                      <div key={k} className="bg-slate-50 p-4 rounded-2xl border-l-4 border-l-amber-500 shadow-sm border border-slate-100">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block mb-1">{k.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-bold text-slate-700">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="bg-white rounded-3xl border border-slate-50 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-8 border-b-4 border-slate-50">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3"><MessageSquare className="w-6 h-6 text-indigo-500" /> Comments</h3>
            </div>

            <div className="p-8 space-y-6">
              {(incident.comments || []).length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No comments yet. Add comments below.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {incident.comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-500 font-black text-lg flex items-center justify-center shrink-0 uppercase shadow-lg">
                        {((comment.user?.name) || comment.user?.email || 'U')[0]}
                      </div>
                      <div className="flex-1 bg-slate-50 p-5 rounded-3xl rounded-tl-sm border border-slate-100">
                        <div className="flex justify-between items-baseline mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-slate-900 uppercase">{(comment.user?.name) || comment.user?.email.split('@')[0]}</span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 tracking-widest uppercase">{comment.user?.role}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-900">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add your observation or reply..."
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-2xl p-5 text-sm resize-y min-h-[120px] outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium mb-4 placeholder:text-slate-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handlePostComment}
                  disabled={isSubmitting || !commentText.trim()}
                  className="flex items-center gap-2 bg-amber-500 text-slate-900 px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" /> Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Evidence */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-50 shadow-xl shadow-slate-200/40">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Evidence Media ({incident.imageUrls?.length || 0})</h3>

            {incident.imageUrls?.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {incident.imageUrls.map((url: string, idx: number) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm hover:border-amber-500 transition-all">
                    <img
                      src={url}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={`Evidence ${idx + 1}`}
                    />
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No media attached to this log.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
