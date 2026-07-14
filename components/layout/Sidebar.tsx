"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  HelpCircle,
  Plus,
  ChevronDown,
  LogOut,
  Search,
  Activity,
  LayoutDashboard,
  Mic2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePatient, Patient } from "@/context/PatientContext";
import { useAuth } from "@/context/AuthContext";
import { BulkUploadWizard } from "../modals/BulkUploadWizard";
import { Logo } from "@/components/brand/Logo";

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
    isLoading,
  } = usePatient();
  const { physician, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  const filteredPatients = patients
    .filter(
      (p) =>
        p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.reference_number.toString().includes(search)
    )
    .slice(0, 15); // Show top 15 in sidebar for efficiency

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
    ? physician.full_name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "DR";

  const handleGoToDashboard = () => {
    setActiveSessionId(null);
    setActivePatientId(null);
    router.push("/dashboard");
  };

  return (
    <aside className="relative flex h-screen w-[300px] shrink-0 select-none flex-col overflow-hidden border-r border-line bg-surface text-ink">
      {/* Header Area */}
      <div className="relative p-6 pb-4">
        <button
          onClick={handleGoToDashboard}
          className="mb-8 flex items-center transition-opacity hover:opacity-80"
        >
          <Logo href={null} />
        </button>

        {/* New Patient Button */}
        <button
          onClick={() => setIsPatientModalOpen(true)}
          className="group mb-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-teal-700 px-4 py-3 font-medium text-white shadow-soft transition-all hover:bg-teal-800 active:scale-[0.98]"
        >
          <Plus
            size={18}
            className="transition-transform duration-500 group-hover:rotate-90"
          />
          <span className="text-sm">New patient</span>
        </button>

        {/* Search */}
        <div className="group relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2 transition-colors group-focus-within:text-teal-700"
            size={16}
          />
          <input
            type="text"
            placeholder="Search patients…"
            className="w-full rounded-xl border border-line bg-surface-2/60 py-2.5 pl-10 pr-4 text-sm text-ink transition-all placeholder:text-muted-2 hover:bg-surface-2 focus:border-[#0A6256] focus:bg-[#EAF5F2] focus:outline-none focus:ring-2 focus:ring-[#7FBDB4]/60"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Patient Explorer */}
      <div className="custom-scrollbar relative z-10 flex-1 space-y-1.5 overflow-y-auto px-4 py-2">
        <div className="group mb-2 flex items-center justify-between pl-2 pr-1">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">
            <Activity size={12} className="text-teal-700" /> Active patients
          </div>
          <button
            onClick={handleGoToDashboard}
            className="text-[10px] font-medium text-teal-700 opacity-0 transition-opacity hover:underline group-hover:opacity-100"
          >
            View all
          </button>
        </div>

        {isLoading && patients.length === 0 ? (
          <div className="space-y-2 px-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 w-full animate-pulse rounded-xl bg-surface-2"
              />
            ))}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="mx-1 space-y-3 rounded-2xl border border-dashed border-line bg-surface-2/40 py-14 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface ring-1 ring-line">
              <Search size={18} className="text-muted-2" />
            </div>
            <p className="px-6 text-xs font-medium text-muted">
              No matching records
            </p>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const isSelected = activePatientId === patient.id;

            return (
              <div key={patient.id} className="space-y-1.5">
                <button
                  onClick={() => {
                    setActivePatientId(patient.id);
                    router.push(`/patients/${patient.id}`);
                  }}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-xl border p-3 text-left transition-all",
                    isSelected
                      ? "border-teal-200 bg-teal-50"
                      : "border-transparent bg-transparent hover:bg-surface-2/60"
                  )}
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold transition-all",
                        isSelected
                          ? "bg-teal-700 text-white"
                          : "bg-surface-2 text-muted group-hover:bg-teal-100 group-hover:text-teal-700"
                      )}
                    >
                      {patient.full_name.charAt(0)}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span
                        className={cn(
                          "truncate text-[13px] font-semibold transition-colors",
                          isSelected
                            ? "text-teal-700"
                            : "text-ink-soft group-hover:text-ink"
                        )}
                      >
                        {patient.full_name}
                      </span>
                      <span className="font-mono-num text-[10px] text-muted-2">
                        REF-{patient.reference_number}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Nav */}
      <div className="space-y-1 border-t border-line bg-surface-2/30 p-4">
        <button
          onClick={handleGoToDashboard}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all",
            pathname === "/dashboard"
              ? "bg-teal-50 text-teal-700"
              : "text-muted hover:bg-surface-2/60 hover:text-ink"
          )}
        >
          <LayoutDashboard
            size={18}
            className="transition-transform group-hover:scale-105"
          />
          <span className="text-sm font-medium">Clinical hub</span>
        </button>
        <button
          onClick={() => router.push("/settings/voice-agent")}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all",
            pathname === "/settings/voice-agent"
              ? "bg-teal-50 text-teal-700"
              : "text-muted hover:bg-surface-2/60 hover:text-ink"
          )}
        >
          <Mic2
            size={18}
            className="transition-transform group-hover:scale-105"
          />
          <span className="text-sm font-medium">Voice agent settings</span>
        </button>
        <button className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-muted transition-all hover:bg-surface-2/60 hover:text-ink">
          <HelpCircle
            size={18}
            className="transition-transform group-hover:rotate-12"
          />
          <span className="text-sm font-medium">Documentation</span>
        </button>

        {/* Profile */}
        <div className="relative mt-1 pt-3">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="group flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 transition-all hover:bg-surface-2/60"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-xs font-semibold text-teal-700 ring-1 ring-line transition-all group-hover:ring-teal-200">
              {initials}
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="truncate text-sm font-semibold text-ink">
                {physician?.full_name ?? "Doctor"}
              </span>
              <span className="truncate text-[10px] font-medium uppercase tracking-tight text-muted-2">
                {physician?.specialty ?? "Medical staff"}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={cn(
                "ml-auto text-muted-2 transition-transform",
                showProfileMenu && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 right-0 z-50 mb-3 overflow-hidden rounded-2xl border border-line bg-surface shadow-lifted"
              >
                <div className="border-b border-line px-5 py-4">
                  <p className="mb-0.5 truncate text-xs font-semibold text-ink">
                    {physician?.full_name}
                  </p>
                  <p className="truncate text-[10px] font-medium uppercase text-muted-2">
                    {physician?.email}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <BulkUploadWizard
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      />
    </aside>
  );
}
