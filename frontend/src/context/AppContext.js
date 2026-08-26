import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost, STATES } from "@/lib/api";

const AppCtx = createContext(null);

export function AppProvider({ children }) {
    const [state, setState] = useState(localStorage.getItem("pt_state") || "Karnataka");
    const [language, setLanguage] = useState(localStorage.getItem("pt_lang") || "en");
    const [user, setUser] = useState(null);
    const [states, setStates] = useState(STATES);
    const [authAvailable, setAuthAvailable] = useState(true);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        localStorage.setItem("pt_state", state);
    }, [state]);
    useEffect(() => {
        localStorage.setItem("pt_lang", language);
    }, [language]);

    useEffect(() => {
        (async () => {
            try {
                const d = await apiGet("/auth/me");
                setUser(d.user);
            } catch {}
            setReady(true);
        })();
    }, []);

    // States are driven by the corpus, not hardcoded, so a state added to the
    // backend appears here without a frontend release.
    useEffect(() => {
        (async () => {
            try {
                const meta = await apiGet("/meta");
                if (Array.isArray(meta?.states) && meta.states.length) {
                    setStates(meta.states.map((name) => ({ code: name, label: name })));
                }
                if (meta && typeof meta.auth_available === "boolean") {
                    setAuthAvailable(meta.auth_available);
                }
            } catch {
                // keep the fallback list already in state
            }
        })();
    }, []);

    async function loginWithAccessToken(token) {
        const r = await apiPost("/auth/session", { access_token: token });
        localStorage.setItem("papertrail_token", r.token);
        setUser(r.user);
        return r.user;
    }

    async function logout() {
        try {
            await apiPost("/auth/logout", {});
        } catch {}
        localStorage.removeItem("papertrail_token");
        setUser(null);
    }

    return (
        <AppCtx.Provider value={{ state, setState, states, authAvailable, language, setLanguage, user, setUser, loginWithAccessToken, logout, ready }}>
            {children}
        </AppCtx.Provider>
    );
}

export const useApp = () => useContext(AppCtx);
