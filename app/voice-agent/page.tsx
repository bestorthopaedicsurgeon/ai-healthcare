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
  const { activeSession } = usePatient();
  const { apiFetch } = useAuth();
  
  const [view, setView] = useState<'setup' | 'active' | 'results'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [targetPhone, setTargetPhone] = useState("");
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'completed'>('idle');
  
  // Magic Endpoint Data
  const [magicData, setMagicData] = useState<any>(null);

  useEffect(() => {
    if (activeSession) {
      setTargetPhone(activeSession.patient_phone || "");
      checkInitialData();
    }
  }, [activeSession]);

  const checkInitialData = async () => {
    if (!activeSession?.session_id) return;
    try {
      const res = await apiFetch(`/api/v1/sessions/${activeSession.session_id}/data`);
      if (res.ok) {
        const d = await res.json();
        setMagicData(d);
        if (d.intake) {
           setCallStatus('completed');
           setView('results');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const downloadIntakeReport = async () => {
    const intakeId = magicData?.intake?.intake_id;
    if (!intakeId) return;
    
    try {
      const res = await apiFetch(`/api/v1/intake/${intakeId}/report`);
      if (!res.ok) throw new Error("Failed to generate PDF report");
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF report.");
    }
  };

  const startIntake = async () => {
    if (!activeSession) return;
    setIsLoading(true);
    try {
      const payload = {
        patient_name: activeSession.patient_name,
        patient_phone: targetPhone || activeSession.patient_phone,
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
      
      setCallStatus('calling');
      setView('active');
    } catch (err) {
      console.error(err);
      alert("Failed to initiate voice agent.");
    } finally {
      setIsLoading(false);
    }
  };

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
        ) : !activeSession.referral_id ? (
          <motion.div
             key="no-triage"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto"
          >
              <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-500 shadow-inner">
                  <ShieldAlert size={48} />
              </div>
              <div>
                  <h2 className="text-2xl font-black text-gray-900 italic tracking-tighter">Dependency Blocked</h2>
                  <p className="text-sm font-medium text-gray-500 mt-3 leading-relaxed">
                      Please complete the <strong>Referral Triage</strong> step for this patient session before initiating an AI voice intake call.
                  </p>
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

              <div className="space-y-4">
                  <div className="bg-white border border-gray-100 rounded-[32px] p-6 flex flex-col justify-center gap-2 shadow-sm">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Target Phone Number</label>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus-within:border-accent-primary/30 focus-within:ring-4 focus-within:ring-accent-primary/10 transition-all">
                          <Phone size={18} className="text-gray-400" />
                          <input 
                              className="bg-transparent border-none outline-none text-sm font-bold w-full text-gray-700" 
                              placeholder="+1234567890"
                              value={targetPhone}
                              onChange={(e) => setTargetPhone(e.target.value)}
                          />
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
                          disabled={isLoading || !targetPhone} 
                          onClick={startIntake} 
                          variant="primary" 
                          className="rounded-2xl px-10 h-14 bg-gray-900 hover:bg-black font-black uppercase tracking-widest text-xs shadow-2xl"
                      >
                          {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2" fill="currentColor" />}
                          Call Patient Instantly
                      </Button>
                  </div>
              </div>
          </motion.div>
        ) : view === 'active' ? (
          <motion.div
              key="active-calling"
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
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Engaging {activeSession.patient_name}</h2>
                  <p className="text-gray-500 font-medium text-sm">The AI is currently conducting a clinical intake interview via phone.</p>
                  <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest"><Loader2 size={12} className="inline animate-spin mr-2"/> Polling connection indefinitely...</p>
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
                      {magicData?.intake?.intake_id && (
                          <Button 
                              onClick={downloadIntakeReport}
                              className="gap-2 bg-gray-900 hover:bg-black h-12 px-8 rounded-xl font-black shadow-2xl">
                              <FileText size={18} />Download PDF Report
                          </Button>
                      )}
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
                                  "{magicData?.intake?.clinical_data?.clinical_summary || "No summary available."}"
                              </p>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                          <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-premium space-y-6">
                              <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Medical History</h4>
                              <div className="space-y-4">
                                  {magicData?.intake?.clinical_data?.relevant_history?.map((item: string, i: number) => (
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
                                  {magicData?.intake?.clinical_data?.worsening_symptoms?.map((item: string, i: number) => (
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
                      {magicData?.categorization ? (
                          <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-gray-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden"
                          >
                              <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent-primary/20 rounded-full blur-[80px]" />
                              
                              <div className="text-[10px] font-black text-accent-primary uppercase tracking-[0.3em] mb-8">Clinical Priority Result</div>
                              
                              <div className="flex items-center gap-6 mb-10">
                                  <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center text-5xl font-black italic text-accent-primary shadow-inner">
                                      {magicData.categorization.category}
                                  </div>
                                  <div>
                                      <h3 className="text-xl font-bold italic tracking-tight">Category {magicData.categorization.category}</h3>
                                      <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Cross-Referenced</p>
                                  </div>
                              </div>

                              <div className="space-y-6">
                                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 italic text-sm leading-relaxed text-white/80">
                                      "{magicData.categorization.reasoning}"
                                  </div>

                                  <div className="space-y-4">
                                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Identified Discrepancies</h4>
                                      {magicData.categorization.discrepancies?.map((item: string, i: number) => (
                                          <div key={i} className="flex gap-3 text-xs font-bold text-orange-400 italic">
                                              <AlertCircle size={14} className="shrink-0" />
                                              {item}
                                          </div>
                                      ))}
                                      {(!magicData.categorization.discrepancies || magicData.categorization.discrepancies.length === 0) && (
                                         <p className="text-xs text-white/50 italic">No historical discrepancies found.</p>
                                      )}
                                  </div>

                                  <div className="space-y-4">
                                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Escalation Factors</h4>
                                      {magicData.categorization.escalation_factors?.map((item: string, i: number) => (
                                          <div key={i} className="flex gap-3 text-xs font-bold text-red-400 italic">
                                              <ShieldAlert size={14} className="shrink-0" />
                                              {item}
                                          </div>
                                      ))}
                                      {(!magicData.categorization.escalation_factors || magicData.categorization.escalation_factors.length === 0) && (
                                         <p className="text-xs text-white/50 italic">No critical escalations required.</p>
                                      )}
                                  </div>
                              </div>
                          </motion.div>
                      ) : (
                          <div className="bg-gray-50 border border-gray-100 rounded-[48px] p-10 flex flex-col items-center justify-center text-center space-y-4 h-full relative overflow-hidden">
                              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-accent-primary animate-pulse shadow-sm">
                                  <Activity size={32} />
                              </div>
                              <p className="text-sm font-bold text-gray-500 italic">Awaiting Priority Categorization Engine...</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Polling Data Stream</p>
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
