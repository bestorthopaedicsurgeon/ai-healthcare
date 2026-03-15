"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ArrowRight,
  ChevronDown,
  Zap,
  Building2,
  Stethoscope,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoModalProvider } from "@/components/landing/DemoModalContext";
import { BookDemoModal } from "@/components/landing/BookDemoModal";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useBookDemo } from "@/components/landing/DemoModalContext";

export default function PricingPage() {
  return (
    <DemoModalProvider>
      <Navbar />
      <PricingContent />
      <FeatureComparison />
      <FAQ />
      <Footer />
      <BookDemoModal />
    </DemoModalProvider>
  );
}

const plans = [
  {
    name: "Starter",
    icon: Stethoscope,
    description: "For solo practitioners getting started with AI-assisted workflows.",
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      "Up to 100 consultations/mo",
      "Ambient Scribe",
      "Basic referral triage",
      "HIPAA compliant",
      "Email support",
      "1 clinician seat",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    icon: Zap,
    description: "For growing practices that need the full clinical AI suite.",
    monthlyPrice: 149,
    yearlyPrice: 119,
    features: [
      "Up to 500 consultations/mo",
      "Ambient Scribe + Voice Intake",
      "Advanced referral triage",
      "HIPAA & ADHA compliant",
      "Priority support",
      "Up to 10 clinician seats",
      "EHR integrations",
      "Custom note templates",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Clinic",
    icon: Building2,
    description: "For multi-location clinics with advanced needs.",
    monthlyPrice: 349,
    yearlyPrice: 279,
    features: [
      "Unlimited consultations",
      "Full platform access",
      "Advanced analytics dashboard",
      "HIPAA, ADHA & SOC 2",
      "Dedicated account manager",
      "Up to 50 clinician seats",
      "All EHR integrations",
      "Custom voice intake flows",
      "API access",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Enterprise",
    icon: Crown,
    description: "For hospitals and health systems at scale.",
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      "Unlimited everything",
      "White-label deployment",
      "Custom AI model training",
      "Full compliance suite",
      "24/7 dedicated support",
      "Unlimited clinician seats",
      "On-premise option",
      "SLA guarantee",
      "Custom integrations",
      "Enterprise SSO",
    ],
    cta: "Book a Demo",
    highlighted: false,
  },
];

function PricingContent() {
  const [annual, setAnnual] = useState(true);
  const { open } = useBookDemo();

  return (
    <section className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-[#28030f] tracking-tight mb-4">
            Pricing
          </h1>
          <p className="text-lg text-[#755760] max-w-xl mx-auto">
            For any size of practice, clinic, and health system.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-16"
        >
          <button
            onClick={() => setAnnual(true)}
            className={cn(
              "text-sm px-5 py-2 rounded-full transition-all",
              annual
                ? "bg-[#28030f] text-white shadow-sm"
                : "text-[#755760] hover:text-[#28030f]"
            )}
          >
            Billed Annually
          </button>
          <button
            onClick={() => setAnnual(false)}
            className={cn(
              "text-sm px-5 py-2 rounded-full transition-all",
              !annual
                ? "bg-[#28030f] text-white shadow-sm"
                : "text-[#755760] hover:text-[#28030f]"
            )}
          >
            Billed Monthly
          </button>
          {annual && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full"
            >
              Save 20%
            </motion.span>
          )}
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col transition-all",
                plan.highlighted
                  ? "border-[#fdf444] bg-white shadow-xl shadow-[#28030f]/5 scale-[1.02]"
                  : "border-[#d4c4c9]/40 bg-white/60 hover:bg-white hover:shadow-lg hover:shadow-[#28030f]/5"
              )}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium bg-[#fdf444] text-[#28030f] px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className="mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#f9f4f1] border border-[#d4c4c9]/20 flex items-center justify-center mb-3 text-[#28030f]/70">
                  <plan.icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-[#28030f]">
                  {plan.name}
                </h3>
                <p className="text-xs text-[#755760] mt-1 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.monthlyPrice ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#28030f]">
                      ${annual ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-sm text-[#755760]">/mo</span>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-[#28030f]">
                    Contact us
                  </div>
                )}
                {plan.monthlyPrice && annual && (
                  <p className="text-xs text-[#755760] mt-1">
                    <span className="line-through">
                      ${plan.monthlyPrice}/mo
                    </span>{" "}
                    billed annually
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      size={15}
                      className="text-green-500 mt-0.5 shrink-0"
                    />
                    <span className="text-[#28030f]/80">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.cta === "Book a Demo" ? (
                <button
                  onClick={open}
                  className="w-full text-center text-sm font-medium py-3 rounded-xl border border-[#d4c4c9]/40 text-[#28030f] hover:bg-[#f9f4f1] transition-colors"
                >
                  {plan.cta}
                </button>
              ) : (
                <Link
                  href="/signup"
                  className={cn(
                    "w-full text-center text-sm font-medium py-3 rounded-xl transition-all",
                    plan.highlighted
                      ? "bg-[#fdf444] text-[#28030f] hover:bg-[#fbf582] shadow-sm"
                      : "bg-[#28030f] text-white hover:bg-[#28030f]/90"
                  )}
                >
                  {plan.cta}
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Feature Comparison ─── */

const comparisonFeatures = [
  {
    category: "Clinical AI",
    features: [
      { name: "Ambient Scribe", starter: true, pro: true, clinic: true, enterprise: true },
      { name: "Voice Intake", starter: false, pro: true, clinic: true, enterprise: true },
      { name: "Referral Triage", starter: "Basic", pro: "Advanced", clinic: "Advanced", enterprise: "Custom" },
      { name: "Custom Note Templates", starter: false, pro: true, clinic: true, enterprise: true },
      { name: "Multi-language Support", starter: false, pro: false, clinic: true, enterprise: true },
    ],
  },
  {
    category: "Integrations",
    features: [
      { name: "EHR Integration", starter: false, pro: true, clinic: true, enterprise: true },
      { name: "API Access", starter: false, pro: false, clinic: true, enterprise: true },
      { name: "Custom Integrations", starter: false, pro: false, clinic: false, enterprise: true },
      { name: "SSO / SAML", starter: false, pro: false, clinic: false, enterprise: true },
    ],
  },
  {
    category: "Security & Compliance",
    features: [
      { name: "HIPAA", starter: true, pro: true, clinic: true, enterprise: true },
      { name: "ADHA", starter: false, pro: true, clinic: true, enterprise: true },
      { name: "SOC 2", starter: false, pro: false, clinic: true, enterprise: true },
      { name: "On-Premise Deployment", starter: false, pro: false, clinic: false, enterprise: true },
      { name: "Audit Logging", starter: false, pro: true, clinic: true, enterprise: true },
    ],
  },
];

type CellValue = boolean | string;

function CellValue({ value }: { value: CellValue }) {
  if (typeof value === "string") {
    return <span className="text-xs font-medium text-[#28030f]">{value}</span>;
  }
  return value ? (
    <Check size={16} className="text-green-500 mx-auto" />
  ) : (
    <span className="block w-4 h-px bg-[#d4c4c9] mx-auto" />
  );
}

function FeatureComparison() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#28030f] text-center mb-12">
          Compare plans
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[#d4c4c9]/30">
                <th className="text-left py-3 pr-4 text-sm font-medium text-[#755760] w-[40%]" />
                <th className="text-center py-3 px-3 text-sm font-semibold text-[#28030f]">
                  Starter
                </th>
                <th className="text-center py-3 px-3 text-sm font-semibold text-[#28030f]">
                  Professional
                </th>
                <th className="text-center py-3 px-3 text-sm font-semibold text-[#28030f]">
                  Clinic
                </th>
                <th className="text-center py-3 px-3 text-sm font-semibold text-[#28030f]">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((group) => (
                <>
                  <tr key={group.category}>
                    <td
                      colSpan={5}
                      className="pt-6 pb-2 text-xs font-semibold uppercase tracking-wider text-[#755760]"
                    >
                      {group.category}
                    </td>
                  </tr>
                  {group.features.map((f) => (
                    <tr
                      key={f.name}
                      className="border-b border-[#d4c4c9]/15 hover:bg-[#f9f4f1]/30 transition-colors"
                    >
                      <td className="py-3 pr-4 text-sm text-[#28030f]/80">
                        {f.name}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <CellValue value={f.starter} />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <CellValue value={f.pro} />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <CellValue value={f.clinic} />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <CellValue value={f.enterprise} />
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */

const faqs = [
  {
    q: "Do you offer a free trial?",
    a: "Yes! All paid plans come with a free 14-day trial. No credit card required to get started.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Absolutely. You can change plans at any time from your dashboard. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "Is my patient data secure?",
    a: "Security is our top priority. All plans include HIPAA compliance with end-to-end encryption. Higher tiers add ADHA, SOC 2, and optional on-premise deployment.",
  },
  {
    q: "How does Voice Intake work?",
    a: "Voice Intake conducts structured pre-consultation calls with patients to gather medical history, symptoms, and context — all before the appointment begins.",
  },
  {
    q: "What EHR systems do you integrate with?",
    a: "We integrate with all major EHR systems including Epic, Cerner, Allscripts, and athenahealth. Enterprise plans can request custom integrations.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "You can cancel anytime from your account settings. Your access continues until the end of your current billing period.",
  },
];

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-20 bg-[#f9f4f1]/30">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#28030f] text-center mb-12">
          Frequently asked questions
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#d4c4c9]/30 bg-white/70 overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-[#28030f] pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "text-[#755760] shrink-0 transition-transform",
                    openIdx === i && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 pb-4 text-sm text-[#755760] leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-sm text-[#755760] mb-4">
            Still have questions?
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="group flex items-center gap-2 bg-[#fdf444] hover:bg-[#fbf582] text-[#28030f] font-medium px-6 py-3 rounded-full transition-all shadow-sm text-sm"
            >
              Start Free Trial
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
