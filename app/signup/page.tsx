"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { User, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] p-4 text-foreground">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full flex bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-2xl shadow-gray-200/50"
      >
        {/* Left Side: Branding/Info */}
        <div className="hidden md:flex w-5/12 bg-sidebar-bg p-10 flex-col text-white">
            <div className="w-12 h-12 rounded-xl bg-accent-primary flex items-center justify-center mb-8">
                <span className="text-2xl font-bold">H</span>
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-4">Start scribing better notes today.</h2>
            <p className="text-sidebar-fg/60 text-sm leading-relaxed mb-auto">
                Join thousands of doctors who use Heidi to focus on their patients, not their paperwork.
            </p>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><ShieldCheck size={16} /></div>
                    <span className="text-xs font-medium">HIPAA & GDPR Compliant</span>
                </div>
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-10">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                <p className="text-gray-500 text-sm mt-1">Free 7-day trial. No credit card required.</p>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">First Name</label>
                        <input 
                            type="text" 
                            placeholder="John"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Last Name</label>
                        <input 
                            type="text" 
                            placeholder="Doe"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Work Email</label>
                    <input 
                        type="email" 
                        placeholder="john.doe@hospital.com"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                    <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all text-sm"
                    />
                </div>

                <div className="pt-2">
                    <Button className="w-full py-4 rounded-xl group" size="lg">
                        Create Account
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-accent-primary hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
