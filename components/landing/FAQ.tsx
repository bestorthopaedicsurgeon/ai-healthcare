"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const items = [
  {
    question: "Is Clinaxy only for GPs?",
    answer:
      "No. The workflow is designed for GPs, specialists, surgeons, and clinic teams. The templates and modules can adapt by specialty.",
  },
  {
    question: "What happens during the 7-day trial?",
    answer:
      "A clinician or clinic can start free for 7 days with a card attached. After the trial, they continue on the selected subscription plan unless they cancel.",
  },
  {
    question: "Does Clinaxy replace clinical judgement?",
    answer:
      "No. Clinaxy prepares drafts, summaries, and workflow suggestions. The clinician reviews, edits, approves, and remains responsible for the final clinical decision.",
  },
  {
    question: "Do you claim patient data resides in Australia?",
    answer:
      "No. This landing page does not make an Australian data residency claim. Data handling and residency language should match the actual production deployment, vendors, and legal review.",
  },
  {
    question: "Can a clinic start with one module?",
    answer:
      "Yes. A clinic can start with notes, referral flow, intake, or follow-up, then add more modules once the team is comfortable.",
  },
  {
    question: "Is Clinaxy a diagnostic device?",
    answer:
      "No. Clinaxy is presented as a workflow and documentation assistance platform, not a diagnostic device.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="bg-white py-28 md:py-36">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            FAQ
          </p>
          <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
            Clear answers before a doctor signs up.
          </h2>
          <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted">
            The goal is to attract clinicians without overpromising. Simple,
            honest copy wins more trust than big compliance claims.
          </p>
        </div>

        <div className="divide-y divide-line rounded-[28px] border border-line bg-canvas">
          {items.map((item, index) => {
            const isOpen = index === open;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left"
                >
                  <span className="text-base font-semibold text-ink">
                    {item.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-muted transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-pretty text-sm leading-relaxed text-muted">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
