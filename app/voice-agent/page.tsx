"use client";

import React, { useState, useEffect } from "react";
import { usePatient } from "@/context/PatientContext";
import { useAuth } from "@/context/AuthContext";
import { Phone, Search, Activity, Mic2, FileText, CheckCircle2, AlertCircle, Headphones, X, Play, Loader2, Wand2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { API_CONSTANTS } from "@/lib/api-constants";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const renderClinicalItem = (item: any) => {
  if (!item) return "";
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    // If it's a medication object
    if ('name' in item) {
      const parts = [
        item.name,
        item.dosage ? `(${item.dosage})` : '',
        item.frequency ? `- ${item.frequency}` : ''
      ].filter(Boolean);
      return parts.join(' ');
    }
    // If it's an allergy object (e.g. { allergy: "peanuts", severity: "severe" })
    if ('allergy' in item || 'allergen' in item) {
      const name = item.allergy || item.allergen;
      const severity = item.severity ? `(${item.severity})` : '';
      return `${name} ${severity}`.trim();
    }
    // If it's a surgery object (e.g. { procedure: "appendix removal", date: "2010" })
    if ('procedure' in item || 'surgery' in item) {
      const name = item.procedure || item.surgery;
      const date = item.date ? `(${item.date})` : '';
      return `${name} ${date}`.trim();
    }
    // If it's a condition object (e.g. { condition: "asthma", onset: "childhood" })
    if ('condition' in item) {
      const name = item.condition;
      const onset = item.onset ? `(${item.onset})` : '';
      return `${name} ${onset}`.trim();
    }
    // Generic fallback - join all string values of the object
    return Object.values(item).filter(val => typeof val === 'string' && val !== '').join(' ');
  }
  return String(item);
};

export default function VoiceAgentPage() {
  const { activeSession, sessionData, isSessionDataLoading, refreshSessionData } = usePatient();
  const { apiFetch } = useAuth();
  const router = useRouter();
  
  const [view, setView] = useState<'setup' | 'active' | 'results' | 'followup'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [targetPhone, setTargetPhone] = useState("");
  const [isPhoneEdited, setIsPhoneEdited] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'completed'>('idle');
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<any>(null);
  const [resultsTab, setResultsTab] = useState<'clinical' | 'transcript'>('clinical');

  // Reset phone edit flag when active session changes
  useEffect(() => {
    if (activeSession) {
      setIsPhoneEdited(false);
      setCallStatus('idle');
      setView('setup');
      setIntakeId(activeSession.intake_id || sessionData?.intake?.intake_id || null);
    }
  }, [activeSession]);

  // Autofetch phone number from triage extracted data or session data, respecting manual overrides
  useEffect(() => {
    if (activeSession && !isPhoneEdited) {
      const extractedPhone = sessionData?.triage?.extracted_data?.patient_phone;
      const sessionPhone = activeSession.patient_phone;
      setTargetPhone(extractedPhone || sessionPhone || "");
    }
  }, [activeSession, sessionData, isPhoneEdited]);

  // Detect follow-up patient (explicit patient_type from API)
  useEffect(() => {
    if (sessionData?.patient_type === 'followup') {
      setView('followup');
    }
  }, [sessionData]);

  useEffect(() => {
    if (sessionData?.patient_type === 'followup') {
      return;
    }
    if (sessionData?.intake && (sessionData.intake.call_transcript || sessionData.intake.clinical_data)) {
      setCallStatus('completed');
      setView('results');
    } else if (sessionData?.intake && view !== 'active') {
      setCallStatus('idle');
      setView('setup');
    }
    if (sessionData?.intake?.intake_id && view !== 'active') {
      setIntakeId(sessionData.intake.intake_id);
    }
  }, [sessionData, view]);

  // Status Polling Effect
  useEffect(() => {
    if (!intakeId || callStatus !== 'calling') {
      setPollingStatus(null);
      return;
    }

    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await apiFetch(`/api/v1/intake/${intakeId}/status`);
        if (res.ok) {
          const statusData = await res.json();
          setPollingStatus(statusData);
          
          if (statusData.is_terminal || statusData.status === 'completed' || statusData.status === 'failed') {
            clearInterval(intervalId);
            await refreshSessionData();
          }
        }
      } catch (err) {
        console.error("Error polling intake status:", err);
      }
    };

    checkStatus();
    intervalId = setInterval(checkStatus, 3000);

    return () => clearInterval(intervalId);
  }, [intakeId, callStatus, apiFetch, refreshSessionData]);

  const downloadIntakeReport = async () => {
    const reportIntakeId = sessionData?.intake?.intake_id || intakeId;
    if (!reportIntakeId) return;
    
    try {
      const res = await apiFetch(`/api/v1/intake/${reportIntakeId}/report`);
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
      const payload: any = {
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
      
      const data = await response.json();
      if (data.intake_id) {
        setIntakeId(data.intake_id);
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

  // Parsing call transcript into bubble objects
  const parseTranscript = (transcript: string) => {
    if (!transcript) return [];
    return transcript.split('\n').map((line, idx) => {
      const isAgent = line.startsWith('Agent:');
      const isUser = line.startsWith('User:');
      let speaker = '';
      let text = line;
      
      if (isAgent) {
        speaker = 'Clinical Agent';
        text = line.replace(/^Agent:\s*/i, '');
      } else if (isUser) {
        speaker = 'Patient';
        text = line.replace(/^User:\s*/i, '');
      } else {
        speaker = 'Narrator';
      }
      
      // Clean bracket tags like [Patient] or [Concerned]
      text = text.replace(/\[.*?\]\s*/g, '');
      
      return { id: idx, speaker, text, isAgent, isUser };
    });
  };

  const transcriptBubbles = parseTranscript(sessionData?.intake?.call_transcript || "");
  const clinicalData = sessionData?.intake?.clinical_data;

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
        ) : view === 'followup' ? (
          <motion.div
              key="followup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500 shadow-inner">
              <Phone size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 italic tracking-tighter">Voice Intake Bypassed</h2>
              <p className="text-sm font-medium text-gray-500 mt-3 leading-relaxed">
                No voice agent intake call is required for this follow-up patient session.
              </p>
            </div>
            <Button 
              onClick={() => router.push("/scribe")}
              variant="primary"
              className="rounded-2xl px-6 h-12 bg-gray-900 hover:bg-black font-black uppercase tracking-widest text-xs shadow-2xl mt-4"
            >
              Go to Scribe Workspace
            </Button>
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
                              onChange={(e) => {
                                  setTargetPhone(e.target.value);
                                  setIsPhoneEdited(true);
                              }}
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
                  <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">
                    <Loader2 size={12} className="inline animate-spin mr-2"/>
                    {pollingStatus ? (
                      <>
                        Status: <span className="text-accent-primary">{pollingStatus.status}</span>
                        {pollingStatus.call_duration_seconds > 0 && ` • Duration: ${pollingStatus.call_duration_seconds}s`}
                      </>
                    ) : (
                      "Initializing connection..."
                    )}
                  </p>
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
                      {(sessionData?.intake?.intake_id || intakeId) && (
                          <Button 
                              onClick={downloadIntakeReport}
                              className="gap-2 bg-gray-900 hover:bg-black h-12 px-8 rounded-xl font-black shadow-2xl">
                              <FileText size={18} />Download PDF Report
                          </Button>
                      )}
                  </div>
              </div>

              <div className="grid grid-cols-12 gap-8">
                  {/* Main Intake Content Column */}
                  <div className="col-span-8 space-y-6">
                      {/* Tabs Navigation */}
                      <div className="flex gap-4 border-b border-gray-100 pb-2">
                          <button
                              onClick={() => setResultsTab('clinical')}
                              className={cn(
                                  "pb-2 px-1 text-sm font-black uppercase tracking-widest border-b-2 transition-all",
                                  resultsTab === 'clinical' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
                              )}
                          >
                              Clinical Profile
                          </button>
                          <button
                              onClick={() => setResultsTab('transcript')}
                              className={cn(
                                  "pb-2 px-1 text-sm font-black uppercase tracking-widest border-b-2 transition-all",
                                  resultsTab === 'transcript' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
                              )}
                          >
                              Call Transcript
                          </button>
                      </div>

                      {resultsTab === 'clinical' ? (
                          <div className="space-y-8">
                              {/* Symptoms Section */}
                              <div className="space-y-4">
                                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reported Symptoms</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {clinicalData?.symptoms?.map((s: any, idx: number) => (
                                          <div key={idx} className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col justify-between gap-4">
                                              <div className="flex items-start justify-between">
                                                  <h5 className="font-bold text-gray-900 capitalize text-base">{s.symptom}</h5>
                                                  <span className={cn(
                                                      "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full",
                                                      s.severity === 'severe' ? "bg-red-50 text-red-600" : s.severity === 'moderate' ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                                                  )}>
                                                      {s.severity || 'Reported'}
                                                  </span>
                                              </div>
                                              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500">
                                                  {s.onset && <div><span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider mb-0.5">Onset</span>{s.onset}</div>}
                                                  {s.duration && <div><span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider mb-0.5">Duration</span>{s.duration}</div>}
                                                  {s.frequency && <div><span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider mb-0.5">Frequency</span>{s.frequency}</div>}
                                              </div>
                                          </div>
                                      ))}
                                      {(!clinicalData?.symptoms || clinicalData.symptoms.length === 0) && (
                                          <p className="text-sm font-medium text-gray-400 italic">No symptoms reported.</p>
                                      )}
                                  </div>
                              </div>

                              {/* Medical History Checklist */}
                              <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm space-y-6">
                                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinical Checklist</h4>
                                  <div className="grid grid-cols-2 gap-8">
                                      <div className="space-y-2">
                                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Past Conditions</span>
                                          <div className="flex flex-wrap gap-2">
                                              {clinicalData?.past_conditions?.map((c: any, idx: number) => <span key={idx} className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl">{renderClinicalItem(c)}</span>) || "None reported"}
                                              {(!clinicalData?.past_conditions || clinicalData.past_conditions.length === 0) && <span className="text-xs text-gray-400 italic">None reported</span>}
                                          </div>
                                      </div>

                                      <div className="space-y-2">
                                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Current Medications</span>
                                          <div className="flex flex-wrap gap-2">
                                              {clinicalData?.current_medications?.map((m: any, idx: number) => <span key={idx} className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl">{renderClinicalItem(m)}</span>) || "None reported"}
                                              {(!clinicalData?.current_medications || clinicalData.current_medications.length === 0) && <span className="text-xs text-gray-400 italic">None reported</span>}
                                          </div>
                                      </div>

                                      <div className="space-y-2">
                                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Allergies</span>
                                          <div className="flex flex-wrap gap-2">
                                              {clinicalData?.allergies?.map((a: any, idx: number) => <span key={idx} className="bg-red-50 text-red-600 border border-red-100 text-xs font-bold px-3 py-1.5 rounded-xl">{renderClinicalItem(a)}</span>) || "None reported"}
                                              {(!clinicalData?.allergies || clinicalData.allergies.length === 0) && <span className="text-xs text-gray-400 italic">None reported</span>}
                                          </div>
                                      </div>

                                      <div className="space-y-2">
                                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Surgical History</span>
                                          <div className="flex flex-wrap gap-2">
                                              {clinicalData?.surgical_history?.map((s: any, idx: number) => <span key={idx} className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl">{renderClinicalItem(s)}</span>) || "None reported"}
                                              {(!clinicalData?.surgical_history || clinicalData.surgical_history.length === 0) && <span className="text-xs text-gray-400 italic">None reported</span>}
                                          </div>
                                      </div>

                                      <div className="col-span-2 space-y-2 border-t border-gray-50 pt-4">
                                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Lifestyle & Social Factors</span>
                                          <div className="grid grid-cols-3 gap-4 text-xs font-medium text-gray-600">
                                              {clinicalData?.lifestyle_factors?.occupation && <div><span className="text-[9px] text-gray-400 font-bold block uppercase mb-0.5">Occupation</span>{clinicalData.lifestyle_factors.occupation}</div>}
                                              {clinicalData?.lifestyle_factors?.exercise && <div><span className="text-[9px] text-gray-400 font-bold block uppercase mb-0.5">Exercise</span>{clinicalData.lifestyle_factors.exercise}</div>}
                                              {clinicalData?.lifestyle_factors?.smoking && <div><span className="text-[9px] text-gray-400 font-bold block uppercase mb-0.5">Smoking</span>{clinicalData.lifestyle_factors.smoking}</div>}
                                              {clinicalData?.lifestyle_factors?.alcohol && <div><span className="text-[9px] text-gray-400 font-bold block uppercase mb-0.5">Alcohol</span>{clinicalData.lifestyle_factors.alcohol}</div>}
                                              {clinicalData?.lifestyle_factors?.diet && <div><span className="text-[9px] text-gray-400 font-bold block uppercase mb-0.5">Diet</span>{clinicalData.lifestyle_factors.diet}</div>}
                                              {clinicalData?.lifestyle_factors?.sleep_quality && <div><span className="text-[9px] text-gray-400 font-bold block uppercase mb-0.5">Sleep</span>{clinicalData.lifestyle_factors.sleep_quality}</div>}
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              {clinicalData?.additional_concerns && (
                                  <div className="bg-orange-50/20 border border-orange-100/50 rounded-3xl p-6">
                                      <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider block mb-2">Additional Concerns</span>
                                      <p className="text-sm font-semibold text-gray-700 italic">"{clinicalData.additional_concerns}"</p>
                                  </div>
                              )}
                          </div>
                      ) : (
                          /* Transcript View */
                          <div className="bg-gray-50 border border-gray-100 rounded-[40px] p-8 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar flex flex-col">
                              {transcriptBubbles.map((bubble) => (
                                  <div
                                      key={bubble.id}
                                      className={cn(
                                          "flex flex-col max-w-[80%] rounded-[24px] p-4 shadow-sm",
                                          bubble.isAgent
                                              ? "bg-white self-start border border-gray-100"
                                              : bubble.isUser
                                                  ? "bg-gray-900 text-white self-end"
                                                  : "bg-gray-200 text-gray-600 text-xs self-center"
                                      )}
                                  >
                                      <span className={cn(
                                          "text-[9px] font-black uppercase tracking-wider mb-1 block",
                                          bubble.isAgent ? "text-accent-primary" : bubble.isUser ? "text-accent-secondary text-white/50" : "text-gray-400"
                                      )}>
                                          {bubble.speaker}
                                      </span>
                                      <p className="text-sm font-semibold leading-relaxed">
                                          {bubble.text}
                                      </p>
                                  </div>
                              ))}
                              {transcriptBubbles.length === 0 && (
                                  <p className="text-sm text-gray-400 italic text-center py-10">No transcript available.</p>
                              )}
                          </div>
                      )}
                  </div>

                  {/* Right Column: Categorization Card */}
                  <div className="col-span-4 space-y-8">
                      {sessionData?.categorization ? (
                          <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-gray-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden"
                          >
                              <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent-primary/20 rounded-full blur-[80px]" />
                              
                              <div className="text-[10px] font-black text-accent-primary uppercase tracking-[0.3em] mb-8">Clinical Priority Result</div>
                              
                              <div className="flex items-center gap-6 mb-10">
                                  <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center text-5xl font-black italic text-accent-primary shadow-inner">
                                      {sessionData.categorization.category}
                                  </div>
                                  <div>
                                      <h3 className="text-xl font-bold italic tracking-tight">Category {sessionData.categorization.category}</h3>
                                      <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Cross-Referenced</p>
                                  </div>
                              </div>

                              <div className="space-y-6">
                                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 italic text-sm leading-relaxed text-white/80">
                                      "{sessionData.categorization.reasoning}"
                                  </div>

                                  <div className="space-y-4">
                                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Identified Discrepancies</h4>
                                      {sessionData.categorization.discrepancies?.map((item: string, i: number) => (
                                          <div key={i} className="flex gap-3 text-xs font-bold text-orange-400 italic">
                                              <AlertCircle size={14} className="shrink-0" />
                                              {item}
                                          </div>
                                      ))}
                                      {(!sessionData.categorization.discrepancies || sessionData.categorization.discrepancies.length === 0) && (
                                         <p className="text-xs text-white/50 italic">No historical discrepancies found.</p>
                                      )}
                                  </div>

                                  <div className="space-y-4">
                                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Escalation Factors</h4>
                                      {sessionData.categorization.escalation_factors?.map((item: string, i: number) => (
                                          <div key={i} className="flex gap-3 text-xs font-bold text-red-400 italic">
                                              <ShieldAlert size={14} className="shrink-0" />
                                              {item}
                                          </div>
                                      ))}
                                      {(!sessionData.categorization.escalation_factors || sessionData.categorization.escalation_factors.length === 0) && (
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
