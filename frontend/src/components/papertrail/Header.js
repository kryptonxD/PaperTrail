import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { LANGUAGES } from "@/lib/api";

const NAV_ITEMS = [
    { to: "/", label: "Home" },
    { to: "/browse", label: "Browse guides" },
    { to: "/vision", label: "How it works" },
];

export default function Header() {
    const nav = useNavigate();
    const loc = useLocation();
    const { state, setState, states, authAvailable, language, setLanguage, user, logout } = useApp();
    const { theme, toggleTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => setMenuOpen(false), [loc.pathname]);

    function startLogin() {
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
        if (!supabaseUrl) {
            console.error("REACT_APP_SUPABASE_URL is not set.");
            return;
        }
        // Without this check the browser navigates to a host that no longer
        // resolves and the user lands on a dead page with no explanation.
        if (!authAvailable) {
            toast.error("Sign-in is unavailable right now. Browsing and search still work.");
            return;
        }
        const redirect = `${window.location.origin}/auth/callback`;
        window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirect)}`;
    }

    const isCurrent = (path) => loc.pathname === path;
    const links = user ? [...NAV_ITEMS, { to: "/checklists", label: "My checklists" }] : NAV_ITEMS;

    return (
        <header className="site-header" data-testid="site-header">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] btn-primary"
            >
                Skip to content
            </a>

            <div className="page-wrap site-header-inner">
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex min-h-11 items-center gap-3" data-testid="logo-link" aria-label="PaperTrail home">
                        <span className="brand-wordmark">PaperTrail<span className="brand-dot">.</span></span>
                        <span className="brand-subtitle hidden sm:block">Public process guides</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-7" aria-label="Primary navigation">
                        {links.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="nav-link"
                                aria-current={isCurrent(item.to) ? "page" : undefined}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="hidden lg:flex items-center gap-2">
                        <label className="sr-only" htmlFor="header-state">State</label>
                        <select
                            id="header-state"
                            data-testid="state-selector"
                            value={state}
                            onChange={(event) => setState(event.target.value)}
                            className="preference-select"
                            aria-label="Select state"
                        >
                            {states.map((item) => (
                                <option key={item.code} value={item.code}>{item.label}</option>
                            ))}
                        </select>

                        <label className="sr-only" htmlFor="header-language">Language</label>
                        <select
                            id="header-language"
                            data-testid="language-selector"
                            value={language}
                            onChange={(event) => setLanguage(event.target.value)}
                            className="preference-select"
                            aria-label="Select language"
                        >
                            {LANGUAGES.map((item) => (
                                <option key={item.code} value={item.code}>{item.native}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="theme-control"
                        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                        data-testid="theme-toggle"
                    >
                        {theme === "dark" ? <Sun aria-hidden="true" className="h-4 w-4" /> : <Moon aria-hidden="true" className="h-4 w-4" />}
                        <span className="hidden sm:inline">{theme === "dark" ? "Day" : "Night"}</span>
                    </button>

                    <div className="hidden lg:flex items-center gap-3">
                        {user ? (
                            <>
                                <button type="button" data-testid="logout-btn" onClick={logout} className="nav-link">Sign out</button>
                                {user.picture && <img src={user.picture} alt="" className="h-8 w-8 rounded-full border border-border-color" />}
                            </>
                        ) : (
                            <button type="button" data-testid="login-btn" onClick={startLogin} disabled={!authAvailable} title={authAvailable ? undefined : "Sign-in is temporarily unavailable"} className="btn-secondary min-h-0 h-10 px-4 disabled:cursor-not-allowed disabled:opacity-50">
                                Sign in
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        className="menu-control lg:hidden"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-navigation"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        {menuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <div id="mobile-navigation" className="mobile-drawer lg:hidden">
                    <div className="page-wrap py-5">
                        <nav className="grid gap-1" aria-label="Mobile navigation">
                            {links.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    aria-current={isCurrent(item.to) ? "page" : undefined}
                                    className="flex min-h-12 items-center justify-between border-b border-border-color py-3 text-base text-text-primary"
                                >
                                    {item.label}
                                    <span aria-hidden="true" className="text-accent-copper">↗</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="grid grid-cols-2 gap-3 py-5">
                            <label className="grid gap-1.5 text-sm leading-5 text-text-secondary">
                                State
                                <select value={state} onChange={(event) => setState(event.target.value)} className="preference-select w-full">
                                    {states.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
                                </select>
                            </label>
                            <label className="grid gap-1.5 text-sm leading-5 text-text-secondary">
                                Language
                                <select value={language} onChange={(event) => setLanguage(event.target.value)} className="preference-select w-full">
                                    {LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.native}</option>)}
                                </select>
                            </label>
                        </div>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <button type="button" data-testid="my-checklists-btn" onClick={() => nav("/checklists")} className="btn-primary flex-1">My checklists</button>
                                <button type="button" onClick={logout} className="btn-secondary">Sign out</button>
                            </div>
                        ) : (
                            <button type="button" onClick={startLogin} disabled={!authAvailable} className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-50">{authAvailable ? "Sign in to save a checklist" : "Sign-in unavailable"}</button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
