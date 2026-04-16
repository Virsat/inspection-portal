"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ClipboardList, ArrowRight, CheckCircle2, Loader2, Camera } from 'lucide-react';

export default function PerformInspection() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [inspectionData, setInspectionData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, { answer: string; imageUrl?: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInspection = async () => {
      try {
        const { data } = await api.get(`/inspections/${id}/results`);
        setInspectionData(data.inspection);
      } catch (err) {
        console.error(err);
        alert("Failed to load inspection details.");
        router.push('/inspector/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchInspection();
  }, [id, router]);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], answer: value }
    }));
  };

  const handleImageSimulate = (questionId: number) => {
    // Simulating an S3 upload by providing a dummy URL
    const dummyS3Url = `https://s3.amazonaws.com/inspector-bucket/simulated-upload-${Date.now()}.jpg`;
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], imageUrl: dummyS3Url }
    }));
    alert("Image successfully uploaded and attached!");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([qId, data]) => ({
        questionId: Number(qId),
        answer: data.answer,
        imageUrl: data.imageUrl,
      }));

      await api.post(`/inspections/${id}/answers`, { answers: payload });
      alert("Inspection submitted successfully!");
      router.push('/inspector/dashboard');
    } catch (e) {
      console.error(e);
      alert("Failed to submit answers.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  if (!inspectionData) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{inspectionData.inspectionType.name}</h1>
          <p className="mt-2 text-slate-500 font-medium flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Inspection #{inspectionData.id}
          </p>
        </div>
        <div className="hidden md:block">
           <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-full">
             {inspectionData.status}
           </span>
        </div>
      </div>

      <div className="space-y-8">
        {inspectionData.sections.map((section: any, idx: number) => (
          <div key={section.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                <span className="text-amber-500 mr-2">0{idx + 1}.</span>
                {section.name}
              </h2>
            </div>
            
            <div className="divide-y divide-slate-100">
              {section.questions.map((question: any) => (
                <div key={question.id} className="p-6">
                  <p className="font-semibold text-slate-800 mb-4">
                    {question.text}
                    {question.isRequired && <span className="text-rose-500 ml-1">*</span>}
                  </p>
                  
                  <div className="space-y-4">
                    <textarea
                      placeholder="Enter your observations..."
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      value={answers[question.id]?.answer || ''}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all resize-none"
                    />

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleImageSimulate(question.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          answers[question.id]?.imageUrl 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {answers[question.id]?.imageUrl ? <CheckCircle2 className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                        {answers[question.id]?.imageUrl ? 'Photo Attached' : 'Attach Photo'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-amber-500 text-slate-900 px-8 py-4 rounded-full font-bold shadow-lg hover:bg-amber-400 transition-colors shadow-amber-500/20 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          Submit Inspection
        </button>
      </div>
    </motion.div>
  );
}
