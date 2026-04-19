export const API_CONSTANTS = {
    BASE_URL: "https://healthcare-ai-backend-723h.onrender.com",
    
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
    TRIAGE_REFERRALS_REPORT: "/api/v1/triage/referrals/{referral_id}/report",

    // Patients
    PATIENTS_BASE: "/api/v1/patients",
    
    // Sessions
    SESSIONS_BASE: "/api/v1/sessions",

    // Intake (Voice Agent)
    INTAKE_START: "/api/v1/intake/start",
    INTAKE_WS_URL: "/api/v1/intake/{intake_id}/websocket-url",
    INTAKE_RESULT: "/api/v1/intake/{intake_id}/result",
    INTAKE_COMPLETE: "/api/v1/intake/{intake_id}/complete",
    
    // Categorization
    CATEGORIZATION_BY_REFERRAL: "/api/v1/categorization/referral/{referral_id}",
}