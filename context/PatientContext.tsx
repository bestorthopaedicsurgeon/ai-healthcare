"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { API_CONSTANTS } from "@/lib/api-constants";

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
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const { apiFetch, token } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [patientSessions, setPatientSessions] = useState<Record<string, 'idle' | 'active' | 'finished'>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionRedirectPath, setSessionRedirectPath] = useState<string | null>(null);

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

  const setScribeStatus = (patientId: string, status: 'idle' | 'active' | 'finished') => {
    setPatientSessions(prev => ({ ...prev, [patientId]: status }));
  };

  useEffect(() => {
    if (token) {
        refreshPatients();
        refreshSessions();
    }
  }, [token, refreshPatients, refreshSessions]);

  const getSessionsForPatient = useCallback((name: string) => {
    return sessions.filter(s => s.patient_name === name);
  }, [sessions]);

  return (
    <PatientContext.Provider value={{ 
      patients, 
      sessions,
      activePatientId, 
      activePatient, 
      setActivePatientId,
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
      sessionRedirectPath
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
