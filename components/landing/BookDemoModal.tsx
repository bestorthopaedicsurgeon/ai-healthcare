"use client";

import { useState } from "react";
import { X, ChevronDown, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookDemo } from "./DemoModalContext";

const employeeOptions = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
];

const specialtyOptions = [
  "Family Medicine",
  "Cardiology",
  "Psychiatry",
  "Pediatrics",
  "Emergency Medicine",
  "Surgery",
  "Radiology",
  "Other",
];

export function BookDemoModal() {
  const { isOpen, close } = useBookDemo();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleClose = () => {
    close();
    setTimeout(() => setSubmitted(false), 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-[#28030f]/10 border border-[#d4c4c9]/30 overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Close dialog"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#755760] hover:text-[#28030f] hover:bg-[#f9f4f1] transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="p-8">
              {submitted ? (
                <SuccessState onClose={handleClose} />
              ) : (
                <>
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-[#f9f4f1] px-3 py-1 text-xs font-medium text-[#28030f] uppercase tracking-wider mb-3">
                      Book a Demo
                    </span>
                    <h2 className="text-2xl font-bold text-[#28030f] tracking-tight">
                      We&apos;d love to hear from you.
                    </h2>
                    <p className="text-sm text-[#755760] mt-2">
                      Tell us a bit about yourself, and we&apos;ll get in touch
                      as soon as we can.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First name"
                        required
                        className="h-11 w-full rounded-lg border border-[#d4c4c9]/50 bg-transparent px-3 text-sm text-[#28030f] placeholder:text-[#d4c4c9] focus:outline-none focus:ring-2 focus:ring-[#fdf444]/50 focus:border-[#fdf444] transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        required
                        className="h-11 w-full rounded-lg border border-[#d4c4c9]/50 bg-transparent px-3 text-sm text-[#28030f] placeholder:text-[#d4c4c9] focus:outline-none focus:ring-2 focus:ring-[#fdf444]/50 focus:border-[#fdf444] transition-all"
                      />
                    </div>

                    <input
                      type="email"
                      placeholder="Work email"
                      required
                      className="h-11 w-full rounded-lg border border-[#d4c4c9]/50 bg-transparent px-3 text-sm text-[#28030f] placeholder:text-[#d4c4c9] focus:outline-none focus:ring-2 focus:ring-[#fdf444]/50 focus:border-[#fdf444] transition-all"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Organization name"
                        required
                        className="h-11 w-full rounded-lg border border-[#d4c4c9]/50 bg-transparent px-3 text-sm text-[#28030f] placeholder:text-[#d4c4c9] focus:outline-none focus:ring-2 focus:ring-[#fdf444]/50 focus:border-[#fdf444] transition-all"
                      />
                      <SelectField
                        placeholder="Team size"
                        options={employeeOptions}
                      />
                    </div>

                    <SelectField
                      placeholder="Primary specialty"
                      options={specialtyOptions}
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-xl bg-[#28030f] text-white font-medium text-sm hover:bg-[#28030f]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Request a Demo"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SelectField({
  placeholder,
  options,
}: {
  placeholder: string;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-11 w-full rounded-lg border border-[#d4c4c9]/50 bg-transparent px-3 text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-[#fdf444]/50 focus:border-[#fdf444]"
      >
        <span className={selected ? "text-[#28030f]" : "text-[#d4c4c9]"}>
          {selected || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-[#755760] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#d4c4c9]/40 shadow-lg shadow-[#28030f]/5 z-10 py-1 max-h-48 overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setSelected(opt);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-[#28030f] hover:bg-[#f9f4f1] transition-colors flex items-center justify-between"
              >
                {opt}
                {selected === opt && (
                  <Check size={14} className="text-[#28030f]" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuccessState({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="w-16 h-16 rounded-full bg-[#f9f4f1] flex items-center justify-center mx-auto mb-5">
        <Check size={28} className="text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-[#28030f] mb-2">
        Thanks for reaching out!
      </h3>
      <p className="text-sm text-[#755760] mb-6 max-w-sm mx-auto">
        We&apos;ve received your request. A member of our team will be in
        touch within 24 hours.
      </p>
      <button
        onClick={onClose}
        className="text-sm font-medium text-[#755760] hover:text-[#28030f] transition-colors"
      >
        Close
      </button>
    </motion.div>
  );
}
