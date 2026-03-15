"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex bg-[#FCFAF8]">
      {/* Left panel — brand */}
      <div className="hidden md:flex w-1/2 bg-[#28030f] relative overflow-hidden items-center justify-center">
        <BrandPanel />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-20 md:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[360px] flex flex-col gap-6"
        >
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#28030f] flex items-center justify-center">
              <span className="font-bold text-xs text-white">C</span>
            </div>
            <span className="font-semibold text-lg text-[#28030f]">
              Cliniq<span className="text-[#755760]">AI</span>
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#28030f]">
              Create your account
            </h1>
            <p className="text-sm text-[#755760] mt-1">
              Free 14-day trial. No credit card required.
            </p>
          </div>

          {/* Social auth */}
          <div className="flex flex-col gap-3">
            <SocialButton icon="google" label="Sign up with Google" />
            <SocialButton icon="microsoft" label="Sign up with Microsoft" />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#d4c4c9]/40" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#FCFAF8] px-3 text-xs text-[#755760]">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email form */}
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First name"
                required
                className="h-11 w-full rounded-xl border border-[#d4c4c9]/50 bg-white px-4 text-sm text-[#28030f] placeholder:text-[#d4c4c9] focus:outline-none focus:ring-2 focus:ring-[#fdf444]/50 focus:border-[#fdf444] transition-all"
              />
              <input
                type="text"
                placeholder="Last name"
                required
                className="h-11 w-full rounded-xl border border-[#d4c4c9]/50 bg-white px-4 text-sm text-[#28030f] placeholder:text-[#d4c4c9] focus:outline-none focus:ring-2 focus:ring-[#fdf444]/50 focus:border-[#fdf444] transition-all"
              />
            </div>
            <input
              type="email"
              placeholder="Work email"
              required
              className="h-11 w-full rounded-xl border border-[#d4c4c9]/50 bg-white px-4 text-sm text-[#28030f] placeholder:text-[#d4c4c9] focus:outline-none focus:ring-2 focus:ring-[#fdf444]/50 focus:border-[#fdf444] transition-all"
            />
            <input
              type="password"
              placeholder="Create a password"
              required
              className="h-11 w-full rounded-xl border border-[#d4c4c9]/50 bg-white px-4 text-sm text-[#28030f] placeholder:text-[#d4c4c9] focus:outline-none focus:ring-2 focus:ring-[#fdf444]/50 focus:border-[#fdf444] transition-all"
            />

            <p className="text-[11px] text-[#755760] leading-relaxed">
              By creating an account, you agree to our{" "}
              <a href="#" className="underline hover:text-[#28030f]">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-[#28030f]">
                Privacy Policy
              </a>
              .
            </p>

            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-[#fdf444] text-[#28030f] text-sm font-medium hover:bg-[#fbf582] transition-colors flex items-center justify-center gap-2 group shadow-sm"
            >
              Create Account
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </form>

          <p className="text-sm text-[#755760] text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#28030f] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Brand Panel ─── */

function BrandPanel() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#28030f_0%,#1b0c14_50%,#28030f_100%)]" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#fdf444]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-white/3 rounded-full blur-[80px]" />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating feature cards */}
      <motion.div
        animate={{ y: [-8, 12, -8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[12%] right-[15%] rounded-2xl border border-white/10 bg-white/4 backdrop-blur-sm p-4 w-44"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs">🎙️</span>
          <span className="text-[11px] font-medium text-white/60">Voice Intake</span>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full bg-white/20"
              style={{ height: `${6 + Math.random() * 14}px` }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[18%] left-[10%] rounded-2xl border border-white/10 bg-white/4 backdrop-blur-sm p-4 w-48"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center text-xs">✓</span>
          <span className="text-[11px] font-medium text-white/60">Scribe Active</span>
        </div>
        <div className="text-[10px] text-white/30 leading-relaxed">
          Chief Complaint: Recurring headaches...
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [-6, 8, -6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[55%] right-[12%] rounded-2xl border border-white/10 bg-white/4 backdrop-blur-sm p-3 w-36"
      >
        <div className="text-[10px] text-white/40 mb-1">Compliance</div>
        <div className="text-lg font-bold text-green-400">100%</div>
        <div className="text-[10px] text-white/30">HIPAA Adherence</div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 px-12 max-w-md">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
            <span className="font-bold text-sm text-white">C</span>
          </div>
          <span className="font-semibold text-lg text-white">
            Cliniq<span className="text-white/40">AI</span>
          </span>
        </div>

        <h2 className="text-3xl font-bold text-white leading-tight mb-4">
          Start scribing
          <br />
          better notes today.
        </h2>
        <p className="text-sm text-white/40 leading-relaxed mb-10">
          Join thousands of clinicians who use Cliniq to focus on their patients,
          not their paperwork.
        </p>

        <div className="flex flex-wrap gap-2">
          {["HIPAA", "ADHA", "SOC 2", "Encrypted"].map((badge) => (
            <span
              key={badge}
              className="text-[10px] font-medium uppercase tracking-wider text-white/30 px-2.5 py-1 rounded-full border border-white/10"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Social Button ─── */

function SocialButton({
  icon,
  label,
}: {
  icon: "google" | "microsoft";
  label: string;
}) {
  return (
    <button
      type="button"
      className="h-11 w-full rounded-xl border border-[#d4c4c9]/50 bg-white text-sm font-medium text-[#28030f] hover:bg-[#f9f4f1] transition-colors flex items-center justify-center gap-2.5"
    >
      {icon === "google" && <GoogleIcon />}
      {icon === "microsoft" && <MicrosoftIcon />}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 21 21" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
