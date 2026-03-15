"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Patient {
  id: string;
  name: string;
  email: string;
  dob: string;
  gender: string;
  lastVisit: string;
}

interface PatientContextType {
  patients: Patient[];
  activePatientId: string;
  activePatient: Patient | null;
  setActivePatientId: (id: string) => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  patientSessions: Record<string, 'idle' | 'active' | 'finished'>; // patientId -> status
  setScribeStatus: (patientId: string, status: 'idle' | 'active' | 'finished') => void;
  isLoading: boolean;
}

const mockPatients: Patient[] = [
  {
    id: "P001",
    name: "John Doe",
    email: "john.doe@example.com",
    dob: "1985-05-12",
    gender: "Male",
    lastVisit: "12/03/2026",
  },
  {
    id: "P002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    dob: "1992-08-24",
    gender: "Female",
    lastVisit: "11/03/2026",
  },
  {
    id: "P003",
    name: "Robert Williams",
    email: "robert.williams@hospital.com",
    dob: "1970-11-30",
    gender: "Male",
    lastVisit: "10/03/2026",
  },
];

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients] = useState<Patient[]>(mockPatients);
  const [activePatientId, setActivePatientId] = useState<string>(mockPatients[0].id);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [patientSessions, setPatientSessions] = useState<Record<string, 'idle' | 'active' | 'finished'>>({});

  const activePatient = patients.find(p => p.id === activePatientId) || null;
  const [isLoading, setIsLoading] = useState(false);

  const setScribeStatus = (patientId: string, status: 'idle' | 'active' | 'finished') => {
    setPatientSessions(prev => ({ ...prev, [patientId]: status }));
  };

  return (
    <PatientContext.Provider value={{ 
      patients, 
      activePatientId, 
      activePatient, 
      setActivePatientId,
      isSidebarCollapsed,
      setSidebarCollapsed,
      patientSessions,
      setScribeStatus,
      isLoading 
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
