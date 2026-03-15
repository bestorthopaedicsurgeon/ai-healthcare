"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, RotateCcw } from "lucide-react";

const conversation = [
  {
    speaker: "doctor",
    text: "Good morning, Sarah. What brings you in today?",
    delay: 0,
  },
  {
    speaker: "patient",
    text: "I've been having these really bad headaches for about three weeks now. They're worse in the morning when I wake up.",
    delay: 2200,
  },
  {
    speaker: "doctor",
    text: "Can you describe the pain? Is it throbbing, constant, or more of a pressure feeling?",
    delay: 5500,
  },
  {
    speaker: "patient",
    text: "It's more like a band of pressure around my head. Sometimes I feel it behind my eyes too.",
    delay: 8000,
  },
  {
    speaker: "doctor",
    text: "Have you noticed any triggers — stress, screen time, changes in sleep?",
    delay: 10800,
  },
  {
    speaker: "patient",
    text: "Actually yes, I started a new job last month and I've been sleeping much less. Maybe five hours a night.",
    delay: 13500,
  },
];

const noteLines = [
  { time: 2200, label: "CC", text: "Headaches x 3 weeks, worse in AM" },
  { time: 5500, label: "HPI", text: "Band-like pressure, bilateral, retro-orbital" },
  { time: 10800, label: "Social", text: "New employment, sleep deprivation (~5h/night)" },
  { time: 13500, label: "ROS", text: "Denies visual changes, nausea, aura" },
];

export function LiveDemo() {
  const [running, setRunning] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [visibleNotes, setVisibleNotes] = useState<number[]>([]);
  const [typingIdx, setTypingIdx] = useState<number | null>(null);
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  const start = () => {
    reset();
    setRunning(true);

    conversation.forEach((msg, i) => {
      const t1 = setTimeout(() => setTypingIdx(i), msg.delay);
      const t2 = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, i]);
        setTypingIdx(null);
      }, msg.delay + 800);
      timeouts.current.push(t1, t2);
    });

    noteLines.forEach((note, i) => {
      const t = setTimeout(
        () => setVisibleNotes((prev) => [...prev, i]),
        note.time + 1200
      );
      timeouts.current.push(t);
    });
  };

  const reset = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setVisibleMessages([]);
    setVisibleNotes([]);
    setTypingIdx(null);
    setRunning(false);
  };

  useEffect(() => {
    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [visibleMessages, typingIdx]);

  return (
    <section className="py-32 bg-[#f9f4f1]/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-[#755760] font-medium">
            See it in action
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-[#28030f]">
            Watch Cliniq scribe{" "}
            <span className="text-[#755760]">in real time</span>
          </h2>
          <p className="text-[#755760] max-w-xl mx-auto text-lg">
            Click play to simulate a live consultation. Cliniq generates
            structured clinical notes as the conversation unfolds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-[#d4c4c9]/40 bg-white/80 backdrop-blur-sm shadow-xl shadow-[#28030f]/5 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#d4c4c9]/20 bg-[#f9f4f1]/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#d4c4c9]/40" />
                  <span className="w-3 h-3 rounded-full bg-[#d4c4c9]/40" />
                  <span className="w-3 h-3 rounded-full bg-[#d4c4c9]/40" />
                </div>
                <span className="text-xs text-[#755760] font-medium">
                  CliniqAI Ambient Scribe
                </span>
              </div>
              <div className="flex items-center gap-2">
                {running && (
                  <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Recording
                  </span>
                )}
                <button
                  onClick={running ? reset : start}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#28030f] text-white hover:bg-[#28030f]/90 transition-colors"
                >
                  {running ? (
                    <>
                      <RotateCcw size={12} /> Reset
                    </>
                  ) : (
                    <>
                      <Mic size={12} /> Start Demo
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Split view */}
            <div className="grid md:grid-cols-2 divide-x divide-[#d4c4c9]/20 min-h-[400px]">
              {/* Conversation */}
              <div className="flex flex-col">
                <div className="px-5 py-2.5 border-b border-[#d4c4c9]/15">
                  <span className="text-xs font-medium text-[#755760] uppercase tracking-wider">
                    Live Conversation
                  </span>
                </div>
                <div
                  ref={chatRef}
                  className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[350px]"
                >
                  {!running && visibleMessages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MicOff
                          size={32}
                          className="mx-auto mb-3 text-[#d4c4c9]"
                        />
                        <p className="text-sm text-[#755760]">
                          Press &ldquo;Start Demo&rdquo; to begin
                        </p>
                      </div>
                    </div>
                  )}
                  {visibleMessages.map((idx) => {
                    const msg = conversation[idx];
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${
                          msg.speaker === "patient" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                            msg.speaker === "doctor"
                              ? "bg-[#28030f] text-white"
                              : "bg-[#f9f4f1] text-[#28030f] border border-[#d4c4c9]/30"
                          }`}
                        >
                          {msg.speaker === "doctor" ? "Dr" : "Pt"}
                        </span>
                        <div
                          className={`rounded-xl px-3.5 py-2.5 max-w-[80%] text-sm leading-relaxed ${
                            msg.speaker === "doctor"
                              ? "bg-[#f9f4f1] text-[#28030f]/80"
                              : "bg-[#28030f]/5 text-[#28030f]/80"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </motion.div>
                    );
                  })}
                  {typingIdx !== null && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`flex gap-3 ${
                        conversation[typingIdx].speaker === "patient"
                          ? "flex-row-reverse"
                          : ""
                      }`}
                    >
                      <span className="w-7 h-7 rounded-full bg-[#d4c4c9]/20 shrink-0" />
                      <div className="rounded-xl px-3.5 py-2.5 bg-[#f9f4f1]">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#755760]/40 animate-bounce" />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#755760]/40 animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#755760]/40 animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* AI Notes */}
              <div className="flex flex-col">
                <div className="px-5 py-2.5 border-b border-[#d4c4c9]/15">
                  <span className="text-xs font-medium text-[#755760] uppercase tracking-wider">
                    AI-Generated Notes
                  </span>
                </div>
                <div className="flex-1 p-5 space-y-3 overflow-y-auto max-h-[350px]">
                  {visibleNotes.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-[#d4c4c9]">
                        Notes will appear here...
                      </p>
                    </div>
                  )}
                  {visibleNotes.map((idx) => {
                    const note = noteLines[idx];
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3"
                      >
                        <span className="w-10 h-6 rounded-md bg-[#fdf444]/30 text-[#28030f] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {note.label}
                        </span>
                        <p className="text-sm text-[#28030f]/80 leading-relaxed">
                          {note.text}
                          {idx === visibleNotes[visibleNotes.length - 1] && (
                            <span className="inline-block w-0.5 h-4 bg-[#28030f] ml-0.5 align-middle animate-caret" />
                          )}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
