"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  MessagesSquare,
  Mic2,
  Route,
  Workflow,
} from "lucide-react";

const ease = [0.2, 0.7, 0.2, 1] as const;

const modules = [
  {
    id: "referrals",
    icon: Route,
    label: "Referral flow",
    title: "Incoming work becomes a clean clinical queue.",
    body: "Sort new referrals by urgency, specialty, missing information, and next action. The team sees what needs attention before the day starts.",
    bullets: ["Priority view", "Missing-info prompts", "Specialty routing"],
  },
  {
    id: "intake",
    icon: Mic2,
    label: "Voice intake",
    title: "Patients arrive with their story already shaped.",
    body: "A guided conversation captures symptoms, history, goals, medication changes, and red flags before the appointment.",
    bullets: ["Plain-language prompts", "Pre-visit summary", "Template-ready context"],
  },
  {
    id: "scribe",
    icon: FileText,
    label: "Clinical notes",
    title: "The consult becomes a structured draft.",
    body: "Clinaxy drafts notes in the background while the clinician stays present. The note is reviewed, edited, and signed by the clinician.",
    bullets: ["Consult summary", "Assessment and plan", "Custom note style"],
  },
  {
    id: "followup",
    icon: ClipboardCheck,
    label: "Follow-up",
    title: "The next step is ready before the patient leaves.",
    body: "Prepare patient instructions, referral letters, team tasks, and follow-up reminders from the same clinical context.",
    bullets: ["Patient summary", "Letter draft", "Team task list"],
  },
  {
    id: "workspace",
    icon: Workflow,
    label: "Team control",
    title: "Several modules, one accountable workspace.",
    body: "Role-aware queues keep reception, nurses, practice managers, and clinicians working from the same source of truth.",
    bullets: ["Shared status", "Approval points", "Team handoff"],
  },
];

export function FeatureDeepDives() {
  const [active, setActive] = useState(0);
  const current = modules[active];
  const Icon = current.icon;

  return (
    <section id="modules" className="relative overflow-hidden bg-canvas py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              Feature deep-dives
            </p>
            <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
              Pick a module. Watch the clinic day{" "}
              <span className="font-serif-italic text-gradient">adjust.</span>
            </h2>
          </div>
          <p className="max-w-md text-pretty text-base leading-relaxed text-muted">
            Designed for GPs, surgeons, specialists, and mixed practices. Start
            with one module or run the whole workflow end to end.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.76fr_1.24fr]">
          <div className="flex flex-col gap-2">
            {modules.map((module, index) => {
              const ModuleIcon = module.icon;
              const isActive = index === active;
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`flex min-h-[76px] items-center gap-4 rounded-2xl border px-4 text-left transition-all ${
                    isActive
                      ? "border-teal-300 bg-white shadow-soft"
                      : "border-transparent bg-white/40 hover:border-line hover:bg-white/70"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                      isActive
                        ? "border-teal-200 bg-teal-50 text-teal-700"
                        : "border-line bg-white text-muted-2"
                    }`}
                  >
                    <ModuleIcon size={19} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {module.label}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {module.bullets[0]}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-[30px] border border-line bg-white/80 shadow-lifted backdrop-blur-xl">
            <div className="grid min-h-[610px] lg:grid-cols-[0.9fr_1.1fr]">
              <div className="border-b border-line p-7 lg:border-b-0 lg:border-r">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.42, ease }}
                  >
                    <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 text-teal-700">
                      <Icon size={25} />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
                      {current.label}
                    </p>
                    <h3 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
                      {current.title}
                    </h3>
                    <p className="mt-5 text-pretty text-base leading-relaxed text-muted">
                      {current.body}
                    </p>

                    <div className="mt-8 space-y-3">
                      {current.bullets.map((bullet) => (
                        <div
                          key={bullet}
                          className="flex items-center gap-3 rounded-2xl border border-line bg-canvas px-4 py-3"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                          <span className="text-sm font-medium text-ink">
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>

                    <a
                      href="#pricing"
                      className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800"
                    >
                      See plans
                      <ArrowRight size={16} />
                    </a>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="relative flex items-center justify-center bg-canvas p-6">
                <ModuleDemo id={current.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModuleDemo({ id }: { id: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease }}
        className="w-full max-w-md"
      >
        {id === "referrals" && <QueueDemo />}
        {id === "intake" && <IntakeDemo />}
        {id === "scribe" && <ScribeDemo />}
        {id === "followup" && <FollowUpDemo />}
        {id === "workspace" && <WorkspaceDemo />}
      </motion.div>
    </AnimatePresence>
  );
}

function QueueDemo() {
  return (
    <div className="space-y-3">
      {[
        ["red", "New surgical referral", "needs review"],
        ["teal", "Missing imaging report", "request info"],
        ["honey", "Routine GP follow-up", "book next"],
      ].map(([tone, label, action], index) => (
        <motion.div
          key={label}
          className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-4"
          animate={{ y: index === 0 ? [0, -4, 0] : 0 }}
          transition={{ duration: 2.6, repeat: Infinity, delay: index * 0.2 }}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              tone === "red"
                ? "bg-danger"
                : tone === "honey"
                  ? "bg-honey"
                  : "bg-teal-500"
            }`}
          />
          <span className="text-sm font-semibold text-ink">{label}</span>
          <span className="ml-auto text-xs text-muted-2">{action}</span>
        </motion.div>
      ))}
    </div>
  );
}

function IntakeDemo() {
  return (
    <div className="rounded-3xl border border-line bg-white p-5">
      <div className="mb-5 flex items-center gap-3">
        <MessagesSquare size={18} className="text-teal-700" />
        <span className="text-sm font-semibold text-ink">Patient story</span>
      </div>
      <div className="space-y-4">
        {["What brought you in today?", "What are you most worried about?", "Any recent medication changes?"].map(
          (line, index) => (
            <div key={line}>
              <p className="mb-2 text-xs text-muted">{line}</p>
              <motion.div
                className="h-2 rounded-full bg-teal-100"
                animate={{ width: ["26%", "96%", "26%"] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.25,
                  ease: "easeInOut",
                }}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ScribeDemo() {
  return (
    <div className="rounded-3xl border border-line bg-white p-5">
      <p className="mb-5 text-sm font-semibold text-ink">Consult note</p>
      <div className="grid gap-3">
        {["History", "Exam", "Plan"].map((label, index) => (
          <div key={label} className="rounded-2xl bg-canvas p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-2">
                {label}
              </span>
              <span className="text-xs text-teal-700">draft</span>
            </div>
            <motion.div
              className="h-2 rounded-full bg-teal-100"
              animate={{ width: [`${52 + index * 8}%`, "92%", `${52 + index * 8}%`] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.2 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function FollowUpDemo() {
  return (
    <div className="space-y-3">
      {["Patient instructions", "Specialist letter", "Team reminder"].map(
        (label, index) => (
          <motion.div
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-4"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: [0.72, 1, 0.72] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: index * 0.25 }}
          >
            <ClipboardCheck size={18} className="text-teal-700" />
            <span className="text-sm font-semibold text-ink">{label}</span>
            <span className="ml-auto rounded-full bg-canvas px-2 py-1 text-xs text-muted-2">
              approve
            </span>
          </motion.div>
        )
      )}
    </div>
  );
}

function WorkspaceDemo() {
  return (
    <div className="grid gap-3">
      {[
        ["Reception", "intake complete"],
        ["Nurse", "prep ready"],
        ["Doctor", "note draft"],
        ["Manager", "billing queue"],
      ].map(([role, status], index) => (
        <motion.div
          key={role}
          className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-4"
          animate={{ x: [0, index % 2 === 0 ? 5 : -5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: index * 0.18 }}
        >
          <Workflow size={18} className="text-teal-700" />
          <span className="text-sm font-semibold text-ink">{role}</span>
          <span className="ml-auto text-xs text-muted-2">{status}</span>
        </motion.div>
      ))}
    </div>
  );
}
