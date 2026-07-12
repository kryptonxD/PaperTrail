import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

export async function tokenHeader() {
    const t = localStorage.getItem("papertrail_token");
    return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function apiGet(path) {
    const r = await api.get(path, { headers: await tokenHeader() });
    return r.data;
}
export async function apiPost(path, body) {
    const r = await api.post(path, body, { headers: await tokenHeader() });
    return r.data;
}
export async function apiPatch(path, body) {
    const r = await api.patch(path, body, { headers: await tokenHeader() });
    return r.data;
}
export async function apiDelete(path) {
    const r = await api.delete(path, { headers: await tokenHeader() });
    return r.data;
}

export const LANGUAGES = [
    { code: "en", name: "English", native: "English" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
    { code: "mr", name: "Marathi", native: "मराठी" },
    { code: "ta", name: "Tamil", native: "தமிழ்" },
    { code: "te", name: "Telugu", native: "తెలుగు" },
    { code: "bn", name: "Bengali", native: "বাংলা" },
    { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
    { code: "ml", name: "Malayalam", native: "മലയാളം" },
    { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
    { code: "ur", name: "Urdu", native: "اردو" },
    { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
    { code: "as", name: "Assamese", native: "অসমীয়া" },
    { code: "kok", name: "Konkani", native: "कोंकणी" },
    { code: "ne", name: "Nepali", native: "नेपाली" },
];

export const STATES = [
    { code: "Karnataka", label: "Karnataka" },
    { code: "Maharashtra", label: "Maharashtra" },
];
