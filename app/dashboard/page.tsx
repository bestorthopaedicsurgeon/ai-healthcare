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
  Users
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
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Clinical Core</h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Next-Generation Health Management</p>
          </div>
          <Button
            onClick={() => setIsPatientModalOpen(true)}
            size="lg"
            className="gap-3 bg-accent-primary cursor-pointer hover:bg-accent-primary/90 text-white shadow-2xl shadow-accent-primary/30 rounded-[20px] h-16 px-10 font-black tracking-tight"
          >
            <Plus size={22} className="stroke-[3]" /> Register New Patients
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-premium flex flex-col gap-6 group hover:translate-y-[-8px] transition-all duration-500 hover:shadow-2xl hover:border-accent-primary/10"
            >
              <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center transition-all group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon size={28} className="stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{stat.label}</span>
                <p className="text-4xl font-black text-gray-900 tracking-tighter italic">{stat.value}</p>
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
                    placeholder="Search database records..."
                    className="bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-6 text-[13px] focus:outline-none focus:ring-4 focus:ring-accent-primary/5 transition-all font-bold min-w-[340px] shadow-sm italic placeholder:text-gray-300"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button className="p-3 bg-white border border-gray-100 rounded-[18px] hover:bg-gray-50 text-gray-400 transition-all shadow-sm">
                  <Filter size={20} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[48px] border border-gray-100 shadow-premium overflow-hidden transition-all hover:shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-50/50 bg-gray-50/30">
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient ID</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Legal Name</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Demographics</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Workflow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="px-10 py-6 border-b border-gray-50"><div className="h-6 bg-gray-100 rounded-xl" /></td>
                        </tr>
                      ))
                    ) : filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-10 py-24 text-center">
                          <div className="max-w-xs mx-auto space-y-4 italic">
                            <Search className="mx-auto text-gray-200" size={48} />
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No results found for "{search}"</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredPatients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="group hover:bg-gray-50/80 transition-all border-b border-gray-50 last:border-0 cursor-pointer relative"
                        onClick={() => handleSelectPatient(patient.id)}
                      >
                        <td className="px-10 py-7 font-mono text-[11px] font-black text-gray-300">REF-{patient.reference_number}</td>
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-5">
                            <div className="w-11 h-11 rounded-[15px] bg-gray-50 text-gray-400 flex items-center justify-center font-black text-[13px] group-hover:bg-accent-primary/10 group-hover:text-accent-primary transition-all shadow-sm">
                              {patient.full_name.charAt(0)}
                            </div>
                            <span className="text-[15px] font-black text-gray-900 group-hover:text-accent-primary transition-colors tracking-tight italic">{patient.full_name}</span>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-bold text-gray-600">{patient.dob}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{patient.gender}</span>
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
      />
    </div>
  );
}
