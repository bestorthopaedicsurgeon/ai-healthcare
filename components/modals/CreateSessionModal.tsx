"use client";

import React, { useState, useEffect } from "react";
import { X, Play, FileText, User, Calendar, Phone, Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { usePatient, Patient } from "@/context/PatientContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function CreateSessionModal() {
  const router = useRouter();
  const { 
    createSession, 
    activePatient, 
    patients, 
    setActivePatientId,
    isSessionModalOpen,
    closeSessionModal,
    sessionRedirectPath
  } = usePatient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  const [formData, setFormData] = useState({
    patient_name: "",
    patient_dob: "",
    patient_phone: "",
    notes: ""
  });

  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.reference_number.toString().includes(search)
  );

  useEffect(() => {
    if (activePatient && isSessionModalOpen) {
      setFormData({
        patient_name: activePatient.full_name,
        patient_dob: activePatient.dob,
        patient_phone: activePatient.phone,
        notes: ""
      });
      setShowSelector(false);
    } else if (!activePatient && isSessionModalOpen) {
        setShowSelector(true);
    }
  }, [activePatient, isSessionModalOpen]);

  const handleSelectPatient = (patient: Patient) => {
    setActivePatientId(patient.id);
    setFormData({
        patient_name: patient.full_name,
        patient_dob: patient.dob,
        patient_phone: patient.phone,
        notes: ""
    });
    setShowSelector(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) {
        setError("Please select a patient first");
        setShowSelector(true);
        return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createSession(formData);
      closeSessionModal();
      if (sessionRedirectPath) {
          router.push(sessionRedirectPath);
      }
    } catch (err: any) {
      setError(err.message || "Failed to start session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isSessionModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSessionModal}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-[48px] shadow-2xl z-[101] overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div className="p-10 pb-8 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-[24px] flex items-center justify-center text-emerald-600 shadow-inner">
                  <Play size={32} className="ml-1 fill-current" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Start New Session</h2>
                  <p className="text-sm text-gray-500 font-medium">Initialize AI clinical processing</p>
                </div>
              </div>
              <button 
                onClick={closeSessionModal}
                className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900 active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-[24px] font-bold flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              {/* Patient Context/Selector */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Target Patient</label>
                
                {activePatient && !showSelector ? (
                    <div className="bg-gray-50/50 rounded-[32px] p-6 border border-gray-100 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-accent-primary font-bold text-xl">
                                {activePatient.full_name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{activePatient.full_name}</h3>
                                <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                    <span>#{activePatient.reference_number}</span>
                                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                    <span>{activePatient.dob}</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setShowSelector(true)}
                            className="p-2 text-gray-400 hover:text-accent-primary transition-colors hover:bg-white rounded-xl shadow-sm opacity-0 group-hover:opacity-100"
                        >
                            Change
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3 relative">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent-primary transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by name or Reference ID..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-[28px] py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-accent-primary/10 transition-all font-medium"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setShowSelector(true);
                                }}
                                onFocus={() => setShowSelector(true)}
                            />
                        </div>

                        {showSelector && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-[32px] shadow-2xl z-[110] overflow-hidden max-h-[280px] overflow-y-auto custom-scrollbar"
                            >
                                {filteredPatients.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 italic text-sm">No patients found</div>
                                ) : filteredPatients.slice(0, 5).map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => handleSelectPatient(p)}
                                        className="w-full text-left p-4 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0 group transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-accent-primary/10 group-hover:text-accent-primary flex items-center justify-center font-bold transition-all">
                                                {p.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{p.full_name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">ID: #{p.reference_number} • {p.dob}</p>
                                            </div>
                                        </div>
                                        <ChevronDown size={14} className="text-gray-300 -rotate-90" />
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>
                )}
              </div>

              {/* Consultation Notes */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Session Context / Reason</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-4 text-gray-400 group-focus-within:text-accent-primary transition-colors" size={20} />
                  <textarea
                    rows={4}
                    placeholder="Briefly describe the purpose of this visit (e.g., Post-op follow up, knee evaluation...)"
                    className="w-full bg-gray-50 border border-gray-100 rounded-[32px] py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-accent-primary/10 transition-all font-medium resize-none shadow-inner"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex items-center gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-16 rounded-[28px] font-bold text-gray-500 hover:text-gray-900 border-gray-100"
                  onClick={closeSessionModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-16 rounded-[28px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-600/20 gap-3 group"
                  disabled={isSubmitting || (!activePatient && !showSelector)}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Start Session <Play size={20} className="fill-current group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
