"use client";

import React, { useState, useRef, useEffect } from "react";

import { usePatient } from "@/context/PatientContext";
import { useAuth } from "@/context/AuthContext";
import { Upload, Plus, FileText, CheckCircle2, ChevronRight, AlertCircle, Wand2, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { API_CONSTANTS } from "@/lib/api-constants";

import { useRouter } from "next/navigation";

export default function TriagePage() {
  const router = useRouter();
  const { apiFetch } = useAuth();
  const { 
    activeSession, 
    activeSessionId,
    activePatientId, 
    activePatient, 
    openSessionModal 
  } = usePatient();
  const [isUploading, setIsUploading] = useState(false);
  const [referralData, setReferralData] = useState<any | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingReferral, setIsLoadingReferral] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activeSession?.referral_id) {
       setReferralData(null);
       setIsExpanded(false);
       return;
    }

    const fetchSummary = async () => {
      setIsLoadingReferral(true);
      try {
        const response = await apiFetch(`/api/v1/triage/referrals/${activeSession.referral_id}/summary`);
        if (!response.ok) throw new Error("Failed to fetch referral summary");
        const data = await response.json();
        setReferralData(data);
        setIsExpanded(false);
      } catch (err) {
        console.error("Failed to load referral summary:", err);
      } finally {
        setIsLoadingReferral(false);
      }
    };

    fetchSummary();
  }, [activeSession?.referral_id, apiFetch]);

  const handleExpandDetails = async () => {
    if (!activeSession?.referral_id) return;
    setIsLoadingReferral(true);
    try {
      const response = await apiFetch(`/api/v1/triage/referrals/${activeSession.referral_id}`);
      if (!response.ok) throw new Error("Failed to fetch full referral");
      const data = await response.json();
      setReferralData(data);
      setIsExpanded(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load full triage data.");
    } finally {
      setIsLoadingReferral(false);
    }
  };

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiFetch(`${API_CONSTANTS.TRIAGE_REFERRALS_UPLOAD}?session_id=${activeSessionId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setReferralData(data);
      setIsExpanded(true); // Automatically expand on fresh upload
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to triage referral. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "N/A";
    
    let birthDate: Date;
    
    // Check for DD/MM/YYYY format
    const dmYMatch = dob.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmYMatch) {
      const day = parseInt(dmYMatch[1], 10);
      const month = parseInt(dmYMatch[2], 10) - 1; // Months are 0-indexed
      const year = parseInt(dmYMatch[3], 10);
      birthDate = new Date(year, month, day);
    } else {
      birthDate = new Date(dob);
    }

    if (isNaN(birthDate.getTime())) return "N/A";

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const triageCategories = [
    { id: 'for_surgery', label: 'For Surgery', color: '#e74c3c' },
    { id: 'possible_surgery', label: 'Possible Surgery', color: '#f39c12' },
    { id: 'not_for_surgery', label: 'Not For Surgery', color: '#27ae60' }
  ];

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
                        <FileText size={48} />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-blue-500">
                          <Plus size={16} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Referral Triage</h2>
                        <p className="text-sm text-gray-500 font-medium">
                           {activePatientId 
                             ? `Ready to triage a referral for ${activePatient?.full_name}?`
                             : "You need an active session to use this clinical tool."}
                        </p>
                    </div>
                    {activePatientId ? (
                        <div className="flex flex-col gap-3 w-full">
                          <Button 
                            onClick={() => openSessionModal("/triage")} 
                            variant="primary" 
                            className="rounded-2xl h-14 font-bold shadow-xl shadow-accent-primary/20 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                          >
                            <Activity size={18} />
                            Start Clinical Session for {activePatient?.full_name}
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
            ) : !referralData ? (
              <motion.div 
                key="upload-ui"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-3xl mx-auto mt-12 space-y-12"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic">Clinical Document Intelligence</h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Patient: {activeSession.patient_name}</p>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-[56px] p-24 flex flex-col items-center justify-center gap-10 cursor-pointer transition-all relative overflow-hidden group shadow-premium",
                    isUploading ? "border-blue-200 bg-blue-50/30" : "border-gray-200 hover:border-accent-primary hover:bg-gray-50/50"
                  )}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf" 
                    onChange={handleFileUpload} 
                  />
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-8">
                      <div className="w-20 h-20 border-4 border-accent-primary border-t-transparent rounded-full animate-spin shadow-2xl" />
                      <div className="text-center space-y-2">
                        <p className="font-black text-gray-900 text-2xl italic tracking-tight">Deciphering Referral...</p>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Running OCR and Clinical Analysis</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-24 h-24 rounded-[32px] bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <Upload size={44} className="stroke-[2.5]" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="font-black text-gray-900 text-2xl italic tracking-tight">Ingest Medical Document</p>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Support for Referral PDF, Scans, and Imaging Reports</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results-ui"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-5xl mx-auto space-y-10 pb-20 mt-6"
              >
                {/* Header Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Triage Category Radios */}
                  <div className="lg:col-span-8 bg-white border border-gray-100 rounded-[32px] p-8 shadow-premium transition-all">
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-6">Triage Category</div>
                    <div className="grid grid-cols-3 gap-4">
                      {triageCategories.map(cat => {
                        const isActive = referralData.triage_category === cat.id;
                        return (
                          <div 
                            key={cat.id} 
                            className={cn(
                              "flex flex-col gap-3 p-5 rounded-2xl border-2 transition-all relative overflow-hidden",
                              isActive ? "bg-opacity-10 border-opacity-100 shadow-xl shadow-black/5 transform scale-105" : "border-gray-100 bg-gray-50 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 cursor-pointer"
                            )}
                            style={{ 
                              borderColor: isActive ? cat.color : '',
                              backgroundColor: isActive ? `${cat.color}10` : ''
                            }}
                          >
                            <div className="flex items-center gap-3">
                                <div 
                                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-inner"
                                  style={{ borderColor: isActive ? cat.color : '#e5e7eb' }}
                                >
                                  {isActive && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />}
                                </div>
                                <span className={cn("font-bold text-sm tracking-tight", isActive ? "text-gray-900" : "text-gray-500")}>
                                  {cat.label}
                                </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-white border border-gray-100 rounded-[32px] p-8 shadow-premium flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 opacity-[0.03] text-emerald-500 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                       <CheckCircle2 size={160} />
                    </div>
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Agent Confidence</div>
                    <div className="text-5xl font-black text-emerald-500 tracking-tighter italic">
                      {(referralData.confidence_score * 100).toFixed(0)}% 
                      <span className="text-emerald-200 text-lg font-bold not-italic ml-2 uppercase tracking-widest">certainty</span>
                    </div>
                  </div>
                </div>
 
                {/* Reasoning Section */}
                <div className="bg-white border border-gray-100 rounded-[48px] p-12 shadow-premium relative overflow-hidden group hover:shadow-2xl transition-all">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-purple-500 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Wand2 size={160} />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] mb-6">
                    <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                      <CheckCircle2 size={14} />
                    </div>
                    Clinical Triage Logic
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-6 tracking-tight italic">Automated Assessment</h3>
                  
                  <div className="space-y-8 relative z-10">
                    <p className="text-gray-900 leading-relaxed text-2xl font-black italic">
                      "{referralData.triage_summary}"
                    </p>
                    <div className="h-px w-24 bg-gray-100" />
                    <p className="text-gray-500 leading-relaxed text-lg font-medium">
                      <span className="font-bold text-gray-400 block mb-2 uppercase text-xs tracking-widest">Reasoning Matrix</span>
                      {referralData.reasoning}
                    </p>
                  </div>
                </div>
 
                {/* Extracted Data Detail or Expansion Button */}
                {isExpanded ? (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 gap-10"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 font-black text-gray-900 uppercase text-[11px] tracking-widest border-b border-gray-100 pb-4 px-2">
                         <AlertCircle size={18} className="text-orange-500 stroke-[3]" />
                         Demographic Context
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-4 px-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Identified Subject</span>
                          <span className="text-[15px] font-black text-gray-900 italic tracking-tight">{referralData.extracted_data?.patient_name}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 px-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subject Age</span>
                          <span className="text-[15px] font-black text-gray-900 italic tracking-tight">{calculateAge(referralData.extracted_data?.patient_dob)} yrs</span>
                        </div>
                        <div className="flex justify-between items-center py-4 px-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Referring Dr.</span>
                          <span className="text-[15px] font-black text-gray-900 italic tracking-tight">{referralData.extracted_data?.referring_physician ?? "Unknown"}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 px-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Primary Complaint</span>
                          <span className="text-[15px] font-black text-gray-900 italic tracking-tight text-right shrink-0 ml-4 max-w-[200px] truncate" title={referralData.extracted_data?.primary_complaint}>
                            {referralData.extracted_data?.primary_complaint ?? "-"}
                          </span>
                        </div>
                        <button className="w-full flex justify-between items-center py-5 px-8 bg-gray-900 text-white rounded-3xl shadow-2xl hover:bg-black transition-all group scale-100 active:scale-95 mt-4"
                             onClick={() => handleViewDocument(referralData.report_pdf_url)}>
                          <span className="text-sm font-black uppercase tracking-[0.2em]">Examine Source Document</span>
                          <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform stroke-[3]" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 font-black text-gray-900 uppercase text-[11px] tracking-widest border-b border-gray-100 pb-4 px-2">
                        <FileText size={18} className="text-blue-500 stroke-[3]" />
                        Diagnostic Intelligence
                      </div>
                      <div className="bg-gray-50/50 rounded-[40px] p-8 space-y-6 border border-gray-100 italic font-medium shadow-inner h-full flex flex-col">
                        {referralData.extracted_data?.diagnostic_reports?.length > 0 ? (
                          <div className="space-y-6 flex-1">
                             {referralData.extracted_data.diagnostic_reports.map((report: any, i: number) => (
                                <div key={i} className="space-y-3 pb-6 border-b border-gray-200/50 last:border-0 last:pb-0">
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest not-italic flex items-center gap-2">
                                     <div className="w-2 h-2 rounded-full bg-blue-500" />
                                     {report.report_type} • {report.body_part_or_test}
                                  </span>
                                  <p className="text-gray-700 text-base leading-[1.8]">
                                    {report.findings}
                                  </p>
                                </div>
                             ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center flex-1 space-y-3 opacity-50 py-10">
                            <AlertCircle size={32} className="text-gray-400" />
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest not-italic">No structured reports identified</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <Button 
                    onClick={handleExpandDetails} 
                    disabled={isLoadingReferral} 
                    className="w-full h-16 rounded-[32px] bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 font-black tracking-widest uppercase text-xs border-2 border-dashed border-gray-200 transition-all"
                  >
                     {isLoadingReferral ? (
                       <span className="flex items-center gap-3"><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Fetching Sub-Clinical Analysis...</span>
                     ) : (
                       "Expand Full Extracted Medical Records"
                     )}
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
}
