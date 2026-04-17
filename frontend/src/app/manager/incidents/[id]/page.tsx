"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Calendar, User, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function IncidentDetails() {
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
      router.push('/manager/incidents');
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

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/incidents/${params.id}/status`, { status });
      fetchIncident();
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400 font-bold tracking-widest text-sm uppercase">
        Loading Incident Details...
      </div>
    );
  }

  if (!incident) return null;

  const severityData = incident.severity ? (typeof incident.severity === 'string' ? JSON.parse(incident.severity) : incident.severity) : null;
  const analysisData = incident.analysis ? (typeof incident.analysis === 'string' ? JSON.parse(incident.analysis) : incident.analysis) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6 pb-20">

      {/* Header Navigation */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/manager/incidents" className="p-2 hover:bg-slate-100 rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            Incident #{incident.id}
          </h1>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">

            <div className="flex items-center gap-3 mb-6">
              <span className={clsx(
                "px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border",
                ['NEAR_MISS', 'INJURY', 'SAFETY_VIOLATION'].includes(incident.type) ? "bg-red-50 text-red-700 border-red-100" :
                  incident.type === 'EQUIPMENT_DAMAGE' ? "bg-orange-50 text-orange-700 border-orange-100" :
                    incident.type === 'ENVIRONMENTAL_SPILL' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      "bg-blue-50 text-blue-700 border-blue-100"
              )}>
                {incident.type?.replace(/_/g, ' ')}
              </span>

              <span className={clsx(
                "px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border border-dashed",
                incident.status === 'OPEN' ? "bg-rose-50 text-rose-600 border-rose-200" :
                  incident.status === 'IN_PROGRESS' ? "bg-amber-50 text-amber-600 border-amber-200" :
                    "bg-emerald-50 text-emerald-600 border-emerald-200"
              )}>
                {incident.status.replace('_', ' ')}
              </span>
            </div>

            <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4">{incident.title}</h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium mb-8">
              {incident.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Reported By</p>
                <p className="text-sm font-black text-slate-800 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {(incident.inspector.name) || incident.inspector.email.split('@')[0]}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Date</p>
                <p className="text-sm font-black text-slate-800 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(incident.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Time</p>
                <p className="text-sm font-black text-slate-800 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {incident.location && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Location</p>
                  <p className="text-sm font-black text-slate-800 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {incident.location}</p>
                </div>
              )}
            </div>

          </div>

          {/* Structured Data rendering if present */}
          {(severityData || analysisData) && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Technical Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {severityData && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Severity Metrics</h4>
                    {Object.entries(severityData).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                        <span className="text-xs font-bold text-slate-600 capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-black text-slate-900">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {analysisData && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Root Cause Analysis</h4>
                    {Object.entries(analysisData).map(([k, v]) => (
                      <div key={k} className="bg-slate-50 p-3 rounded-xl border-l-4 border-l-indigo-400">
                        <span className="text-[10px] font-black uppercase text-indigo-400 block mb-1">{k.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-medium text-slate-700">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-indigo-500" /> Comments</h3>
            </div>

            <div className="p-6 space-y-6">
              {(incident.comments || []).length === 0 ? (
                <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-sm">No comments yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {incident.comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0 uppercase">
                        {((comment.user?.name) || comment.user?.email || 'U')[0]}
                      </div>
                      <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tl-sm border border-slate-100 relative">
                        <div className="flex justify-between items-baseline mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{(comment.user?.name) || comment.user?.email.split('@')[0]}</span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 tracking-widest">{comment.user?.role}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-400">{new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment or update..."
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm resize-y min-h-[100px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium mb-3"
              />
              <div className="flex justify-end">
                <button
                  onClick={handlePostComment}
                  disabled={isSubmitting || !commentText.trim()}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" /> Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Evidence & Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Management Actions</h3>

            <label className="text-xs font-bold text-slate-900 mb-2 block">Update Status</label>
            <select
              value={incident.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 text-white border-0 rounded-xl text-sm font-bold outline-none cursor-pointer mb-2"
            >
              <option value="OPEN">Mark as Open</option>
              <option value="IN_PROGRESS">Investigating (In Progress)</option>
              <option value="RESOLVED">Resolve Issue</option>
            </select>
            {incident.status === 'RESOLVED' && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl text-xs font-bold mt-3">
                <CheckCircle2 className="w-4 h-4" /> Issue officially resolved
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Evidence Media ({incident.imageUrls?.length || 0})</h3>

            {incident.imageUrls?.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {incident.imageUrls.map((url: string, idx: number) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block relative group aspect-square rounded-2xl overflow-hidden border border-slate-200">
                    <img
                      src={url}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={`Evidence ${idx + 1}`}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-xs font-medium text-slate-400">No images attached.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
