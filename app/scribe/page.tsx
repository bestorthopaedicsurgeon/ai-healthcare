"use client";

import React, { useState, useRef } from "react";
import { Plus, Play, Mic2, Pause, Square, Download, Activity, CheckCircle2, FileText } from "lucide-react";
import { usePatient } from "@/context/PatientContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { API_CONSTANTS } from "@/lib/api-constants";
import ReactMarkdown from "react-markdown";

export default function ScribePage() {
  const { 
    activeSession, 
    patientSessions, 
    setScribeStatus, 
    activeSessionId, 
    activePatient, 
    activePatientId, 
    openSessionModal 
  } = usePatient();
  const router = useRouter();
  const { apiFetch } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [time, setTime] = useState(0);

  // Results State
  const [sessionResults, setSessionResults] = useState<any | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const sessionStatus = activeSessionId ? (patientSessions[activeSessionId] || 'idle') : 'none';

  const handleViewDocument = async (url: string) => {
    if (!url) return;
    try {
      const response = await apiFetch(url);
      if (!response.ok) throw new Error("Failed to fetch document");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank');
    } catch (err) {
      console.error("Document viewing error:", err);
      alert("Failed to load secure document.");
    }
  };

  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    if (!sessionResults?.consultation_id) return;
    setIsApproving(true);
    try {
      const response = await apiFetch(`/api/v1/scribe/consultations/${sessionResults.consultation_id}/approve`, {
        method: "POST",
        body: JSON.stringify({ edits: {} })
      });
      if (!response.ok) throw new Error("Approval failed");
      setSessionResults({ ...sessionResults, status: 'approved' });
      alert("Documentation approved and finalized.");
    } catch (err) {
      console.error(err);
      alert("Failed to approve documentation.");
    } finally {
      setIsApproving(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    if (!activeSession) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "consultation.webm");
      formData.append("patient_name", activeSession.patient_name);
      formData.append("primary_complaint", activeSession.notes || "Recorded Consultation");
      formData.append("session_id", activeSessionId!);

      const response = await apiFetch(API_CONSTANTS.SCRIBE_CONSULTATIONS_UPLOAD_AUDIO, {

        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const results = await response.json();
      setSessionResults(results);
      setScribeStatus(activeSessionId!, 'finished');
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload audio. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    if (!activeSessionId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        uploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setScribeStatus(activeSessionId, 'active');
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsRecording(false);
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsRecording(true);
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    if (activeSessionId) setScribeStatus(activeSessionId, 'finished');
    if (timerRef.current) clearInterval(timerRef.current);
    setTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-full p-8 bg-white">
          <AnimatePresence mode="wait">
            {!activeSession ? (
                <motion.div
                    key="no-session"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 max-w-md mx-auto"
                >
                    <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-300 relative">
                        <Mic2 size={48} />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-accent-primary">
                          <Plus size={16} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Ready to begin?</h2>
                        <p className="text-sm text-gray-500 font-medium">
                           {activePatientId 
                             ? `You're one step away from transcribing for ${activePatient?.full_name}.`
                             : "You need an active session to use this clinical tool."}
                        </p>
                    </div>
                    {activePatientId ? (
                        <div className="flex flex-col gap-3 w-full">
                          <Button 
                            onClick={() => openSessionModal("/scribe")} 
                            variant="primary" 
                            className="rounded-2xl h-14 font-bold shadow-xl shadow-accent-primary/20 flex items-center justify-center gap-2"
                          >
                            <Play size={18} fill="currentColor" />
                            Start Consultation for {activePatient?.full_name}
                          </Button>
                          <Button 
                            onClick={() => router.push(`/patients/${activePatientId}`)} 
                            variant="secondary" 
                            className="rounded-2xl h-12 text-gray-500 hover:text-gray-900 font-medium"
                          >
                            View Patient Profile
                          </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                          <p className="text-sm text-gray-400">Select a patient from the sidebar to begin.</p>
                          <Button onClick={() => router.push(`/dashboard`)} variant="outline" className="rounded-2xl px-8 h-12">Browse Patients</Button>
                        </div>
                    )}
                </motion.div>
            ) : sessionStatus === 'idle' ? (
              <motion.div
                key="start-ui"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-md w-full text-center space-y-8 p-12 mx-auto mt-12 bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-blue-500/5"
              >
                <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto text-blue-500 mb-6">
                  <Mic2 size={48} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Start Scribe Session</h2>
                  <p className="text-gray-500 font-medium">For {activeSession.patient_name}</p>
                  <p className="text-xs text-gray-400">Record your consultation. The AI will generate structured clinical notes automatically.</p>
                </div>
                <button
                  onClick={startRecording}
                  className="w-full py-4 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-2xl font-bold shadow-lg shadow-accent-primary/30 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                >
                  <Play size={24} fill="white" />
                  Start Recording
                </button>
              </motion.div>
            ) : sessionStatus === 'active' || isUploading ? (
              <motion.div
                key="active-ui"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl w-full h-full space-y-6 flex flex-col mx-auto items-center justify-center"
              >
                {isUploading ? (
                  <div className="text-center space-y-8 py-20">
                    <div className="w-24 h-24 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto shadow-2xl opacity-80" />
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic">Processing Intel...</h3>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Synthesizing clinical documentation via AI</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-[48px] p-16 shadow-premium flex flex-col items-center gap-12 w-full max-w-2xl relative overflow-hidden transition-all hover:shadow-2xl">
                    {/* Background Accents */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-primary via-blue-500 to-emerald-500 opacity-50" />
                    
                    <div className="relative">
                      <div className={cn("w-40 h-40 rounded-full flex items-center justify-center transition-all duration-700 shadow-inner", isRecording ? "bg-red-50" : "bg-orange-50")}>
                        <Mic2 size={64} className={cn(isRecording ? "text-red-500" : "text-orange-500")} />
                      </div>
                      {isRecording && (
                        <>
                          <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0, 0.1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-[-20px] rounded-full border border-red-500/20" />
                          <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.05, 0, 0.05] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute inset-[-40px] rounded-full border border-red-500/10" />
                        </>
                      )}
                    </div>
 
                    <div className="text-center space-y-2">
                      <div className="text-6xl font-black text-gray-900 tracking-tighter italic mb-4">{formatTime(time)}</div>
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]",
                        isRecording ? "bg-red-50 text-red-500 ring-1 ring-red-100" : "bg-orange-50 text-orange-500 ring-1 ring-orange-100"
                      )}>
                        {isRecording ? <><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Recording Live</> : "Consultation Paused"}
                      </div>
                    </div>
 
                    <div className="flex items-center gap-6 w-full">
                      {isRecording ? (
                        <Button variant="outline" size="lg" onClick={pauseRecording} className="flex-1 h-16 rounded-[24px] gap-3 text-lg font-bold border-gray-100 hover:bg-gray-50"><Pause size={22} fill="currentColor" />Pause</Button>
                      ) : (
                        <Button variant="primary" size="lg" onClick={resumeRecording} className="flex-1 h-16 rounded-[24px] gap-3 text-lg font-black"><Play size={22} fill="white" />Resume</Button>
                      )}
                      <Button variant="secondary" size="lg" onClick={stopRecording} className="flex-1 h-16 rounded-[24px] bg-red-50 border-red-100 text-red-600 hover:bg-red-100 gap-3 font-black text-lg shadow-xl shadow-red-500/5">
                        <Square size={20} fill="currentColor" /> Finalize
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results-ui"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl w-full mx-auto space-y-12 pb-24"
              >
                {/* Results Header */}
                <div className="flex items-end justify-between px-2">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none italic">Clinical Intelligence</h2>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">{activeSession.patient_name} • Consultation Data • {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {sessionResults?.status !== 'approved' && (
                      <Button onClick={handleApprove} disabled={isApproving} className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-12 px-6 rounded-xl font-bold text-white shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">
                         <CheckCircle2 size={18} />{isApproving ? "Approving..." : "Approve Notes"}
                      </Button>
                    )}
                    <Button variant="outline" className="gap-2 h-12 px-6 rounded-xl font-bold border-gray-100"><Plus size={18} />Edit</Button>
                    <Button variant="secondary" className="gap-2 h-12 px-6 rounded-xl font-black bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100 shadow-xl shadow-purple-500/10" onClick={() => handleViewDocument(`/api/v1/scribe/consultations/${sessionResults?.consultation_id}/letter`)}>
                      <FileText size={18} />GP Letter
                    </Button>
                    <Button className="gap-2 bg-gray-900 hover:bg-black h-12 px-8 rounded-xl font-black shadow-2xl" onClick={() => handleViewDocument(sessionResults?.report_pdf_url)}>
                      <Download size={18} />Archival PDF
                    </Button>
                  </div>

                </div>
 
                {/* SOAP Note Grid */}
                <div className="grid grid-cols-4 gap-6">
                  {(['subjective', 'objective', 'assessment', 'plan'] as const).map((key) => (
                    <div key={key} className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-premium group hover:border-accent-primary/20 transition-all hover:shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{key}</h4>
                        <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-accent-primary transition-colors">
                          <Plus size={12} />
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-[15px] font-medium italic">
                        "{sessionResults?.soap_note?.[key] || "Analytics pending for this segment."}"
                      </p>
                    </div>
                  ))}
                </div>
 
                {/* Diagnoses & Treatment */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-premium space-y-6">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Identified Diagnoses</h4>
                    <div className="flex flex-col gap-3">
                      {sessionResults?.diagnoses?.map((d: string, i: number) => (
                        <div key={i} className="px-4 py-3 bg-red-50/50 text-red-600 rounded-[20px] text-xs font-black border border-red-100 italic transition-all hover:scale-[1.02]">
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-premium space-y-6">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Therapeutic Roadmap</h4>
                    <ul className="space-y-4">
                      {sessionResults?.treatment_plan?.map((t: string, i: number) => (
                        <li key={i} className="text-[13px] text-gray-600 font-bold flex gap-4 leading-relaxed group">
                          <span className="w-2 h-2 bg-accent-primary rounded-full mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
 
                {/* Clinical Letter */}
                <div className="bg-white border border-gray-100 rounded-[56px] p-16 shadow-premium relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <Mic2 size={300} />
                  </div>
                  <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-12 text-center">Synthesized Clinical Letter</h4>
                  <div className="prose prose-slate max-w-3xl mx-auto font-serif text-gray-800 leading-[2.2] text-xl italic whitespace-pre-wrap scribe-letter relative z-10">
                    <ReactMarkdown>
                      {sessionResults?.clinical_letter}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
}
