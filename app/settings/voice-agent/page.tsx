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
      <div className="min-h-full flex items-center justify-center p-8 bg-background">
        <Loader2 className="animate-spin text-teal-700" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-full p-8 bg-background">
      <div className="max-w-5xl mx-auto space-y-10 pb-24">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Mic2 size={20} />
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
              Voice Agent Questions
            </h1>
          </div>
          <p className="text-sm text-muted">
            Customize the clinical questions Sarah asks during intake calls.
          </p>
        </div>

        <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-6 text-sm leading-relaxed text-ink-soft">
          You can customize the clinical questions asked during the call — tailor them to your
          specialty. Identity verification, recording consent, and the call wrap-up are fixed and
          can't be changed, to keep every call compliant and consistent.
          {isUsingDefault && (
            <span className="mt-2 block font-medium text-teal-700">
              You're currently using the default question set.
            </span>
          )}
        </div>

        <div className="space-y-2 rounded-2xl border border-line bg-surface p-6 shadow-soft">
          <label className="ml-1 text-[11px] font-medium uppercase tracking-wider text-muted-2">
            Version Label (optional)
          </label>
          <input
            className="w-full rounded-xl border border-line bg-surface-2/60 px-4 py-3 text-sm font-medium text-ink outline-none transition-all placeholder:text-muted-2 focus:border-[#0A6256] focus:bg-[#EAF5F2] focus:ring-2 focus:ring-[#7FBDB4]/60"
            placeholder="e.g. Post-op follow-up"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-2">
              Clinical Questions ({questions.length})
            </h4>
            <button
              onClick={addQuestion}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
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
                  "flex items-start gap-3 rounded-xl border border-line bg-surface-2/40 p-4",
                  dragIndex === index && "opacity-50",
                )}
              >
                <div className="mt-2.5 shrink-0 cursor-grab text-muted-2 active:cursor-grabbing">
                  <GripVertical size={16} />
                </div>
                <span className="mt-2.5 w-5 shrink-0 text-xs font-semibold text-muted-2">
                  {index + 1}
                </span>
                <textarea
                  value={question}
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  rows={2}
                  placeholder="e.g. Ask about current medications"
                  className="flex-1 resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none transition-all focus:border-[#0A6256] focus:bg-[#EAF5F2] focus:ring-2 focus:ring-[#7FBDB4]/60"
                />
                <button
                  onClick={() => removeQuestion(index)}
                  className="mt-2.5 shrink-0 text-muted-2 transition-colors hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {questions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line bg-surface-2/40 py-12 text-center">
              <p className="text-sm italic text-muted-2">No questions yet — add at least one.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="gap-2 rounded-xl bg-teal-700 px-8 font-medium text-white shadow-soft hover:bg-teal-800"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save & Activate
          </Button>
        </div>

        <div className="space-y-4 border-t border-line pt-6">
          <div className="flex items-center gap-2 px-1">
            <History size={14} className="text-muted-2" />
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-2">
              Version History
            </h4>
          </div>

          {versions.length === 0 ? (
            <p className="px-1 text-sm italic text-muted-2">
              No saved versions yet — save your first customization above.
            </p>
          ) : (
            <div className="space-y-2">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-4 transition-all",
                    v.id === activeVersionId
                      ? "border-teal-200 bg-teal-50"
                      : "border-line bg-surface-2/40",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {v.id === activeVersionId ? (
                      <CheckCircle2 size={16} className="shrink-0 text-teal-700" />
                    ) : (
                      <div className="h-4 w-4 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Version {v.version_number}
                        {v.label && (
                          <span className="font-normal text-muted"> — {v.label}</span>
                        )}
                      </p>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-2">
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
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-teal-700"
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
