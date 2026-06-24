"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X, UploadCloud, FileText, CheckCircle, ChevronRight,
  File as FileIcon, AlertCircle, XCircle, Calendar, AlertTriangle, Check,
  FileSpreadsheet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { usePatient } from "@/context/PatientContext";
import Papa from "papaparse";
import { toast } from "react-hot-toast";

interface BulkUploadWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type UploadMode = null | "csv" | "pdf";

// Shape of a row coming back from POST /bulk/parse-pdf
interface ParsedPatientRow {
  row_index: number;
  time_label: string;
  appointment_datetime: string | null;
  patient_name: string | null;
  patient_dob: string | null;       // ISO YYYY-MM-DD
  patient_phone: string | null;     // E.164
  raw_note: string;
  detected_type: "new" | "followup" | "unclear";
  detection_reason: string;
  phone_warning: string | null;
}

interface NonPatientRow {
  row_index: number;
  time_label: string;
  raw_text: string;
}

interface ParsedSchedule {
  appointment_date: string | null;
  doctor_name: string | null;
  patient_rows: ParsedPatientRow[];
  non_patient_rows: NonPatientRow[];
  parser_warnings: string[];
}

// Editable patient row used in the PDF "review" step
interface EditablePatient extends ParsedPatientRow {
  include: boolean;          // surgeon can drop a row
  // overridable fields
  edit_name: string;
  edit_phone: string;
  edit_dob: string;
  edit_type: "new" | "followup";
}

export function BulkUploadWizard({ isOpen, onClose }: BulkUploadWizardProps) {
  const { uploadBulkPatients, parseSchedulePdf, confirmBulkPatients } = usePatient();

  // null until the user picks CSV or PDF mode
  const [mode, setMode] = useState<UploadMode>(null);

  // CSV-flow state (unchanged from before)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [parsedPatients, setParsedPatients] = useState<any[]>([]);
  const [fileMappings, setFileMappings] = useState<Record<number, { gpLetter: string; previousScribe: string }>>({});

  // PDF-flow state
  const [scheduleFile, setScheduleFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedSchedule, setParsedSchedule] = useState<ParsedSchedule | null>(null);
  const [editableRows, setEditableRows] = useState<EditablePatient[]>([]);

  // Shared submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  const csvInputRef = useRef<HTMLInputElement>(null);
  const pdfScheduleInputRef = useRef<HTMLInputElement>(null);

  // Reset everything when the modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMode(null);
        setStep(1);
        setCsvFile(null);
        setPdfFiles([]);
        setParsedPatients([]);
        setFileMappings({});
        setScheduleFile(null);
        setIsParsing(false);
        setParsedSchedule(null);
        setEditableRows([]);
        setIsSubmitting(false);
        setUploadResult(null);
      }, 300);
    }
  }, [isOpen]);

  // ---------- CSV mode handlers (legacy, unchanged) ----------

  const handleCsvFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const csv = files.find(f => f.name.toLowerCase().endsWith(".csv"));
    const pdfs = files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
    if (csv) setCsvFile(csv);
    if (pdfs.length > 0) setPdfFiles(prev => [...prev, ...pdfs]);
  };

  const removePdf = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  const parseCsvAndAutoMap = () => {
    if (!csvFile) return;
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error("Failed to parse CSV file");
          return;
        }
        const patients = results.data as any[];
        setParsedPatients(patients);

        const initialMappings: Record<number, { gpLetter: string; previousScribe: string }> = {};
        patients.forEach((patient, index) => {
          const pName = patient.patient_name || patient.full_name || "";
          const pType = (patient.patient_type || "").toLowerCase();
          let matchedGp = "";
          let matchedScribe = "";
          if (pName) {
            const nameParts = pName.toLowerCase().split(" ");
            const potentialMatches = pdfFiles.filter(f =>
              nameParts.some((part: string) => part.length > 2 && f.name.toLowerCase().includes(part))
            );
            if (potentialMatches.length > 0) {
              if (pType === "new") matchedGp = potentialMatches[0].name;
              else if (pType === "followup") matchedScribe = potentialMatches[0].name;
            }
          }
          initialMappings[index] = {
            gpLetter: patient.gp_letter_filename || matchedGp,
            previousScribe: patient.previous_scribe_filename || matchedScribe,
          };
        });
        setFileMappings(initialMappings);
        setStep(2);
      },
    });
  };

  const handleMappingChange = (index: number, field: "gpLetter" | "previousScribe", value: string) => {
    setFileMappings(prev => ({
      ...prev,
      [index]: { ...prev[index], [field]: value },
    }));
  };

  const handleCsvSubmit = async () => {
    if (!csvFile) return;
    setIsSubmitting(true);
    try {
      const updatedData = parsedPatients.map((patient, index) => ({
        ...patient,
        gp_letter_filename: fileMappings[index]?.gpLetter || "",
        previous_scribe_filename: fileMappings[index]?.previousScribe || "",
      }));
      const csvString = Papa.unparse(updatedData);
      const newCsvFile = new File([new Blob([csvString], { type: "text/csv" })], csvFile.name, { type: "text/csv" });
      const formData = new FormData();
      formData.append("bulk_list", newCsvFile);
      pdfFiles.forEach(pdf => {
        const isMapped = Object.values(fileMappings).some(m => m.gpLetter === pdf.name || m.previousScribe === pdf.name);
        if (isMapped) formData.append("files", pdf);
      });
      const response = await uploadBulkPatients(formData);
      setUploadResult(response);
      toast.success("Bulk upload processed successfully!");
      setStep(3);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit bulk upload");
      setIsSubmitting(false);
    }
  };

  // ---------- PDF mode handlers (new) ----------

  const handleScheduleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Schedule must be a PDF file");
      return;
    }
    setScheduleFile(f);
  };

  const handleParsePdf = async () => {
    if (!scheduleFile) return;
    setIsParsing(true);
    try {
      const result: ParsedSchedule = await parseSchedulePdf(scheduleFile);
      setParsedSchedule(result);
      // Build editable rows
      const rows: EditablePatient[] = result.patient_rows.map(r => ({
        ...r,
        include: true,
        edit_name: r.patient_name || "",
        edit_phone: r.patient_phone || "",
        edit_dob: r.patient_dob || "",
        edit_type: r.detected_type === "unclear" ? "new" : r.detected_type,
      }));
      setEditableRows(rows);
      if (result.patient_rows.length === 0) {
        toast("No patient rows detected — check the PDF format", { icon: "⚠️" });
      } else {
        toast.success(`Found ${result.patient_rows.length} patient(s) and ${result.non_patient_rows.length} non-patient row(s)`);
      }
      setStep(2);
    } catch (e: any) {
      toast.error(e.message || "Failed to parse schedule PDF");
    } finally {
      setIsParsing(false);
    }
  };

  const updateRow = (idx: number, patch: Partial<EditablePatient>) => {
    setEditableRows(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const handlePdfConfirm = async () => {
    const included = editableRows.filter(r => r.include);
    if (included.length === 0) {
      toast.error("No patients selected to confirm");
      return;
    }
    // Validate: name + appointment required for all; phone required for new
    const invalid = included.find(r => {
      if (!r.edit_name.trim()) return true;
      if (!r.appointment_datetime) return true;
      if (r.edit_type === "new" && !r.edit_phone.trim()) return true;
      return false;
    });
    if (invalid) {
      toast.error(`Row "${invalid.edit_name || invalid.time_label}": missing required fields`);
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = included.map(r => ({
        patient_name: r.edit_name.trim(),
        patient_type: r.edit_type,
        appointment_datetime: r.appointment_datetime,
        patient_phone: r.edit_phone.trim() || null,
        patient_dob: r.edit_dob.trim() || null,
        notes: r.raw_note || null,
        source_row_index: r.row_index,
      }));
      const response = await confirmBulkPatients(payload);
      setUploadResult(response);
      toast.success("Patients created successfully!");
      setStep(3);
    } catch (e: any) {
      toast.error(e.message || "Failed to confirm patients");
      setIsSubmitting(false);
    }
  };

  // ---------- Render helpers ----------

  const headerSteps = mode === "pdf"
    ? ["Upload Schedule", "Review Patients", "Complete"]
    : mode === "csv"
      ? ["Upload Files", "Map Patients", "Complete"]
      : ["Choose Method", "Review", "Complete"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting && !isParsing ? onClose : undefined}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl bg-white rounded-[32px] shadow-2xl z-[51] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-primary/10 rounded-[16px] flex items-center justify-center text-accent-primary">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Bulk Upload Wizard</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {headerSteps.map((label, i) => (
                      <React.Fragment key={label}>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${step === i + 1 ? "text-accent-primary" : "text-gray-400"}`}>
                          {i + 1}. {label}
                        </span>
                        {i < headerSteps.length - 1 && <ChevronRight size={12} className="text-gray-300" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
              {!isSubmitting && !isParsing && (
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              {/* STEP 1 — Mode picker (when nothing chosen) */}
              {step === 1 && mode === null && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <button
                    onClick={() => setMode("pdf")}
                    className="border-2 border-gray-200 hover:border-accent-primary rounded-[28px] p-8 text-left transition-all hover:bg-accent-primary/5 group"
                  >
                    <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <FileText size={26} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">Schedule PDF</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      Upload the day's appointment schedule exported from the EHR. The system extracts patients,
                      detects new vs followup, and surfaces admin rows separately for review.
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500 mt-4">Recommended →</p>
                  </button>

                  <button
                    onClick={() => setMode("csv")}
                    className="border-2 border-gray-200 hover:border-gray-400 rounded-[28px] p-8 text-left transition-all hover:bg-gray-50 group"
                  >
                    <div className="w-14 h-14 bg-gray-50 text-gray-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <FileSpreadsheet size={26} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">CSV + Documents</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      Upload a CSV of patient rows plus all GP letters and previous scribe notes in one go.
                      Filenames in the CSV are matched to uploaded files.
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-4">Legacy</p>
                  </button>
                </motion.div>
              )}

              {/* STEP 1 — PDF mode: upload schedule */}
              {step === 1 && mode === "pdf" && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-[32px] p-12 text-center hover:bg-gray-50 hover:border-accent-primary/50 transition-all cursor-pointer relative group"
                    onClick={() => pdfScheduleInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={pdfScheduleInputRef}
                      onChange={handleScheduleFileSelect}
                      className="hidden"
                      accept=".pdf"
                    />
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <UploadCloud size={32} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Drop the schedule PDF here</h3>
                    <p className="text-sm text-gray-400 font-medium max-w-md mx-auto">
                      The PDF should be the day's appointment list exported from the EHR.
                      AI will extract patient rows and flag non-patient entries separately.
                    </p>
                  </div>

                  {scheduleFile && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
                      <FileText className="text-emerald-500" size={24} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{scheduleFile.name}</p>
                        <p className="text-xs text-emerald-600 font-medium">Ready to parse</p>
                      </div>
                      <CheckCircle className="text-emerald-500" size={20} />
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 1 — CSV mode: original upload UI */}
              {step === 1 && mode === "csv" && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-[32px] p-12 text-center hover:bg-gray-50 hover:border-accent-primary/50 transition-all cursor-pointer relative group"
                    onClick={() => csvInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={csvInputRef}
                      onChange={handleCsvFilesSelect}
                      className="hidden"
                      multiple
                      accept=".csv,.pdf"
                    />
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <UploadCloud size={32} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Drop your CSV and PDF files here</h3>
                    <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto">
                      Upload the patient registry CSV along with all related GP letters and scribe notes in one go.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Registry CSV</h4>
                      {csvFile ? (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
                          <FileText className="text-emerald-500" size={24} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{csvFile.name}</p>
                            <p className="text-xs text-emerald-600 font-medium">Ready to parse</p>
                          </div>
                          <CheckCircle className="text-emerald-500" size={20} />
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-center text-gray-400 border-dashed h-[74px]">
                          <span className="text-sm font-medium">No CSV uploaded yet</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Clinical Documents ({pdfFiles.length})</h4>
                      {pdfFiles.length > 0 ? (
                        <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                          {pdfFiles.map((pdf, i) => (
                            <div key={i} className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-center justify-between group">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <FileIcon className="text-blue-500 shrink-0" size={16} />
                                <p className="text-xs font-bold text-gray-700 truncate">{pdf.name}</p>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); removePdf(i); }} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-center text-gray-400 border-dashed h-[74px]">
                          <span className="text-sm font-medium">No PDFs uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — PDF mode: review parsed rows */}
              {step === 2 && mode === "pdf" && parsedSchedule && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="text-blue-500 mt-0.5 shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-bold text-blue-900">
                        Review the parsed schedule for {parsedSchedule.doctor_name || "your appointments"} on{" "}
                        {parsedSchedule.appointment_date || "the selected day"}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Confirm name / phone / DOB / type for each patient. Untick any row to skip it.
                        GP letters get attached per-patient later from the patient detail page.
                      </p>
                    </div>
                  </div>

                  {/* Editable patient rows */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-50/50 border-b border-gray-100 px-5 py-3 grid grid-cols-12 gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <div className="col-span-1">Inc.</div>
                      <div className="col-span-2">Time</div>
                      <div className="col-span-3">Name</div>
                      <div className="col-span-2">Phone</div>
                      <div className="col-span-2">DOB</div>
                      <div className="col-span-2">Type</div>
                    </div>
                    {editableRows.map((row, i) => (
                      <div
                        key={i}
                        className={`px-5 py-3 grid grid-cols-12 gap-3 items-center border-b border-gray-50 last:border-0 transition-colors ${
                          row.include ? "" : "opacity-40 bg-gray-50/30"
                        }`}
                      >
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={row.include}
                            onChange={(e) => updateRow(i, { include: e.target.checked })}
                            className="w-4 h-4 accent-accent-primary"
                          />
                        </div>
                        <div className="col-span-2 text-xs font-bold text-gray-700">{row.time_label}</div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={row.edit_name}
                            onChange={(e) => updateRow(i, { edit_name: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={row.edit_phone}
                            onChange={(e) => updateRow(i, { edit_phone: e.target.value })}
                            placeholder="+61..."
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                          />
                          {row.phone_warning && (
                            <p className="text-[10px] text-amber-600 mt-1">⚠ {row.phone_warning}</p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <input
                            type="date"
                            value={row.edit_dob}
                            onChange={(e) => updateRow(i, { edit_dob: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                          />
                        </div>
                        <div className="col-span-2">
                          <select
                            value={row.edit_type}
                            onChange={(e) => updateRow(i, { edit_type: e.target.value as "new" | "followup" })}
                            className={`w-full border rounded-lg px-3 py-1.5 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-accent-primary/20 ${
                              row.edit_type === "new" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-purple-50 border-purple-100 text-purple-700"
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="followup">Followup</option>
                          </select>
                          {row.detected_type === "unclear" && (
                            <p className="text-[10px] text-amber-600 mt-1">⚠ unclear — please confirm</p>
                          )}
                        </div>
                        {row.raw_note && (
                          <div className="col-span-12 text-[11px] text-gray-500 font-medium italic px-1">
                            {row.raw_note}
                          </div>
                        )}
                      </div>
                    ))}
                    {editableRows.length === 0 && (
                      <div className="p-8 text-center text-sm text-gray-400">
                        No patient rows detected in the PDF.
                      </div>
                    )}
                  </div>

                  {/* Non-patient rows audit panel */}
                  {parsedSchedule.non_patient_rows.length > 0 && (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <AlertTriangle size={14} />
                        Non-patient rows skipped ({parsedSchedule.non_patient_rows.length})
                      </h4>
                      <p className="text-xs text-gray-500">
                        These look like admin items, blocks, or off-site clinics — not real patients.
                        If you spot a patient here by mistake, parse the PDF again or use the CSV flow.
                      </p>
                      <div className="space-y-1 max-h-[140px] overflow-y-auto pr-2">
                        {parsedSchedule.non_patient_rows.map((r, i) => (
                          <div key={i} className="text-xs text-gray-600 font-medium flex gap-3">
                            <span className="text-gray-400 font-mono shrink-0 w-32">{r.time_label}</span>
                            <span>{r.raw_text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2 — CSV mode: original mapping UI */}
              {step === 2 && mode === "csv" && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="text-blue-500 mt-0.5 shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-bold text-blue-900">Map Clinical Documents</p>
                      <p className="text-xs text-blue-700 mt-1">We've parsed your CSV. Please select the correct PDF file for each patient. We've auto-matched some based on filenames.</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Required Document</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedPatients.map((patient, i) => {
                          const pName = patient.patient_name || patient.full_name || "Unknown Patient";
                          const pType = (patient.patient_type || "new").toLowerCase();
                          return (
                            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                    {pName.charAt(0)}
                                  </div>
                                  <span className="text-sm font-bold text-gray-900">{pName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${pType === "new" ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600"}`}>
                                  {pType}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                                  value={pType === "new" ? fileMappings[i]?.gpLetter || "" : fileMappings[i]?.previousScribe || ""}
                                  onChange={(e) =>
                                    handleMappingChange(i, pType === "new" ? "gpLetter" : "previousScribe", e.target.value)
                                  }
                                >
                                  <option value="">-- Select {pType === "new" ? "GP Letter" : "Scribe Note"} --</option>
                                  {pdfFiles.map((f, j) => (
                                    <option key={j} value={f.name}>{f.name}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — shared success/results screen */}
              {step === 3 && (
                !uploadResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mb-6" />
                    <h3 className="text-xl font-bold text-gray-900">Processing Upload Results...</h3>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                    <div className="text-center space-y-2 mb-6">
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">Processing Complete</h3>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Bulk Registry Ingestion Report</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-6 text-center space-y-1 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Rows</p>
                        <p className="text-3xl font-black text-gray-900 italic">{uploadResult.total_rows}</p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-[24px] p-6 text-center space-y-1 shadow-sm">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Successful</p>
                        <p className="text-3xl font-black text-emerald-600 italic">{uploadResult.successful}</p>
                      </div>
                      <div className="bg-rose-50 border border-rose-100 rounded-[24px] p-6 text-center space-y-1 shadow-sm">
                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Failed</p>
                        <p className="text-3xl font-black text-rose-600 italic">{uploadResult.failed}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-3">Ingestion Details</h4>
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {uploadResult.results?.map((row: any, i: number) => (
                          <div
                            key={i}
                            className={`border rounded-2xl p-5 flex flex-col md:flex-row md:items-start gap-4 transition-all hover:shadow-sm ${
                              row.success ? "bg-white border-gray-100 hover:border-emerald-200" : "bg-rose-50/20 border-rose-100 hover:border-rose-200"
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {row.success ? (
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                  <Check size={16} className="stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-rose-50/80 text-rose-500 flex items-center justify-center">
                                  <XCircle size={18} className="stroke-[2.5]" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-400 font-mono bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                                  Row {row.row_index}
                                </span>
                                <p className="text-sm font-black text-gray-900 tracking-tight italic">{row.patient_name || `Row ${row.row_index}`}</p>
                                {row.patient_type && (
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${row.patient_type === "new" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-purple-50 text-purple-600 border border-purple-100"}`}>
                                    {row.patient_type}
                                  </span>
                                )}
                              </div>
                              {row.success ? (
                                <div className="flex flex-col gap-2 text-xs text-gray-500 font-medium">
                                  {row.scheduled_call_at && (
                                    <span className="flex items-center gap-1.5 text-emerald-600">
                                      <Calendar size={13} />
                                      Call scheduled: {new Date(row.scheduled_call_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                                    </span>
                                  )}
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {row.session_id && <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Session: {row.session_id.slice(0, 8)}...</span>}
                                    {row.referral_id && <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Referral: {row.referral_id.slice(0, 8)}...</span>}
                                    {row.intake_id && <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Intake: {row.intake_id.slice(0, 8)}...</span>}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                                    <AlertTriangle size={13} />
                                    {row.error || "Failed to process row"}
                                  </p>
                                  {row.missing_fields && row.missing_fields.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 items-center">
                                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mr-1">Missing / Invalid:</span>
                                      {row.missing_fields.map((field: string, fIdx: number) => (
                                        <span key={fIdx} className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 font-mono text-[10px] rounded">
                                          {field}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between gap-3">
              <div>
                {step === 1 && mode !== null && (
                  <Button variant="outline" onClick={() => setMode(null)}>← Back to method</Button>
                )}
              </div>
              <div className="flex gap-3">
                {step === 1 && mode === "pdf" && (
                  <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleParsePdf} disabled={!scheduleFile || isParsing}>
                      {isParsing ? "Parsing..." : "Next: Review Patients"}
                    </Button>
                  </>
                )}
                {step === 1 && mode === "csv" && (
                  <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={parseCsvAndAutoMap} disabled={!csvFile}>Next: Map Documents</Button>
                  </>
                )}
                {step === 2 && mode === "pdf" && (
                  <>
                    <Button variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>Back</Button>
                    <Button onClick={handlePdfConfirm} disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Confirm & Create Patients"}
                    </Button>
                  </>
                )}
                {step === 2 && mode === "csv" && (
                  <>
                    <Button variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>Back</Button>
                    <Button onClick={handleCsvSubmit} disabled={isSubmitting}>
                      {isSubmitting ? "Uploading..." : "Confirm & Upload"}
                    </Button>
                  </>
                )}
                {step === 3 && (
                  <Button onClick={onClose} className="px-8">Close</Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
