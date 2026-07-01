"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Platform", href: "/#modules" },
  { label: "Security", href: "/#security" },
  { label: "See if it fits", href: "/#decide" },
  { label: "Pricing", href: "/pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          className={cn(
            "flex w-full max-w-6xl items-center justify-between gap-6 rounded-full py-2 pl-5 pr-2 transition-all duration-500",
            scrolled
              ? "glass border border-line shadow-soft"
              : "border border-transparent bg-white/50 backdrop-blur-sm"
          )}
        >
          <Logo />

          <div className="hidden items-center md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-[13.5px] text-muted transition-colors hover:bg-teal-50 hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-1 md:flex">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-[13.5px] text-muted transition-colors hover:bg-teal-50 hover:text-ink"
            >
              Log in
            </Link>
            <Link
              href="/pricing"
              className="group flex items-center gap-1.5 rounded-full bg-teal-700 px-4 py-2 text-[13.5px] font-semibold text-white shadow-brand transition-all hover:bg-teal-800"
            >
              Start trial
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <button
            className="cursor-pointer p-2 text-muted transition-colors hover:text-ink md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-canvas/97 pt-24 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col items-center gap-1 p-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-lg text-ink-soft transition-colors hover:text-teal-700"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-line-strong py-3 text-center text-sm text-ink"
                >
                  Log in
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-teal-700 py-3 text-center text-sm font-semibold text-white"
                >
                  Start trial
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
