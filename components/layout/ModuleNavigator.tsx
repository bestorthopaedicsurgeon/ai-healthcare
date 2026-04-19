"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic2, Phone, MessageSquare, ChevronRight, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const modules = [
  { label: "Triage", icon: FileSpreadsheet, href: "/triage", color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Voice", icon: Phone, href: "/voice-agent", color: "text-green-500", bg: "bg-green-50" },
  { label: "Scribe", icon: Mic2, href: "/scribe", color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Chat", icon: MessageSquare, href: "/chat", color: "text-purple-500", bg: "bg-purple-50" },
];

export function ModuleNavigator() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-sidebar-bg/5 rounded-[20px] border border-gray-100 shadow-premium glass-premium relative z-10">
      {modules.map((mod) => {
        const isActive = pathname.startsWith(mod.href);
        return (
          <Link
            key={mod.href}
            href={mod.href}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 rounded-2xl transition-all text-[13px] font-bold relative group",
              isActive 
                ? "bg-white text-gray-900 shadow-xl shadow-black/5" 
                : "text-gray-400 hover:text-gray-900 hover:bg-white/50"
            )}
          >
            <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                isActive ? mod.bg : "bg-transparent group-hover:bg-gray-100"
            )}>
                <mod.icon size={16} className={cn(isActive ? mod.color : "text-gray-400")} />
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
