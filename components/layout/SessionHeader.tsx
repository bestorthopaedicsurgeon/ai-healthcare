"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mic2, Phone, MessageSquare, FileText, ChevronRight, Activity, Clock, Share2, MoreVertical, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePatient } from "@/context/PatientContext";

const tools = [
  { id: "scribe", label: "Scribe", icon: Mic2, href: "/scribe", color: "text-blue-500", bg: "bg-blue-50" },
  { id: "triage", label: "Triage", icon: FileText, href: "/triage", color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "chat", label: "AI Chat", icon: MessageSquare, href: "/chat", color: "text-purple-500", bg: "bg-purple-50" },
  { id: "voice", label: "Voice Agent", icon: Phone, href: "/voice-agent", color: "text-green-500", bg: "bg-green-50" },
];

export function SessionHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeSession, openSessionModal } = usePatient();

  const isDashboard = pathname === "/dashboard";

  if (!activeSession && !isDashboard) return (
    <header className="h-16 border-b border-gray-100 bg-white flex items-center px-8 shrink-0">
        <div className="flex items-center gap-2 text-gray-400">
            <Activity size={18} />
            <span className="text-sm font-medium italic">Select a patient session to begin workspace</span>
        </div>
    </header>
  );

  return (
    <header className="h-20 border-b border-gray-100 bg-white flex flex-col justify-between shrink-0">
      <div className="flex-1 flex items-center justify-between px-8">
        {/* Context Breadcrumbs */}
        <div className="flex items-center gap-4">
          {isDashboard ? (
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                    <LayoutDashboard size={18} />
                </div>
                <h1 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Main Dashboard</h1>
             </div>
          ) : activeSession && (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm border border-blue-100">
                {activeSession.patient_name.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <h1 className="text-sm font-bold text-gray-900 leading-tight">
                        {activeSession.patient_name}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={10} className="text-gray-400" />
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                            Visit: {new Date(activeSession.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
          )}
          
          {!isDashboard && activeSession && (
            <>
                <ChevronRight size={14} className="text-gray-300" />
                <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {tools.find(t => pathname.startsWith(t.href))?.label || "Workspace"}
                    </span>
                </div>
            </>
          )}
        </div>

        {/* Global Tools Navigation (TABS) - Intercepts if no session */}
        <nav className="flex items-center gap-1 p-1 bg-gray-100/50 rounded-xl border border-gray-100 shadow-sm">
          {tools.map((tool) => {
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
                  "relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-xs font-bold",
                  isActive 
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
              >
                <tool.icon size={14} className={cn(isActive ? tool.color : "text-gray-400")} />
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
            <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                <Share2 size={18} />
            </button>
            <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                <MoreVertical size={18} />
            </button>
        </div>
      </div>
    </header>
  );
}
