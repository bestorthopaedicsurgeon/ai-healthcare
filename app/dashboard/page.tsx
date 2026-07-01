"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  User,
  Activity,
  Clock,
  ArrowUpRight,
  Filter,
  MoreVertical,
  Calendar,
  Users,
} from "lucide-react";
import { usePatient, Patient, Session } from "@/context/PatientContext";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
// import { CreatePatientModal } from "@/components/modals/CreatePatientModal";
import { BulkUploadWizard } from "@/components/modals/BulkUploadWizard";

export default function DashboardPage() {
  const { patients, sessions, setActivePatientId, setActiveSessionId, openSessionModal, isLoading } = usePatient();
  const [search, setSearch] = useState("");
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const router = useRouter();

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.reference_number.toString().includes(search)
  );

  const now = new Date();
  const activeSessions = sessions.filter(s => new Date(s.expires_at) > now);
  // Real count: any session created today (regardless of expiry).
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sessionsToday = sessions.filter(s => new Date(s.created_at) >= startOfToday).length;

  const stats = [
    { label: "Total patients", value: patients.length, icon: Users },
    { label: "Active sessions", value: activeSessions.length, icon: Activity },
    { label: "Sessions today", value: sessionsToday, icon: Calendar },
  ];

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    router.push("/scribe");
  };

  const handleSelectPatient = (patientId: string) => {
    setActivePatientId(patientId);
    router.push(`/patients/${patientId}`);
  };

  return (
    <div className="relative flex-1 overflow-y-auto bg-background custom-scrollbar">
      <div className="relative z-10 mx-auto max-w-[1500px] space-y-10 p-10">

        {/* Header Section */}
        <div className="flex items-end justify-between">
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-teal-700">
              Clinical hub
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
              Overview
            </h1>
            <p className="text-sm text-muted">
              Your patients and live consults, at a glance.
            </p>
          </div>
          <Button
            onClick={() => setIsPatientModalOpen(true)}
            size="lg"
            className="h-12 gap-2 rounded-2xl bg-teal-700 px-6 font-medium text-white shadow-soft transition-all hover:bg-teal-800"
          >
            <Plus size={18} /> New patient
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-teal-200"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <stat.icon size={20} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-2">{stat.label}</span>
                <p className="font-display text-3xl font-semibold tracking-tight text-ink">{stat.value}</p>
              </div>
            </motion.div>
          ))}
          {/* Support / help card */}
          <button className="group flex flex-col justify-between rounded-2xl border border-teal-100 bg-teal-50 p-6 text-left transition-all hover:border-teal-200">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700 text-white">
              <User size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink">Need a hand?</h3>
              <p className="flex items-center gap-1 text-xs font-medium text-teal-700">
                Visit the support centre <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </p>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* Active Sessions List */}
          <div className="space-y-5 xl:col-span-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-ink">
                <Activity size={18} className="text-teal-700" /> Live consults
              </h2>
              <div className="flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 ring-1 ring-teal-100">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700">{activeSessions.length} online</span>
              </div>
            </div>

            <div className="space-y-3">
              {activeSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-surface-2/40 p-12 text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-2">No active consults</p>
                </div>
              ) : activeSessions.map((session, i) => (
                <motion.button
                  key={session.session_id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSelectSession(session.session_id)}
                  className="group relative w-full overflow-hidden rounded-2xl border border-line bg-surface p-5 text-left shadow-soft transition-all hover:border-teal-200"
                >
                  <div className="absolute right-0 top-0 p-5 opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowUpRight size={18} className="text-teal-700" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-lg font-semibold text-teal-700">
                      {session.patient_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-ink">{session.patient_name}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Clock size={13} className="text-muted-2" />
                        <span className="text-[11px] font-medium text-muted">
                          Started {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Patient Directory Table */}
          <div className="space-y-5 xl:col-span-8">
            <div className="flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-ink">
                <Users size={18} className="text-teal-700" /> Patient registry
              </h2>
              <div className="flex items-center gap-3">
                <div className="group relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2 transition-colors group-focus-within:text-teal-700" size={16} />
                  <input
                    type="text"
                    placeholder="Search patients…"
                    className="min-w-[300px] rounded-xl border border-line bg-surface py-2.5 pl-10 pr-5 text-[13px] font-medium text-ink transition-all placeholder:text-muted-2 focus:border-[#0A6256] focus:bg-[#EAF5F2] focus:outline-none focus:ring-2 focus:ring-[#7FBDB4]/60"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button className="rounded-xl border border-line bg-surface p-2.5 text-muted transition-all hover:bg-surface-2/60 hover:text-ink">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line bg-surface-2/40">
                      <th className="px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">Patient ID</th>
                      <th className="px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">Name</th>
                      <th className="px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">Demographics</th>
                      <th className="px-8 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">Workflow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="border-b border-line px-8 py-5"><div className="h-6 rounded-lg bg-surface-2" /></td>
                        </tr>
                      ))
                    ) : filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center">
                          <div className="mx-auto max-w-xs space-y-3">
                            <Search className="mx-auto text-line-strong" size={40} />
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-2">No results for &ldquo;{search}&rdquo;</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredPatients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="group cursor-pointer border-b border-line transition-all last:border-0 hover:bg-surface-2/50"
                        onClick={() => handleSelectPatient(patient.id)}
                      >
                        <td className="px-8 py-5 font-mono-num text-[11px] font-semibold text-muted-2">REF-{patient.reference_number}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-[13px] font-semibold text-muted transition-all group-hover:bg-teal-100 group-hover:text-teal-700">
                              {patient.full_name.charAt(0)}
                            </div>
                            <span className="text-[15px] font-semibold tracking-tight text-ink transition-colors group-hover:text-teal-700">{patient.full_name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-medium text-ink-soft">{patient.dob}</span>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-2">{patient.gender}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePatientId(patient.id);
                                openSessionModal("/scribe");
                              }}
                              className="rounded-lg bg-teal-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-teal-700 opacity-0 transition-all hover:bg-teal-700 hover:text-white active:scale-95 group-hover:opacity-100"
                            >
                              Launch session
                            </button>
                            <button className="rounded-lg p-2 text-muted-2 transition-all hover:bg-surface-2 hover:text-ink">
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BulkUploadWizard
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      />
    </div>
  );
}
