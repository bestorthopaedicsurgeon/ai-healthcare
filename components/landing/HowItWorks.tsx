"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Referral Arrives",
    description:
      "Patient referrals flow into the system from any source — fax, email, or EHR. Cliniq instantly parses and categorizes each one.",
    visual: "Triage",
  },
  {
    step: "02",
    title: "Voice Pre-Consult",
    description:
      "Before the appointment, Cliniq conducts an automated voice interview to capture patient history, symptoms, and relevant context.",
    visual: "Intake",
  },
  {
    step: "03",
    title: "Live Consultation",
    description:
      "During the visit, the ambient scribe listens in real-time — documenting the entire consultation while you focus on the patient.",
    visual: "Scribe",
  },
  {
    step: "04",
    title: "Notes & Compliance",
    description:
      "Structured clinical notes are generated instantly, fully compliant with HIPAA and ADHA standards, ready for your EHR.",
    visual: "Secure",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[#f9f4f1]/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-[#755760] font-medium">
            Workflow
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-[#28030f]">
            How it <span className="text-[#755760]">works</span>
          </h2>
          <p className="text-[#755760] max-w-xl mx-auto text-lg">
            A seamless journey from the first referral to the final clinical
            note — fully automated, fully compliant.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-[#d4c4c9] to-transparent hidden lg:block" />

          <div className="space-y-12 lg:space-y-24">
            {steps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1 }}
                className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                  idx % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 text-center lg:text-left">
                  <span className="text-5xl font-bold text-[#d4c4c9]">
                    {step.step}
                  </span>
                  <h3 className="text-2xl font-semibold text-[#28030f] mt-2 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#755760] leading-relaxed max-w-md mx-auto lg:mx-0">
                    {step.description}
                  </p>
                </div>

                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-[#fdf444] shadow-lg shadow-[#fdf444]/30 hidden lg:block" />
                </div>

                <div className="flex-1">
                  <StepVisual step={step.visual} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepVisual({ step }: { step: string }) {
  const visuals: Record<string, React.ReactNode> = {
    Triage: (
      <div className="space-y-3">
        {["Critical", "Urgent", "Routine"].map((level, i) => (
          <div
            key={level}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-[#d4c4c9]/30"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                i === 0
                  ? "bg-red-500"
                  : i === 1
                  ? "bg-amber-500"
                  : "bg-green-500"
              }`}
            />
            <span className="text-sm text-[#28030f]">{level} Priority</span>
            <span className="ml-auto text-xs text-[#755760]">
              {i === 0 ? "3" : i === 1 ? "12" : "28"} referrals
            </span>
          </div>
        ))}
      </div>
    ),
    Intake: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-[#d4c4c9]/30">
          <div className="flex gap-0.5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full bg-[#28030f]/30"
                style={{ height: `${8 + Math.random() * 16}px` }}
              />
            ))}
          </div>
          <span className="text-xs text-[#755760] ml-auto">Recording...</span>
        </div>
        <div className="px-4 py-3 rounded-lg bg-white border border-[#d4c4c9]/30">
          <p className="text-xs text-[#755760] mb-1">Transcript</p>
          <p className="text-sm text-[#28030f]/80">
            &ldquo;Patient reports recurring chest pain for the past 2
            weeks...&rdquo;
          </p>
        </div>
      </div>
    ),
    Scribe: (
      <div className="space-y-2">
        {[
          "Chief Complaint: Recurring chest pain",
          "History: 2-week duration, exertional",
          "Assessment: Rule out cardiac etiology",
          "Plan: ECG, troponin levels, cardiology referral",
        ].map((line, i) => (
          <div
            key={i}
            className="flex items-start gap-2 px-4 py-2 rounded-lg bg-white border border-[#d4c4c9]/30"
          >
            <span className="w-1 h-1 rounded-full bg-[#fdf444] mt-1.5 shrink-0" />
            <span className="text-sm text-[#28030f]/80">{line}</span>
          </div>
        ))}
      </div>
    ),
    Secure: (
      <div className="space-y-3">
        {[
          { label: "HIPAA Compliance", status: "Active" },
          { label: "ADHA Standards", status: "Active" },
          { label: "End-to-End Encryption", status: "Enabled" },
          { label: "Audit Logging", status: "Recording" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-[#d4c4c9]/30"
          >
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-[#28030f]">{item.label}</span>
            <span className="ml-auto text-xs text-green-600">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div className="rounded-2xl border border-[#d4c4c9]/40 bg-white/70 backdrop-blur-sm p-6 max-w-sm mx-auto lg:mx-0 w-full shadow-sm">
      {visuals[step]}
    </div>
  );
}
