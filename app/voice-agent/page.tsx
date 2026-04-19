"use client";

import React from "react";
import { usePatient } from "@/context/PatientContext";
import { Phone, Search, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export default function VoiceAgentPage() {
  const { activeSession } = usePatient();

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
            ) : (
                <motion.div 
                    key="voice-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-4xl mx-auto space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Transcriptions for {activeSession.patient_name}</h2>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Search calls..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20" />
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                            <Phone size={32} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">No calls transcribed yet for {activeSession.patient_name}</h4>
                            <p className="text-gray-500 text-sm">When this patient calls, the AI transcription will appear here.</p>
                        </div>
                        <Button variant="outline" className="mt-2">Simulate Incoming Call</Button>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
    </div>
  );
}
