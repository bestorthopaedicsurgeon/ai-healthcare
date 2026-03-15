"use client";

import React, { useState, useRef } from "react";
import { MoreVertical, Share2, Plus, Play, ChevronDown, Wand2, Copy, Mic2, Pause, Square, Power } from "lucide-react";
import { usePatient } from "@/context/PatientContext";
import { Button } from "@/components/ui/Button";
import { SessionSidebar } from "@/components/layout/SessionSidebar";
import { ModuleNavigator } from "@/components/layout/ModuleNavigator";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ScribePage() {
  const { patients, activePatientId, activePatient, setActivePatientId, patientSessions, setScribeStatus } = usePatient();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  
  // Real-time API States
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [clinicalItems, setClinicalItems] = useState<string[]>([]);
  const [runningContext, setRunningContext] = useState<string>("");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const sessionStatus = patientSessions[activePatientId] || 'idle';

  const sidebarItems = patients.map(p => ({
    id: p.id,
    name: p.name,
    subtitle: patientSessions[p.id] === 'active' ? "Ongoing Consultation" : 
              patientSessions[p.id] === 'finished' ? "Completed Session" : "No active session",
    time: patientSessions[p.id] === 'active' ? "Now" : ""
  }));

  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      // Expected structure from API: { text: string, clinical_items: string[], running_context: string }
      if (data.text) setTranscription(prev => prev + " " + data.text);
      if (data.clinical_items) setClinicalItems(data.clinical_items);
      if (data.running_context) setRunningContext(data.running_context);
    } catch (err) {
      console.error("Error parsing WS message", err);
    }
  };

  const startRecording = async () => {
    try {
      // 1. Start Consultation via API
      const response = await fetch("https://healthcare-ai-backend-723h.onrender.com/api/v1/scribe/consultations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          physician_id: "DR-CLARK-001", // Placeholder
          patient_name: activePatient?.name || "Unknown Patient",
          patient_dob: "01/05/1968", // Mock
          primary_complaint: "Routine checkup", 
          priority: "B",
          known_symptoms: [],
          known_medications: [],
          allergies: [],
          medical_history_summary: "No major history.",
          additional_context: "AI Healthcare MVP Session"
        })
      });

      const data = await response.json();
      const { consultation_id, websocket_url } = data;
      setConsultationId(consultation_id);

      // 2. Setup WebSocket
      const wsUrl = `wss://healthcare-ai-backend-723h.onrender.com${websocket_url}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => console.log("WebSocket Connected");
      ws.onmessage = handleWebSocketMessage;
      ws.onerror = (err) => console.error("WebSocket Error", err);
      ws.onclose = () => console.log("WebSocket Closed");

      // 3. Start MediaRecorder
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          // Send audio chunk to WebSocket
          ws.send(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        if (ws.readyState === WebSocket.OPEN) ws.close();
      };

      // Start recording in slices (e.g., every 1 second) to stream
      mediaRecorder.start(1000); 
      
      setIsRecording(true);
      setIsPaused(false);
      setScribeStatus(activePatientId, 'active');
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start session:", err);
      alert("Microphone or API access failed. Please check permissions.");
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
            <Button variant="secondary" className="gap-2" onClick={() => setScribeStatus(activePatientId, 'idle')}><Power size={18} />Reset</Button>
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
                            <p className="text-gray-500">Begin recording your consultation with {activePatient?.name}.</p>
                        </div>
                        <button 
                            onClick={startRecording}
                            className="w-full py-4 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-2xl font-bold shadow-lg shadow-accent-primary/30 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Play size={24} fill="white" />
                            Start Recording
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="session-ui"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl w-full h-full space-y-6 flex flex-col mx-auto"
                    >
                        {/* Status Bar */}
                        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-3 h-3 rounded-full",
                                    sessionStatus === 'active' ? (isRecording ? "bg-red-500 animate-pulse" : "bg-orange-400") : "bg-green-500"
                                )} />
                                <div>
                                    <div className="text-sm font-bold text-gray-900">
                                        {sessionStatus === 'active' ? (isRecording ? "Recording Live" : "Paused") : "Session Completed"}
                                    </div>
                                    {sessionStatus === 'active' && <div className="text-2xl font-mono text-gray-400">{formatTime(time)}</div>}
                                </div>
                            </div>
                            
                            {sessionStatus === 'active' && (
                                <div className="flex items-center gap-3">
                                    {isRecording ? (
                                        <Button variant="outline" onClick={pauseRecording} className="gap-2"><Pause size={18} />Pause</Button>
                                    ) : (
                                        <Button variant="primary" onClick={resumeRecording} className="gap-2"><Play size={18} />Resume</Button>
                                    )}
                                    <Button variant="secondary" onClick={stopRecording} className="bg-red-50 border-red-100 text-red-600 hover:bg-red-100 gap-2 font-bold">
                                        <Square size={16} fill="currentColor" /> Finish Session
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex gap-6 min-h-0">
                            {/* Live Transcript */}
                            <div className="flex-[2] bg-white border border-gray-100 rounded-3xl p-8 shadow-sm overflow-y-auto space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                    <Wand2 size={14} className="text-purple-500" />
                                    {sessionStatus === 'active' ? "Real-time AI Transcription" : "Final Consultation Summary"}
                                </div>
                                
                                <div className="space-y-4">
                                    {transcription ? (
                                        <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 leading-relaxed text-gray-700">
                                            {transcription}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-400 italic">
                                            {isRecording ? "Listening for audio..." : "Transcription will appear here..."}
                                        </div>
                                    )}

                                    {isRecording && (
                                        <div className="flex items-center gap-2 text-blue-500 italic text-sm animate-pulse p-4">
                                            <Mic2 size={14} /> Processing live audio<span className="flex gap-1"><span className="w-1 h-1 bg-blue-500 rounded-full" /><span className="w-1 h-1 bg-blue-500 rounded-full" /><span className="w-1 h-1 bg-blue-500 rounded-full" /></span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Clinical Intelligence Sidebar */}
                            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                                {/* Running Context */}
                                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Running Context</h4>
                                    <p className="text-sm text-gray-600 italic">
                                        {runningContext || "Identifying consultation focus..."}
                                    </p>
                                </div>

                                {/* Clinical Items */}
                                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Clinical Items</h4>
                                    {clinicalItems.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {clinicalItems.map((item, i) => (
                                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium border border-blue-100">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">No clinical items detected yet...</p>
                                    )}
                                </div>
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
