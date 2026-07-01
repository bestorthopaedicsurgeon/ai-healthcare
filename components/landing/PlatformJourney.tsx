"use client";

import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { CheckCircle2, ClipboardList, FileText, Mic2, Route } from "lucide-react";

const ease = [0.2, 0.7, 0.2, 1] as const;

type Stage = {
  id: "sort" | "prepare" | "draft" | "finish";
  step: string;
  title: string;
  line: string;
  body: string;
};

const stages: Stage[] = [
  {
    id: "sort",
    step: "01",
    title: "Sort the incoming work",
    line: "Referrals, requests, and patient messages are turned into a clear queue.",
    body: "Clinaxy helps your team see what needs attention first, what is missing, and where each patient belongs.",
  },
  {
    id: "prepare",
    step: "02",
    title: "Capture the patient story",
    line: "Patients share context before the appointment, in simple language.",
    body: "Voice intake turns the pre-visit conversation into a concise summary, so the clinician walks in with the story already shaped.",
  },
  {
    id: "draft",
    step: "03",
    title: "Draft while you consult",
    line: "The note forms in the background while the doctor stays present.",
    body: "The system creates a structured draft that follows your preferred style. The clinician reviews, edits, and signs.",
  },
  {
    id: "finish",
    step: "04",
    title: "Prepare the next step",
    line: "Follow-up tasks, letters, and patient summaries are ready for approval.",
    body: "No claim leaves automatically. Clinaxy keeps the workflow moving, but the clinical team stays in control.",
  },
];

export function PlatformJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 24,
    mass: 0.7,
  });
  const pulseTop = useTransform(smoothProgress, (value) => `${value * 100}%`);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(stages.length - 1, Math.floor(value * stages.length));
    if (next !== active) setActive(next);
  });

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative h-[420vh] bg-white"
    >
      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(246,244,238,0.76), rgba(255,255,255,0.92) 42%, rgba(246,244,238,0.55)), radial-gradient(circle at 82% 28%, rgba(166,214,206,0.28), transparent 30%)",
          }}
        />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-6 lg:grid-cols-[0.84fr_1.16fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              How it works
            </p>
            <h2 className="mt-5 max-w-xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
              A whole clinic day, moving on one{" "}
              <span className="font-serif-italic text-gradient">line.</span>
            </h2>
            <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted">
              The product should feel simple because the handoffs are handled.
              Each module knows what came before it and what needs to happen
              next.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1fr]">
            <div className="relative pl-10">
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-line">
                <motion.div
                  className="absolute inset-0 origin-top bg-teal-500"
                  style={{ scaleY: smoothProgress }}
                />
                <motion.span
                  className="absolute -left-[4px] h-2.5 w-2.5 rounded-full bg-teal-500"
                  style={{
                    top: pulseTop,
                    translateY: "-50%",
                    boxShadow: "0 0 16px rgba(14,138,125,0.65)",
                  }}
                />
              </div>

              <div className="flex flex-col gap-5">
                {stages.map((stage, index) => {
                  const isActive = index === active;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setActive(index)}
                      className="group relative -ml-10 flex w-full gap-5 pl-10 text-left"
                    >
                      <span className="absolute left-0 top-2 flex h-[11px] w-[11px] items-center justify-center">
                        <motion.span
                          className="h-[11px] w-[11px] rounded-full border bg-white"
                          animate={{
                            borderColor: isActive
                              ? "var(--teal-500)"
                              : "var(--line-strong)",
                            scale: isActive ? 1 : 0.78,
                          }}
                          transition={{ duration: 0.35, ease }}
                        />
                        {isActive && (
                          <motion.span
                            layoutId="journey-active-node"
                            className="absolute h-1.5 w-1.5 rounded-full bg-teal-500"
                          />
                        )}
                      </span>

                      <span className="block pb-1">
                        <span className="font-mono-num text-xs text-muted-2">
                          {stage.step}
                        </span>
                        <motion.span
                          className="mt-1 block text-xl font-semibold tracking-tight"
                          animate={{
                            color: isActive ? "var(--ink)" : "var(--muted-2)",
                          }}
                          transition={{ duration: 0.35, ease }}
                        >
                          {stage.title}
                        </motion.span>
                        <span className="mt-1 block max-w-md text-sm leading-relaxed text-muted">
                          {stage.line}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative min-h-[430px] rounded-[28px] border border-line bg-white/80 p-6 shadow-lifted backdrop-blur-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stages[active].id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.45, ease }}
                  className="flex h-full flex-col"
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono-num text-xs text-muted-2">
                        Step {stages[active].step}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                        {stages[active].title}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                      <CheckCircle2 size={14} />
                      controlled
                    </span>
                  </div>

                  <StageVisual id={stages[active].id} />

                  <p className="mt-auto pt-7 text-pretty text-sm leading-relaxed text-muted">
                    {stages[active].body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StageVisual({ id }: { id: Stage["id"] }) {
  if (id === "sort") return <SortVisual />;
  if (id === "prepare") return <PrepareVisual />;
  if (id === "draft") return <DraftVisual />;
  return <FinishVisual />;
}

function SortVisual() {
  const rows = [
    ["urgent", "Possible fracture", "first"],
    ["soon", "Surgical review", "soon"],
    ["routine", "Routine check", "queue"],
  ];
  return (
    <div className="space-y-3">
      {rows.map(([level, label, tag], index) => (
        <motion.div
          key={label}
          className="flex items-center gap-3 rounded-2xl border border-line bg-canvas px-4 py-3"
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: index * 0.1 }}
        >
          <Route
            size={18}
            className={level === "urgent" ? "text-danger" : "text-teal-600"}
          />
          <span className="text-sm font-semibold text-ink">{label}</span>
          <span className="ml-auto font-mono-num text-[10px] uppercase tracking-wider text-muted-2">
            {tag}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function PrepareVisual() {
  return (
    <div className="space-y-5">
      <div className="flex h-20 items-center justify-center gap-1 rounded-2xl border border-line bg-canvas px-4">
        {Array.from({ length: 38 }).map((_, index) => (
          <motion.span
            key={index}
            className="w-1 rounded-full bg-teal-400"
            style={{ height: 18 + (index % 6) * 5 }}
            animate={{ scaleY: [0.35, 1, 0.35] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: (index % 12) * 0.05,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {["Symptoms", "Medication", "Goals", "Flags"].map((label, index) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-4">
            <Mic2 size={17} className="mb-3 text-teal-700" />
            <p className="text-sm font-semibold text-ink">{label}</p>
            <motion.div
              className="mt-3 h-1.5 rounded-full bg-teal-100"
              animate={{ width: ["38%", "86%", "38%"] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.2 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function DraftVisual() {
  return (
    <div className="rounded-2xl border border-line bg-canvas p-5">
      <div className="mb-4 flex items-center gap-3">
        <FileText size={18} className="text-teal-700" />
        <span className="text-sm font-semibold text-ink">Consult draft</span>
      </div>
      <div className="space-y-4">
        {["Subjective", "Objective", "Assessment", "Plan"].map((label, index) => (
          <div key={label}>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted-2">
              {label}
            </p>
            <motion.div
              className="h-2 rounded-full bg-teal-100"
              animate={{ width: [`${42 + index * 7}%`, "96%", `${42 + index * 7}%`] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.18,
                ease: "easeInOut",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function FinishVisual() {
  return (
    <div className="space-y-3">
      {["Patient instructions", "Referral letter", "Team follow-up"].map(
        (label, index) => (
          <motion.div
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-line bg-canvas px-4 py-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.1 }}
          >
            <ClipboardList size={18} className="text-teal-700" />
            <span className="text-sm font-semibold text-ink">{label}</span>
            <span className="ml-auto rounded-full bg-white px-2 py-1 font-mono-num text-[10px] uppercase tracking-wider text-muted-2">
              approve
            </span>
          </motion.div>
        )
      )}
    </div>
  );
}
