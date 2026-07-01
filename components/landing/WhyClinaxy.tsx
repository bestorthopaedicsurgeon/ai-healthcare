"use client";

import { motion } from "framer-motion";
import { BrainCircuit, CircleCheck, Layers3 } from "lucide-react";

const ease = [0.2, 0.7, 0.2, 1] as const;

const principles = [
  {
    icon: Layers3,
    title: "Not one AI trick",
    body: "Clinaxy is built as a platform. Each module helps the next one work better.",
  },
  {
    icon: BrainCircuit,
    title: "Plain clinical language",
    body: "The product does the AI work quietly. The interface speaks the way a clinic already works.",
  },
  {
    icon: CircleCheck,
    title: "Clinician control",
    body: "Drafts, summaries, and follow-ups are useful only after the clinical team reviews them.",
  },
];

const audiences = [
  "General practice",
  "Orthopaedics",
  "Cardiology",
  "Psychiatry",
  "Paediatrics",
  "Dermatology",
  "Allied clinics",
  "Multi-site groups",
];

export function WhyClinaxy() {
  return (
    <section id="why" className="relative overflow-hidden bg-white py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700"
            >
              The platform angle
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.75, ease, delay: 0.06 }}
              className="mt-5 max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl"
            >
              A scribe helps one moment. Clinaxy connects the{" "}
              <span className="font-serif-italic text-gradient">whole day.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.75, ease, delay: 0.12 }}
              className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted"
            >
              Most AI tools ask the doctor to adopt another isolated product.
              Clinaxy is designed as a workflow layer across the clinic: one
              queue, one patient context, one review path, and one subscription.
            </motion.p>
          </div>

          <div className="grid gap-4">
            {principles.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.65, ease, delay: index * 0.08 }}
                  className="flex gap-5 rounded-3xl border border-line bg-canvas p-6"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-200 bg-white text-teal-700">
                    <Icon size={21} />
                  </span>
                  <span>
                    <h3 className="text-lg font-semibold tracking-tight text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-20 border-t border-line pt-10">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-2">
            Built to adapt by specialty
          </p>
          <div className="flex flex-wrap gap-2">
            {audiences.map((audience) => (
              <span
                key={audience}
                className="rounded-full border border-line bg-canvas px-4 py-2 text-sm font-medium text-ink-soft"
              >
                {audience}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
