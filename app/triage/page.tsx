"use client";

import React, { useState, useRef, useEffect } from "react";

import { usePatient } from "@/context/PatientContext";
import { useAuth } from "@/context/AuthContext";
import { Upload, Plus, FileText, CheckCircle2, ChevronRight, AlertCircle, Wand2, Activity, AlertTriangle, ShieldAlert } from "lucide-react";
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
  const [uploadMode, setUploadMode] = useState<'document' | 'raw'>('document');
  const [manualFormData, setManualFormData] = useState({
    patient_name: "Rabi ahmed",
    patient_dob: "1990-01-01",
    patient_phone: "+61412345678",
    source_type: "email",
    raw_content: "Patient presents with severe left knee pain for 6 months. Requesting orthopaedic consult."
  });

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

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const response = await apiFetch(API_CONSTANTS.TRIAGE_REFERRALS_SUBMIT, {
        method: "POST",
        body: JSON.stringify(manualFormData)
      });
      if (!response.ok) throw new Error("Manual submit failed");

      const data = await response.json();
      setReferralData(data);
      setIsExpanded(true);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to triage manual data. Please try again.");
    } finally {
      setIsUploading(false);
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
    { id: 'urgent', label: 'Urgent', meaning: 'Within days', color: '#e74c3c' },
    { id: 'semi_urgent', label: 'Semi Urgent', meaning: '1-2 weeks', color: '#f39c12' },
    { id: 'routine', label: 'Routine', meaning: 'Standard wait', color: '#27ae60' }
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
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">GP Referral Intake</h2>
                        <p className="text-sm text-gray-500 font-medium">
                           {activePatientId 
                             ? `Ready to process a GP referral for ${activePatient?.full_name}?`
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
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Triaging Patient Referral</p>
                </div>

                <div className="flex items-center justify-center p-1 bg-gray-100 rounded-full max-w-sm mx-auto">
                   <button 
                     onClick={() => setUploadMode('document')}
                     className={cn("flex-1 py-3 px-6 rounded-full text-sm font-bold transition-all", uploadMode === 'document' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                   >
                     Upload PDF
                   </button>
                   <button 
                     onClick={() => setUploadMode('raw')}
                     className={cn("flex-1 py-3 px-6 rounded-full text-sm font-bold transition-all", uploadMode === 'raw' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                   >
                     Raw Data Entry
                   </button>
                </div>

                {uploadMode === 'document' ? (
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
                ) : (
                    <form onSubmit={handleManualSubmit} className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-premium space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Patient Name</label>
                                <input required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-accent-primary/10 transition-all" value={manualFormData.patient_name} onChange={e => setManualFormData({...manualFormData, patient_name: e.target.value})} placeholder="Jane Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Date of Birth</label>
                                <input required type="date" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-accent-primary/10 transition-all" value={manualFormData.patient_dob} onChange={e => setManualFormData({...manualFormData, patient_dob: e.target.value})} />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Phone Number</label>
                                <input required type="tel" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-accent-primary/10 transition-all" value={manualFormData.patient_phone} onChange={e => setManualFormData({...manualFormData, patient_phone: e.target.value})} placeholder="+61400000000" />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Raw Clinical Data</label>
                                <textarea required rows={5} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-5 py-5 text-sm font-medium text-gray-700 outline-none focus:ring-4 focus:ring-accent-primary/10 resize-none transition-all" value={manualFormData.raw_content} onChange={e => setManualFormData({...manualFormData, raw_content: e.target.value})} placeholder="Paste email or text here..." />
                            </div>
                        </div>
                        <Button type="submit" disabled={isUploading} className="w-full h-16 rounded-[24px] font-black text-sm uppercase tracking-widest bg-gray-900 hover:bg-black text-white shadow-xl mt-4">
                            {isUploading ? "Analyzing Data..." : "Submit Raw Data For Triage"}
                        </Button>
                    </form>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="results-ui"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-5xl mx-auto space-y-10 pb-20 mt-6"
              >
                {/* Flagged Referral Alert */}
                {referralData.requires_manual_review && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-100 rounded-[32px] p-8 flex items-start gap-6 shadow-xl shadow-red-500/5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-red-600 pointer-events-none">
                      <ShieldAlert size={120} />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white border border-red-100 flex items-center justify-center text-red-500 shrink-0 shadow-sm">
                      <AlertTriangle size={28} className="stroke-[2.5]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-red-900 tracking-tight italic">Flagged for Manual Review</h3>
                      <p className="text-red-700/80 font-medium text-sm leading-relaxed max-w-2xl">
                        {referralData.review_reason || "This referral contains insufficient or contradictory clinical data that requires specialist oversight before categorization."}
                      </p>
                    </div>
                  </motion.div>
                )}

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
                              "flex flex-col gap-3 p-5 rounded-2xl border-2 transition-all relative overflow-visible group",
                              isActive ? "bg-opacity-10 border-opacity-100 shadow-xl shadow-black/5 transform scale-105" : "border-gray-100 bg-gray-50 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 cursor-pointer"
                            )}
                            style={{ 
                              borderColor: isActive ? cat.color : '',
                              backgroundColor: isActive ? `${cat.color}10` : ''
                            }}
                          >
                            <div className="flex items-center gap-3 relative z-10">
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
                            
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl flex items-center justify-center">
                                {cat.meaning}
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-white border border-gray-100 rounded-[32px] p-8 shadow-premium flex flex-col justify-center relative overflow-hidden group">
                    <div className={cn(
                      "absolute -right-10 -bottom-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none",
                      referralData.confidence_score < 0.4 ? "text-red-500" : referralData.confidence_score < 0.7 ? "text-orange-500" : "text-emerald-500"
                    )}>
                       <CheckCircle2 size={160} />
                    </div>
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Agent Confidence</div>
                    <div className={cn(
                      "text-5xl font-black tracking-tighter italic",
                      referralData.confidence_score < 0.4 ? "text-red-500" : referralData.confidence_score < 0.7 ? "text-orange-500" : "text-emerald-500"
                    )}>
                      {(referralData.confidence_score * 100).toFixed(0)}% 
                      <span className={cn(
                        "text-lg font-bold not-italic ml-2 uppercase tracking-widest",
                        referralData.confidence_score < 0.4 ? "text-red-200" : referralData.confidence_score < 0.7 ? "text-orange-200" : "text-emerald-200"
                      )}>
                        {referralData.confidence_score < 0.4 ? "Caution" : referralData.confidence_score < 0.7 ? "Moderate" : "Reliable"}
                      </span>
                    </div>
                  </div>
                </div>
 
                {/* Reasoning Section */}
                <div className="bg-white border border-gray-100 rounded-[48px] p-12 shadow-premium relative overflow-hidden group hover:shadow-2xl transition-all">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-purple-500 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Wand2 size={160} />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] mb-4">
                    <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Wand2 size={14} />
                    </div>
                    Clinical Intelligence
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">AI Generated Summary</h3>
                  
                  <div className="space-y-8 relative z-10">
                    <div className="relative">
                      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-purple-100 rounded-full" />
                      <p className="text-gray-800 leading-relaxed text-xl font-medium italic pl-4">
                        "{referralData.triage_summary}"
                      </p>
                    </div>
                    <div className="h-px w-24 bg-gray-100" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <p className="text-gray-500 leading-relaxed text-lg font-medium">
                            <span className="font-bold text-gray-400 block mb-2 uppercase text-xs tracking-widest">Reasoning Matrix</span>
                            {referralData.reasoning}
                            </p>
                        </div>
                        
                        {referralData.extracted_data?.urgency_indicators?.length > 0 && (
                            <div className="bg-gray-50/50 rounded-[32px] p-8 border border-gray-100 space-y-4">
                                <span className="font-bold text-gray-400 block uppercase text-xs tracking-widest">Clinical Urgency Factors</span>
                                <div className="space-y-3">
                                    {referralData.extracted_data.urgency_indicators.map((indicator: string, i: number) => (
                                        <div key={i} className="flex gap-3 text-sm font-bold text-gray-700 italic">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                                            {indicator}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {referralData.extracted_data?.risk_factors?.length > 0 && (
                            <div className="bg-orange-50/30 rounded-[32px] p-8 border border-orange-100/50 space-y-4">
                                <span className="font-bold text-orange-400 block uppercase text-xs tracking-widest">Risk Factors</span>
                                <div className="space-y-3">
                                    {referralData.extracted_data.risk_factors.map((risk: string, i: number) => (
                                        <div key={i} className="flex gap-3 text-sm font-bold text-orange-700 italic">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                                            {risk}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
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
                          <span className="text-[15px] font-black text-gray-900 italic tracking-tight">{referralData.extracted_data?.patient_name || "Unknown Patient"}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 px-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subject Age</span>
                          <span className="text-[15px] font-black text-gray-900 italic tracking-tight">
                            {referralData.extracted_data?.patient_dob ? `${calculateAge(referralData.extracted_data?.patient_dob)} yrs` : "Not Identified"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-4 px-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Referring Dr.</span>
                          <span className="text-[15px] font-black text-gray-900 italic tracking-tight">{referralData.extracted_data?.referring_physician || "Not Specified"}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 px-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Primary Complaint</span>
                          <span className="text-[15px] font-black text-gray-900 italic tracking-tight text-right shrink-0 ml-4 max-w-[200px] truncate" title={referralData.extracted_data?.primary_complaint}>
                            {referralData.extracted_data?.primary_complaint || "None Listed"}
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
