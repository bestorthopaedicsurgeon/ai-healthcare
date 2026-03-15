"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Mic2, 
  Phone, 
  MessageSquare, 
  Settings, 
  Bell, 
  HelpCircle, 
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePatient } from "@/context/PatientContext";

const navItems = [
  { id: "triage", label: "Triage", icon: Phone, href: "/triage" },
  { id: "scribe", label: "Scribe", icon: Mic2, href: "/scribe" },
  { id: "chat", label: "AI Chat", icon: MessageSquare, href: "/chat" },
];

const secondaryItems = [
  { id: "notifications", label: "Notifications", icon: Bell, href: "/notifications" },
  { id: "help", label: "Help", icon: HelpCircle, href: "/help" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, setSidebarCollapsed } = usePatient();

  return (
    <aside className="w-[240px] h-screen bg-sidebar-bg text-sidebar-fg flex flex-col p-4 border-r border-sidebar-bg/10 select-none shrink-0">
      {/* Logo Area */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center">
          <span className="font-bold text-lg">H</span>
        </div>
        <span className="font-semibold text-xl tracking-tight">Heidi</span>
        <div className="ml-auto opacity-40">
           <LayoutGrid size={18} />
        </div>
      </div>

      {/* New Session Button */}
      <button className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg py-2.5 px-4 flex items-center gap-2 transition-all mb-8 font-medium shadow-lg shadow-accent-primary/20">
        <Plus size={20} />
        <span>New session</span>
      </button>

      {/* Primary Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                isActive 
                  ? "bg-sidebar-active-bg text-white font-medium" 
                  : "text-sidebar-fg/60 hover:bg-sidebar-hover-bg hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-white" : "text-sidebar-fg/40 group-hover:text-white")} />
              <span>{item.label}</span>
              {isActive && (
                <>
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-accent-primary rounded-r-full"
                  />
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setSidebarCollapsed(!isSidebarCollapsed);
                    }}
                    className="ml-auto p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Secondary Nav */}
      <div className="mt-auto space-y-1 pt-4 border-t border-sidebar-fg/5">
        {secondaryItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-fg/60 hover:bg-sidebar-hover-bg hover:text-white transition-all group"
          >
            <item.icon size={18} className="text-sidebar-fg/40 group-hover:text-white" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}

        {/* Profile Button */}
        <div className="pt-4 flex items-center gap-3 px-2 py-3 mt-2 rounded-xl hover:bg-sidebar-hover-bg cursor-pointer transition-all group">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold ring-2 ring-sidebar-fg/10 group-hover:ring-accent-primary transition-all">
            RA
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Rabi Ahmed</span>
            <span className="text-[10px] text-sidebar-fg/40 truncate w-24">ahmedrabi@gmail.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
