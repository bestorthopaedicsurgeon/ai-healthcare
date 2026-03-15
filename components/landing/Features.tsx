"use client";

import {
  GitPullRequestArrow,
  Mic,
  FileText,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: GitPullRequestArrow,
    title: "Referral Triage",
    description:
      "AI-powered categorization of patient referrals into urgency levels. Reduce wait times by instantly routing critical cases to the right specialists.",
    highlights: [
      "Auto-classify urgency levels",
      "Smart specialist routing",
      "Priority queue management",
    ],
  },
  {
    icon: Mic,
    title: "Voice Intake",
    description:
      "Conduct structured pre-consultation voice calls that capture patient history, symptoms, and context before they ever step into the clinic.",
    highlights: [
      "Structured voice interviews",
      "Pre-consult data capture",
      "Multi-language support",
    ],
  },
  {
    icon: FileText,
    title: "Ambient Scribe",
    description:
      "Real-time AI documentation during consultations. Stay present with your patient while Cliniq captures every clinical detail accurately.",
    highlights: [
      "Real-time note generation",
      "Clinical terminology mapping",
      "EHR-ready formatting",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Security & Compliance",
    description:
      "Enterprise-grade security with full HIPAA and ADHA compliance built into every layer. Your patient data is protected by design.",
    highlights: [
      "HIPAA & ADHA certified",
      "End-to-end encryption",
      "Audit trail logging",
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Features() {
  return (
    <section id="features" className="relative py-32">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-[#755760] font-medium">
            Core Platform
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-[#28030f]">
            Four pillars.{" "}
            <span className="text-[#755760]">One platform.</span>
          </h2>
          <p className="text-[#755760] max-w-xl mx-auto text-lg">
            Every feature is designed to remove friction from the clinical
            workflow — from the first referral to the final note.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group relative rounded-2xl border border-[#d4c4c9]/40 bg-white/60 hover:bg-white/90 p-8 transition-all duration-300 hover:shadow-lg hover:shadow-[#28030f]/5"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-[#f9f4f1] border border-[#d4c4c9]/30 flex items-center justify-center mb-5 text-[#28030f]/70 group-hover:text-[#28030f] transition-colors">
                  <feature.icon size={24} />
                </div>

                <h3 className="text-xl font-semibold text-[#28030f] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#755760] leading-relaxed mb-6">
                  {feature.description}
                </p>

                <ul className="space-y-2.5 mb-6">
                  {feature.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-[#755760]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#fdf444]" />
                      {item}
                    </li>
                  ))}
                </ul>

                <button className="flex items-center gap-1.5 text-sm font-medium text-[#755760] hover:text-[#28030f] transition-colors group/btn">
                  Learn more
                  <ArrowRight
                    size={14}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
