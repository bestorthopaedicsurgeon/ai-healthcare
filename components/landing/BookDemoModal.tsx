"use client";

import { useState } from "react";
import { X, ChevronDown, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookDemo } from "./DemoModalContext";

const employeeOptions = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

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

const inputClass =
  "h-11 w-full rounded-lg border border-line-strong bg-transparent px-3 text-sm text-ink placeholder:text-muted-2 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200";

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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-teal-900/50 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Book a demo"
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-white shadow-lifted"
          >
            <button
              onClick={handleClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 z-10 cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-teal-50 hover:text-ink"
            >
              <X size={18} />
            </button>

            <div className="p-8">
              {submitted ? (
                <SuccessState onClose={handleClose} />
              ) : (
                <>
                  <div className="mb-6">
                    <span className="mb-3 inline-flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-teal-800">
                      Book a demo
                    </span>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                      See Clinaxy in your workflow.
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      Tell us a bit about your team, and we&apos;ll tailor a
                      walkthrough and get in touch within 24 hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="sr-only">
                          First name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          placeholder="First name"
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="sr-only">
                          Last name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          placeholder="Last name"
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="sr-only">
                        Work email
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Work email"
                        required
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="org" className="sr-only">
                          Organization name
                        </label>
                        <input
                          id="org"
                          type="text"
                          placeholder="Organization name"
                          required
                          className={inputClass}
                        />
                      </div>
                      <SelectField placeholder="Team size" options={employeeOptions} />
                    </div>

                    <SelectField
                      placeholder="Primary specialty"
                      options={specialtyOptions}
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-700 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:opacity-70"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Request a demo"
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
        className="flex h-11 w-full cursor-pointer items-center justify-between rounded-lg border border-line-strong bg-transparent px-3 text-left text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
      >
        <span className={selected ? "text-ink" : "text-muted-2"}>
          {selected || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-line bg-white py-1 shadow-lifted"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setSelected(opt);
                  setOpen(false);
                }}
                className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-teal-50"
              >
                {opt}
                {selected === opt && <Check size={14} className="text-teal-800" />}
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
      className="py-8 text-center"
    >
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
        <Check size={28} className="text-teal-800" />
      </div>
      <h3 className="mb-2 font-display text-xl font-bold text-ink">
        Thanks for reaching out!
      </h3>
      <p className="mx-auto mb-6 max-w-sm text-sm text-muted">
        We&apos;ve received your request. A member of our team will be in touch
        within 24 hours.
      </p>
      <button
        onClick={onClose}
        className="cursor-pointer text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        Close
      </button>
    </motion.div>
  );
}
