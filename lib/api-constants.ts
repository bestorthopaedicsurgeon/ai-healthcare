// Backend base URL. Override per environment via NEXT_PUBLIC_API_BASE_URL
// in .env.local (dev) or Render/Vercel/etc. env config (deploy).
const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://healthcare-ai-backend-723h.onrender.com";

// Derive the websocket URL from BASE_URL — http -> ws, https -> wss.
const WS_BASE = BASE_URL.replace(/^http/, "ws");

export const API_CONSTANTS = {
    BASE_URL,
    
    // Auth related
    AUTH_LOGIN: "/api/v1/auth/login",
    AUTH_REGISTER: "/api/v1/auth/register",
    AUTH_REFRESH: "/api/v1/auth/refresh",
    AUTH_ME: "/api/v1/auth/me",
    
    // Scribe
    SCRIBE_CONSULTATIONS_UPLOAD_AUDIO: "/api/v1/scribe/consultations/upload-audio",
    SCRIBE_CONSULTATIONS_REPORT: "/api/v1/scribe/consultations/{consultation_id}/report",
    
    // Triage
    TRIAGE_REFERRALS_UPLOAD: "/api/v1/triage/referrals/upload",
    TRIAGE_REFERRALS_SUBMIT: "/api/v1/triage/referrals/submit",
    TRIAGE_REFERRALS_REPORT: "/api/v1/triage/referrals/{referral_id}/report",

    // Patients
    PATIENTS_BASE: "/api/v1/patients",

    // Bulk (CSV — legacy, still supported)
    BULK_UPLOAD: "/api/v1/bulk/upload",

    // Bulk (PDF — new 2-step flow)
    BULK_PARSE_PDF: "/api/v1/bulk/parse-pdf",
    BULK_CONFIRM_PATIENTS: "/api/v1/bulk/confirm-patients",

    WS_EVENTS: `${WS_BASE}/api/v1/ws/events`,

    // Sessions
    SESSIONS_BASE: "/api/v1/sessions",
    SESSIONS_DATA: "/api/v1/sessions/{session_id}/data",
    SESSIONS_PREVIOUS_SCRIBE: "/api/v1/sessions/{session_id}/previous-scribe",

    // Intake (Voice Agent)
    INTAKE_START: "/api/v1/intake/start",
    INTAKE_WS_URL: "/api/v1/intake/{intake_id}/websocket-url",
    INTAKE_MESSAGE: "/api/v1/intake/{intake_id}/message",
    INTAKE_RESULT: "/api/v1/intake/{intake_id}/result",
    INTAKE_STATUS: "/api/v1/intake/{intake_id}/status",
    INTAKE_COMPLETE: "/api/v1/intake/{intake_id}/complete?conversation_id={conversation_id}",
    INTAKE_FINALIZE: "/api/v1/intake/{intake_id}/finalize",
    INTAKE_REPORT: "/api/v1/intake/{intake_id}/report",
    
    // Categorization
    CATEGORIZATION_BY_REFERRAL: "/api/v1/categorization/referral/{referral_id}",

    // Chat
    CHAT_SESSIONS: "/api/v1/chat/sessions/{session_id}",
}