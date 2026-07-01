"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useBookDemo } from "./DemoModalContext";
import { ClinaxySymbol } from "@/components/brand/Logo";

const ease = [0.2, 0.7, 0.2, 1] as const;

export function CTA() {
  const { open } = useBookDemo();

  return (
    <section
      id="cta"
      className="relative flex flex-col items-center overflow-hidden bg-canvas px-6 py-28 text-center md:py-40"
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0.42, scale: 0.96 }}
        animate={{ opacity: [0.35, 0.62, 0.35], scale: [0.96, 1.05, 0.96] }}
        transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(127,189,180,0.26), rgba(14,138,125,0.05) 45%, transparent 70%)",
          filter: "blur(44px)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
        >
          <ClinaxySymbol
            className="mx-auto mb-9 h-11 w-11"
            petalColor="var(--teal-700)"
            starColor="var(--teal-400)"
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease, delay: 0.06 }}
          className="text-balance text-4xl font-semibold leading-[1.04] tracking-tight text-ink md:text-6xl"
        >
          Let the workflow prove itself for{" "}
          <span className="font-serif-italic text-gradient">7 days.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease, delay: 0.14 }}
          className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted"
        >
          Start with the trial, attach a card, and see whether Clinaxy fits the
          way your clinic already works.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease, delay: 0.22 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href="/pricing"
            className="group inline-flex items-center gap-2 rounded-full bg-teal-700 px-8 py-4 text-base font-semibold text-white shadow-brand transition-all hover:bg-teal-800"
          >
            See pricing and start
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <button
            type="button"
            onClick={open}
            className="rounded-full border border-line-strong bg-white/70 px-8 py-4 text-base font-semibold text-ink transition-all hover:border-teal-300 hover:text-teal-700"
          >
            Talk to the team
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease, delay: 0.32 }}
          className="mt-7 text-xs text-muted-2"
        >
          7 days free. Card required. Cancel before the trial ends.
        </motion.p>
      </div>
    </section>
  );
}
