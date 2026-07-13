import React from "react";
import Header from "@/components/papertrail/Header";
import SearchBar from "@/components/papertrail/SearchBar";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { STATES } from "@/lib/api";
import DocumentTrail from "@/components/DocumentTrail";


const CATEGORIES = [
    { key: "Core Identity", label: "Identity", desc: "Aadhaar, PAN, Passport, Voter ID", icon: "identity" },
    { key: "Property", label: "Property & Land", desc: "Sale deed, EC, RTC / 7-12, mutation", icon: "property" },
    { key: "Transport", label: "Vehicles", desc: "Driving licence, RC, permits", icon: "vehicles" },
    { key: "Business", label: "Business", desc: "GST, Udyam, Shop Act, FSSAI", icon: "business" },
    { key: "Welfare", label: "Welfare", desc: "Ration, caste, income, EWS", icon: "welfare" },
    { key: "Health", label: "Health", desc: "Ayushman Bharat, UDID, insurance", icon: "health" },
    { key: "Employment", label: "Employment", desc: "EPF, ESI, labour card", icon: "employment" },
    { key: "Finance", label: "Tax & Finance", desc: "ITR, GST returns, KYC", icon: "finance" },
];

function getCategoryIcon(type) {
    const commonClass = "w-7 h-7 stroke-[1.5] text-blue-500 fill-blue-500/10 mb-5";
    switch (type) {
        case "identity":
            return (
                <svg className={commonClass} viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="12" cy="10" r="3" />
                    <path d="M7 17c0-2 2-3 5-3s5 1 5 3" />
                </svg>
            );
        case "property":
            return (
                <svg className={commonClass} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            );
        case "vehicles":
            return (
                <svg className={commonClass} viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="1" y="3" width="22" height="13" rx="2" />
                    <circle cx="7" cy="19" r="2" />
                    <circle cx="17" cy="19" r="2" />
                    <path d="M12 13h5M7 13h1" />
                </svg>
            );
        case "business":
            return (
                <svg className={commonClass} viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
            );
        case "welfare":
            return (
                <svg className={commonClass} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            );
        case "health":
            return (
                <svg className={commonClass} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
            );
        case "employment":
            return (
                <svg className={commonClass} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
            );
        case "finance":
            return (
                <svg className={commonClass} viewBox="0 0 24 24" stroke="currentColor">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            );
        default:
            return null;
    }
}

export default function Home() {
    const nav = useNavigate();
    const { state, setState } = useApp();

    return (
        <div className="min-h-screen bg-bg-page text-text-primary flex flex-col justify-between">
            <div>
                <Header />
                {/* HERO */}
                <section className="relative max-w-6xl mx-auto px-6 md:px-10 pt-28 pb-20" data-testid="hero">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-bg-card border border-border-color text-xs text-text-secondary mb-8 animate-fade-up">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Version 2.0 Live · Karnataka & Maharashtra
                    </div>
                    <div className="flex items-center justify-between gap-8 mb-8">
                        <h1 className="flex-1 font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-text-primary animate-fade-up" style={{ animationDelay: "80ms" }}>
                            Government paperwork,<br />
                            <span className="text-blue-500">decoded.</span>
                        </h1>
                        <DocumentTrail />
                    </div>
                    <p className="text-base md:text-lg text-text-secondary max-w-2xl mb-12 leading-relaxed animate-fade-up" style={{ animationDelay: "160ms" }}>
                        Search any official document process. Get clear, step-by-step checklists, verified fees, locations, and requirements without the government runaround.
                    </p>

                    <div className="animate-fade-up" style={{ animationDelay: "240ms" }}>
                        <SearchBar size="hero" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-6 text-sm animate-fade-up" style={{ animationDelay: "320ms" }}>
                        <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold mr-2">Suggestions:</span>
                        {[
                            "How do I apply for a Caste Certificate?",
                            "Register a rent agreement",
                            "Get a Driving Licence",
                        ].map((s) => (
                            <button
                                key={s}
                                data-testid={`sample-query-${s.slice(0, 10)}`}
                                onClick={() => nav(`/search?q=${encodeURIComponent(s)}`)}
                                className="px-3 py-1.5 rounded bg-bg-card border border-border-color text-text-secondary hover:text-text-primary hover:border-border-color text-xs transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* State picker inline */}
                    <div className="mt-16 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-up" style={{ animationDelay: "400ms" }}>
                        <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Select Region</span>
                        <div className="flex gap-2">
                            {STATES.map((s) => (
                                <button
                                    key={s.code}
                                    data-testid={`state-chip-${s.code.toLowerCase()}`}
                                    onClick={() => setState(s.code)}
                                    className={`px-4.5 py-1.5 text-xs font-medium rounded transition-all ${state === s.code ? "bg-blue-600 border border-blue-600 text-white" : "bg-bg-card border border-border-color text-text-secondary hover:border-accent-blue hover:text-text-primary"}`}
                                >
                                    {s.label}
                                </button>
                            ))}
                            <span className="self-center text-xs text-zinc-600 italic px-2">+ more coming soon</span>
                        </div>
                    </div>
                </section>

                {/* TRUST / VALUE PROP (Borders dropped, uses whitespace and clean typography grid) */}
                <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 border-t border-border-color/60">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {[
                            { k: "Confidence Verified", v: "Every guide highlights the confidence levels of the requirements, fees, and location sources." },
                            { k: "Step-by-Step Plans", v: "Save structured requirements lists, necessary forms, costs, and official queues to your personal profile." },
                            { k: "Location Details", v: "Live geo-targeted search extracts addresses and official counters directly from local government websites." },
                            { k: "Community Checked", v: "Enriched with real-world tips, wait times, and documents verified by other citizens." },
                        ].map((t, i) => (
                            <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                                <h3 className="font-semibold text-text-primary text-base mb-2">{t.k}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{t.v}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* BROWSE BY THEME (Whitespace layout, custom blue outline categories) */}
                <section className="max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-32">
                    <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
                        <div>
                            <span className="text-xs text-blue-500 font-semibold uppercase tracking-widest mb-3 block">Civic Services Directory</span>
                            <h2 className="font-extrabold text-3xl md:text-5xl text-text-primary tracking-tight leading-none">
                                Browse by category
                            </h2>
                        </div>
                        <Link 
                            to="/browse" 
                            data-testid="browse-all-link" 
                            className="text-xs border border-zinc-805 bg-bg-card hover:bg-zinc-100 dark:hover:bg-[#1c1c1c] text-text-secondary px-4 py-2.5 rounded transition-all"
                        >
                            View all processes
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {CATEGORIES.map((c, i) => (
                            <button
                                key={c.key}
                                data-testid={`category-${c.key.toLowerCase().replace(/ /g, "-")}`}
                                onClick={() => nav(`/browse?category=${encodeURIComponent(c.key)}`)}
                                className="bg-bg-card border border-border-color hover:border-border-color hover:bg-zinc-100 dark:hover:bg-[#1c1c1c] p-6 rounded-lg transition-all text-left group animate-fade-up"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                {getCategoryIcon(c.icon)}
                                <div className="font-bold text-lg text-text-primary mb-2 group-hover:text-blue-500 transition-colors">{c.label}</div>
                                <p className="text-xs text-text-secondary leading-relaxed mb-6">{c.desc}</p>
                                <span className="text-xs text-text-secondary group-hover:text-blue-500 transition-colors font-medium">Explore Processes →</span>
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            <footer className="border-t border-border-color py-12 text-center bg-bg-page">
                <span className="font-bold text-sm tracking-tight text-text-primary block">PaperTrail</span>
                <span className="text-xs text-zinc-600 mt-2 block font-mono">Built for transparency · Powered by citizen collaboration</span>
            </footer>
        </div>
    );
}

