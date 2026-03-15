"use client";

import React from "react";
import { usePatient } from "@/context/PatientContext";
import { Phone, Search, MoreHorizontal, Play, Download, Clock, Share2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SessionSidebar } from "@/components/layout/SessionSidebar";
import { ModuleNavigator } from "@/components/layout/ModuleNavigator";
import { cn } from "@/lib/utils";

export default function VoiceAgentPage() {
  const { patients, activePatientId, activePatient, setActivePatientId } = usePatient();

  const sidebarItems = patients.map(p => ({
    id: p.id,
    name: p.name,
    subtitle: "Voice Intake",
    time: "10:30 AM"
  }));

  return (
    <div className="flex flex-col h-full bg-[#fcfcfc]">
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold">
             {activePatient?.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              {activePatient?.name}
              <span className="text-gray-300">|</span>
              <span className="text-gray-400 font-normal">AI Voice Agent</span>
            </h1>
          </div>
          <div className="ml-4"><ModuleNavigator /></div>
        </div>
        <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><Share2 size={20} /></button>
            <Button variant="secondary" className="gap-2"><Plus size={18} />New Call</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <SessionSidebar 
            items={sidebarItems} 
            activeId={activePatientId} 
            onSelect={setActivePatientId} 
        />

        <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Transcriptions for {activePatient?.name}</h2>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search calls..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20" />
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                        <Phone size={32} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">No calls transcribed yet for {activePatient?.name}</h4>
                        <p className="text-gray-500 text-sm">When this patient calls, the AI transcription will appear here.</p>
                    </div>
                    <Button variant="outline" className="mt-2">Simulate Incoming Call</Button>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
