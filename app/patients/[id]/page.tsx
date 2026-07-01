"use client";

import React, { useEffect, useState } from "react";
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
    AlertCircle
} from "lucide-react";
import { usePatient, Session } from "@/context/PatientContext";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
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
        isLoading
    } = usePatient();

    // Find the current patient from the URL param
    const patientId = params.id as string;
    const currentPatient = patients.find(p => p.id === patientId);

    useEffect(() => {
        if (patientId && activePatientId !== patientId) {
            setActivePatientId(patientId);
        }
    }, [patientId, activePatientId, setActivePatientId]);

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

                    {/* Smart Readiness banner — surfaces missing-referral state for
                        patients created via the bulk PDF flow (which doesn't attach
                        GP letters at creation time). */}
                    {(() => {
                        const sessionsForThis = getSessionsForPatient(currentPatient.full_name);
                        const activeSession = sessionsForThis.find(s => !isExpired(s.expires_at));
                        const missingReferral = activeSession && !activeSession.referral_id;
                        const hasNoSession = sessionsForThis.length === 0;

                        if (missingReferral) {
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
            </div>
        </div>
    );
}
