"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Building2, Hospital, Stethoscope, Users2 } from "lucide-react";

const ease = [0.2, 0.7, 0.2, 1] as const;

const options = [
  {
    id: "solo",
    icon: Stethoscope,
    label: "Solo doctor",
    plan: "Starter",
    title: "Start with notes and simple follow-up.",
    body: "Best when you want the fastest relief from documentation without changing the entire clinic workflow at once.",
    modules: ["Clinical notes", "Patient summaries", "Follow-up drafts"],
  },
  {
    id: "gp",
    icon: Users2,
    label: "GP clinic",
    plan: "Practice",
    title: "Run the full pre-visit to post-visit loop.",
    body: "Best for teams that need referrals, intake, consult notes, and follow-up to stop living in separate places.",
    modules: ["Referral queue", "Voice intake", "Clinical notes", "Team tasks"],
  },
  {
    id: "specialist",
    icon: Hospital,
    label: "Specialist practice",
    plan: "Practice",
    title: "Control referrals, letters, and complex consult notes.",
    body: "Best for surgeons and specialty clinics where referrals and letters are the real bottleneck.",
    modules: ["Referral triage", "Specialty templates", "Letters", "Review workflow"],
  },
  {
    id: "group",
    icon: Building2,
    label: "Multi-site group",
    plan: "Clinic",
    title: "Standardise workflow across locations.",
    body: "Best when managers need consistent queues, team handoffs, roles, and reporting across multiple clinicians.",
    modules: ["Shared queues", "Role access", "Analytics", "Priority support"],
  },
];

export function DecisionQuiz() {
  const [active, setActive] = useState(1);
  const selected = options[active];
  const Icon = selected.icon;

  return (
    <section id="decide" className="relative overflow-hidden bg-white py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Decide for me
          </p>
          <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
            Not sure where to start?
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted">
            Choose the shape of your clinic. Clinaxy recommends a first setup
            without making you understand every module first.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {options.map((option, index) => {
              const OptionIcon = option.icon;
              const isActive = index === active;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`flex min-h-[74px] items-center gap-4 rounded-2xl border px-4 text-left transition-all ${
                    isActive
                      ? "border-teal-300 bg-teal-50 text-ink shadow-soft"
                      : "border-line bg-canvas text-muted hover:bg-white"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                      isActive
                        ? "border-teal-200 bg-white text-teal-700"
                        : "border-line bg-white text-muted-2"
                    }`}
                  >
                    <OptionIcon size={19} />
                  </span>
                  <span className="text-sm font-semibold">{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-[30px] border border-line bg-canvas shadow-lifted">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.42, ease }}
                className="grid min-h-[440px] gap-8 p-7 md:grid-cols-[0.9fr_1.1fr] md:p-9"
              >
                <div className="flex flex-col">
                  <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-200 bg-white text-teal-700">
                    <Icon size={25} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                    Recommended: {selected.plan}
                  </p>
                  <h3 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-ink">
                    {selected.title}
                  </h3>
                  <p className="mt-4 text-pretty text-base leading-relaxed text-muted">
                    {selected.body}
                  </p>
                  <Link
                    href="/pricing"
                    className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-brand transition-all hover:bg-teal-800"
                  >
                    View subscription
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>

                <div className="flex items-center">
                  <div className="w-full space-y-3">
                    {selected.modules.map((module, index) => (
                      <motion.div
                        key={module}
                        className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-4"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.08 }}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 font-mono-num text-xs font-semibold text-teal-700">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-ink">
                          {module}
                        </span>
                        <motion.span
                          className="ml-auto h-1.5 rounded-full bg-teal-100"
                          animate={{ width: ["22%", "44%", "22%"] }}
                          transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            delay: index * 0.18,
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
