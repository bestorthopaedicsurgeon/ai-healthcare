"use client";

import React, { useState, useRef } from "react";
import { usePatient } from "@/context/PatientContext";
import { FileSpreadsheet, Upload, Share2, Plus, FileText, CheckCircle2, ChevronRight, AlertCircle, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SessionSidebar } from "@/components/layout/SessionSidebar";
import { ModuleNavigator } from "@/components/layout/ModuleNavigator";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { API_CONSTANTS } from "@/lib/api-constants";

export default function TriagePage() {
  const { patients, activePatientId, activePatient, setActivePatientId } = usePatient();
  const [isUploading, setIsUploading] = useState(false);
  const [referralData, setReferralData] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sidebarItems = patients.map(p => ({
    id: p.id,
    name: p.name,
    subtitle: "Referral Intake",
    time: referralData && p.id === activePatientId ? "Just now" : ""
  }));

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_CONSTANTS.BASE_URL}${API_CONSTANTS.TRIAGE_REFERRALS_UPLOAD}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setReferralData(data);
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

  const getSeverityLabel = (priority: string) => {
    switch (priority) {
      case 'A': return { label: 'High', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
      case 'B': return { label: 'Moderate', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' };
      case 'C': return { label: 'Low', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
      default: return { label: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfcfc]">
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
             {activePatient?.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              {activePatient?.name}
              <span className="text-gray-300">|</span>
              <span className="text-gray-400 font-normal">Triage Referral</span>
            </h1>
          </div>
          <div className="ml-4"><ModuleNavigator /></div>
        </div>
        <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><Share2 size={20} /></button>
            <Button variant="secondary" className="gap-2" onClick={() => setReferralData(null)}><Plus size={18} />Reset</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <SessionSidebar 
            items={sidebarItems} 
            activeId={activePatientId} 
            onSelect={setActivePatientId} 
        />

        <main className="flex-1 overflow-y-auto bg-white p-8">
          <AnimatePresence mode="wait">
            {!referralData ? (
              <motion.div 
                key="upload-ui"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-2xl mx-auto mt-12"
              >
                <div className="text-center space-y-4 mb-12">
                  <h2 className="text-3xl font-bold text-gray-900">Referral Triage GPT</h2>
                  <p className="text-gray-500 max-w-lg mx-auto">Upload a medical referral PDF. Our AI will extract key data, calculate priority, and summarize the clinical reasoning instantly.</p>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-[40px] p-16 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all",
                    isUploading ? "border-blue-200 bg-blue-50/30" : "border-gray-200 hover:border-accent-primary hover:bg-slate-50/50 group"
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
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
                      <div className="text-center">
                        <p className="font-bold text-gray-900 text-lg">Triaging Referral...</p>
                        <p className="text-gray-500">Reading clinical context and extracting data.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload size={40} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 text-xl mb-1">Upload Referral PDF</p>
                        <p className="text-gray-500">Drag and drop or click to browse</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results-ui"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8 pb-12"
              >
                {/* Header Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Severity</div>
                    <div className={cn(
                      "inline-flex px-3 py-1 rounded-full text-sm font-bold border",
                      getSeverityLabel(referralData.priority).bg,
                      getSeverityLabel(referralData.priority).color,
                      getSeverityLabel(referralData.priority).border
                    )}>
                      {getSeverityLabel(referralData.priority).label}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Patient Age</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {calculateAge(referralData.extracted_data?.patient_dob)} yrs
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Confidence</div>
                    <div className="text-2xl font-bold text-emerald-500">
                      {(referralData.confidence_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Reasoning Section */}
                <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Wand2 size={120} />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">
                    <CheckCircle2 size={14} />
                    Clinical Reasoning
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Triage Summary</h3>
                  <p className="text-gray-700 leading-relaxed text-lg italic">
                    "{referralData.reasoning}"
                  </p>
                </div>

                {/* Extracted Data Detail */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-bold text-gray-900 border-b border-gray-100 pb-2">
                      <FileText size={18} className="text-blue-500" />
                      Extracted Findings
                    </div>
                    <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                      {referralData.extracted_data?.diagnostic_reports?.[0] ? (
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase">Conclusion</span>
                          <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                            {referralData.extracted_data.diagnostic_reports[0].conclusion}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No diagnostic conclusion extracted.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-bold text-gray-900 border-b border-gray-100 pb-2">
                       <AlertCircle size={18} className="text-orange-500" />
                       Patient Context
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 px-4 bg-white border border-gray-100 rounded-2xl">
                        <span className="text-sm text-gray-500">Patient Name</span>
                        <span className="text-sm font-bold text-gray-900">{referralData.extracted_data?.patient_name}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-4 bg-white border border-gray-100 rounded-2xl">
                        <span className="text-sm text-gray-500">Service Requested</span>
                        <span className="text-sm font-bold text-gray-900">{referralData.extracted_data?.requested_service}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-4 bg-white border border-gray-100 rounded-2xl text-blue-600 font-medium cursor-pointer hover:bg-blue-50 transition-colors"
                           onClick={() => window.open(`${API_CONSTANTS.BASE_URL}${referralData.report_pdf_url}`, '_blank')}>
                        <span className="text-sm">View Original Document</span>
                        <ChevronRight size={16} />
                      </div>
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
