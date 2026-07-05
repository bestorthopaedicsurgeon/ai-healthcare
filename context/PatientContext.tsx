"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { API_CONSTANTS } from "@/lib/api-constants";
import { toast } from "react-hot-toast";

export interface Patient {
  id: string;
  physician_id: string;
  reference_number: number;
  full_name: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

export interface Session {
    session_id: string;
    physician_id: string;
    patient_name: string;
    patient_dob: string;
    patient_phone: string;
    notes?: string;
    referral_id: string | null;
    intake_id: string | null;
    consultation_id: string | null;
    expires_at: string;
    created_at: string;
}

// --- Bulk PDF flow types (shared with BulkUploadWizard) ---

export interface ParsedPatientRow {
    row_index: number;
    time_label: string;
    appointment_datetime: string | null;
    patient_name: string | null;
    patient_dob: string | null;
    patient_phone: string | null;
    raw_note: string;
    detected_type: "new" | "followup" | "unclear";
    detection_reason: string;
    phone_warning: string | null;
}

export interface NonPatientRow {
    row_index: number;
    time_label: string;
    raw_text: string;
}

export interface ParsedSchedule {
    appointment_date: string | null;
    doctor_name: string | null;
    patient_rows: ParsedPatientRow[];
    non_patient_rows: NonPatientRow[];
    parser_warnings: string[];
}

export interface ConfirmedPatientPayload {
    patient_name: string;
    patient_type: "new" | "followup";
    appointment_datetime: string;
    patient_phone: string | null;
    patient_dob: string | null;
    notes: string | null;
    source_row_index?: number;
}

export interface BulkRowResult {
    row_index: number;
    patient_name: string;
    patient_type: "new" | "followup";
    success: boolean;
    patient_id?: string | null;
    session_id?: string | null;
    referral_id?: string | null;
    intake_id?: string | null;
    scheduled_call_at?: string | null;
    error?: string | null;
    missing_fields?: string[];
}

export interface BulkUploadResponse {
    bulk_upload_id: string;
    total_rows: number;
    successful: number;
    failed: number;
    results: BulkRowResult[];
}

interface PatientContextType {
  patients: Patient[];
  sessions: Session[];
  activePatientId: string | null;
  activePatient: Patient | null;
  setActivePatientId: (id: string | null) => void;
  activeSessionId: string | null;
  activeSession: Session | null;
  setActiveSessionId: (id: string | null) => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  patientSessions: Record<string, 'idle' | 'active' | 'finished'>; // patientId -> status
  setScribeStatus: (patientId: string, status: 'idle' | 'active' | 'finished') => void;
  isLoading: boolean;
  refreshPatients: (search?: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
  createPatient: (payload: any) => Promise<Patient>;
  createSession: (payload: any) => Promise<Session>;
  getSessionsForPatient: (patientName: string) => Session[];
  openSessionModal: (redirectTo?: string) => void;
  closeSessionModal: () => void;
  isSessionModalOpen: boolean;
  sessionRedirectPath: string | null;
  uploadBulkPatients: (formData: FormData) => Promise<BulkUploadResponse>;
  parseSchedulePdf: (pdfFile: File) => Promise<ParsedSchedule>;
  confirmBulkPatients: (patients: ConfirmedPatientPayload[]) => Promise<BulkUploadResponse>;
  uploadPreviousScribe: (sessionId: string, pdfFile: File) => Promise<{
    session_id: string;
    file_url: string;
    summary: string | null;
    summary_generated: boolean;
  }>;
  sessionData: any | null;
  isSessionDataLoading: boolean;
  refreshSessionData: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const { apiFetch, token } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const handleSetActivePatientId = useCallback((id: string | null) => {
    setActivePatientId(id);
    setActiveSessionId(null);
    setSessionData(null);
  }, []);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [patientSessions, setPatientSessions] = useState<Record<string, 'idle' | 'active' | 'finished'>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionRedirectPath, setSessionRedirectPath] = useState<string | null>(null);
const [sessionData, setSessionData] = useState<any | null>(null);
  const [sessionDataCache, setSessionDataCache] = useState<Record<string, any>>({});
  const [isSessionDataLoading, setIsSessionDataLoading] = useState(false);

  const activePatient = patients.find(p => p.id === activePatientId) || null;
  const activeSession = sessions.find(s => s.session_id === activeSessionId) || null;

  const openSessionModal = (redirectTo?: string) => {
    if (redirectTo) setSessionRedirectPath(redirectTo);
    setIsSessionModalOpen(true);
  };

  const closeSessionModal = () => {
    setIsSessionModalOpen(false);
    setSessionRedirectPath(null);
  };

  const refreshPatients = useCallback(async (search?: string) => {
    if (!token) return;
    try {
      setIsLoading(true);
      let url = API_CONSTANTS.PATIENTS_BASE;
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
        if (data.length > 0 && !activePatientId) {
            // Optional: set first patient as active if none selected
            // setActivePatientId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch, token, activePatientId]);

  const refreshSessions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiFetch(API_CONSTANTS.SESSIONS_BASE);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  }, [apiFetch, token]);

  const createPatient = async (payload: any) => {
    const res = await apiFetch(API_CONSTANTS.PATIENTS_BASE, {
        method: "POST",
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to create patient");
    await refreshPatients();
    return data;
  };

  const createSession = async (payload: any) => {
    const res = await apiFetch(API_CONSTANTS.SESSIONS_BASE, {
        method: "POST",
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to create session");
    await refreshSessions();
    setActiveSessionId(data.session_id);
    return data;
  };

  const uploadBulkPatients = async (formData: FormData): Promise<BulkUploadResponse> => {
    const res = await apiFetch(API_CONSTANTS.BULK_UPLOAD, {
        method: "POST",
        body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to upload bulk patients");
    await refreshPatients();
    await refreshSessions();
    return data as BulkUploadResponse;
  };

  // PDF bulk flow (new) — step 1: send the schedule PDF, get back a
  // structured patient list + non-patient rows. NO DB writes yet.
  const parseSchedulePdf = async (pdfFile: File): Promise<ParsedSchedule> => {
    const formData = new FormData();
    formData.append("schedule", pdfFile);
    const res = await apiFetch(API_CONSTANTS.BULK_PARSE_PDF, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to parse schedule PDF");
    return data as ParsedSchedule;
  };

  // PDF bulk flow (new) — step 2: send the surgeon-confirmed patient list
  // to create Patients + Sessions + (for new patients) scheduled IntakeRecords.
  // GP letters are uploaded per-patient later via /triage/referrals/upload.
  const confirmBulkPatients = async (
    patients: ConfirmedPatientPayload[],
  ): Promise<BulkUploadResponse> => {
    const res = await apiFetch(API_CONSTANTS.BULK_CONFIRM_PATIENTS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patients }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to confirm bulk patients");
    await refreshPatients();
    await refreshSessions();
    return data as BulkUploadResponse;
  };

  // Attach a previous-visit scribe PDF to a followup session AFTER the fact.
  // The bulk PDF flow doesn't accept scribes inline (only the schedule is
  // parsed), so this endpoint lets the surgeon upload the previous note
  // per-patient from the patient detail page.
  const uploadPreviousScribe = async (sessionId: string, pdfFile: File) => {
    const formData = new FormData();
    formData.append("file", pdfFile);
    const res = await apiFetch(
      API_CONSTANTS.SESSIONS_PREVIOUS_SCRIBE.replace("{session_id}", sessionId),
      { method: "POST", body: formData },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to upload previous scribe");
    await refreshSessionData();
    return data as {
      session_id: string;
      file_url: string;
      summary: string | null;
      summary_generated: boolean;
    };
  };

  const setScribeStatus = (patientId: string, status: 'idle' | 'active' | 'finished') => {
    setPatientSessions(prev => ({ ...prev, [patientId]: status }));
  };

  const refreshSessionData = useCallback(async () => {
    if (!token || !activeSessionId) {
      setSessionData(null);
      return;
    }
    setIsSessionDataLoading(true);
    setSessionData(null); // Clear previous data so we don't display it while loading
    try {
    // Use cached data if available
    if (sessionDataCache[activeSessionId]) {
      setSessionData(sessionDataCache[activeSessionId]);
      setIsSessionDataLoading(false);
      return;
    }
    // Fetch from API if not cached
    const res = await apiFetch(`/api/v1/sessions/${activeSessionId}/data`);
    if (res.ok) {
      const data = await res.json();
      setSessionData(data);
      // Store in cache
      setSessionDataCache(prev => ({ ...prev, [activeSessionId]: data }));
    }
    } catch (err) {
      console.error("Failed to fetch session data", err);
    } finally {
      setIsSessionDataLoading(false);
    }
  }, [apiFetch, token, activeSessionId]);

  // Auto-fetch session data when active session changes
  useEffect(() => {
    if (activeSessionId && token) {
      refreshSessionData();
    } else {
      setSessionData(null);
    }
  }, [activeSessionId, token, refreshSessionData]);

  useEffect(() => {
    if (token) {
        refreshPatients();
        refreshSessions();
    }
  }, [token, refreshPatients, refreshSessions]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let cancelled = false;
    // Exponential backoff: 5s, 10s, 20s, 40s, 80s (cap). After 5 failures
    // we stop trying — the user has to refresh / re-login.
    let backoffMs = 5_000;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;
    const MAX_BACKOFF_MS = 80_000;

    const connectWebSocket = async () => {
        if (cancelled || !token) return;

        // 1) Exchange the long-lived JWT for a one-shot WS ticket so the
        //    JWT never lands in proxy/CDN access logs via the WS URL.
        let ticket: string | null = null;
        try {
            const res = await fetch(
                `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.AUTH_WS_TICKET}`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (res.ok) {
                ticket = (await res.json()).ticket;
            } else if (process.env.NODE_ENV !== "production") {
                console.warn("ws-ticket fetch failed, falling back to legacy ?token=");
            }
        } catch {
            // Network blip — fall back to legacy below
        }

        const wsUrl = ticket
            ? `${API_CONSTANTS.WS_EVENTS}?ticket=${ticket}`
            : `${API_CONSTANTS.WS_EVENTS}?token=${token}`; // legacy fallback during deploy

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            // Reset backoff on successful connect
            backoffMs = 5_000;
            attempts = 0;
            if (process.env.NODE_ENV !== "production") {
                console.log("WebSocket connected for realtime events");
            }
        };

        ws.onmessage = (msg) => {
            try {
                const payload = JSON.parse(msg.data);
                // Backend sends { event, data, ts } — NOT { type, ... }
                const eventName: string | undefined = payload.event;
                if (process.env.NODE_ENV !== 'production') {
                    // Avoid PHI in production console logs
                    console.log('WS Event:', eventName);
                }

                switch (eventName) {
                    case 'ws.connected':
                        // Initial connection confirmed
                        break;
                    case 'intake.scheduled':
                        toast.success(`Intake scheduled`);
                        refreshPatients();
                        refreshSessions();
                        refreshSessionData();
                        break;
                    case 'intake.call_started':
                        toast(`Calling patient...`, { icon: '📞' });
                        refreshPatients();
                        refreshSessions();
                        refreshSessionData();
                        break;
                    case 'intake.completed':
                        toast.success(`Call completed`);
                        refreshPatients();
                        refreshSessions();
                        refreshSessionData();
                        break;
                    case 'intake.failed':
                        toast.error(`Call failed`);
                        refreshPatients();
                        refreshSessions();
                        refreshSessionData();
                        break;
                    case 'categorization.completed':
                        toast.success(`Categorization ready`);
                        refreshPatients();
                        refreshSessions();
                        refreshSessionData();
                        break;
                    default:
                        // Any other intake.* or categorization.* event still triggers a silent refresh
                        if (eventName?.startsWith('intake.') || eventName?.startsWith('categorization.')) {
                            refreshPatients();
                            refreshSessions();
                            refreshSessionData();
                        }
                        break;
                }
            } catch (err) {
                console.error('Error parsing WS message:', err);
            }
        };

        ws.onclose = () => {
            if (cancelled || !token) return;
            attempts += 1;
            if (attempts > MAX_ATTEMPTS) {
                if (process.env.NODE_ENV !== "production") {
                    console.warn(`WS reconnect gave up after ${MAX_ATTEMPTS} attempts`);
                }
                return;
            }
            const delay = backoffMs;
            backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
            reconnectTimer = setTimeout(connectWebSocket, delay);
        };

        ws.onerror = (error) => {
            if (process.env.NODE_ENV !== "production") {
                console.error("WebSocket error:", error);
            }
            ws?.close();
        };
    };

    if (token) {
        connectWebSocket();
    }

    return () => {
        cancelled = true;
        if (reconnectTimer) clearTimeout(reconnectTimer);
        if (ws) {
            ws.onclose = null;
            ws.close();
        }
    };
  }, [token, refreshPatients, refreshSessions, refreshSessionData]);

  const getSessionsForPatient = useCallback((name: string) => {
    return sessions.filter(s => s.patient_name === name);
  }, [sessions]);

  return (
    <PatientContext.Provider value={{ 
      patients, 
      sessions,
      activePatientId, 
      activePatient, 
      setActivePatientId: handleSetActivePatientId,
      activeSessionId,
      activeSession,
      setActiveSessionId,
      isSidebarCollapsed,
      setSidebarCollapsed,
      patientSessions,
      setScribeStatus,
      isLoading,
      refreshPatients,
      refreshSessions,
      createPatient,
      createSession,
      getSessionsForPatient,
      openSessionModal,
      closeSessionModal,
      isSessionModalOpen,
      sessionRedirectPath,
      uploadBulkPatients,
      parseSchedulePdf,
      confirmBulkPatients,
      uploadPreviousScribe,
      sessionData,
      isSessionDataLoading,
      refreshSessionData
    }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error("usePatient must be used within a PatientProvider");
  }
  return context;
}
