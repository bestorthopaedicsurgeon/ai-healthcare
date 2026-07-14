"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Mic2, 
  Phone, 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  Activity, 
  Clock, 
  Share2, 
  MoreVertical, 
  LayoutDashboard, 
  Trash2, 
  Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePatient } from "@/context/PatientContext";
import { toast } from "react-hot-toast";

const tools = [
  { id: "summary", label: "Summary", icon: LayoutDashboard, href: "/summary", color: "text-teal-700", bg: "bg-teal-50" },
  { id: "triage", label: "GP Referral", icon: FileText, href: "/triage", color: "text-teal-700", bg: "bg-teal-50" },
  { id: "voice", label: "Voice Agent", icon: Phone, href: "/voice-agent", color: "text-teal-700", bg: "bg-teal-50" },
  { id: "scribe", label: "Scribe", icon: Mic2, href: "/scribe", color: "text-teal-700", bg: "bg-teal-50" },
  { id: "chat", label: "AI Chat", icon: MessageSquare, href: "/chat", color: "text-teal-700", bg: "bg-teal-50" },
];

export function SessionHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    activePatient, 
    activeSession, 
    openSessionModal, 
    sessionData,
    isRecording,
    isPaused,
    recordingTime,
    recordingPatientName,
    recordingPatientId,
    setActivePatientId,
    setActiveSessionId,
    deletePatientPermanently
  } = usePatient();

  const isDashboard = pathname === "/dashboard";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setShowDeleteConfirm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeletePatient = async () => {
    if (!activePatient || isDeleting) return;
    setIsDeleting(true);
    const t = toast.loading("Permanently wiping patient and all data...");
    try {
      await deletePatientPermanently(activePatient.id);
      toast.success("Patient successfully deleted", { id: t });
      setActivePatientId(null);
      setActiveSessionId(null);
      setShowDeleteConfirm(false);
      setIsMenuOpen(false);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete patient", { id: t });
      setIsDeleting(false);
    }
  };

  const isFollowup = sessionData?.patient_type === "followup";
  const displayedTools = tools
    .map(t => {
      if (t.id === "triage" && isFollowup) {
        return { ...t, label: "Previous Scribe" };
      }
      return t;
    })
    .filter(t => !(t.id === "voice" && isFollowup));

  if (!activePatient && !isDashboard) return (
    <header className="h-16 border-b border-line bg-white flex items-center px-8 shrink-0">
      <div className="flex items-center gap-2 text-muted">
        <Activity size={18} />
        <span className="text-sm font-medium">Select a patient session to begin workspace</span>
      </div>
    </header>
  );

  return (
    <header className="h-20 border-b border-line bg-white flex flex-col justify-between shrink-0">
      <div className="flex-1 flex items-center justify-between px-8">
        {/* Context Breadcrumbs */}
        <div className="flex items-center gap-4">
          {isDashboard ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                <LayoutDashboard size={18} />
              </div>
              <h1 className="text-sm font-medium text-ink uppercase tracking-widest">Main Dashboard</h1>
            </div>
          ) : activePatient && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-medium text-xs shadow-sm border border-teal-100">
                {activePatient.full_name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-medium text-ink leading-tight flex items-center gap-2">
                  {activePatient.full_name}
                  {isFollowup && (
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-[9px] font-semibold uppercase tracking-widest leading-none shrink-0">
                      Follow-up
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock size={10} className="text-muted" />
                  <span className="text-[10px] text-muted font-medium whitespace-nowrap">
                    Visit: {activeSession ? new Date(activeSession.created_at).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!isDashboard && activePatient && (
            <>
              <ChevronRight size={14} className="text-muted-2" />
              <div className="px-3 py-1 bg-surface-2/50 rounded-lg border border-line">
                <span className="text-[10px] font-medium text-muted uppercase tracking-widest">
                  {displayedTools.find(t => pathname.startsWith(t.href))?.label || "Workspace"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Global Tools Navigation (TABS) - Intercepts if no session */}
        {!isDashboard && (
          <nav className="flex items-center gap-1 p-1 bg-surface-2/50 rounded-xl border border-line shadow-sm">
            {displayedTools.map((tool) => {
              const isActive = pathname.startsWith(tool.href);

              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    if (!activeSession) {
                      openSessionModal(tool.href);
                    } else {
                      router.push(tool.href);
                    }
                  }}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-xs font-medium",
                    isActive
                      ? "bg-white text-ink shadow-sm ring-1 ring-line"
                      : "text-muted hover:text-ink-soft hover:bg-surface-2"
                  )}
                >
                  <tool.icon size={14} className={cn(isActive ? tool.color : "text-muted")} />
                  <span>{tool.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-glow"
                      className="absolute inset-0 bg-white/50 blur-sm rounded-lg -z-10"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Active Scribe Recording Pill */}
          {(isRecording || isPaused) && (
            <button
              onClick={() => {
                if (recordingPatientId) {
                  setActivePatientId(recordingPatientId);
                  router.push("/scribe");
                }
              }}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all hover:scale-[1.02] shadow-sm cursor-pointer mr-2",
                isRecording 
                  ? "bg-red-50 text-red-600 border-red-200 animate-pulse" 
                  : "bg-orange-50 text-orange-600 border-orange-200"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full", isRecording ? "bg-red-600 animate-ping" : "bg-orange-600")} />
              <span className="max-w-[120px] truncate">
                {isRecording ? "Recording" : "Paused"}: {recordingPatientName}
              </span>
              <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-100 text-gray-700">
                {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
              </span>
            </button>
          )}
          {activePatient && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                  setShowDeleteConfirm(false);
                }}
                className={cn(
                  "p-2.5 text-muted hover:text-ink hover:bg-surface-2/50 rounded-xl transition-all cursor-pointer flex items-center justify-center",
                  isMenuOpen && "bg-surface-2 text-ink"
                )}
              >
                <MoreVertical size={18} />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 z-50 origin-top-right"
                  >
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 size={14} />
                        Delete Patient
                      </button>
                    ) : (
                      <div className="p-2 space-y-2 text-center bg-red-50/50 border border-red-100 rounded-xl">
                        <p className="text-[10px] font-black text-red-800 uppercase tracking-wider leading-relaxed">
                          Delete everything?
                        </p>
                        <p className="text-[9px] text-red-600 font-semibold leading-relaxed">
                          This wipes all session data and consultations permanently.
                        </p>
                        <div className="flex gap-2 justify-center pt-1.5">
                          <button
                            onClick={handleDeletePatient}
                            disabled={isDeleting}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white transition-colors cursor-pointer flex items-center gap-1"
                          >
                            {isDeleting ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              "Yes, wipe"
                            )}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            Keep
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
