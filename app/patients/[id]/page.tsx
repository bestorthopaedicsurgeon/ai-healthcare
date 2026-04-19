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
        openSessionModal,
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
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                size="lg"
                                onClick={() => openSessionModal("/scribe")}
                                className="h-14 px-8 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-2xl shadow-xl shadow-accent-primary/20 font-bold gap-3 text-lg group"
                            >
                                <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                                Start New Session
                            </Button>
                            <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">Unlocks AI Tools</p>
                        </div>
                    </div>

                    {/* Quick Summary / Alert (Placeholder) */}
                    <div className="mt-10 p-5 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                            <AlertCircle size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-blue-900">Patient Readiness Summary</p>
                            <p className="text-[11px] text-blue-600 font-medium mt-0.5">This patient has no active alerts. Recommended for a routine follow-up Scribe session.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Workspace Redirect Warning (if tools locked) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* History Column */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 px-2">
                            <History size={20} className="text-gray-400" /> Visit History
                        </h2>

                        <div className="space-y-4">
                            {patientSessions.length === 0 ? (
                                <div className="p-12 text-center bg-white rounded-[40px] border border-gray-100 shadow-sm border-dashed">
                                    <Clock size={32} className="mx-auto text-gray-200 mb-4" />
                                    <h3 className="text-sm font-bold text-gray-900">No previous visits</h3>
                                    <p className="text-xs text-gray-400 mt-1">Start a session to begin documentation.</p>
                                </div>
                            ) : (
                                patientSessions.map((session, i) => (
                                    <motion.div
                                        key={session.session_id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:border-accent-primary/20 transition-all group flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                                isExpired(session.expires_at) ? "bg-gray-50 text-gray-400" : "bg-emerald-50 text-emerald-600"
                                            )}>
                                                <Calendar size={20} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {new Date(session.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                                        {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <div className={cn(
                                                        "w-1 h-1 rounded-full",
                                                        isExpired(session.expires_at) ? "bg-gray-300" : "bg-emerald-500 animate-pulse"
                                                    )} />
                                                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", isExpired(session.expires_at) ? "text-gray-400" : "text-emerald-600")}>
                                                        {isExpired(session.expires_at) ? "Session Expired" : "Active Session"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setActiveSessionId(session.session_id);
                                                router.push("/scribe");
                                            }}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                                                isExpired(session.expires_at)
                                                    ? "text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100"
                                                    : "text-white bg-accent-primary hover:bg-accent-primary/90 shadow-lg shadow-accent-primary/20"
                                            )}
                                        >
                                            {isExpired(session.expires_at) ? <FileText size={14} /> : <Play size={14} fill="currentColor" />}
                                            {isExpired(session.expires_at) ? "View Data" : "Open Scribe"}
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Details Column */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Clinical Notes</h2>
                            <div className="space-y-4">
                                {/* <div className="p-5 bg-gray-50 rounded-3xl text-sm text-gray-600 italic leading-relaxed">
                            {currentPatient?.notes || "No initial referral notes provided for this patient."}
                        </div> */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border border-gray-50 rounded-2xl bg-white shadow-sm">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Visit Date</span>
                                        <p className="text-sm font-bold text-gray-700 mt-1">
                                            {patientSessions[0] ? new Date(patientSessions[0].created_at).toLocaleDateString() : "Never"}
                                        </p>
                                    </div>
                                    <div className="p-4 border border-gray-50 rounded-2xl bg-white shadow-sm">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Visits</span>
                                        <p className="text-sm font-bold text-gray-700 mt-1">{patientSessions.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden group border border-white/10 shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 transition-transform group-hover:scale-110 duration-500">
                                <MapPin size={100} />
                            </div>
                            <h3 className="text-lg font-bold mb-6">Patient Address</h3>
                            <div className="space-y-4 relative z-10">
                                <p className="text-gray-400 font-medium max-w-[200px] leading-relaxed">
                                    {currentPatient.address || "No address on file."}
                                </p>
                                <button className="flex items-center gap-2 text-xs font-bold text-accent-primary hover:text-white transition-colors">
                                    Update Registry Info <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
