import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { STATES, LANGUAGES } from "@/lib/api";

export default function Header() {
    const nav = useNavigate();
    const loc = useLocation();
    const { state, setState, language, setLanguage, user, logout } = useApp();

    function startLogin() {
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
        if (!supabaseUrl) {
            console.error("REACT_APP_SUPABASE_URL is not set.");
            return;
        }
        const redirect = `${window.location.origin}/auth/callback`;
        window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirect)}`;
    }

    const isCurrent = (path) => loc.pathname === path;

    return (
        <header className="sticky top-0 z-50 border-b border-neutral-900 bg-[#131313]/90 backdrop-blur-md" data-testid="site-header">
            <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
                {/* Logo and Nav links */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-3 group" data-testid="logo-link">
                        <div className="w-8 h-8 rounded flex items-center justify-center bg-[#161616] border border-zinc-800 text-white font-bold text-base transition-colors group-hover:border-blue-600">
                            P
                        </div>
                        <span className="font-semibold text-lg text-white tracking-tight">PaperTrail</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link 
                            to="/" 
                            className={`text-sm transition-colors ${isCurrent("/") ? "text-white font-medium" : "text-zinc-400 hover:text-white"}`}
                        >
                            Home
                        </Link>
                        <Link 
                            to="/browse" 
                            className={`text-sm transition-colors ${isCurrent("/browse") ? "text-white font-medium" : "text-zinc-400 hover:text-white"}`}
                        >
                            Browse
                        </Link>
                        <Link 
                            to="/vision" 
                            className={`text-sm transition-colors ${isCurrent("/vision") ? "text-white font-medium" : "text-zinc-400 hover:text-white"}`}
                        >
                            Vision
                        </Link>
                        {user && (
                            <Link 
                                to="/checklists" 
                                className={`text-sm transition-colors ${isCurrent("/checklists") ? "text-white font-medium" : "text-zinc-400 hover:text-white"}`}
                            >
                                Checklists
                            </Link>
                        )}

                    </nav>
                </div>

                {/* Right side: state/language and authentication */}
                <div className="flex items-center gap-5">
                    <div className="hidden sm:flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <select
                                data-testid="state-selector"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="bg-[#161616] border border-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs focus:border-blue-600 focus:outline-none cursor-pointer"
                            >
                                {STATES.map((s) => (
                                    <option key={s.code} value={s.code}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                data-testid="language-selector"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-[#161616] border border-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs focus:border-blue-600 focus:outline-none cursor-pointer"
                            >
                                {LANGUAGES.map((l) => (
                                    <option key={l.code} value={l.code}>
                                        {l.native}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <button
                                    data-testid="my-checklists-btn"
                                    onClick={() => nav("/checklists")}
                                    className="hidden sm:inline-block border border-zinc-800 bg-[#161616] hover:bg-[#1c1c1c] text-zinc-300 text-xs px-3 py-1.5 rounded transition-all"
                                >
                                    My Checklists
                                </button>

                                <button
                                    data-testid="logout-btn"
                                    onClick={logout}
                                    className="text-zinc-400 hover:text-white text-xs transition-colors"
                                >
                                    Sign out
                                </button>
                                {user.picture && (
                                    <img src={user.picture} alt="" className="w-7 h-7 rounded-full border border-zinc-800" />
                                )}
                            </>
                        ) : (
                            <button 
                                data-testid="login-btn" 
                                onClick={startLogin} 
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-1.5 rounded transition-colors"
                            >
                                Sign in
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
