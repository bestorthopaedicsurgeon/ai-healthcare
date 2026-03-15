"use client";

import { motion } from "framer-motion";
import {
  Mic,
  FileText,
  ShieldCheck,
  GitPullRequestArrow,
  Zap,
  Globe,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function BentoGrid() {
  return (
    <section className="py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-[#755760] font-medium">
            Product
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-[#28030f]">
            Built for the way{" "}
            <span className="text-[#755760]">clinicians work</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-6 gap-4"
        >
          {/* Large — Ambient Scribe */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-4 rounded-2xl border border-[#d4c4c9]/40 bg-white/60 p-8 hover:bg-white hover:shadow-lg hover:shadow-[#28030f]/5 transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#f9f4f1] border border-[#d4c4c9]/20 flex items-center justify-center mb-3 text-[#28030f]/70">
                  <FileText size={20} />
                </div>
                <h3 className="text-lg font-semibold text-[#28030f]">
                  Ambient Scribe
                </h3>
                <p className="text-sm text-[#755760] mt-1 max-w-sm">
                  AI listens to the consultation and generates structured
                  clinical notes in real time.
                </p>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                Live
              </span>
            </div>
            <div className="rounded-xl bg-[#f9f4f1]/70 border border-[#d4c4c9]/20 p-5 space-y-3">
              {[
                { label: "S", text: 'Chief Complaint: "Recurring headaches for 3 weeks, worse in the morning"' },
                { label: "O", text: "BP 138/88, HR 72, Temp 98.4°F. Mild tenderness on palpation of temporal region." },
                { label: "A", text: "Tension-type headache. Rule out secondary causes given hypertension." },
                { label: "P", text: "Order CBC, BMP, MRI brain. Start amitriptyline 10mg at bedtime." },
              ].map((line) => (
                <div key={line.label} className="flex gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#fdf444]/30 text-[#28030f] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {line.label}
                  </span>
                  <p className="text-sm text-[#28030f]/70 leading-relaxed">
                    {line.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tall — Compliance */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-2 md:row-span-2 rounded-2xl border border-[#d4c4c9]/40 bg-white/60 p-8 hover:bg-white hover:shadow-lg hover:shadow-[#28030f]/5 transition-all flex flex-col"
          >
            <div className="w-10 h-10 rounded-xl bg-[#f9f4f1] border border-[#d4c4c9]/20 flex items-center justify-center mb-3 text-[#28030f]/70">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-semibold text-[#28030f]">
              Enterprise Security
            </h3>
            <p className="text-sm text-[#755760] mt-1 mb-6">
              Every byte encrypted. Every action logged. Every standard met.
            </p>
            <div className="flex-1 flex flex-col justify-end gap-2.5">
              {[
                { name: "HIPAA", pct: 100 },
                { name: "ADHA", pct: 100 },
                { name: "SOC 2 Type II", pct: 100 },
                { name: "ISO 27001", pct: 100 },
                { name: "GDPR", pct: 100 },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#28030f]/70">
                      {item.name}
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      {item.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#f9f4f1]">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Medium — Voice Intake */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-2 rounded-2xl border border-[#d4c4c9]/40 bg-white/60 p-8 hover:bg-white hover:shadow-lg hover:shadow-[#28030f]/5 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#f9f4f1] border border-[#d4c4c9]/20 flex items-center justify-center mb-3 text-[#28030f]/70">
              <Mic size={20} />
            </div>
            <h3 className="text-lg font-semibold text-[#28030f]">
              Voice Intake
            </h3>
            <p className="text-sm text-[#755760] mt-1 mb-4">
              Structured pre-consult calls that save 15 min per patient.
            </p>
            <div className="flex items-end gap-0.5 h-10">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full bg-[#28030f]/10"
                  style={{
                    height: `${20 + Math.sin(i * 0.5) * 40 + Math.random() * 30}%`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Small — Triage */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-2 rounded-2xl border border-[#d4c4c9]/40 bg-white/60 p-8 hover:bg-white hover:shadow-lg hover:shadow-[#28030f]/5 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#f9f4f1] border border-[#d4c4c9]/20 flex items-center justify-center mb-3 text-[#28030f]/70">
              <GitPullRequestArrow size={20} />
            </div>
            <h3 className="text-lg font-semibold text-[#28030f]">
              Smart Triage
            </h3>
            <p className="text-sm text-[#755760] mt-1 mb-4">
              AI categorizes referrals by urgency in milliseconds.
            </p>
            <div className="flex gap-2">
              {[
                { label: "Critical", color: "bg-red-500", w: "w-[15%]" },
                { label: "Urgent", color: "bg-amber-400", w: "w-[30%]" },
                { label: "Routine", color: "bg-green-400", w: "w-[55%]" },
              ].map((seg) => (
                <div key={seg.label} className={`${seg.w} flex flex-col items-center gap-1`}>
                  <div className={`h-2 w-full rounded-full ${seg.color}`} />
                  <span className="text-[10px] text-[#755760]">{seg.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Wide bottom — Speed + Languages */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-3 rounded-2xl border border-[#d4c4c9]/40 bg-white/60 p-8 hover:bg-white hover:shadow-lg hover:shadow-[#28030f]/5 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#f9f4f1] border border-[#d4c4c9]/20 flex items-center justify-center text-[#28030f]/70">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#28030f]">
                  Real-Time Processing
                </h3>
                <p className="text-sm text-[#755760]">
                  Notes generated in under 2 seconds
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 rounded-full bg-[#f9f4f1] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "95%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-linear-to-r from-[#fdf444] to-[#fbf582]"
                />
              </div>
              <span className="text-sm font-bold text-[#28030f]">
                &lt;2s
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="md:col-span-3 rounded-2xl border border-[#d4c4c9]/40 bg-white/60 p-8 hover:bg-white hover:shadow-lg hover:shadow-[#28030f]/5 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#f9f4f1] border border-[#d4c4c9]/20 flex items-center justify-center text-[#28030f]/70">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#28030f]">
                  30+ Languages
                </h3>
                <p className="text-sm text-[#755760]">
                  Serve diverse patient populations effortlessly
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "English", "Spanish", "Mandarin", "Hindi", "Arabic",
                "French", "Portuguese", "German", "Japanese", "Korean",
                "Italian", "Turkish",
              ].map((lang) => (
                <span
                  key={lang}
                  className="text-[11px] text-[#755760] px-2.5 py-1 rounded-full bg-[#f9f4f1] border border-[#d4c4c9]/20"
                >
                  {lang}
                </span>
              ))}
              <span className="text-[11px] text-[#755760] px-2.5 py-1 rounded-full bg-[#fdf444]/20 border border-[#fdf444]/30 font-medium">
                +18 more
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
