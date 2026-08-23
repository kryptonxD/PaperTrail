import React from "react";
import { ArrowRight, Briefcase, Building2, Car, FileText, Hammer, HeartPulse, Landmark, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GuidePreview from "@/components/papertrail/GuidePreview";
import Header from "@/components/papertrail/Header";
import SearchBar from "@/components/papertrail/SearchBar";
import { useApp } from "@/context/AppContext";

const CATEGORIES = [
    { key: "Core Identity", label: "Identity", desc: "Aadhaar, PAN, passport and voter services", Icon: FileText },
    { key: "Property", label: "Property & land", desc: "Registration, records, mutation and certificates", Icon: Building2 },
    { key: "Transport", label: "Vehicles", desc: "Driving licences, registration and permits", Icon: Car },
    { key: "Business", label: "Business", desc: "GST, Udyam, shop licences and FSSAI", Icon: Briefcase },
    { key: "Welfare", label: "Welfare", desc: "Ration, caste, income and EWS support", Icon: Users },
    { key: "Health", label: "Health", desc: "Ayushman Bharat, UDID and public insurance", Icon: HeartPulse },
    { key: "Employment", label: "Employment", desc: "EPF, ESI, labour cards and work records", Icon: Hammer },
    { key: "Finance", label: "Tax & finance", desc: "ITR, GST returns, KYC and related services", Icon: Landmark },
];

const POPULAR_SEARCHES = [
    "Apply for a caste certificate",
    "Register a rent agreement",
    "Get a driving licence",
];

const VALUE_POINTS = [
    ["Official sources", "Links stay beside the guidance, so you can check the original."],
    ["Clear review dates", "See how recently a guide was checked before you rely on it."],
    ["Practical details", "Documents, fees, timelines and the right office in one route."],
    ["Progress you can save", "Turn any process into a checklist and pick up where you left off."],
];

export default function Home() {
    const nav = useNavigate();
    const { state, setState, states } = useApp();

    return (
        <div className="min-h-screen bg-bg-page text-text-primary">
            <Header />

            <main id="main-content">
                <section className="page-wrap home-hero" data-testid="hero">
                    <div>
                        <p className="utility-label animate-fade-up">
                            <span className="text-accent-copper">PaperTrail</span> / Public process guides
                        </p>
                        <h1 className="home-title animate-fade-up" style={{ animationDelay: "60ms" }}>
                            The clear way through <em>public paperwork.</em>
                        </h1>
                        <p className="home-lede animate-fade-up" style={{ animationDelay: "120ms" }}>
                            Find the steps, documents, fees and official links for the government service you need—all in one clear guide.
                        </p>

                        <div className="mt-8 max-w-2xl animate-fade-up" style={{ animationDelay: "180ms" }}>
                            <SearchBar size="hero" />
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 animate-fade-up" style={{ animationDelay: "240ms" }}>
                            <span className="utility-label">Popular</span>
                            {POPULAR_SEARCHES.map((query) => (
                                <button
                                    key={query}
                                    type="button"
                                    data-testid={`sample-query-${query.slice(0, 10)}`}
                                    onClick={() => nav(`/search?q=${encodeURIComponent(query)}`)}
                                    className="compact-copy min-h-11 border-b border-border-color text-left text-text-secondary transition-colors hover:border-accent-copper hover:text-text-primary"
                                >
                                    {query}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-2 animate-fade-up" style={{ animationDelay: "300ms" }}>
                            <span className="utility-label mr-2">Guides for</span>
                            {states.map((item) => (
                                <button
                                    key={item.code}
                                    type="button"
                                    data-testid={`state-chip-${item.code.toLowerCase()}`}
                                    onClick={() => setState(item.code)}
                                    className={`meta-copy min-h-11 rounded-md border px-3.5 font-medium transition-colors ${
                                        state === item.code
                                            ? "border-action bg-action text-action-contrast"
                                            : "border-control-border bg-bg-card text-text-secondary hover:border-border-strong hover:text-text-primary"
                                    }`}
                                    aria-pressed={state === item.code}
                                >
                                    {item.label}
                                </button>
                            ))}
                            <span className="meta-copy ml-1 text-text-tertiary">More regions are being added carefully.</span>
                        </div>

                        <p className="compact-copy mt-7 flex items-center gap-2 text-text-secondary animate-fade-up" style={{ animationDelay: "360ms" }}>
                            <span aria-hidden="true" className="h-px w-7 bg-accent-copper" />
                            Source-backed guidance · Clear review dates · No form-name guesswork
                        </p>
                    </div>

                    <GuidePreview />
                </section>

                <section className="border-y border-border-color bg-bg-card" aria-labelledby="evidence-title">
                    <div className="page-wrap py-12 md:py-14">
                        <h2 id="evidence-title" className="sr-only">What every PaperTrail guide includes</h2>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
                            {VALUE_POINTS.map(([title, detail], index) => (
                                <div key={title} className="lg:border-l lg:border-border-color lg:px-7 first:lg:border-l-0 first:lg:pl-0 last:lg:pr-0">
                                    <span className="utility-label text-accent-copper">0{index + 1}</span>
                                    <h3 className="mt-3 text-base font-semibold text-text-primary">{title}</h3>
                                    <p className="body-copy mt-2 text-text-secondary">{detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="page-wrap grid gap-12 py-20 md:grid-cols-[0.72fr_1.28fr] md:py-28" aria-labelledby="how-title">
                    <div>
                        <p className="utility-label text-accent-copper">A simpler starting point</p>
                        <h2 id="how-title" className="editorial-title mt-4 text-5xl leading-[0.95] md:text-6xl">
                            Start with the outcome, not the form.
                        </h2>
                        <p className="body-copy mt-5 max-w-md text-text-secondary">
                            You should not need to understand a department’s language before you can ask for help.
                        </p>
                    </div>

                    <ol className="grid gap-8 sm:grid-cols-3">
                        {[
                            ["Find your process", "Describe what you need in everyday words."],
                            ["Make it relevant", "Choose your state and open the closest matching guide."],
                            ["Follow your checklist", "Work through documents, steps, fees and sources in order."],
                        ].map(([title, detail], index) => (
                            <li key={title} className="border-t border-border-strong pt-5">
                                <span className="utility-label text-accent-copper">0{index + 1} / 03</span>
                                <h3 className="mt-5 text-lg font-semibold text-text-primary">{title}</h3>
                                <p className="body-copy mt-2 text-text-secondary">{detail}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="border-t border-border-color bg-bg-elevated" aria-labelledby="category-title">
                    <div className="page-wrap py-20 md:py-28">
                        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
                            <div>
                                <p className="utility-label text-accent-copper">Civic services directory</p>
                                <h2 id="category-title" className="editorial-title mt-3 text-5xl leading-none md:text-6xl">Browse by category</h2>
                            </div>
                            <Link to="/browse" data-testid="browse-all-link" className="btn-secondary">
                                View all guides <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid gap-x-14 lg:grid-cols-2">
                            {CATEGORIES.map(({ key, label, desc, Icon }, index) => (
                                <button
                                    key={key}
                                    type="button"
                                    data-testid={`category-${key.toLowerCase().replace(/ /g, "-")}`}
                                    onClick={() => nav(`/browse?category=${encodeURIComponent(key)}`)}
                                    className="category-row group"
                                >
                                    <span className="utility-label">{String(index + 1).padStart(2, "0")}</span>
                                    <Icon aria-hidden="true" className="h-5 w-5 text-accent-copper" strokeWidth={1.5} />
                                    <span>
                                        <strong className="block text-base font-semibold text-current">{label}</strong>
                                        <span className="compact-copy mt-1 block text-text-secondary">{desc}</span>
                                    </span>
                                    <ArrowRight aria-hidden="true" className="h-4 w-4 text-text-tertiary transition-transform group-hover:translate-x-1 group-hover:text-accent-copper" />
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border-color bg-bg-page">
                <div className="page-wrap flex flex-col justify-between gap-5 py-10 sm:flex-row sm:items-center">
                    <div>
                        <span className="brand-wordmark text-2xl">PaperTrail<span className="brand-dot">.</span></span>
                        <p className="meta-copy mt-2 text-text-secondary">Clear public-process guidance for India.</p>
                    </div>
                    <p className="meta-copy max-w-lg text-text-tertiary sm:text-right">
                        PaperTrail simplifies official information. Always use the linked government source for the final submission.
                    </p>
                </div>
            </footer>
        </div>
    );
}
