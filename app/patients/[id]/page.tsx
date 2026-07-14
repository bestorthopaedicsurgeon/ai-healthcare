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
    Upload
} from "lucide-react";
import { usePatient, Session } from "@/context/PatientContext";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

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
        uploadPreviousScribe,
        deletePatientPermanently
    } = usePatient();

    // Find the current patient from the URL param
    const patientId = params.id as string;
    const currentPatient = patients.find(p => p.id === patientId);

    const [isCancellingCall, setIsCancellingCall] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [isUploadingScribe, setIsUploadingScribe] = useState(false);
    const [isDeletingPatient, setIsDeletingPatient] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const scribeInputRef = useRef<HTMLInputElement>(null);

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

    const handleDeletePatient = async () => {
        if (!currentPatient || isDeletingPatient) return;
        setIsDeletingPatient(true);
        const t = toast.loading("Permanently deleting patient and all data...");
        try {
            const result = await deletePatientPermanently(currentPatient.id);
            toast.success("Patient and all associated data deleted", { id: t });
            setActivePatientId(null);
            setActiveSessionId(null);
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err?.message || "Could not delete patient", { id: t });
            setIsDeletingPatient(false);
            setShowDeleteConfirm(false);
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

                        {/* Permanent delete — irreversible, wipes GP letter/triage,
                            voice call, scribe consultations, and all sessions for
                            this patient. 2-step confirm to prevent misclicks. */}
                        <div className="shrink-0">
                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> Delete Patient
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl p-2">
                                    <span className="text-[11px] font-bold text-red-700 px-2">Delete everything?</span>
                                    <button
                                        onClick={handleDeletePatient}
                                        disabled={isDeletingPatient}
                                        className="px-3 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white transition-colors flex items-center gap-1.5"
                                    >
                                        {isDeletingPatient ? (
                                            <><Loader2 size={12} className="animate-spin" /> Deleting...</>
                                        ) : (
                                            <>Yes, delete all</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={isDeletingPatient}
                                        className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-100 text-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
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
            </div>
        </div>
    );
}
