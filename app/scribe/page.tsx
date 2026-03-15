"use client";

import React, { useState, useRef } from "react";
import { MoreVertical, Share2, Plus, Play, ChevronDown, Wand2, Copy, Mic2, Pause, Square, Power, Download } from "lucide-react";
import { usePatient } from "@/context/PatientContext";
import { Button } from "@/components/ui/Button";
import { SessionSidebar } from "@/components/layout/SessionSidebar";
import { ModuleNavigator } from "@/components/layout/ModuleNavigator";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { API_CONSTANTS } from "@/lib/api-constants";
import ReactMarkdown from "react-markdown";

export default function ScribePage() {
  const { patients, activePatientId, activePatient, setActivePatientId, patientSessions, setScribeStatus } = usePatient();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [time, setTime] = useState(0);

  // Results State
  const [sessionResults, setSessionResults] = useState<any | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const sessionStatus = patientSessions[activePatientId] || 'idle';

  const sidebarItems = patients.map(p => ({
    id: p.id,
    name: p.name,
    subtitle: patientSessions[p.id] === 'active' ? "Ongoing Consultation" :
      patientSessions[p.id] === 'finished' ? "Completed Session" : "No active session",
    time: patientSessions[p.id] === 'active' ? "Now" : ""
  }));

  const uploadAudio = async (audioBlob: Blob) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "consultation.webm");
      formData.append("physician_id", "DR-CLARK-001"); // Placeholder
      formData.append("patient_name", activePatient?.name || "Unknown");
      formData.append("patient_dob", "01/05/1968"); // Mock
      formData.append("primary_complaint", "Routine checkup");

      const response = await fetch("https://healthcare-ai-backend-723h.onrender.com/api/v1/scribe/consultations/upload-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const results = await response.json();
      setSessionResults(results);
      setScribeStatus(activePatientId, 'finished');
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload audio. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
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
      setScribeStatus(activePatientId, 'active');
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
    setScribeStatus(activePatientId, 'finished');
    if (timerRef.current) clearInterval(timerRef.current);
    setTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfcfc]">
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            {activePatient?.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              {activePatient?.name}
              <span className="text-gray-300">|</span>
              <span className="text-gray-400 font-normal">Scribe</span>
            </h1>
          </div>
          <div className="ml-4"><ModuleNavigator /></div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><Share2 size={20} /></button>
          <Button variant="secondary" className="gap-2" onClick={() => {
            setScribeStatus(activePatientId, 'idle');
            setSessionResults(null);
          }}><Power size={18} />Reset</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <SessionSidebar
          items={sidebarItems}
          activeId={activePatientId}
          onSelect={setActivePatientId}
        />

        <main className="flex-1 flex flex-col p-8 overflow-y-auto bg-white">
          <AnimatePresence mode="wait">
            {sessionStatus === 'idle' ? (
              <motion.div
                key="start-ui"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-md w-full text-center space-y-8 p-12 mx-auto mt-20 bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-blue-500/5"
              >
                <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto text-blue-500 mb-6">
                  <Mic2 size={48} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Start Scribe Session</h2>
                  <p className="text-gray-500">Record your consultation. The AI will generate structured clinical notes automatically.</p>
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
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">Processing Consultation...</h3>
                      <p className="text-gray-500">Transcribing and generating clinical documentation.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-3xl p-12 shadow-sm flex flex-col items-center gap-8 w-full max-w-xl">
                    <div className="relative">
                      <div className={cn("w-32 h-32 rounded-full flex items-center justify-center", isRecording ? "bg-red-50" : "bg-orange-50")}>
                        <Mic2 size={48} className={cn(isRecording ? "text-red-500" : "text-orange-500")} />
                      </div>
                      {isRecording && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 rounded-full border-2 border-red-500/20" />}
                    </div>

                    <div className="text-center">
                      <div className="text-4xl font-mono text-gray-900 mb-2">{formatTime(time)}</div>
                      <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        {isRecording ? "Recording Live" : "Paused"}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full">
                      {isRecording ? (
                        <Button variant="outline" size="lg" onClick={pauseRecording} className="flex-1 h-14 rounded-2xl gap-2 text-lg"><Pause size={20} />Pause</Button>
                      ) : (
                        <Button variant="primary" size="lg" onClick={resumeRecording} className="flex-1 h-14 rounded-2xl gap-2 text-lg"><Play size={20} />Resume</Button>
                      )}
                      <Button variant="secondary" size="lg" onClick={stopRecording} className="flex-1 h-14 rounded-2xl bg-red-50 border-red-100 text-red-600 hover:bg-red-100 gap-2 font-bold text-lg">
                        <Square size={18} fill="currentColor" /> Finish
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
                className="max-w-5xl w-full mx-auto space-y-8 pb-12"
              >
                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Consultation Documentation</h2>
                    <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2"><Plus size={18} />Edit Notes</Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => window.open(`${API_CONSTANTS.BASE_URL}${sessionResults?.report_pdf_url}`, '_blank')}>
                      <Download size={18} />Download PDF
                    </Button>
                  </div>
                </div>

                {/* SOAP Note Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {(['subjective', 'objective', 'assessment', 'plan'] as const).map((key) => (
                    <div key={key} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{key}</h4>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {sessionResults?.soap_note?.[key] || "No data generated for this section."}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Diagnoses & Treatment */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diagnoses</h4>
                    <div className="flex flex-col gap-2">
                      {sessionResults?.diagnoses?.map((d: string, i: number) => (
                        <div key={i} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100">
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Treatment Plan</h4>
                    <ul className="space-y-2">
                      {sessionResults?.treatment_plan?.map((t: string, i: number) => (
                        <li key={i} className="text-xs text-gray-600 flex gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1 shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prescriptions</h4>
                    <ul className="space-y-2">
                      {sessionResults?.prescriptions?.map((p: string, i: number) => (
                        <li key={i} className="text-xs text-gray-600 flex gap-2 italic">
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Clinical Letter */}
                <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm border-t-4 border-t-blue-500">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Generated Clinical Letter</h4>
                  <div className="prose prose-blue max-w-3xl mx-auto font-serif text-gray-800 leading-loose whitespace-pre-wrap scribe-letter">
                    <ReactMarkdown>
                      {sessionResults?.clinical_letter}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
