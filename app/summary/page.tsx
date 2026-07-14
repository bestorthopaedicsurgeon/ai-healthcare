"use client";

import React, { useState } from "react";
import { usePatient } from "@/context/PatientContext";
import { useAuth } from "@/context/AuthContext";
import { 
  FileText, 
  Phone, 
  Activity, 
  AlertCircle, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Wand2, 
  ChevronRight, 
  User, 
  Calendar, 
  Mic2,
  Clock,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

const formatReasoning = (text: string) => {
  if (!text) return null;

  const regex = /\(\d+\)/g;
  const parts = text.split(regex);
  const matches = text.match(regex);

  if (!matches || parts.length <= 1) {
    return <p className="text-sm font-semibold text-gray-600 leading-relaxed">{text}</p>;
  }

  const intro = parts[0].trim();
  const points: string[] = [];
  let outro = "";

  for (let i = 1; i < parts.length; i++) {
    const currentPart = parts[i].trim();
    if (i === parts.length - 1) {
      const firstPeriodIdx = currentPart.indexOf(". ");
      if (firstPeriodIdx !== -1) {
        points.push(currentPart.substring(0, firstPeriodIdx + 1).trim());
        outro = currentPart.substring(firstPeriodIdx + 2).trim();
      } else {
        points.push(currentPart);
      }
    } else {
      points.push(currentPart);
    }
  }

  return (
    <div className="space-y-4">
      {intro && <p className="text-sm font-semibold text-gray-800 leading-relaxed">{intro}</p>}
      <div className="grid grid-cols-1 gap-3 pl-1">
        {points.map((point, index) => {
          let cleanPoint = point.trim();
          if (cleanPoint.endsWith(";") || cleanPoint.endsWith(",")) {
            cleanPoint = cleanPoint.slice(0, -1);
          }
          if (cleanPoint && !cleanPoint.endsWith(".")) {
            cleanPoint = cleanPoint + ".";
          }
          return (
            <div key={index} className="flex items-start gap-3 text-xs font-semibold text-gray-600 leading-relaxed">
              <span className="w-5 h-5 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-teal-100 mt-0.5">
                {index + 1}
              </span>
              <span>{cleanPoint}</span>
            </div>
          );
        })}
      </div>
      {outro && (
        <div className="p-4 bg-teal-50/30 border border-teal-100/50 rounded-xl mt-4">
          <p className="text-xs font-bold text-teal-800 leading-relaxed italic">{outro}</p>
        </div>
      )}
    </div>
  );
};

const renderClinicalItem = (item: any) => {
  if (!item) return "";
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    if ('name' in item) {
      const parts = [
        item.name,
        item.dosage ? `(${item.dosage})` : '',
        item.frequency ? `- ${item.frequency}` : ''
      ].filter(Boolean);
      return parts.join(' ');
    }
    if ('allergy' in item || 'allergen' in item) {
      const name = item.allergy || item.allergen;
      const severity = item.severity ? `(${item.severity})` : '';
      return `${name} ${severity}`.trim();
    }
    if ('procedure' in item || 'surgery' in item) {
      const name = item.procedure || item.surgery;
      const date = item.date ? `(${item.date})` : '';
      return `${name} ${date}`.trim();
    }
    if ('condition' in item) {
      const name = item.condition;
      const onset = item.onset ? `(${item.onset})` : '';
      return `${name} ${onset}`.trim();
    }
    return Object.values(item).filter(val => typeof val === 'string' && val !== '').join(' ');
  }
  return String(item);
};

export default function PatientSummaryPage() {
  const { activeSession, sessionData, isSessionDataLoading } = usePatient();
  const { apiFetch } = useAuth();
  const [showFullTranscript, setShowFullTranscript] = useState(true);

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
      toast.error("Failed to load secure document.");
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "N/A";
    let birthDate: Date;
    const dmYMatch = dob.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmYMatch) {
      const day = parseInt(dmYMatch[1], 10);
      const month = parseInt(dmYMatch[2], 10) - 1;
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

  if (isSessionDataLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white space-y-4 min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Assembling patient records...</p>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white min-h-[60vh] text-center space-y-6 max-w-md mx-auto">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
          <FileText size={40} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">No active session</h2>
          <p className="text-sm text-gray-500 mt-2">Select a patient session from the sidebar to load their clinical summary.</p>
        </div>
      </div>
    );
  }

  const isFollowup = sessionData?.patient_type === "followup";
  const triage = sessionData?.triage;
  const intake = sessionData?.intake;
  const categorization = sessionData?.categorization;
  const previousScribe = sessionData?.previous_scribe;
  const clinicalData = intake?.clinical_data;

  // Parse call transcript
  const parseTranscript = (transcript: string) => {
    if (!transcript) return [];
    return transcript.split('\n').map((line, idx) => {
      const isAgent = line.startsWith('Agent:');
      const isUser = line.startsWith('User:');
      let speaker = '';
      let text = line;
      
      if (isAgent) {
        speaker = 'Intake Agent';
        text = line.replace(/^Agent:\s*/i, '');
      } else if (isUser) {
        speaker = 'Patient';
        text = line.replace(/^User:\s*/i, '');
      } else {
        speaker = 'Narrator';
      }
      text = text.replace(/\[.*?\]\s*/g, '');
      return { id: idx, speaker, text, isAgent, isUser };
    });
  };

  const transcriptBubbles = parseTranscript(intake?.call_transcript || "");

  const triageCategories = {
    urgent: { label: 'Urgent', color: 'bg-red-50 text-red-700 border-red-100' },
    semi_urgent: { label: 'Semi Urgent', color: 'bg-orange-50 text-orange-700 border-orange-100' },
    routine: { label: 'Routine', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
  };

  return (
    <div className="min-h-full p-8 bg-[#fcfcfc] overflow-y-auto custom-scrollbar">
      <div className="max-w-[1700px] mx-auto space-y-8">
        
        {/* Header Dashboard Banner */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl">
              {activeSession.patient_name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{activeSession.patient_name}</h1>
                <span className={cn(
                  "px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-widest border",
                  isFollowup 
                    ? "bg-purple-50 text-purple-700 border-purple-100" 
                    : "bg-blue-50 text-blue-700 border-blue-100"
                )}>
                  {isFollowup ? "Follow-up Visit" : "New Patient Visit"}
                </span>
                {categorization?.category && (
                  <span className="px-3 py-0.5 bg-gray-900 text-white rounded-full text-xs font-semibold tracking-wider border border-gray-900">
                    Category {categorization.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                <div>DOB: {activeSession.patient_dob}</div>
                <span className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                <div>Phone: {activeSession.patient_phone}</div>
                <span className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                <div className="flex items-center gap-1"><Clock size={12} /> Registered: {new Date(activeSession.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {triage?.report_pdf_url && (
              <Button 
                variant="outline" 
                onClick={() => handleViewDocument(triage.report_pdf_url)}
                className="rounded-xl h-12 text-xs font-bold gap-2"
              >
                <FileText size={14} /> GP Referral PDF
              </Button>
            )}
            {intake?.intake_id && (
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    const res = await apiFetch(`/api/v1/intake/${intake.intake_id}/report`);
                    if (res.ok) {
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      window.open(url, "_blank");
                    }
                  } catch (e) {
                    toast.error("Failed to view intake report");
                  }
                }}
                className="rounded-xl h-12 text-xs font-bold gap-2"
              >
                <Phone size={14} /> Voice Intake Report
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Patient Info Screen */}
        {isFollowup ? (
          /* FOLLOW-UP: Display previous scribe notes in full */
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5 text-xs font-bold text-purple-700 uppercase tracking-widest">
                  <Activity size={16} />
                  Historical Summary Context
                </div>
                <h3 className="text-xl font-bold text-gray-900">Summary of Last Consultation</h3>
                
                {previousScribe ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-purple-50/40 border border-purple-100 rounded-2xl">
                      <p className="text-gray-800 text-lg leading-relaxed font-medium italic">
                        {previousScribe.summary ? `"${previousScribe.summary}"` : "No summary text generated for the previous scribe notes."}
                      </p>
                    </div>
                    {previousScribe.file_url && (
                      <button
                        onClick={() => handleViewDocument(previousScribe.file_url)}
                        className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold tracking-wider hover:bg-black transition-all"
                      >
                        <FileText size={14} /> Open Previous Consultation Notes
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                    <AlertCircle size={32} className="text-gray-400 mb-2" />
                    <p className="text-sm font-bold text-gray-500">No previous consult notes uploaded</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">Upload previous consult documents from the patient profile dashboard to review them here.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Current Consultation Context</h3>
                <div className="p-5 bg-teal-50/40 border border-teal-100 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-teal-800">Ready to consult</p>
                  <p className="text-xs text-teal-700 leading-relaxed font-medium">
                    This is a follow-up. Check past documentation and start the scribe recording when the consultation begins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* NEW PATIENT: Display GP Referral details & Voice Intake details side-by-side */
          <div className="grid grid-cols-12 gap-8">
            
            {/* Left Grid: GP Referral Triage Details */}
            <div className="col-span-12 lg:col-span-6 space-y-8">
              <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-teal-700 uppercase tracking-widest">
                    <FileText size={16} />
                    GP Referral Triage
                  </div>
                  {triage?.triage_category && (
                    <span className={cn(
                      "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border",
                      triageCategories[triage.triage_category as keyof typeof triageCategories]?.color || "bg-gray-100"
                    )}>
                      {triageCategories[triage.triage_category as keyof typeof triageCategories]?.label || triage.triage_category}
                    </span>
                  )}
                </div>

                {triage ? (
                  <div className="space-y-6">
                    {/* Triage Summary */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Triage AI Summary</span>
                      <p className="text-gray-800 font-medium leading-relaxed bg-gray-50/50 p-5 rounded-2xl border border-gray-100 italic">
                        "{triage.triage_summary}"
                      </p>
                    </div>

                    {/* Reasoning matrix */}
                    {triage.reasoning && (
                      <div className="space-y-2 bg-gray-50 border border-gray-100 rounded-2xl p-6">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Clinical Reasoning Matrix</span>
                        {formatReasoning(triage.reasoning)}
                      </div>
                    )}

                    {/* Urgency & Risk Factors */}
                    <div className="grid grid-cols-2 gap-6 pt-2">
                      {triage.extracted_data?.urgency_indicators?.length > 0 && (
                        <div className="space-y-3 p-5 bg-red-50/20 border border-red-100/50 rounded-2xl">
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">Urgency Indicators</span>
                          <div className="space-y-2">
                            {triage.extracted_data.urgency_indicators.map((u: string, idx: number) => (
                              <div key={idx} className="flex gap-2 text-xs font-bold text-gray-700 leading-snug">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                {u}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {triage.extracted_data?.risk_factors?.length > 0 && (
                        <div className="space-y-3 p-5 bg-orange-50/20 border border-orange-100/50 rounded-2xl">
                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block">Risk Factors</span>
                          <div className="space-y-2">
                            {triage.extracted_data.risk_factors.map((r: string, idx: number) => (
                              <div key={idx} className="flex gap-2 text-xs font-bold text-gray-700 leading-snug">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                {r}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Diagnostic reports */}
                    {triage.extracted_data?.diagnostic_reports?.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Diagnostic Reports Found</span>
                        <div className="space-y-3 bg-gray-50 border border-gray-100 rounded-2xl p-6 font-medium">
                          {triage.extracted_data.diagnostic_reports.map((report: any, idx: number) => (
                            <div key={idx} className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                              <span className="text-[9px] font-black text-teal-600 block uppercase tracking-wider">
                                {report.report_type} • {report.body_part_or_test}
                              </span>
                              <p className="text-xs text-gray-700 leading-relaxed mt-1 italic">
                                "{report.findings}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Referrer Details */}
                    {triage.extracted_data?.referring_physician && (
                      <div className="pt-2 flex justify-between items-center text-xs font-bold text-gray-500">
                        <span>Referring Practitioner:</span>
                        <span className="text-gray-800">{triage.extracted_data.referring_physician}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <AlertCircle size={32} className="text-gray-300 mb-2" />
                    <p className="text-sm font-bold text-gray-500">GP referral details missing</p>
                    <p className="text-xs text-gray-400 mt-1">Upload the GP letter to begin clinical triage.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Grid: Voice Intake Checklists */}
            <div className="col-span-12 lg:col-span-6 space-y-8">
              <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-8">
                <div className="flex items-center gap-2.5 text-xs font-bold text-teal-700 uppercase tracking-widest border-b border-gray-50 pb-4">
                  <Phone size={16} />
                  AI Voice Patient Intake
                </div>

                {intake ? (
                  <div className="space-y-6">
                    {/* Symptoms */}
                    {clinicalData?.symptoms?.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Reported Symptoms</span>
                        <div className="grid grid-cols-2 gap-3">
                          {clinicalData.symptoms.map((s: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900 text-sm">{s.symptom}</span>
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                                  s.severity === 'severe' ? "bg-red-50 text-red-600" : s.severity === 'moderate' ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                                )}>
                                  {s.severity || 'mild'}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-semibold">{s.duration || s.onset ? `${s.duration || ''} ${s.onset ? `(onset: ${s.onset})` : ''}` : 'No timeline listed'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medical checklist grid */}
                    <div className="grid grid-cols-2 gap-6 bg-gray-50 border border-gray-100 rounded-2xl p-6">
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Conditions</span>
                        <div className="flex flex-wrap gap-1.5">
                          {clinicalData?.past_conditions?.map((c: any, idx: number) => (
                            <span key={idx} className="bg-white border border-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg">{renderClinicalItem(c)}</span>
                          )) || <span className="text-xs text-gray-400 italic">None reported</span>}
                          {clinicalData?.past_conditions?.length === 0 && <span className="text-xs text-gray-400 italic">None reported</span>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Medications</span>
                        <div className="flex flex-wrap gap-1.5">
                          {clinicalData?.current_medications?.map((m: any, idx: number) => (
                            <span key={idx} className="bg-white border border-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg">{renderClinicalItem(m)}</span>
                          )) || <span className="text-xs text-gray-400 italic">None reported</span>}
                          {clinicalData?.current_medications?.length === 0 && <span className="text-xs text-gray-400 italic">None reported</span>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Allergies</span>
                        <div className="flex flex-wrap gap-1.5">
                          {clinicalData?.allergies?.map((a: any, idx: number) => (
                            <span key={idx} className="bg-red-50 text-red-600 border border-red-100 text-xs font-bold px-2.5 py-1 rounded-lg">{renderClinicalItem(a)}</span>
                          )) || <span className="text-xs text-gray-400 italic">None reported</span>}
                          {clinicalData?.allergies?.length === 0 && <span className="text-xs text-gray-400 italic">None reported</span>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Surgeries</span>
                        <div className="flex flex-wrap gap-1.5">
                          {clinicalData?.surgical_history?.map((s: any, idx: number) => (
                            <span key={idx} className="bg-white border border-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg">{renderClinicalItem(s)}</span>
                          )) || <span className="text-xs text-gray-400 italic">None reported</span>}
                          {clinicalData?.surgical_history?.length === 0 && <span className="text-xs text-gray-400 italic">None reported</span>}
                        </div>
                      </div>
                      <div className="col-span-2 border-t border-gray-200/50 pt-4 space-y-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Lifestyle details</span>
                        <div className="grid grid-cols-3 gap-4 text-xs font-bold text-gray-600 leading-normal">
                          {clinicalData?.lifestyle_factors?.occupation && <div><span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Job</span>{clinicalData.lifestyle_factors.occupation}</div>}
                          {clinicalData?.lifestyle_factors?.exercise && <div><span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Exercise</span>{clinicalData.lifestyle_factors.exercise}</div>}
                          {clinicalData?.lifestyle_factors?.smoking && <div><span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Smoking</span>{clinicalData.lifestyle_factors.smoking}</div>}
                          {clinicalData?.lifestyle_factors?.alcohol && <div><span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Alcohol</span>{clinicalData.lifestyle_factors.alcohol}</div>}
                          {clinicalData?.lifestyle_factors?.diet && <div><span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Diet</span>{clinicalData.lifestyle_factors.diet}</div>}
                          {clinicalData?.lifestyle_factors?.sleep_quality && <div><span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Sleep</span>{clinicalData.lifestyle_factors.sleep_quality}</div>}
                        </div>
                      </div>
                    </div>

                    {/* Call Transcript */}
                    {transcriptBubbles.length > 0 && (
                      <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Call Transcript Snippets</span>
                          <button 
                            onClick={() => setShowFullTranscript(!showFullTranscript)}
                            className="text-xs font-bold text-teal-700 hover:text-teal-900"
                          >
                            {showFullTranscript ? "Collapse Transcript" : "Expand Transcript"}
                          </button>
                        </div>
                        
                        {showFullTranscript && (
                          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 max-h-[350px] overflow-y-auto custom-scrollbar flex flex-col gap-3 font-medium">
                            {transcriptBubbles.map((bubble) => (
                              <div
                                key={bubble.id}
                                className={cn(
                                  "flex flex-col max-w-[85%] rounded-[18px] p-3.5 shadow-sm text-xs",
                                  bubble.isAgent
                                    ? "bg-white self-start border border-gray-200 text-gray-800"
                                    : bubble.isUser
                                      ? "bg-gray-900 text-white self-end"
                                      : "bg-gray-200 text-gray-500 text-[10px] self-center"
                                )}
                              >
                                <span className={cn(
                                  "text-[8px] font-black uppercase tracking-wider mb-1 block",
                                  bubble.isAgent ? "text-teal-700" : bubble.isUser ? "text-white/60" : "text-gray-400"
                                )}>
                                  {bubble.speaker}
                                </span>
                                <p className="leading-relaxed">
                                  {bubble.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Phone size={32} className="text-gray-300 mb-2" />
                    <p className="text-sm font-bold text-gray-500">Voice intake call pending</p>
                    <p className="text-xs text-gray-400 mt-1">Initiate patient call from the Voice workspace to gather pre-consultation insights.</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
