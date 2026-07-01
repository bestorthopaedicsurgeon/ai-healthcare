"use client";

import Link from "next/link";
import { ArrowRight, Loader2, Stethoscope, Lock, Mic } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

// Google / Microsoft OAuth isn't wired yet — flip to true to show the social buttons.
const SOCIAL_AUTH_ENABLED = false;

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex bg-[#F6F4EE]">
      {/* Left panel — brand */}
      <div className="hidden md:flex w-1/2 bg-[#1C2A27] relative overflow-hidden items-center justify-center">
        <BrandPanel
          heading="Welcome back."
          subheading="Sign in to continue managing your clinical workflows with AI."
        />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-20 md:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[360px] flex flex-col gap-6"
        >
          {/* Mobile logo */}
          <Link href="/" className="md:hidden flex items-center gap-2 mb-2 w-fit hover:opacity-80 transition-opacity">
            <Logo href={null} symbolClassName="h-7 w-7" />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1C2A27]">
              Login to Clinaxy
            </h1>
            <p className="text-sm text-[#55625B] mt-1">
              The future of clinical documentation
            </p>
          </div>

          {/* Social auth — hidden until Google/Microsoft OAuth is wired */}
          {SOCIAL_AUTH_ENABLED && (
            <>
              <div className="flex flex-col gap-3">
                <SocialButton icon="google" label="Sign in with Google" />
                <SocialButton icon="microsoft" label="Sign in with Microsoft" />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#D5CFBF]/40" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#F6F4EE] px-3 text-xs text-[#55625B]">
                    Or continue with
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Email form */}
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}
            <input
              type="email"
              placeholder="Work email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#D5CFBF]/50 bg-white px-4 text-sm text-[#1C2A27] placeholder:text-[#D5CFBF] focus:outline-none focus:border-[#0A6256] focus:ring-2 focus:ring-[#7FBDB4]/60 focus:bg-[#EAF5F2] transition-all"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#D5CFBF]/50 bg-white px-4 text-sm text-[#1C2A27] placeholder:text-[#D5CFBF] focus:outline-none focus:border-[#0A6256] focus:ring-2 focus:ring-[#7FBDB4]/60 focus:bg-[#EAF5F2] transition-all"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded border-[#D5CFBF] text-[#1C2A27] focus:ring-[#0A6256]"
                />
                <span className="text-xs text-[#55625B] group-hover:text-[#1C2A27]">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-xs font-medium text-[#55625B] hover:text-[#1C2A27] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-xl bg-[#0A6256] text-white text-sm font-medium hover:bg-[#0C7468] transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-[#55625B] text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#1C2A27] hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Shared Components ─── */

function BrandPanel({
  heading,
  subheading,
}: {
  heading: string;
  subheading: string;
}) {
  return (
    <>
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#1C2A27_0%,#0B332E_50%,#1C2A27_100%)]" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#7FBDB4]/12 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-white/3 rounded-full blur-[80px]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] right-[20%] w-20 h-20 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm flex items-center justify-center"
      >
        <Stethoscope size={22} strokeWidth={1.75} className="text-teal-200" />
      </motion.div>
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[20%] left-[15%] w-16 h-16 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm flex items-center justify-center"
      >
        <Lock size={20} strokeWidth={1.75} className="text-teal-200" />
      </motion.div>
      <motion.div
        animate={{ y: [-8, 12, -8] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[60%] right-[15%] w-14 h-14 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm flex items-center justify-center"
      >
        <Mic size={18} strokeWidth={1.75} className="text-teal-200" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 px-12 max-w-md">
        <Link href="/" className="flex items-center gap-2.5 mb-10 w-fit cursor-pointer hover:opacity-80 transition-opacity">
          <Logo href={null} reversed />
        </Link>

        <h2 className="text-3xl font-bold text-white leading-tight mb-4">
          {heading}
        </h2>
        <p className="text-sm text-white/40 leading-relaxed mb-10">
          {subheading}
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-2">
          {["Clinician review", "Secure access", "Role-aware", "Audit-friendly"].map((badge) => (
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

function SocialButton({
  icon,
  label,
}: {
  icon: "google" | "microsoft";
  label: string;
}) {
  // OAuth providers not yet wired (real integration requires Google Cloud /
  // Microsoft Entra setup + backend callback routes). Button is rendered
  // disabled with a "Coming soon" hint so users aren't misled.
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      className="h-11 w-full rounded-xl border border-[#D5CFBF]/50 bg-white text-sm font-medium text-[#1C2A27]/60 cursor-not-allowed flex items-center justify-center gap-2.5 relative group"
    >
      {icon === "google" && <GoogleIcon />}
      {icon === "microsoft" && <MicrosoftIcon />}
      <span>{label}</span>
      <span className="absolute right-3 text-[9px] font-bold uppercase tracking-widest text-gray-400">
        Soon
      </span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
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
