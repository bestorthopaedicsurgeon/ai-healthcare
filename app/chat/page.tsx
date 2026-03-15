"use client";

import React, { useState, useEffect } from "react";
import { Send, Paperclip, FileText, Bot, User, X, Share2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SessionSidebar } from "@/components/layout/SessionSidebar";
import { ModuleNavigator } from "@/components/layout/ModuleNavigator";
import { usePatient } from "@/context/PatientContext";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { patients, activePatientId, activePatient, setActivePatientId } = usePatient();
  const [messages, setMessages] = useState<{id: string, role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<{name: string, size: string}[]>([]);

  // Reset messages when active patient changes
  useEffect(() => {
    setMessages([
      { id: "1", role: "assistant", content: `Hello! I'm your AI assistant for ${activePatient?.name}. You can ask me about their medical history, upload PDFs for analysis, or help with documentation.` }
    ]);
  }, [activePatientId]);

  const sidebarItems = patients.map(p => ({
    id: p.id,
    name: p.name,
    subtitle: "Clinical Inquiry",
    time: "Yesterday"
  }));

  const sendMessage = () => {
    if (!input.trim() && files.length === 0) return;
    const newMessages = [...messages, { id: Date.now().toString(), role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: `Analyzing history for ${activePatient?.name}...` }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfcfc]">
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
             {activePatient?.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              {activePatient?.name}
              <span className="text-gray-300">|</span>
              <span className="text-gray-400 font-normal">AI Chat</span>
            </h1>
          </div>
          <div className="ml-4"><ModuleNavigator /></div>
        </div>
        <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><Share2 size={20} /></button>
            <Button variant="ghost" size="sm" onClick={() => setMessages([])}>Clear Chat</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <SessionSidebar 
            items={sidebarItems} 
            activeId={activePatientId} 
            onSelect={setActivePatientId} 
        />

        <main className="flex-1 flex flex-col bg-white">
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
                        <textarea rows={1} placeholder={`Message AI about ${activePatient?.name}...`} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 pr-32 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all resize-none text-sm" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
                        <div className="absolute right-3 bottom-3 flex items-center gap-2">
                            <button onClick={() => setFiles([{ name: "report.pdf", size: "1MB" }])} className="p-2 text-gray-400 hover:text-gray-600 transition-all"><Paperclip size={20} /></button>
                            <button onClick={sendMessage} className="p-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-all shadow-lg shadow-accent-primary/20"><Send size={20} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
