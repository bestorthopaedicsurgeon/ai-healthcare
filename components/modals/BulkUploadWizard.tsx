"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, UploadCloud, FileText, CheckCircle, ChevronRight, File as FileIcon, User, AlertCircle, XCircle, Calendar, AlertTriangle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { usePatient } from "@/context/PatientContext";
import Papa from "papaparse";
import { toast } from "react-hot-toast";

interface BulkUploadWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkUploadWizard({ isOpen, onClose }: BulkUploadWizardProps) {
  const { uploadBulkPatients } = usePatient();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  
  const [parsedPatients, setParsedPatients] = useState<any[]>([]);
  const [fileMappings, setFileMappings] = useState<Record<number, { gpLetter: string; previousScribe: string }>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setCsvFile(null);
        setPdfFiles([]);
        setParsedPatients([]);
        setFileMappings({});
        setIsSubmitting(false);
        setUploadResult(null);
      }, 300); // Wait for exit animation
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const csv = files.find(f => f.name.toLowerCase().endsWith('.csv'));
      const pdfs = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
      
      if (csv) setCsvFile(csv);
      if (pdfs.length > 0) setPdfFiles(prev => [...prev, ...pdfs]);
    }
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

        // Auto-mapping logic
        const initialMappings: Record<number, { gpLetter: string; previousScribe: string }> = {};
        
        patients.forEach((patient, index) => {
          const pName = patient.patient_name || patient.full_name || "";
          const pType = (patient.patient_type || "").toLowerCase();
          
          let matchedGp = "";
          let matchedScribe = "";

          // Try to fuzzy match based on name if name exists
          if (pName) {
            const nameParts = pName.toLowerCase().split(" ");
            const potentialMatches = pdfFiles.filter(f => 
                nameParts.some((part: string) => part.length > 2 && f.name.toLowerCase().includes(part))
            );

            if (potentialMatches.length > 0) {
                if (pType === "new") {
                    matchedGp = potentialMatches[0].name;
                } else if (pType === "followup") {
                    matchedScribe = potentialMatches[0].name;
                }
            }
          }

          initialMappings[index] = {
            gpLetter: patient.gp_letter_filename || matchedGp,
            previousScribe: patient.previous_scribe_filename || matchedScribe
          };
        });

        setFileMappings(initialMappings);
        setStep(2);
      }
    });
  };

  const handleMappingChange = (index: number, field: 'gpLetter' | 'previousScribe', value: string) => {
    setFileMappings(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!csvFile) return;
    setIsSubmitting(true);

    try {
      // 1. Inject mappings into the parsed CSV data
      const updatedData = parsedPatients.map((patient, index) => {
        return {
          ...patient,
          gp_letter_filename: fileMappings[index]?.gpLetter || "",
          previous_scribe_filename: fileMappings[index]?.previousScribe || ""
        };
      });

      // 2. Unparse back to CSV string
      const csvString = Papa.unparse(updatedData);
      
      // 3. Create a new File blob
      const newCsvBlob = new Blob([csvString], { type: 'text/csv' });
      const newCsvFile = new File([newCsvBlob], csvFile.name, { type: 'text/csv' });

      // 4. Build FormData
      const formData = new FormData();
      formData.append("bulk_list", newCsvFile);
      
      pdfFiles.forEach(pdf => {
        // Find if this PDF is actually mapped to someone before sending it
        const isMapped = Object.values(fileMappings).some(m => m.gpLetter === pdf.name || m.previousScribe === pdf.name);
        if (isMapped) {
            formData.append("files", pdf);
        }
      });

      // 5. Submit
      const response = await uploadBulkPatients(formData);
      setUploadResult(response);
      
      toast.success("Bulk upload processed successfully!");
      setStep(3);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit bulk upload");
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting ? onClose : undefined}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-[32px] shadow-2xl z-[51] overflow-hidden flex flex-col max-h-[90vh]"
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
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${step === 1 ? 'text-accent-primary' : 'text-gray-400'}`}>1. Upload Files</span>
                    <ChevronRight size={12} className="text-gray-300" />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${step === 2 ? 'text-accent-primary' : 'text-gray-400'}`}>2. Map Patients</span>
                    <ChevronRight size={12} className="text-gray-300" />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${step === 3 ? 'text-accent-primary' : 'text-gray-400'}`}>3. Complete</span>
                  </div>
                </div>
              </div>
              {!isSubmitting && (
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* STEP 1: UPLOAD */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div 
                    className="border-2 border-dashed border-gray-200 rounded-[32px] p-12 text-center hover:bg-gray-50 hover:border-accent-primary/50 transition-all cursor-pointer relative group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                        multiple 
                        accept=".csv,.pdf"
                    />
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <UploadCloud size={32} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Drop your CSV and PDF files here</h3>
                    <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto">Upload the patient registry CSV along with all related GP letters and scribe notes in one go.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* CSV Status */}
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

                    {/* PDFs Status */}
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

              {/* STEP 2: MAPPING */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
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
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${pType === 'new' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
                                                    {pType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {pType === 'new' ? (
                                                    <div className="relative">
                                                        <select 
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 appearance-none pr-8"
                                                            value={fileMappings[i]?.gpLetter || ""}
                                                            onChange={(e) => handleMappingChange(i, 'gpLetter', e.target.value)}
                                                        >
                                                            <option value="">-- Select GP Letter --</option>
                                                            {pdfFiles.map((f, j) => <option key={j} value={f.name}>{f.name}</option>)}
                                                        </select>
                                                        <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <select 
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 appearance-none pr-8"
                                                            value={fileMappings[i]?.previousScribe || ""}
                                                            onChange={(e) => handleMappingChange(i, 'previousScribe', e.target.value)}
                                                        >
                                                            <option value="">-- Select Scribe Note --</option>
                                                            {pdfFiles.map((f, j) => <option key={j} value={f.name}>{f.name}</option>)}
                                                        </select>
                                                        <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
              )}

              {/* STEP 3: SUCCESS OR RESPONSE DETAILS */}
              {step === 3 && (
                !uploadResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mb-6" />
                      <h3 className="text-xl font-bold text-gray-900">Processing Upload Results...</h3>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="space-y-8"
                  >
                    <div className="text-center space-y-2 mb-6">
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">Processing Complete</h3>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Bulk Registry Ingestion Report</p>
                    </div>

                    {/* Summary Cards */}
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

                    {/* Detailed Results List */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-3">Ingestion Details</h4>
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {uploadResult.results?.map((row: any, i: number) => {
                          const isSuccess = row.success;
                          const rowNum = row.row_index + 2; // Data row starts at index 0 which corresponds to row 2 of CSV

                          return (
                            <div 
                              key={i} 
                              className={`border rounded-2xl p-5 flex flex-col md:flex-row md:items-start gap-4 transition-all hover:shadow-sm ${
                                isSuccess ? "bg-white border-gray-100 hover:border-emerald-200" : "bg-rose-50/20 border-rose-100 hover:border-rose-200"
                              }`}
                            >
                              {/* Icon / Status */}
                              <div className="shrink-0 mt-0.5">
                                {isSuccess ? (
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                    <Check size={16} className="stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-rose-50/80 text-rose-500 flex items-center justify-center">
                                    <XCircle size={18} className="stroke-[2.5]" />
                                  </div>
                                )}
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="text-[10px] font-bold text-gray-400 font-mono bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                                    Row {rowNum}
                                  </span>
                                  <p className="text-sm font-black text-gray-900 tracking-tight italic">
                                    {row.patient_name || "Row " + rowNum}
                                  </p>
                                  {row.patient_type && (
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                      row.patient_type === 'new' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-purple-50 text-purple-600 border border-purple-100"
                                    }`}>
                                      {row.patient_type}
                                    </span>
                                  )}
                                </div>

                                {/* Success details */}
                                {isSuccess ? (
                                  <div className="flex flex-col gap-2 text-xs text-gray-500 font-medium">
                                    {row.scheduled_call_at && (
                                      <span className="flex items-center gap-1.5 text-emerald-600">
                                        <Calendar size={13} />
                                        Call scheduled: {new Date(row.scheduled_call_at).toLocaleString(undefined, { 
                                          dateStyle: 'medium', 
                                          timeStyle: 'short' 
                                        })}
                                      </span>
                                    )}
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {row.patient_id && (
                                        <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                          Patient ID: {row.patient_id.slice(0, 8)}...
                                        </span>
                                      )}
                                      {row.session_id && (
                                        <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                          Session ID: {row.session_id.slice(0, 8)}...
                                        </span>
                                      )}
                                      {row.referral_id && (
                                        <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                          Referral ID: {row.referral_id.slice(0, 8)}...
                                        </span>
                                      )}
                                      {row.intake_id && (
                                        <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                          Intake ID: {row.intake_id.slice(0, 8)}...
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  /* Failure details */
                                  <div className="space-y-2">
                                    <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                                      <AlertTriangle size={13} />
                                      {row.error || "Failed to process row"}
                                    </p>
                                    {row.missing_fields && row.missing_fields.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 items-center">
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mr-1">Missing / Invalid Fields:</span>
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
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )
              )}

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                {step === 1 && (
                    <>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={parseCsvAndAutoMap} disabled={!csvFile}>Next: Map Documents</Button>
                    </>
                )}
                {step === 2 && (
                    <>
                        <Button variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>Back</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Uploading..." : "Confirm & Upload"}
                        </Button>
                    </>
                )}
                {step === 3 && (
                    <Button onClick={onClose} className="px-8">Close</Button>
                )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
