"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useBookDemo } from "./DemoModalContext";

export function CTA() {
  const { open } = useBookDemo();

  return (
    <section id="cta" className="relative py-32">
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#fdf444]/10 rounded-full blur-[120px]" />

          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-bold text-[#28030f] mb-6">
              Ready to transform
              <br />
              <span className="text-[#755760]">your practice?</span>
            </h2>
            <p className="text-[#755760] text-lg max-w-xl mx-auto mb-10">
              Join thousands of clinicians who spend less time on paperwork
              and more time with patients. Start your free trial today — no
              credit card required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group flex items-center gap-2 bg-[#fdf444] hover:bg-[#fbf582] text-[#28030f] font-medium px-8 py-4 rounded-full transition-all shadow-sm text-base"
              >
                Start Free Trial
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <button
                onClick={open}
                className="text-sm font-medium text-[#755760] hover:text-[#28030f] transition-colors px-6 py-4 border border-[#d4c4c9]/40 rounded-full hover:bg-[#f9f4f1]"
              >
                Book a Demo
              </button>
            </div>

            <p className="text-xs text-[#d4c4c9] mt-6">
              Free 14-day trial · No credit card · HIPAA compliant from day one
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
