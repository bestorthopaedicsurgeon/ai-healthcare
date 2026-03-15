"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useBookDemo } from "./DemoModalContext";

export function Hero() {
  const { open } = useBookDemo();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-radial-hero" />

      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#fdf444]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#f9f4f1] rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4c4c9]/50 bg-white/60 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-[#755760]">
            HIPAA & ADHA Compliant — Enterprise Ready
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6"
        >
          <span className="text-[#28030f]">The AI Platform</span>
          <br />
          <span className="text-[#755760]">for Healthcare</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-lg md:text-xl text-[#755760] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          From referral triage to real-time consultation notes — Cliniq automates
          the clinical workflow so you can focus on what matters most: your
          patients.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            className="group flex items-center gap-2 bg-[#fdf444] hover:bg-[#fbf582] text-[#28030f] font-medium px-8 py-3.5 rounded-full transition-all shadow-sm text-sm"
          >
            Start Free Trial
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <button
            onClick={open}
            className="group flex items-center gap-2 text-[#755760] hover:text-[#28030f] transition-colors text-sm px-6 py-3.5"
          >
            <span className="w-10 h-10 rounded-full border border-[#d4c4c9] flex items-center justify-center group-hover:border-[#28030f]/30 transition-colors bg-white">
              <Play size={14} className="ml-0.5" />
            </span>
            Book a Demo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-20 relative max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl border border-[#d4c4c9]/40 bg-white/70 backdrop-blur-sm p-1 shadow-xl shadow-[#28030f]/5">
            <div className="rounded-xl bg-[#f9f4f1]/50 p-8 md:p-12">
              <div className="grid grid-cols-3 gap-4">
                <DashboardCard
                  label="Referrals Triaged"
                  value="2,847"
                  change="+12%"
                />
                <DashboardCard
                  label="Voice Intakes"
                  value="1,293"
                  change="+8%"
                />
                <DashboardCard
                  label="Notes Generated"
                  value="4,621"
                  change="+24%"
                />
              </div>
              <div className="mt-6 flex gap-4">
                <div className="flex-1 h-32 rounded-lg bg-white/80 border border-[#d4c4c9]/30 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-1">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="w-2 rounded-full bg-linear-to-t from-[#d4c4c9] to-[#28030f]/60"
                            style={{ height: `${h}%` }}
                          />
                        )
                      )}
                    </div>
                    <span className="text-[10px] text-[#755760]">
                      Weekly Activity
                    </span>
                  </div>
                </div>
                <div className="w-48 h-32 rounded-lg bg-white/80 border border-[#d4c4c9]/30 p-4 flex flex-col justify-between">
                  <span className="text-[10px] text-[#755760] uppercase tracking-wider">
                    Compliance
                  </span>
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      100%
                    </span>
                    <p className="text-[10px] text-[#755760] mt-1">
                      HIPAA Adherence
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-[#fdf444]/10 blur-[100px] rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-lg bg-white/80 border border-[#d4c4c9]/30 p-4">
      <p className="text-[10px] text-[#755760] uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-xl md:text-2xl font-bold text-[#28030f]">{value}</p>
      <p className="text-xs mt-1 text-[#755760]">{change} this month</p>
    </div>
  );
}
