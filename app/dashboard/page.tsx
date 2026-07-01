"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  User,
  Activity,
  Clock,
  ChevronRight,
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
  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.reference_number.toString().includes(search)
  );

    const stats = [
      { label: "Total Patients", value: patients.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    ];

    const handleSelectPatient = (patientId: string) => {
      setActivePatientId(patientId);
      router.push(`/patients/${patientId}`);
    };

    return (
      <div className="flex-1 bg-background overflow-y-auto custom-scrollbar relative">
        {/* Decorative Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-primary/5 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[160px] pointer-events-none" />

        <div className="max-w-[1700px] mx-auto p-12 space-y-12 relative z-10">

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
              <Button
            onClick={() => setIsPatientModalOpen(true)}
              size="lg"
              className="gap-3 bg-accent-primary cursor-pointer hover:bg-accent-primary/90 text-white shadow-2xl shadow-accent-primary/30 rounded-[20px] h-16 px-10 font-black tracking-tight"
            >
              <Plus size={22} className="stroke-[3]" /> Register New Patients
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
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            {/* Patient Directory Table */}
            <div className="xl:col-span-12 space-y-8">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <Users size={24} className="text-blue-500 stroke-[3]" /> Patient Registry
                </h2>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-primary transition-colors" size={16} />
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
                            className="group hover:bg-gray-50/80 transition-all border-b border-gray-50 last:border-0 cursor-pointer relative"
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
                            <td className="px-10 py-7 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button className="p-2.5 text-gray-300 hover:text-gray-900 hover:bg-white rounded-xl transition-all shadow-sm group-hover:bg-white">
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

        {/* <CreatePatientModal 
        isOpen={isPatientModalOpen} 
        onClose={() => setIsPatientModalOpen(false)} 
      /> */}

        <BulkUploadWizard
          isOpen={isPatientModalOpen}
          onClose={() => setIsPatientModalOpen(false)}
          isOpen={isPatientModalOpen}
          onClose={() => setIsPatientModalOpen(false)}
        />
      </div>
    );
  }
