"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic2, Phone, MessageSquare, ChevronRight, FileSpreadsheet, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePatient } from "@/context/PatientContext";

const modules = [
  { label: "Summary", icon: LayoutDashboard, href: "/summary", color: "text-teal-700", bg: "bg-teal-50" },
  { label: "Triage", icon: FileSpreadsheet, href: "/triage", color: "text-teal-700", bg: "bg-teal-50" },
  { label: "Voice", icon: Phone, href: "/voice-agent", color: "text-teal-700", bg: "bg-teal-50" },
  { label: "Scribe", icon: Mic2, href: "/scribe", color: "text-teal-700", bg: "bg-teal-50" },
  { label: "Chat", icon: MessageSquare, href: "/chat", color: "text-teal-700", bg: "bg-teal-50" },
];

export function ModuleNavigator() {
  const pathname = usePathname();
  const { sessionData } = usePatient();

  const isFollowup = sessionData?.patient_type === "followup";
  const displayedModules = modules
    .map((mod) => {
      if (mod.href === "/triage" && isFollowup) {
        return { ...mod, label: "Previous Scribe" };
      }
      return mod;
    })
    .filter((mod) => !(mod.href === "/voice-agent" && isFollowup));

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-surface-2/60 rounded-2xl border border-line shadow-soft relative z-10">
      {displayedModules.map((mod) => {
        const isActive = pathname.startsWith(mod.href);
        return (
          <Link
            key={mod.href}
            href={mod.href}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 rounded-2xl transition-all text-[13px] font-medium relative group",
              isActive 
                ? "bg-white text-ink shadow-soft" 
                : "text-muted hover:text-ink hover:bg-white/50"
            )}
          >
            <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                isActive ? mod.bg : "bg-transparent group-hover:bg-surface-2"
            )}>
                <mod.icon size={16} className={cn(isActive ? mod.color : "text-muted")} />
            </div>
            <span>{mod.label}</span>
            {isActive && (
                <motion.div 
                    layoutId="nav-pill" 
                    className="absolute inset-0 bg-white rounded-2xl -z-10 shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
          </Link>
        );
      })}
    </div>
  );
}
