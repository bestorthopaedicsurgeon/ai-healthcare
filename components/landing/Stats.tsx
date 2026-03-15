"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "10M+", label: "Patient visits supported" },
  { value: "98.7%", label: "Documentation accuracy" },
  { value: "3hrs", label: "Saved per clinician per day" },
  { value: "50+", label: "Clinical specialties" },
];

const logos = [
  "Mayo Clinic",
  "Cleveland Clinic",
  "Johns Hopkins",
  "Mass General",
  "Cedars-Sinai",
  "Stanford Health",
];

export function Stats() {
  return (
    <section className="relative py-32">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-[#755760] font-medium">
            Impact
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-[#28030f]">
            Real-world results from{" "}
            <span className="text-[#755760]">real clinicians</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl border border-[#d4c4c9]/40 bg-white/60"
            >
              <p className="text-3xl md:text-4xl font-bold text-[#28030f] mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-[#755760]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#755760] mb-8">
            Trusted by leading healthcare organizations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {logos.map((logo) => (
              <span
                key={logo}
                className="text-sm font-semibold text-[#755760]/50 hover:text-[#28030f] transition-colors"
              >
                {logo}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
