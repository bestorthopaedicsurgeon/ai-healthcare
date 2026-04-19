"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Settings, 
  HelpCircle,
  Plus,
  ChevronDown,
  History,
  Clock,
  LogOut,
  Search,
  Activity,
  Play,
  User,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePatient, Patient, Session } from "@/context/PatientContext";
import { useAuth } from "@/context/AuthContext";
import { CreatePatientModal } from "../modals/CreatePatientModal";
import { CreateSessionModal } from "../modals/CreateSessionModal";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    isSidebarCollapsed, 
    patients, 
    activePatientId, 
    activeSessionId,
    setActivePatientId,
    setActiveSessionId,
    getSessionsForPatient,
    openSessionModal,
    isLoading 
  } = usePatient();
  const { physician, logout } = useAuth();
  
  const [search, setSearch] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.reference_number.toString().includes(search)
  ).slice(0, 15); // Show top 15 in sidebar for efficiency

  const formatExpiry = (expiryStr: string) => {
    const expiry = new Date(expiryStr);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d`;
    return `${hours}h ${mins}m`;
  };

  const isExpired = (expiryStr: string) => {
    return new Date(expiryStr).getTime() < new Date().getTime();
  };

  const initials = physician?.full_name
    ? physician.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "DR";

  const handleGoToDashboard = () => {
    setActiveSessionId(null);
    router.push("/dashboard");
  };

  return (
    <aside className="w-[300px] h-screen bg-sidebar-bg text-sidebar-fg flex flex-col border-r border-white/5 select-none shrink-0 overflow-hidden glass-dark-premium relative">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-accent-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Header Area */}
      <div className="p-7 pb-4 relative">
        <button 
            onClick={handleGoToDashboard}
            className="flex items-center gap-3 mb-10 group transition-all"
        >
            <div className="w-9 h-9 rounded-xl bg-accent-primary flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] shrink-0 group-hover:scale-110 transition-transform">
                <span className="font-black text-white text-xl leading-none italic">C</span>
            </div>
            <span className="font-bold text-2xl tracking-tighter text-white">Cliniq<span className="text-accent-primary">AI</span></span>
        </button>

        {/* New Patient Button */}
        <button 
            onClick={() => setIsPatientModalOpen(true)}
            className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white rounded-2xl py-3.5 px-4 flex items-center justify-center gap-3 transition-all mb-8 font-bold shadow-[0_8px_20px_-4px_rgba(99,102,241,0.4)] group active:scale-[0.97]"
        >
            <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-sm">New Patient Registry</span>
        </button>

        {/* Search */}
        <div className="relative group mb-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sidebar-fg/20 group-focus-within:text-accent-primary transition-colors duration-300" size={16} />
            <input 
                type="text"
                placeholder="Search database..."
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all placeholder:text-sidebar-fg/20 font-medium hover:bg-white/[0.05]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* Patient Explorer */}
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3 custom-scrollbar relative z-10">
        <div className="text-[10px] font-bold text-sidebar-fg/20 uppercase tracking-[0.25em] mb-4 pl-3 flex items-center justify-between group">
            <div className="flex items-center gap-2">
                <Activity size={12} className="text-accent-primary" /> Active Patients
            </div>
            <button onClick={handleGoToDashboard} className="text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline">Full View</button>
        </div>

        {isLoading && patients.length === 0 ? (
            <div className="space-y-4 px-2">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-14 w-full bg-white/[0.02] rounded-2xl animate-pulse" />
                ))}
            </div>
        ) : filteredPatients.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-white/[0.01] rounded-[32px] border border-white/5 mx-2">
                <div className="w-12 h-12 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto">
                  <Search size={20} className="text-sidebar-fg/10" />
                </div>
                <p className="text-xs text-sidebar-fg/20 font-medium px-6">No matching records</p>
            </div>
        ) : filteredPatients.map((patient) => {
            const isSelected = activePatientId === patient.id;
            const patientSessions = getSessionsForPatient(patient.full_name);
            
            return (
                <div key={patient.id} className="space-y-2">
                    <button
                        onClick={() => {
                            setActivePatientId(patient.id);
                            router.push(`/patients/${patient.id}`);
                        }}
                        className={cn(
                            "w-full text-left p-4 rounded-2xl transition-all group border relative overflow-hidden",
                            isSelected 
                                ? "bg-white/[0.05] border-white/5 shadow-xl" 
                                : "bg-transparent border-transparent hover:bg-white/[0.02]"
                        )}
                    >
                        {isSelected && <motion.div layoutId="patient-glow" className="absolute inset-0 bg-accent-primary/5 pointer-events-none" />}
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all text-[10px] font-black shrink-0",
                                isSelected ? "bg-accent-primary text-white glow-accent" : "bg-white/5 text-sidebar-fg/30 group-hover:bg-white/10"
                            )}>
                                {patient.full_name.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className={cn("text-[13px] font-bold truncate transition-colors", isSelected ? "text-white" : "text-sidebar-fg/70 group-hover:text-white")}>
                                    {patient.full_name}
                                </span>
                                <span className="text-[10px] text-sidebar-fg/30 font-bold tracking-tight">
                                    REF-{patient.reference_number}
                                </span>
                            </div>
                            <div className={cn("transition-transform duration-500", isSelected ? "rotate-180 text-accent-primary" : "text-sidebar-fg/10")}>
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </button>

                    <AnimatePresence>
                        {isSelected && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-black/20 rounded-[24px] border border-white/[0.03] ml-2"
                            >
                                <div className="p-4 space-y-4">
                                    <button 
                                        onClick={() => openSessionModal("/scribe")}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-white/[0.05] text-white hover:bg-accent-primary rounded-xl text-xs font-bold transition-all active:scale-95 group"
                                    >
                                        <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Start Consultation
                                    </button>

                                    <div className="space-y-1.5">
                                        <div className="text-[9px] font-black text-sidebar-fg/10 uppercase tracking-widest mb-3 px-1">Case History</div>
                                        {patientSessions.length === 0 ? (
                                             <p className="text-[10px] text-sidebar-fg/20 italic px-2 py-2">No previous visits</p>
                                        ) : patientSessions.slice(0, 3).map(session => (
                                            <button
                                                key={session.session_id}
                                                onClick={() => setActiveSessionId(session.session_id)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-2.5 rounded-xl transition-all border",
                                                    activeSessionId === session.session_id
                                                        ? "bg-white/[0.03] border-white/5 text-white"
                                                        : "bg-transparent border-transparent text-sidebar-fg/40 hover:bg-white/[0.02]"
                                                )}
                                            >
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <span className="text-[10px] font-bold truncate">
                                                        {new Date(session.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={cn(
                                                            "w-1 h-1 rounded-full animate-pulse",
                                                            isExpired(session.expires_at) ? "bg-sidebar-fg/20" : "bg-emerald-500"
                                                        )} />
                                                        <span className="text-[9px] font-bold uppercase opacity-40">
                                                            {isExpired(session.expires_at) ? "Archived" : "Live Session"}
                                                        </span>
                                                    </div>
                                                </div>
                                                {activeSessionId === session.session_id && <Play size={10} fill="currentColor" className="text-accent-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        })}
      </div>

      {/* Footer Nav */}
      <div className="p-5 border-t border-white/5 space-y-1 bg-black/10 backdrop-blur-md">
        <button 
            onClick={handleGoToDashboard}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group",
                pathname === "/dashboard" ? "bg-accent-primary text-white glow-accent" : "text-sidebar-fg/30 hover:bg-white/5 hover:text-white"
            )}
        >
            <LayoutDashboard size={18} className={cn("transition-transform group-hover:scale-110", pathname === "/dashboard" && "text-white")} />
            <span className="text-sm font-bold">Clinical Hub</span>
        </button>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sidebar-fg/30 hover:bg-white/5 hover:text-white transition-all group"
        >
          <HelpCircle size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-bold">Documentation</span>
        </button>

        {/* Profile */}
        <div className="relative pt-3 mt-2">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 cursor-pointer transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center text-xs font-black ring-1 ring-white/10 group-hover:ring-accent-primary transition-all text-accent-primary shrink-0">
              {initials}
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-sm font-bold text-white truncate">
                {physician?.full_name ?? "Doctor"}
              </span>
              <span className="text-[10px] font-bold text-sidebar-fg/20 truncate uppercase tracking-tighter">
                {physician?.specialty ?? "Medical Staff"}
              </span>
            </div>
            <ChevronDown size={14} className={cn("ml-auto text-sidebar-fg/10 transition-transform", showProfileMenu && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
                <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full mb-3 left-0 right-0 bg-sidebar-bg border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 glass-dark-premium"
                >
                <div className="px-5 py-4 border-b border-white/5">
                    <p className="text-xs font-black text-white truncate mb-0.5">{physician?.full_name}</p>
                    <p className="text-[10px] text-sidebar-fg/30 truncate font-bold uppercase">{physician?.email}</p>
                </div>
                <div className="p-2">
                  <button
                      onClick={() => { setShowProfileMenu(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold"
                  >
                      <LogOut size={16} />
                      Log Out
                  </button>
                </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CreatePatientModal 
        isOpen={isPatientModalOpen} 
        onClose={() => setIsPatientModalOpen(false)} 
      />
    </aside>
  );
}
