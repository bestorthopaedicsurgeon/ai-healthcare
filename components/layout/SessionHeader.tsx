"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mic2, Phone, MessageSquare, FileText, ChevronRight, Activity, Clock, Share2, MoreVertical, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePatient } from "@/context/PatientContext";

const tools = [
  { id: "triage", label: "GP Referral", icon: FileText, href: "/triage", color: "text-teal-700", bg: "bg-teal-50" },
  { id: "voice", label: "Voice Agent", icon: Phone, href: "/voice-agent", color: "text-teal-700", bg: "bg-teal-50" },
  { id: "scribe", label: "Scribe", icon: Mic2, href: "/scribe", color: "text-teal-700", bg: "bg-teal-50" },
  { id: "chat", label: "AI Chat", icon: MessageSquare, href: "/chat", color: "text-teal-700", bg: "bg-teal-50" },
];

export function SessionHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeSession, openSessionModal, sessionData } = usePatient();

  const isDashboard = pathname === "/dashboard";

  const isFollowup = sessionData?.patient_type === "followup";
  const displayedTools = tools
    .map(t => {
      if (t.id === "triage" && isFollowup) {
        return { ...t, label: "Previous Scribe" };
      }
      return t;
    })
    .filter(t => !(t.id === "voice" && isFollowup));

  if (!activeSession && !isDashboard) return (
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
          ) : activeSession && (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-medium text-xs shadow-sm border border-teal-100">
                {activeSession.patient_name.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <h1 className="text-sm font-medium text-ink leading-tight flex items-center gap-2">
                        {activeSession.patient_name}
                        {isFollowup && (
                          <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-[9px] font-semibold uppercase tracking-widest leading-none shrink-0">
                            Follow-up
                          </span>
                        )}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={10} className="text-muted" />
                        <span className="text-[10px] text-muted font-medium whitespace-nowrap">
                            Visit: {new Date(activeSession.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
          )}
          
          {!isDashboard && activeSession && (
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

        {/* Actions */}
        <div className="flex items-center gap-2">
            <button className="p-2.5 text-muted hover:text-muted hover:bg-surface-2/50 rounded-xl transition-all">
                <Share2 size={18} />
            </button>
            <button className="p-2.5 text-muted hover:text-muted hover:bg-surface-2/50 rounded-xl transition-all">
                <MoreVertical size={18} />
            </button>
        </div>
      </div>
    </header>
  );
}
