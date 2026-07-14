"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    User,
    Plus,
    History,
    Calendar,
    Phone,
    Mail,
    MapPin,
    Activity,
    Clock,
    ChevronRight,
    Play,
    FileText,
    AlertCircle,
    Trash2,
    PhoneCall,
    Loader2,
    Upload,
    Mic2,
    CheckCircle2,
    Download,
    ExternalLink,
    ShieldAlert,
    Wand2,
    AlertTriangle
} from "lucide-react";
import { usePatient, Session } from "@/context/PatientContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";

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

export default function PatientProfilePage() {
    const params = useParams();
    const router = useRouter();
    const {
        patients,
        activePatient,
        activePatientId,
        setActivePatientId,
        setActiveSessionId,
        getSessionsForPatient,
        isLoading,
        sessionData,
        cancelScheduledIntake,
        uploadPreviousScribe
    } = usePatient();

    // Find the current patient from the URL param
    const patientId = params.id as string;
    const currentPatient = patients.find(p => p.id === patientId);

    const { apiFetch } = useAuth();
    const [activeTab, setActiveTab] = useState<"triage" | "voice" | "consultation">("triage");
    const [showFullTranscript, setShowFullTranscript] = useState(true);
    const [isCancellingCall, setIsCancellingCall] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [isUploadingScribe, setIsUploadingScribe] = useState(false);
    const scribeInputRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => {
        if (patientId && activePatientId !== patientId) {
            setActivePatientId(patientId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId, setActivePatientId]);

    const handleCancelScheduledCall = async () => {
        const intakeId = sessionData?.intake?.intake_id;
        if (!intakeId || isCancellingCall) return;
        setIsCancellingCall(true);
        const t = toast.loading("Cancelling scheduled call...");
        try {
            await cancelScheduledIntake(intakeId);
            toast.success("Scheduled call cancelled", { id: t });
            setShowCancelConfirm(false);
        } catch (err: any) {
            toast.error(err?.message || "Could not cancel the call", { id: t });
        } finally {
            setIsCancellingCall(false);
        }
    };


    const handleScribeFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const currentSessionId = sessionData?.session_id;
        if (!file || !currentSessionId) return;

        setIsUploadingScribe(true);
        const uploadToast = toast.loading("Uploading previous scribe PDF...");
        try {
            await uploadPreviousScribe(currentSessionId, file);
            toast.success("Previous scribe uploaded successfully!", {
                id: uploadToast,
            });
        } catch (err: any) {
            toast.error(err?.message || "Failed to upload previous scribe", {
                id: uploadToast,
            });
        } finally {
            setIsUploadingScribe(false);
        }
    };

    if (isLoading && !currentPatient) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white space-y-4">
                <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400 font-medium">Loading Patient Record...</p>
            </div>
        );
    }

    if (!currentPatient) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
                    <User size={40} />
                </div>
                <div className="max-w-md">
                    <h2 className="text-2xl font-bold text-gray-900">Patient Not Found</h2>
                    <p className="text-gray-500 mt-2">The patient record you are looking for might have been moved or deleted.</p>
                </div>
                <Button onClick={() => router.push("/dashboard")} variant="secondary">Return to Dashboard</Button>
            </div>
        );
    }

    const patientSessions = getSessionsForPatient(currentPatient.full_name);
    const isExpired = (expiryStr: string) => new Date(expiryStr).getTime() < new Date().getTime();

    return (
        <div className="flex-1 bg-[#fcfcfc] overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto p-10 space-y-10">

                {/* Bio Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none">
                        <User size={240} />
                    </div>

                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-start gap-8">
                            <div className="w-28 h-28 rounded-[32px] bg-accent-primary flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-accent-primary/20">
                                {currentPatient.full_name.charAt(0)}
                            </div>
                            <div className="space-y-4 pt-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{currentPatient.full_name}</h1>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold uppercase tracking-widest">
                                            REF: #{currentPatient.reference_number}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-500 font-medium">
                                        <div className="flex items-center gap-1.5"><Calendar size={16} /> {currentPatient.dob}</div>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <div className="flex items-center gap-1.5"><Activity size={16} /> Active Patient</div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-6 pt-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Phone size={14} /></div>
                                        {currentPatient.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Mail size={14} /></div>
                                        {currentPatient.email || "No email provided"}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><MapPin size={14} /></div>
                                        {currentPatient.address || "No address on file"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Smart Readiness banner — states, in priority order:
                         1. Followup with no previous scribe → upload previous scribe here
                         2. New patient with no referral → route to /triage for GP letter
                         3. No sessions yet → prompt to start one
                         4. All good → green "ready" tile
                        The followup/new distinction comes from sessionData.patient_type
                        (populated once activeSessionId is set — that happens on mount).
                    */}
                    {(() => {
                        const sessionsForThis = getSessionsForPatient(currentPatient.full_name);
                        const activeSession = sessionsForThis.find(s => !isExpired(s.expires_at));
                        const hasNoSession = sessionsForThis.length === 0;

                        // Prefer sessionData (has patient_type + previous_scribe) when loaded
                        const patientType: "new" | "followup" | undefined = sessionData?.patient_type;
                        const previousScribe = sessionData?.previous_scribe;
                        const isFollowupMissingScribe =
                            activeSession &&
                            patientType === "followup" &&
                            !previousScribe;
                        const isNewMissingReferral =
                            activeSession &&
                            (patientType === "new" || !patientType) &&
                            !activeSession.referral_id;

                        if (isFollowupMissingScribe) {
                            return (
                                <div className="mt-10 p-5 bg-purple-50/70 border border-purple-200 rounded-3xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-purple-600 shadow-sm">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-purple-900">Previous visit scribe missing</p>
                                        <p className="text-[11px] text-purple-700 font-medium mt-0.5">
                                            This is a followup patient. Attach the previous consultation's scribe
                                            PDF and we'll summarize it so you can glance at it before the appointment.
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        ref={scribeInputRef}
                                        onChange={handleScribeFileSelect}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => scribeInputRef.current?.click()}
                                        disabled={isUploadingScribe}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white transition-colors shrink-0 flex items-center gap-2"
                                    >
                                        {isUploadingScribe ? (
                                            <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                                        ) : (
                                            <><Upload size={14} /> Upload scribe PDF</>
                                        )}
                                    </button>
                                </div>
                            );
                        }

                        if (isNewMissingReferral) {
                            return (
                                <div className="mt-10 p-5 bg-amber-50/70 border border-amber-200 rounded-3xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-amber-600 shadow-sm">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-amber-900">GP referral letter missing</p>
                                        <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                                            This patient was created via bulk upload without a GP letter attached.
                                            Triage and the AI call use the letter — upload it from the Triage workspace.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setActiveSessionId(activeSession.session_id);
                                            router.push("/triage");
                                        }}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors shrink-0"
                                    >
                                        Upload GP letter →
                                    </button>
                                </div>
                            );
                        }

                        if (hasNoSession) {
                            return (
                                <div className="mt-10 p-5 bg-gray-50 border border-gray-100 rounded-3xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-gray-500 shadow-sm">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-900">No sessions yet</p>
                                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">Start a new session to unlock triage, voice intake, and scribe tools.</p>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div className="mt-10 p-5 bg-emerald-50/70 border border-emerald-100 rounded-3xl flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                    <AlertCircle size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-emerald-900">Patient is set up and ready</p>
                                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">All required documents are in place.</p>
                                </div>
                            </div>
                        );
                    })()}
                </motion.div>

                {/* Scheduled call card — only for NEW patients whose Agent 2
                    voice intake call is pending (not yet fired, not in flight,
                    not completed). Lets the doctor manually cancel the call
                    before it dials. Hidden for followups (their intake block
                    is null) and for already-fired / completed calls. */}
                {(() => {
                    const intake = sessionData?.intake;
                    if (!intake || !intake.scheduled_call_at) return null;
                    if (intake.status !== "pending") return null;

                    const scheduledDate = new Date(intake.scheduled_call_at);
                    const now = Date.now();
                    const msUntil = scheduledDate.getTime() - now;
                    const hoursUntil = Math.round(msUntil / 3600000);
                    const relativeLabel = msUntil < 0
                        ? "overdue — scheduler will dispatch shortly"
                        : hoursUntil < 24
                            ? `in ${hoursUntil} hour${hoursUntil === 1 ? "" : "s"}`
                            : `in ${Math.round(hoursUntil / 24)} day${hoursUntil >= 48 ? "s" : ""}`;

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-blue-100 rounded-[32px] p-6 shadow-sm flex items-center gap-4 mt-6"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <PhoneCall size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">
                                    AI voice intake call scheduled
                                </p>
                                <p className="text-sm font-bold text-gray-900 mt-1">
                                    {scheduledDate.toLocaleString(undefined, {
                                        weekday: "short",
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                    <span className="ml-2 text-xs font-medium text-gray-500">
                                        ({relativeLabel})
                                    </span>
                                </p>
                                {intake.retry_count > 0 && (
                                    <p className="text-[11px] text-amber-700 mt-1 font-medium">
                                        Previous attempt(s): {intake.retry_count}
                                    </p>
                                )}
                            </div>

                            {!showCancelConfirm ? (
                                <button
                                    onClick={() => setShowCancelConfirm(true)}
                                    disabled={isCancellingCall}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors shrink-0 flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> Cancel call
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[11px] font-bold text-gray-500 mr-1">Confirm?</span>
                                    <button
                                        onClick={handleCancelScheduledCall}
                                        disabled={isCancellingCall}
                                        className="px-3 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white transition-colors flex items-center gap-1.5"
                                    >
                                        {isCancellingCall ? (
                                            <><Loader2 size={12} className="animate-spin" /> Cancelling...</>
                                        ) : (
                                            <>Yes, cancel</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowCancelConfirm(false)}
                                        disabled={isCancellingCall}
                                        className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                    >
                                        Keep
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    );
                })()}

                {/* Unified Patient Medical History Tabs */}
                {sessionData && (
                  <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-8">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-100 pb-2 gap-6">
                      {(["triage", "voice", "consultation"] as const).map((tab) => {
                        const labels = {
                          triage: "GP Referral Triage",
                          voice: "Voice Patient Intake",
                          consultation: "Clinical Scribe Results"
                        };
                        const isActive = activeTab === tab;
                        return (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                              "pb-2 px-1 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer",
                              isActive ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
                            )}
                          >
                            {labels[tab]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab Content */}
                    <div className="pt-2">
                       {/* Tab 1: GP Triage */}
                       {activeTab === "triage" && (
                         <div className="space-y-6">
                           {sessionData.triage ? (
                             <div className="space-y-6">
                               <div className="flex items-center justify-between">
                                 <h3 className="text-sm font-bold text-gray-900">Triage AI Summary</h3>
                                 {sessionData.triage.triage_category && (
                                   <span className={cn(
                                     "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border",
                                     sessionData.triage.triage_category === 'urgent' ? 'bg-red-50 text-red-700 border-red-100' : sessionData.triage.triage_category === 'semi_urgent' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                   )}>
                                     Category {sessionData.triage.triage_category}
                                   </span>
                                 )}
                               </div>
                               <p className="text-gray-800 font-medium leading-relaxed bg-gray-50/50 p-5 rounded-2xl border border-gray-100 italic">
                                 "{sessionData.triage.triage_summary}"
                               </p>

                               {sessionData.triage.reasoning && (
                                 <div className="space-y-2 bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Clinical Reasoning</span>
                                   {formatReasoning(sessionData.triage.reasoning)}
                                 </div>
                               )}

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {sessionData.triage.extracted_data?.urgency_indicators?.length > 0 && (
                                   <div className="p-5 bg-red-50/20 border border-red-100/50 rounded-2xl space-y-2">
                                     <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">Urgency Indicators</span>
                                     <div className="space-y-1.5">
                                       {sessionData.triage.extracted_data.urgency_indicators.map((u: string, idx: number) => (
                                         <div key={idx} className="flex gap-2 text-xs font-bold text-gray-700 leading-snug">
                                           <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                           {u}
                                         </div>
                                       ))}
                                     </div>
                                   </div>
                                 )}

                                 {sessionData.triage.extracted_data?.risk_factors?.length > 0 && (
                                   <div className="p-5 bg-orange-50/20 border border-orange-100/50 rounded-2xl space-y-2">
                                     <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block">Risk Factors</span>
                                     <div className="space-y-1.5">
                                       {sessionData.triage.extracted_data.risk_factors.map((r: string, idx: number) => (
                                         <div key={idx} className="flex gap-2 text-xs font-bold text-gray-700 leading-snug">
                                           <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                           {r}
                                         </div>
                                       ))}
                                     </div>
                                   </div>
                                 )}
                               </div>

                               {sessionData.triage.extracted_data?.diagnostic_reports?.length > 0 && (
                                 <div className="space-y-2">
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Diagnostic Reports Found</span>
                                   <div className="space-y-3 bg-gray-50 border border-gray-100 rounded-2xl p-6 font-medium">
                                     {sessionData.triage.extracted_data.diagnostic_reports.map((report: any, idx: number) => (
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

                               {sessionData.triage.report_pdf_url && (
                                 <Button
                                   variant="outline"
                                   onClick={() => handleViewDocument(sessionData.triage.report_pdf_url)}
                                   className="rounded-xl text-xs font-bold h-11"
                                 >
                                   View Original GP Referral PDF
                                 </Button>
                               )}
                             </div>
                           ) : (
                             <div className="text-center py-10">
                               <AlertCircle size={28} className="text-gray-300 mx-auto mb-2" />
                               <p className="text-sm font-semibold text-gray-500">No GP referral document triaged for this session.</p>
                             </div>
                           )}
                         </div>
                       )}

                       {/* Tab 2: Voice Intake */}
                       {activeTab === "voice" && (
                         <div className="space-y-6">
                           {sessionData.intake ? (
                             <div className="space-y-6">
                               {/* Symptoms */}
                               {sessionData.intake.clinical_data?.symptoms?.length > 0 && (
                                 <div className="space-y-3">
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Reported Symptoms</span>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {sessionData.intake.clinical_data.symptoms.map((s: any, idx: number) => (
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

                               {/* Checklist Grid */}
                               <div className="grid grid-cols-2 gap-6 bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                 <div className="space-y-2">
                                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Conditions</span>
                                   <div className="flex flex-wrap gap-1.5">
                                     {sessionData.intake.clinical_data?.past_conditions?.map((c: any, idx: number) => (
                                       <span key={idx} className="bg-white border border-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg">{renderClinicalItem(c)}</span>
                                     )) || <span className="text-xs text-gray-400 italic">None reported</span>}
                                     {sessionData.intake.clinical_data?.past_conditions?.length === 0 && <span className="text-xs text-gray-400 italic">None reported</span>}
                                   </div>
                                 </div>
                                 <div className="space-y-2">
                                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Medications</span>
                                   <div className="flex flex-wrap gap-1.5">
                                     {sessionData.intake.clinical_data?.current_medications?.map((m: any, idx: number) => (
                                       <span key={idx} className="bg-white border border-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg">{renderClinicalItem(m)}</span>
                                     )) || <span className="text-xs text-gray-400 italic">None reported</span>}
                                     {sessionData.intake.clinical_data?.current_medications?.length === 0 && <span className="text-xs text-gray-400 italic">None reported</span>}
                                   </div>
                                 </div>
                                 <div className="space-y-2">
                                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Allergies</span>
                                   <div className="flex flex-wrap gap-1.5">
                                     {sessionData.intake.clinical_data?.allergies?.map((a: any, idx: number) => (
                                       <span key={idx} className="bg-red-50 text-red-600 border border-red-100 text-xs font-bold px-2.5 py-1 rounded-lg">{renderClinicalItem(a)}</span>
                                     )) || <span className="text-xs text-gray-400 italic">None reported</span>}
                                     {sessionData.intake.clinical_data?.allergies?.length === 0 && <span className="text-xs text-gray-400 italic">None reported</span>}
                                   </div>
                                 </div>
                                 <div className="space-y-2">
                                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Surgeries</span>
                                   <div className="flex flex-wrap gap-1.5">
                                     {sessionData.intake.clinical_data?.surgical_history?.map((s: any, idx: number) => (
                                       <span key={idx} className="bg-white border border-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg">{renderClinicalItem(s)}</span>
                                     )) || <span className="text-xs text-gray-400 italic">None reported</span>}
                                     {sessionData.intake.clinical_data?.surgical_history?.length === 0 && <span className="text-xs text-gray-400 italic">None reported</span>}
                                   </div>
                                 </div>
                               </div>

                               {/* Call Transcript Accordion */}
                               {sessionData.intake.call_transcript && (
                                 <div className="space-y-3">
                                   <div className="flex justify-between items-center">
                                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Intake Call Transcript</span>
                                     <button 
                                       onClick={() => setShowFullTranscript(!showFullTranscript)}
                                       className="text-xs font-bold text-teal-700 hover:text-teal-900"
                                     >
                                       {showFullTranscript ? "Hide Transcript" : "Show Transcript"}
                                     </button>
                                   </div>
                                   {showFullTranscript && (
                                     <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 max-h-[350px] overflow-y-auto custom-scrollbar flex flex-col gap-3 font-medium">
                                       {parseTranscript(sessionData.intake.call_transcript).map((bubble: any) => (
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
                             <div className="text-center py-10">
                               <Phone size={28} className="text-gray-300 mx-auto mb-2" />
                               <p className="text-sm font-semibold text-gray-500">No voice intake interview has been conducted yet.</p>
                             </div>
                           )}
                         </div>
                       )}

                       {/* Tab 3: Consultation (Scribe) */}
                       {activeTab === "consultation" && (
                         <div className="space-y-8">
                           {sessionData.consultation ? (
                             <div className="space-y-8">
                               {/* SOAP note grid */}
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                 {(['subjective', 'objective', 'assessment', 'plan'] as const).map((key) => (
                                   <div key={key} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-3">
                                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{key}</span>
                                     <p className="text-gray-700 text-xs leading-relaxed font-semibold italic">
                                       "{sessionData.consultation.soap_note?.[key] || "Pending..."}"
                                     </p>
                                   </div>
                                 ))}
                               </div>

                               {/* Diagnoses & Roadmap */}
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4">
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Identified Diagnoses</span>
                                   <div className="flex flex-col gap-2">
                                     {sessionData.consultation.diagnoses?.map((d: string, idx: number) => (
                                       <div key={idx} className="px-4 py-2.5 bg-red-50/50 text-red-600 rounded-xl text-xs font-black border border-red-100/50 italic">
                                         {d}
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                                 <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4">
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Therapeutic Roadmap</span>
                                   <ul className="space-y-3">
                                     {sessionData.consultation.treatment_plan?.map((t: string, idx: number) => (
                                       <li key={idx} className="text-xs text-gray-600 font-bold flex gap-3 leading-relaxed">
                                         <span className="w-1.5 h-1.5 bg-accent-primary rounded-full mt-1.5 shrink-0" />
                                         {t}
                                       </li>
                                     ))}
                                   </ul>
                                 </div>
                               </div>

                               {/* Clinical Letter */}
                               {sessionData.consultation.clinical_letter && (
                                 <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 space-y-4 relative overflow-hidden">
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">GP Clinical Letter</span>
                                   <div className="prose prose-slate max-w-none font-serif text-gray-800 leading-relaxed text-sm italic whitespace-pre-wrap scribe-letter relative z-10 px-4">
                                     <ReactMarkdown>
                                       {sessionData.consultation.clinical_letter}
                                     </ReactMarkdown>
                                   </div>
                                 </div>
                               )}
                             </div>
                           ) : (
                             <div className="text-center py-10">
                               <Mic2 size={28} className="text-gray-300 mx-auto mb-2" />
                               <p className="text-sm font-semibold text-gray-500">No clinical scribe session has been recorded yet.</p>
                             </div>
                           )}
                         </div>
                       )}
                    </div>
                  </div>
                )}
            </div>
        </div>
    );
}
