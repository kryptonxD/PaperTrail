import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
    const { loginWithAccessToken } = useApp();
    const [err, setErr] = useState(null);
    const nav = useNavigate();

    useEffect(() => {
        const hash = window.location.hash || "";
        const params = new URLSearchParams(hash.startsWith("#") ? hash.substring(1) : hash);
        const token = params.get("access_token");
        if (!token) {
            setErr("Missing access token from authentication provider");
            return;
        }
        loginWithAccessToken(token)
            .then(() => nav("/checklists"))
            .catch(() => setErr("Sign-in failed. Please try again."));
    }, [loginWithAccessToken, nav]);

    return (
        <main id="main-content" className="grid min-h-screen place-items-center bg-bg-page px-6 text-text-primary">
            <div className="surface-panel w-full max-w-md p-8 text-center sm:p-10">
                <div className="brand-wordmark mb-7 text-3xl">PaperTrail<span className="brand-dot">.</span></div>
                {err ? (
                    <>
                        <p className="utility-label text-accent-copper">Sign-in interrupted</p>
                        <div className="body-copy mb-6 mt-3 text-text-secondary">{err}</div>
                        <button type="button" onClick={() => nav("/")} className="btn-secondary">Return home</button>
                    </>
                ) : (
                    <div className="flex items-center justify-center gap-3 text-text-primary" role="status">
                        <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-accent-copper" />
                        <span className="utility-label text-accent-copper">Signing you in…</span>
                    </div>
                )}
            </div>
        </main>
    );
}
