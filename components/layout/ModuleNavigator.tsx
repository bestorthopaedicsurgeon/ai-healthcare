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
    <div className="flex items-center gap-1 p-1 bg-gray-100/50 rounded-xl border border-gray-100 shadow-sm">
      {modules.map((mod) => {
        const isActive = pathname.startsWith(mod.href);
        return (
          <Link
            key={mod.href}
            href={mod.href}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium",
              isActive 
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            )}
          >
            <mod.icon size={14} className={cn(isActive ? mod.color : "text-gray-400")} />
            <span>{mod.label}</span>
            {isActive && (
                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-white/50 blur-sm rounded-lg -z-10" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
