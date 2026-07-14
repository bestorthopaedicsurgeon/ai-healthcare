"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_CONSTANTS } from "@/lib/api-constants";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Mic2,
  Plus,
  Trash2,
  GripVertical,
  Save,
  History,
  RotateCcw,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface PromptVersion {
  id: string;
  physician_id: string;
  version_number: number;
  questions: string[];
  label: string | null;
  is_active: boolean;
  created_at: string;
}

const DEFAULT_QUESTIONS = [
  "Main reason for the visit — what's bringing them in, when it started, how bad it is, how often.",
  "Past conditions — any diagnosed medical conditions (diabetes, blood pressure, asthma, etc.)",
  "Medications — name, dose, how often, including over-the-counter and vitamins.",
  "Allergies — medications, food, anything, and what happens when they have a reaction.",
  "Family history — major conditions that run in the family.",
  "Lifestyle — smoking, alcohol, exercise.",
  "Surgeries — any past surgeries or procedures.",
  "Anything else — anything the doctor should know before the appointment.",
];

export default function VoiceAgentSettingsPage() {
  const { apiFetch } = useAuth();

  const [questions, setQuestions] = useState<string[]>(DEFAULT_QUESTIONS);
  const [label, setLabel] = useState("");
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUsingDefault, setIsUsingDefault] = useState(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [activeRes, versionsRes] = await Promise.all([
        apiFetch(API_CONSTANTS.VOICE_AGENT_PROMPT_ACTIVE),
        apiFetch(API_CONSTANTS.VOICE_AGENT_PROMPT_VERSIONS),
      ]);

      if (activeRes.ok) {
        const active = await activeRes.json();
        if (active) {
          setQuestions(active.questions);
          setLabel(active.label || "");
          setActiveVersionId(active.id);
          setIsUsingDefault(false);
        }
      }

      if (versionsRes.ok) {
        const list = await versionsRes.json();
        setVersions(list);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load voice agent settings.");
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateQuestion = (index: number, value: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? value : q)));
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, ""]);
  };

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setQuestions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  };
  const handleDragEnd = () => setDragIndex(null);

  const handleSave = async () => {
    const cleaned = questions.map((q) => q.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      toast.error("Add at least one question before saving.");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      const res = await apiFetch(API_CONSTANTS.VOICE_AGENT_PROMPT_SAVE, {
        method: "PUT",
        body: JSON.stringify({ questions: cleaned, label: label.trim() || null }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const saved = await res.json();
      setQuestions(saved.questions);
      setActiveVersionId(saved.id);
      setIsUsingDefault(false);
      toast.success("Voice agent questions saved.");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save voice agent questions.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async (versionId: string) => {
    try {
      const res = await apiFetch(
        API_CONSTANTS.VOICE_AGENT_PROMPT_ACTIVATE.replace("{version_id}", versionId),
        { method: "POST" },
      );
      if (!res.ok) throw new Error("Failed to restore version");
      const restored = await res.json();
      setQuestions(restored.questions);
      setLabel(restored.label || "");
      setActiveVersionId(restored.id);
      setIsUsingDefault(false);
      toast.success(`Restored version ${restored.version_number}.`);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore version.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white">
        <Loader2 className="animate-spin text-accent-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-full p-8 bg-white">
      <div className="max-w-5xl mx-auto space-y-10 pb-24">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center text-accent-primary">
              <Mic2 size={20} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">
              Voice Agent Questions
            </h2>
          </div>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            Customize the clinical questions Sarah asks during intake calls
          </p>
        </div>

        <div className="bg-blue-50/40 border border-blue-100 rounded-3xl p-6 text-sm font-medium text-gray-600 leading-relaxed">
          You can customize the clinical questions asked during the call — tailor them to your
          specialty. Identity verification, recording consent, and the call wrap-up are fixed and
          can't be changed, to keep every call compliant and consistent.
          {isUsingDefault && (
            <span className="block mt-2 text-blue-600 font-bold">
              You're currently using the default question set.
            </span>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
            Version Label (optional)
          </label>
          <input
            className="w-full bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 text-sm font-bold text-gray-700 outline-none focus:border-accent-primary/30 focus:ring-4 focus:ring-accent-primary/10 transition-all"
            placeholder="e.g. Post-op follow-up"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Clinical Questions ({questions.length})
            </h4>
            <button
              onClick={addQuestion}
              className="flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:underline"
            >
              <Plus size={14} /> Add Question
            </button>
          </div>

          <AnimatePresence initial={false}>
            {questions.map((question, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-4",
                  dragIndex === index && "opacity-50",
                )}
              >
                <div className="cursor-grab active:cursor-grabbing text-gray-300 mt-2.5 shrink-0">
                  <GripVertical size={16} />
                </div>
                <span className="text-xs font-black text-gray-400 mt-2.5 shrink-0 w-5">
                  {index + 1}
                </span>
                <textarea
                  value={question}
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  rows={2}
                  placeholder="e.g. Ask about current medications"
                  className="flex-1 bg-white rounded-xl px-3 py-2 border border-gray-100 text-sm font-semibold text-gray-700 outline-none focus:border-accent-primary/30 focus:ring-4 focus:ring-accent-primary/10 transition-all resize-none"
                />
                <button
                  onClick={() => removeQuestion(index)}
                  className="text-gray-300 hover:text-red-500 mt-2.5 shrink-0 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {questions.length === 0 && (
            <div className="py-12 text-center bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-sm text-gray-400 italic">No questions yet — add at least one.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="primary"
            className="rounded-2xl px-8 h-12 bg-gray-900 hover:bg-black font-black uppercase tracking-widest text-xs shadow-2xl gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save & Activate
          </Button>
        </div>

        <div className="space-y-4 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2">
            <History size={14} className="text-gray-400" />
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Version History
            </h4>
          </div>

          {versions.length === 0 ? (
            <p className="text-sm text-gray-400 italic px-2">
              No saved versions yet — save your first customization above.
            </p>
          ) : (
            <div className="space-y-2">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                    v.id === activeVersionId
                      ? "bg-accent-primary/5 border-accent-primary/20"
                      : "bg-gray-50 border-gray-100",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {v.id === activeVersionId ? (
                      <CheckCircle2 size={16} className="text-accent-primary shrink-0" />
                    ) : (
                      <div className="w-4 h-4 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        Version {v.version_number}
                        {v.label && (
                          <span className="text-gray-400 font-medium"> — {v.label}</span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {v.questions.length} questions •{" "}
                        {new Date(v.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {v.id !== activeVersionId && (
                    <button
                      onClick={() => handleActivate(v.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-accent-primary transition-colors"
                    >
                      <RotateCcw size={13} /> Restore
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
