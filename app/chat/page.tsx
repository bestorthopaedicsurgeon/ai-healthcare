"use client";

import React, { useState, useEffect } from "react";
import { Send, Paperclip, FileText, Bot, User, X, Activity } from "lucide-react";
import { usePatient } from "@/context/PatientContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function ChatPage() {
  const router = useRouter();
  const { activeSession, activeSessionId, activePatientId } = usePatient();
  const [messages, setMessages] = useState<{id: string, role: "user" | "assistant", content: string}[]>([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<{name: string, size: string}[]>([]);

  // Reset messages when active session changes
  useEffect(() => {
    if (activeSession) {
        setMessages([
          { id: "1", role: "assistant", content: `Hello! I'm your AI assistant for ${activeSession.patient_name}. You can ask me about their medical history, upload PDFs for analysis, or help with documentation.` }
        ]);
    } else {
        setMessages([]);
    }
  }, [activeSessionId]);

  const sendMessage = () => {
    if (!input.trim() && files.length === 0) return;
    const newMessages: any[] = [...messages, { id: Date.now().toString(), role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: `Analyzing history for ${activeSession?.patient_name}...` }]);
    }, 1000);
  };

  return (
    <div className="min-h-full flex flex-col bg-white overflow-hidden">
            <AnimatePresence mode="wait">
            {!activeSession ? (
                <motion.div
                    key="no-session"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto"
                >
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
                        <Bot size={40} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">No active session selected</h2>
                        <p className="text-sm text-gray-500 mt-2">
                           You need an active session to use clinical tools. 
                           {activePatientId ? "Please start a session from the patient profile." : "Please select a patient from the sidebar."}
                        </p>
                    </div>
                    {activePatientId ? (
                        <Button onClick={() => router.push(`/patients/${activePatientId}`)} variant="primary" className="rounded-xl px-8 h-12 shadow-lg shadow-accent-primary/20 text-white bg-accent-primary">Go to Patient Profile</Button>
                    ) : (
                        <Button onClick={() => router.push(`/dashboard`)} variant="secondary">Browse All Patients</Button>
                    )}
                </motion.div>
            ) : (
                <motion.div 
                    key="chat-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        <div className="max-w-3xl mx-auto space-y-6">
                            {messages.map((msg) => (
                                <div key={msg.id} className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "")}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                        msg.role === "assistant" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                        {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                                    </div>
                                    <div className={cn(
                                        "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all",
                                        msg.role === "assistant" ? "bg-gray-50 text-gray-800" : "bg-accent-primary text-white"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-white">
                        <div className="max-w-3xl mx-auto space-y-4">
                            {files.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium group">
                                            <FileText size={14} className="text-gray-400" />
                                            <span>{file.name}</span>
                                            <button onClick={() => setFiles(f => f.filter((_, idx) => idx !== i))} className="hover:text-red-500"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="relative group">
                                <textarea rows={1} placeholder={`Message AI about ${activeSession.patient_name}...`} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 pr-32 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all resize-none text-sm" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
                                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                    <button onClick={() => setFiles([{ name: "report.pdf", size: "1MB" }])} className="p-2 text-gray-400 hover:text-gray-600 transition-all"><Paperclip size={20} /></button>
                                    <button onClick={sendMessage} className="p-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-all shadow-lg shadow-accent-primary/20"><Send size={20} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
    </div>
  );
}
