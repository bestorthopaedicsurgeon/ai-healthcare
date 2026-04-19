"use client";

import React, { useState, useEffect } from "react";
import { usePatient } from "@/context/PatientContext";
import { useAuth } from "@/context/AuthContext";
import { Phone, Search, Activity, Mic2, FileText, CheckCircle2, AlertCircle, Headphones, X, Play, Loader2, Wand2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { API_CONSTANTS } from "@/lib/api-constants";
import { cn } from "@/lib/utils";

export default function VoiceAgentPage() {
  const { activeSession, refreshSessions } = usePatient();
  const { apiFetch } = useAuth();
  
  const [view, setView] = useState<'setup' | 'active' | 'results'>('setup');
  const [intakeMode, setIntakeMode] = useState<'phone' | 'browser'>('browser');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Intake State
  const [intakeData, setIntakeData] = useState<any | null>(null);
  const [intakeResult, setIntakeResult] = useState<any | null>(null);
  const [categorizationResult, setCategorizationResult] = useState<any | null>(null);

  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'completed'>('idle');

  const startIntake = async () => {
    if (!activeSession) return;
    setIsLoading(true);
    try {
      const payload = {
        patient_name: activeSession.patient_name,
        patient_phone: activeSession.patient_phone,
        patient_dob: activeSession.patient_dob,
        primary_complaint: activeSession.notes || "Knee Assessment",
        session_id: activeSession.session_id,
        referral_id: activeSession.referral_id
      };

      const response = await apiFetch(API_CONSTANTS.INTAKE_START, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to start intake");
      const data = await response.json();
      setIntakeData(data);
      
      if (intakeMode === 'browser') {
        await fetchWebSocketUrl(data.intake_id);
      }
      
      setCallStatus('calling');
      setView('active');
    } catch (err) {
      console.error(err);
      alert("Failed to initiate voice agent.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWebSocketUrl = async (id: string) => {
    try {
      const response = await apiFetch(API_CONSTANTS.INTAKE_WS_URL.replace("{intake_id}", id));
      if (response.ok) {
        const data = await response.json();
        console.log("WebSocket URL fetched:", data.websocket_url);
        // Note: Real WebSocket connection would be established here
      }
    } catch (err) {
      console.error("Failed to fetch WebSocket URL", err);
    }
  };

  const handleCompleteIntake = async () => {
    if (!intakeData?.intake_id) return;
    setIsProcessing(true);
    try {
      // 1. Complete the intake
      const completeRes = await apiFetch(API_CONSTANTS.INTAKE_COMPLETE.replace("{intake_id}", intakeData.intake_id), {
        method: "POST"
      });
      if (!completeRes.ok) throw new Error("Failed to complete intake");

      // 2. Fetch result
      const resultRes = await apiFetch(API_CONSTANTS.INTAKE_RESULT.replace("{intake_id}", intakeData.intake_id));
      if (resultRes.ok) {
        const results = await resultRes.json();
        setIntakeResult(results);
      }

      // 3. Fetch Categorization if referral_id exists
      if (activeSession?.referral_id) {
          const catRes = await apiFetch(API_CONSTANTS.CATEGORIZATION_BY_REFERRAL.replace("{referral_id}", activeSession.referral_id));
          if (catRes.ok) {
              const catData = await catRes.json();
              setCategorizationResult(catData);
          }
      }

      setCallStatus('completed');
      setView('results');
      refreshSessions();
    } catch (err) {
      console.error(err);
      alert("Failed to finalize intake.");
    } finally {
      setIsProcessing(false);
    }
  };

  const triageCategories = [
    { id: 'A', label: 'Category A', color: '#e74c3c', desc: 'Urgent — specialist review within days' },
    { id: 'B', label: 'Category B', color: '#f39c12', desc: 'Semi-urgent — within 1-2 weeks' },
    { id: 'C', label: 'Category C', color: '#27ae60', desc: 'Routine — standard wait time' }
  ];

  return (
    <div className="min-h-full p-8 bg-white">
            <AnimatePresence mode="wait">
            {!activeSession ? (
                <motion.div
                    key="no-session"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto"
                >
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
                        <Phone size={40} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">No active session selected</h2>
                        <p className="text-sm text-gray-500 mt-2">Please select a patient session from the sidebar to view voice agent transcriptions.</p>
                    </div>
                </motion.div>
             ) : view === 'setup' ? (
                <motion.div 
                    key="setup-ui"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto space-y-10 mt-12"
                >
                    <div className="text-center space-y-4">
                      <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">AI Voice Intake</h2>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Patient Engagement Agent — Session Active</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div 
                          onClick={() => setIntakeMode('browser')}
                          className={cn(
                            "bg-white border rounded-[40px] p-10 cursor-pointer transition-all flex flex-col items-center text-center gap-6 group relative overflow-hidden",
                            intakeMode === 'browser' ? "border-accent-primary ring-2 ring-accent-primary/20 shadow-xl" : "border-gray-100 hover:border-gray-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                          )}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Headphones size={32} />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 italic uppercase">Browser-Based</h3>
                                <p className="text-xs text-gray-500 mt-1">Connect directly via WebSocket. Best for demos & testing.</p>
                            </div>
                            {intakeMode === 'browser' && <div className="absolute top-4 right-4 text-accent-primary"><CheckCircle2 size={24} /></div>}
                        </div>

                        <div 
                           onClick={() => setIntakeMode('phone')}
                           className={cn(
                             "bg-white border rounded-[40px] p-10 cursor-pointer transition-all flex flex-col items-center text-center gap-6 group relative overflow-hidden",
                             intakeMode === 'phone' ? "border-accent-primary ring-2 ring-accent-primary/20 shadow-xl" : "border-gray-100 hover:border-gray-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                           )}
                        >
                             <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <Phone size={32} />
                             </div>
                             <div>
                                 <h3 className="font-black text-gray-900 italic uppercase">Phone Call</h3>
                                 <p className="text-xs text-gray-500 mt-1">AI calls {activeSession.patient_phone} immediately.</p>
                             </div>
                             {intakeMode === 'phone' && <div className="absolute top-4 right-4 text-accent-primary"><CheckCircle2 size={24} /></div>}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-[32px] p-8 flex items-center justify-between border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Linkage</p>
                                <p className="text-sm font-bold text-gray-700">Linked to Referral: <span className="text-accent-primary italic">{activeSession.referral_id ? activeSession.referral_id.slice(0, 8) + '...' : 'None'}</span></p>
                            </div>
                        </div>
                        <Button 
                            disabled={isLoading} 
                            onClick={startIntake} 
                            variant="primary" 
                            className="rounded-2xl px-10 h-14 bg-gray-900 hover:bg-black font-black uppercase tracking-widest text-xs shadow-2xl"
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2" fill="currentColor" />}
                            Initiate Engagement
                        </Button>
                    </div>
                </motion.div>
            ) : view === 'active' ? (
                <motion.div
                    key="active-ui"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-12"
                >
                    <div className="relative">
                        <div className="w-48 h-48 rounded-full bg-accent-primary/5 flex items-center justify-center">
                            <div className="w-32 h-32 rounded-full bg-accent-primary/10 flex items-center justify-center animate-pulse">
                                <div className="w-20 h-20 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-2xl shadow-accent-primary/40">
                                    <Mic2 size={40} />
                                </div>
                            </div>
                        </div>
                        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 rounded-full border-2 border-accent-primary/20" />
                        <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.1, 0, 0.1] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute inset-0 rounded-full border-2 border-accent-primary/10" />
                    </div>

                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 text-accent-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                            <div className="w-2 h-2 bg-accent-primary rounded-full" />
                            Live AI Conversation
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic italic uppercase">Engaging {activeSession.patient_name}</h2>
                        <p className="text-gray-500 font-medium text-sm">The AI is currently conducting a clinical intake interview via {intakeMode}.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full max-w-sm">
                        <Button 
                            disabled={isProcessing}
                            onClick={handleCompleteIntake} 
                            variant="secondary" 
                            className={cn(
                                "flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all",
                                isProcessing ? "bg-gray-100 italic" : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                            )}
                        >
                            {isProcessing ? "Processing Analysis..." : "Finalize Call"}
                        </Button>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="results-ui"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl w-full mx-auto space-y-12 pb-24"
                >
                    <div className="flex items-end justify-between px-2">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none italic uppercase">Patient Insights</h2>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">{activeSession.patient_name} • Intake Report • {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" className="gap-2 h-12 px-6 rounded-xl font-bold border-gray-100" onClick={() => setView('setup')}>New Call</Button>
                            <Button className="gap-2 bg-gray-900 hover:bg-black h-12 px-8 rounded-xl font-black shadow-2xl">
                                <Search size={18} />Full Transcript
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                        {/* Summary & History */}
                        <div className="col-span-8 space-y-8">
                            <div className="bg-white border border-gray-100 rounded-[48px] p-12 shadow-premium relative overflow-hidden group hover:shadow-2xl transition-all">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-emerald-500 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                    <Activity size={160} />
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-6">
                                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                                        <Wand2 size={14} />
                                    </div>
                                    Synthesized History
                                </div>
                                <div className="space-y-8 relative z-10">
                                    <p className="text-gray-900 leading-relaxed text-2xl font-black italic">
                                        "{intakeResult?.clinical_intake?.clinical_summary || "No summary available."}"
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-premium space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Medical History</h4>
                                    <div className="space-y-4">
                                        {intakeResult?.clinical_intake?.relevant_history?.map((item: string, i: number) => (
                                            <div key={i} className="flex gap-4 group">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                                <p className="text-sm font-bold text-gray-700">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-premium space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Worsening Symptoms</h4>
                                    <div className="space-y-4">
                                        {intakeResult?.clinical_intake?.worsening_symptoms?.map((item: string, i: number) => (
                                            <div key={i} className="flex gap-4 group">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                                                <p className="text-sm font-bold text-gray-700">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Categorization Card */}
                        <div className="col-span-4 space-y-8">
                            {categorizationResult ? (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-gray-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent-primary/20 rounded-full blur-[80px]" />
                                    
                                    <div className="text-[10px] font-black text-accent-primary uppercase tracking-[0.3em] mb-8">Clinical Priority Result</div>
                                    
                                    <div className="flex items-center gap-6 mb-10">
                                        <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center text-5xl font-black italic text-accent-primary shadow-inner">
                                            {categorizationResult.category}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold italic tracking-tight">Category {categorizationResult.category} Status</h3>
                                            <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Auto-Generated Intel</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 italic text-sm leading-relaxed text-white/80">
                                            "{categorizationResult.reasoning}"
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Identified Discrepancies</h4>
                                            {categorizationResult.discrepancies?.map((item: string, i: number) => (
                                                <div key={i} className="flex gap-3 text-xs font-bold text-orange-400 italic">
                                                    <AlertCircle size={14} className="shrink-0" />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Escalation Factors</h4>
                                            {categorizationResult.escalation_factors?.map((item: string, i: number) => (
                                                <div key={i} className="flex gap-3 text-xs font-bold text-red-400 italic">
                                                    <ShieldAlert size={14} className="shrink-0" />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-gray-50 border border-gray-100 rounded-[48px] p-10 flex flex-col items-center justify-center text-center space-y-4 h-full">
                                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-gray-200">
                                        <Activity size={32} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 italic">No linked referral found for auto-categorization.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
    </div>
  );
}
