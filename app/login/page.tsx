"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Bot, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/50"
      >
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-accent-primary flex items-center justify-center mb-4 shadow-lg shadow-accent-primary/20">
                <span className="text-3xl font-bold text-white">H</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Please enter your details to sign in</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="email" 
                        placeholder="dr.smith@hospital.com"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-10 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-10 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="rounded border-gray-300 text-accent-primary focus:ring-accent-primary" />
                    <span className="text-sm text-gray-500 group-hover:text-gray-700">Remember me</span>
                </label>
                <button className="text-sm font-medium text-accent-primary hover:underline">Forgot password?</button>
            </div>

            <Button className="w-full py-4 rounded-xl group" size="lg">
                Sign In
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link href="/signup" className="font-bold text-accent-primary hover:underline">Sign up for free</Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
}
