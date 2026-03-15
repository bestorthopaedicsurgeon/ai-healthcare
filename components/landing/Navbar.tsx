"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useBookDemo } from "./DemoModalContext";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open } = useBookDemo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4"
      >
        <nav
          className={cn(
            "w-full max-w-[700px] flex items-center justify-between gap-6 rounded-full transition-all duration-500",
            "py-2 pl-4 pr-2",
            "bg-white/80 backdrop-blur-xl border border-[#d4c4c9]/40",
            scrolled && "bg-white/90 shadow-sm shadow-[#28030f]/5"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 ml-1">
            <div className="w-7 h-7 rounded-lg bg-[#28030f] flex items-center justify-center">
              <span className="font-bold text-[11px] text-white">C</span>
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-[#28030f]">
              Cliniq<span className="text-[#755760]">AI</span>
            </span>
          </Link>

          {/* Center links */}
          <div className="hidden sm:flex items-center">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-[#755760] hover:text-[#28030f] px-4 py-2 rounded-xl transition-colors hover:bg-[#f9f4f1]"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-[#755760] hover:text-[#28030f] px-4 py-2 rounded-xl transition-colors hover:bg-[#f9f4f1]"
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          {/* Right side */}
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            <Link
              href="/login"
              className="text-[13px] text-[#755760] hover:text-[#28030f] px-4 py-2 rounded-xl transition-colors hover:bg-[#f9f4f1]"
            >
              Log in
            </Link>
            <button
              onClick={open}
              className="text-[13px] font-medium bg-[#fdf444] text-[#28030f] px-4 py-2 rounded-full hover:bg-[#fbf582] transition-all shadow-sm"
            >
              Book a Demo
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="sm:hidden text-[#755760] hover:text-[#28030f] transition-colors p-2 mr-1"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#FCFAF8]/98 backdrop-blur-xl pt-20"
          >
            <div className="flex flex-col items-center gap-2 p-6">
              {navLinks.map((link) =>
                link.href.startsWith("/") ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg text-[#755760] hover:text-[#28030f] py-3 transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg text-[#755760] hover:text-[#28030f] py-3 transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="w-full max-w-xs mt-6 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center text-sm text-[#755760] py-3 rounded-full border border-[#d4c4c9]"
                >
                  Log in
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    open();
                  }}
                  className="text-center text-sm font-medium bg-[#fdf444] text-[#28030f] py-3 rounded-full"
                >
                  Book a Demo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
