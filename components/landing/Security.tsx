"use client";

import { motion } from "framer-motion";
import { Eye, FileLock2, Fingerprint, ShieldCheck, UserCheck } from "lucide-react";

const ease = [0.2, 0.7, 0.2, 1] as const;

const controls = [
  {
    icon: UserCheck,
    title: "Clinician approval",
    body: "Drafts and follow-ups are reviewed before they become part of the clinical workflow.",
  },
  {
    icon: Fingerprint,
    title: "Role-aware access",
    body: "Teams can be structured around who should view, prepare, approve, or manage each workflow.",
  },
  {
    icon: Eye,
    title: "Audit-friendly activity",
    body: "Every handoff should be easy to trace: what changed, who reviewed it, and what happened next.",
  },
  {
    icon: FileLock2,
    title: "Deployment settings",
    body: "Data handling and residency language must match the actual production deployment and vendor setup.",
  },
];

export function Security() {
  return (
    <section
      id="security"
      className="relative overflow-hidden bg-[#0b2926] py-28 text-white md:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(127,189,180,0.24), transparent 42%), radial-gradient(circle at 88% 68%, rgba(201,138,34,0.12), transparent 28%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-100"
            >
              <ShieldCheck size={15} />
              Security and governance
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.75, ease, delay: 0.06 }}
              className="max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
            >
              Trust is built by controls, not{" "}
              <span className="font-serif-italic text-teal-200">claims.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.75, ease, delay: 0.12 }}
              className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-teal-100/80"
            >
              Clinaxy should never promise data residency unless the production
              system is actually configured that way. The safer story is clear:
              clinical review, access control, auditability, and deployment
              settings that can be documented before rollout.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, ease, delay: 0.12 }}
            className="rounded-[30px] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            <div className="rounded-[24px] border border-white/10 bg-black/10 p-5">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono-num text-xs uppercase tracking-[0.18em] text-teal-100/60">
                  governance layer
                </span>
                <span className="rounded-full bg-teal-300/10 px-3 py-1 text-xs font-medium text-teal-100">
                  human in control
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {controls.map((control, index) => {
                  const Icon = control.icon;
                  return (
                    <motion.div
                      key={control.title}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.55, ease, delay: 0.08 * index }}
                      className="min-h-[190px] rounded-2xl border border-white/10 bg-white/[0.055] p-5"
                    >
                      <Icon size={20} className="text-teal-200" />
                      <h3 className="mt-5 text-base font-semibold tracking-tight text-white">
                        {control.title}
                      </h3>
                      <p className="mt-2 text-pretty text-sm leading-relaxed text-teal-100/70">
                        {control.body}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
          className="mt-12 max-w-3xl text-sm leading-relaxed text-teal-100/60"
        >
          Clinaxy is an assistance layer for workflow and documentation. It is
          not a diagnostic device and does not replace clinical judgement.
        </motion.p>
      </div>
    </section>
  );
}
