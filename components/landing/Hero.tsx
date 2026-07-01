"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Mic2,
  Route,
  Sparkles,
} from "lucide-react";

const ease = [0.2, 0.7, 0.2, 1] as const;

const workflow = [
  {
    icon: Route,
    label: "Incoming referrals",
    headline: "Priority cases surface first.",
    detail: "New referral, specialist request, missing context.",
    status: "Sorted",
    color: "#c0392b",
  },
  {
    icon: Mic2,
    label: "Patient story",
    headline: "The history is captured before the consult.",
    detail: "Symptoms, medication, goals, red flags.",
    status: "Ready",
    color: "#0e8a7d",
  },
  {
    icon: FileText,
    label: "Consult note",
    headline: "The note drafts while you stay present.",
    detail: "Assessment, plan, tasks, letter outline.",
    status: "Drafted",
    color: "#c98a22",
  },
  {
    icon: CheckCircle2,
    label: "Follow-up",
    headline: "The next step waits for your approval.",
    detail: "Patient summary, referral letter, team task.",
    status: "Review",
    color: "#344039",
  },
];

export function Hero() {
  const [active, setActive] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 70, damping: 22 });
  const smoothY = useSpring(mouseY, { stiffness: 70, damping: 22 });
  const consoleX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const consoleY = useTransform(smoothY, [-1, 1], [-8, 8]);

  useEffect(() => {
    const id = window.setInterval(
      () => setActive((current) => (current + 1) % workflow.length),
      2600
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-canvas px-6 pb-14 pt-28 md:pt-32"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mouseX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
        mouseY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 54% 15%, rgba(166,214,206,0.38), transparent 34%), radial-gradient(circle at 18% 40%, rgba(232,226,212,0.68), transparent 32%), linear-gradient(180deg, rgba(255,255,255,0.55), transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2 text-xs font-medium text-muted shadow-soft backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-teal-500/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
            </span>
            A platform - several modules working as one system
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.06 }}
            className="max-w-3xl text-balance text-4xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-5xl md:text-6xl lg:text-[4rem]"
          >
            One AI workspace for the work around every{" "}
            <span className="font-serif-italic text-gradient">appointment.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.14 }}
            className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted md:text-lg"
          >
            Clinaxy sorts incoming work, collects the patient story, drafts the
            note, and prepares follow-up - so GPs, surgeons, specialists, and
            clinic teams can move through the day without chasing paperwork.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.22 }}
            className="mt-7 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/pricing"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-7 py-4 text-sm font-semibold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:bg-teal-800"
            >
              Start 7-day trial
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-line-strong bg-white/60 px-7 py-4 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700"
            >
              Watch the workflow
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-5 text-xs leading-relaxed text-muted-2"
          >
            7 days free. Card required. Clinicians review and approve every
            output before it leaves the workflow.
          </motion.p>
        </div>

        <motion.div
          style={{ x: consoleX, y: consoleY }}
          initial={{ opacity: 0, y: 28, rotateX: 6 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.18 }}
          className="relative mx-auto w-full max-w-2xl"
        >
          <WorkflowConsole active={active} setActive={setActive} />
        </motion.div>
      </div>
    </section>
  );
}

function WorkflowConsole({
  active,
  setActive,
}: {
  active: number;
  setActive: (index: number) => void;
}) {
  const current = workflow[active];
  const ActiveIcon = current.icon;

  return (
    <div className="relative">
      <motion.div
        aria-hidden
        className="absolute -inset-8 rounded-[40px]"
        animate={{ opacity: [0.45, 0.72, 0.45], scale: [0.96, 1.02, 0.96] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle, rgba(127,189,180,0.24), rgba(14,138,125,0.06) 45%, transparent 72%)",
          filter: "blur(38px)",
        }}
      />

      <div className="relative overflow-hidden rounded-[30px] border border-line bg-white/80 p-4 shadow-lifted backdrop-blur-xl md:p-5">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-honey/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500/80" />
          </div>
          <div className="hidden rounded-full border border-line bg-canvas px-3 py-1 font-mono-num text-[11px] text-muted md:block">
            live workflow
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="space-y-2">
            {workflow.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === active;
              return (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`group flex min-h-[76px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                    isActive
                      ? "border-teal-300 bg-teal-50 shadow-soft"
                      : "border-line bg-white/60 hover:border-line-strong hover:bg-white"
                  }`}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white"
                    style={{
                      borderColor: isActive ? "rgba(14,138,125,0.28)" : "",
                      color: isActive ? step.color : "var(--muted-2)",
                    }}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">
                      {step.label}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-muted">
                      {step.status}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-line bg-canvas p-5 md:min-h-[420px] md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-2">
                Clinaxy run
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-teal-700">
                <Sparkles size={13} />
                active
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.45, ease }}
              >
                <div className="mb-5 flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-white"
                    style={{ color: current.color }}
                  >
                    <ActiveIcon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-teal-700">
                      {current.label}
                    </p>
                    <h2 className="mt-1 text-balance text-2xl font-semibold leading-tight text-ink md:text-3xl">
                      {current.headline}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {current.detail}
                    </p>
                  </div>
                </div>

                <LiveWorkflow active={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveWorkflow({ active }: { active: number }) {
  if (active === 0) return <ReferralSort />;
  if (active === 1) return <PatientIntake />;
  if (active === 2) return <NoteDraft />;
  return <FollowUp />;
}

function ReferralSort() {
  const [top, setTop] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => setTop((value) => !value), 1400);
    return () => window.clearInterval(id);
  }, []);
  const rows = top
    ? ["Possible fracture", "Post-op review", "Knee pain"]
    : ["Post-op review", "Knee pain", "Possible fracture"];

  return (
    <div className="space-y-2.5">
      {rows.map((row) => (
        <motion.div
          layout
          key={row}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3"
        >
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              row === "Possible fracture" ? "bg-danger" : "bg-teal-300"
            }`}
          />
          <span className="text-sm font-medium text-ink">{row}</span>
          <span className="ml-auto font-mono-num text-[10px] uppercase tracking-wider text-muted-2">
            {row === "Possible fracture" ? "first" : "queued"}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function PatientIntake() {
  return (
    <div className="space-y-5">
      <div className="flex h-16 items-center justify-center gap-1.5 rounded-2xl border border-line bg-white px-4">
        {Array.from({ length: 34 }).map((_, index) => (
          <motion.span
            key={index}
            className="w-1 rounded-full bg-teal-400"
            style={{ height: 18 + (index % 7) * 4 }}
            animate={{ scaleY: [0.35, 1, 0.35] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (index % 10) * 0.06,
            }}
          />
        ))}
      </div>
      <div className="space-y-2">
        {["Reason for visit", "Medication changes", "Main concern"].map(
          (label, index) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3"
            >
              <span className="font-mono-num text-[11px] text-muted-2">
                0{index + 1}
              </span>
              <span className="text-sm font-medium text-ink">{label}</span>
              <motion.span
                className="ml-auto h-1.5 rounded-full bg-teal-200"
                initial={{ width: 0 }}
                animate={{ width: ["28%", "46%", "28%"] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}

function NoteDraft() {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
        <span className="text-sm font-semibold text-ink">Progress note</span>
        <span className="rounded-full bg-teal-50 px-2 py-1 font-mono-num text-[10px] uppercase tracking-wider text-teal-700">
          drafting
        </span>
      </div>
      <div className="space-y-3">
        {["History", "Assessment", "Plan", "Tasks"].map((line, index) => (
          <div key={line}>
            <div className="mb-1.5 text-xs font-medium text-muted">{line}</div>
            <motion.div
              className="h-2 rounded-full bg-teal-100"
              initial={{ width: "12%" }}
              animate={{ width: [`${28 + index * 8}%`, "92%", `${28 + index * 8}%`] }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                delay: index * 0.22,
                ease: "easeInOut",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function FollowUp() {
  return (
    <div className="space-y-3">
      {["Patient summary", "Referral letter", "Team task"].map(
        (label, index) => (
          <motion.div
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-4"
            initial={{ opacity: 0.4, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.16,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 1.6,
            }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <CheckCircle2 size={16} />
            </span>
            <span className="text-sm font-semibold text-ink">{label}</span>
            <span className="ml-auto text-xs text-muted-2">review</span>
          </motion.div>
        )
      )}
    </div>
  );
}
