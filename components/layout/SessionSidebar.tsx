"use client";

import React from "react";
import { Mic2, Phone, MessageSquare, Plus, LayoutGrid, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { usePatient } from "@/context/PatientContext";
import { AnimatePresence, motion } from "framer-motion";

interface PatientSelectionItem {
  id: string;
  name: string;
  subtitle: string;
  time?: string;
}

interface SessionSidebarProps {
  items: PatientSelectionItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function SessionSidebar({ items, activeId, onSelect }: SessionSidebarProps) {
  const pathname = usePathname();
  const { isSidebarCollapsed } = usePatient();
  
  const getIcon = () => {
    if (pathname.includes("/scribe")) return <Mic2 size={14} className="text-blue-500" />;
    if (pathname.includes("/voice")) return <Phone size={14} className="text-green-500" />;
    if (pathname.includes("/chat")) return <MessageSquare size={14} className="text-purple-500" />;
    return <User size={14} />;
  };

  const getActiveBg = () => {
    if (pathname.includes("/scribe")) return "bg-blue-50 border-blue-100";
    if (pathname.includes("/voice")) return "bg-green-50 border-green-100";
    if (pathname.includes("/chat")) return "bg-purple-50 border-purple-100";
    return "bg-gray-50 border-gray-100";
  };

  return (
    <AnimatePresence>
      {!isSidebarCollapsed && (
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="h-full border-r border-gray-100 bg-white flex flex-col overflow-hidden shrink-0"
        >
          <div className="w-64 flex flex-col h-full">
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex gap-4">
                <button className="text-sm font-bold border-b-2 border-black pb-1 text-gray-900">Patients</button>
                <button className="text-sm font-bold text-gray-400 pb-1 hover:text-gray-600 transition-colors">Recent</button>
                </div>
                <button className="text-gray-400 hover:text-black transition-colors p-1 hover:bg-gray-100 rounded">
                    <Plus size={16} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Active Consultations</div>
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className={cn(
                                "w-full text-left p-3 rounded-xl transition-all border group relative",
                                activeId === item.id 
                                    ? getActiveBg() + " shadow-sm translate-x-1" 
                                    : "bg-white border-transparent hover:bg-gray-50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                    activeId === item.id ? "bg-white shadow-sm" : "bg-gray-100 group-hover:bg-gray-200"
                                )}>
                                    {getIcon()}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className={cn(
                                        "text-xs font-bold truncate",
                                        activeId === item.id ? "text-gray-900" : "text-gray-900"
                                    )}>
                                        {item.name}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[10px] text-gray-400 font-medium truncate">{item.subtitle}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
