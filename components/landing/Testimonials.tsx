"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Cliniq's referral triage has transformed how we handle incoming cases. What used to take hours of manual sorting now happens in seconds with remarkable accuracy.",
    name: "Dr. Sarah Chen",
    role: "Head of Cardiology, Pacific Medical Group",
    rating: 5,
  },
  {
    quote:
      "The voice intake feature is a game-changer. Patients feel heard before they even arrive, and I walk into every consultation already prepared with structured context.",
    name: "Dr. James Mitchell",
    role: "General Practitioner, HealthFirst Clinic",
    rating: 5,
  },
  {
    quote:
      "I was skeptical about AI scribes, but Cliniq captures clinical nuance I didn't think was possible. My notes are more thorough now than when I wrote them myself.",
    name: "Dr. Priya Sharma",
    role: "Psychiatrist, MindBridge Health",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[#f9f4f1]/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-[#755760] font-medium">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-[#28030f]">
            Loved by clinicians{" "}
            <span className="text-[#755760]">worldwide</span>
          </h2>
          <p className="text-[#755760] max-w-xl mx-auto text-lg">
            Healthcare professionals trust Cliniq to handle their most critical
            workflows.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="rounded-2xl border border-[#d4c4c9]/40 bg-white/70 backdrop-blur-sm p-8 hover:bg-white hover:shadow-lg hover:shadow-[#28030f]/5 transition-all"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={14}
                    className="fill-[#fdf444] text-[#fdf444]"
                  />
                ))}
              </div>
              <p className="text-[#28030f]/80 leading-relaxed mb-8 text-[15px]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f9f4f1] border border-[#d4c4c9]/30 flex items-center justify-center text-xs font-bold text-[#28030f]/60">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#28030f]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#755760]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
