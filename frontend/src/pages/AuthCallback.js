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
        <div className="min-h-screen flex items-center justify-center">
            <div className="glass p-10 text-center">
                {err ? (
                    <>
                        <div className="text-red-300 mb-4">{err}</div>
                        <button onClick={() => nav("/")} className="btn-ghost-gold">Return home</button>
                    </>
                ) : (
                    <div className="flex items-center gap-3 text-[#F5F2EA]">
                        <Loader2 className="w-5 h-5 animate-spin text-gold" />
                        <span className="label-mono text-gold">Signing you in…</span>
                    </div>
                )}
            </div>
        </div>
    );
}
