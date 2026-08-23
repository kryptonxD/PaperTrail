import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/papertrail/Header";
import { ConfidenceBadge } from "@/components/papertrail/ConfidenceBadge";
import { useApp } from "@/context/AppContext";
import { apiGet } from "@/lib/api";

const CATEGORY_FILTERS = [
    ["Core Identity", "Identity"],
    ["Property", "Property & land"],
    ["Transport", "Vehicles"],
    ["Business", "Business"],
    ["Welfare", "Welfare"],
    ["Health", "Health"],
    ["Employment", "Employment"],
    ["Finance", "Tax & finance"],
];

export default function Browse() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const { state } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get("category") || "";
    const nav = useNavigate();

    useEffect(() => {
        setLoading(true);
        setError("");
        const params = new URLSearchParams({ state });
        if (category) params.set("category", category);

        apiGet(`/documents?${params.toString()}`)
            .then(setDocs)
            .catch(() => setError("The directory could not be loaded. Please try again."))
            .finally(() => setLoading(false));
    }, [state, category]);

    useEffect(() => {
        const selected = CATEGORY_FILTERS.find(([key]) => key === category)?.[1];
        document.title = `${selected || "Browse guides"} — PaperTrail`;
    }, [category]);

    const visibleDocs = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return docs;
        return docs.filter((doc) => [doc.name, doc.department, doc.category]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalized)));
    }, [docs, query]);

    const activeLabel = CATEGORY_FILTERS.find(([key]) => key === category)?.[1] || "All public processes";

    return (
        <div className="min-h-screen bg-bg-page text-text-primary">
            <Header />
            <main id="main-content" className="page-wrap py-14 md:py-20">
                <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
                    <div>
                        <p className="utility-label text-accent-copper">Directory / {state}</p>
                        <h1 className="editorial-title mt-4 text-5xl leading-[0.92] md:text-7xl">Find the right public process.</h1>
                    </div>
                    <p className="body-copy max-w-xl text-text-secondary lg:justify-self-end">
                        Search by the outcome you need or narrow the directory by service area. Each guide keeps its confidence level and practical timing visible.
                    </p>
                </div>

                <section className="sticky top-[4.75rem] z-30 -mx-3 mt-12 border-y border-border-color bg-bg-page/95 px-3 py-5 backdrop-blur-lg" aria-label="Directory filters">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <label className="relative block w-full lg:max-w-md">
                            <span className="sr-only">Search within {activeLabel}</span>
                            <Search aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search guides, departments or services…"
                                className="min-h-12 w-full rounded-md border border-control-border bg-bg-card py-2 pl-10 pr-10 text-base leading-6 text-text-primary outline-none placeholder:text-text-tertiary focus:border-focus"
                            />
                            {query && (
                                <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-text-tertiary hover:text-text-primary">
                                    <X aria-hidden="true" className="h-4 w-4" />
                                </button>
                            )}
                        </label>

                        <div className="flex items-center justify-between gap-4">
                            <span className="utility-label whitespace-nowrap">{loading ? "Loading" : `${visibleDocs.length} guide${visibleDocs.length === 1 ? "" : "s"}`}</span>
                            {category && (
                                <button type="button" data-testid="clear-category-btn" onClick={() => setSearchParams({})} className="meta-copy min-h-11 font-semibold text-accent-copper hover:text-accent-copper-hover">
                                    Clear category
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filter by category">
                        <button
                            type="button"
                            onClick={() => setSearchParams({})}
                            aria-pressed={!category}
                            className={`meta-copy min-h-11 shrink-0 rounded-md border px-3 ${!category ? "border-action bg-action text-action-contrast" : "border-control-border bg-bg-card text-text-secondary hover:border-border-strong"}`}
                        >
                            All guides
                        </button>
                        {CATEGORY_FILTERS.map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setSearchParams({ category: key })}
                                aria-pressed={category === key}
                                className={`meta-copy min-h-11 shrink-0 rounded-md border px-3 ${category === key ? "border-action bg-action text-action-contrast" : "border-control-border bg-bg-card text-text-secondary hover:border-border-strong"}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </section>

                <div className="mt-10 flex items-end justify-between gap-4 border-b border-border-strong pb-5">
                    <div>
                        <p className="utility-label text-accent-copper">Selected collection</p>
                        <h2 className="mt-2 text-2xl font-semibold text-text-primary">{activeLabel}</h2>
                    </div>
                    <span className="meta-copy hidden text-text-secondary sm:block">State: {state}</span>
                </div>

                {loading && (
                    <div className="grid gap-px border-b border-border-color bg-border-color md:grid-cols-2" aria-label="Loading directory">
                        {[1, 2, 3, 4].map((item) => <div key={item} className="h-44 animate-pulse bg-bg-card" />)}
                    </div>
                )}

                {error && (
                    <div role="alert" className="surface-panel body-copy mt-8 p-6 text-text-secondary">{error}</div>
                )}

                {!loading && !error && visibleDocs.length > 0 && (
                    <div className="grid gap-px border-b border-border-color bg-border-color md:grid-cols-2">
                        {visibleDocs.map((doc, index) => (
                            <button
                                key={doc.id}
                                type="button"
                                data-testid={`browse-doc-${doc.id}`}
                                onClick={() => nav(`/doc/${doc.id}`)}
                                className="group min-h-56 bg-bg-page p-6 text-left transition-colors hover:bg-bg-card md:p-8"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <span className="utility-label text-accent-copper">{String(index + 1).padStart(2, "0")} / {doc.category}</span>
                                    <ConfidenceBadge level={doc.confidence} />
                                </div>
                                <h3 className="mt-7 text-xl font-semibold leading-tight text-text-primary transition-colors group-hover:text-accent-copper">{doc.name}</h3>
                                <p className="compact-copy mt-2 line-clamp-2 text-text-secondary">{doc.department}</p>
                                <div className="meta-copy mt-7 flex items-center justify-between border-t border-border-color pt-4">
                                    <span className="text-text-secondary">{doc.processing_time || "Timing not listed"}</span>
                                    <span className="inline-flex items-center gap-1.5 font-semibold text-text-primary">
                                        Open guide <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {!loading && !error && visibleDocs.length === 0 && (
                    <div className="py-20 text-center" data-testid="browse-empty">
                        <p className="utility-label text-accent-copper">No matching guides</p>
                        <h2 className="editorial-title mt-4 text-4xl">Try a broader description.</h2>
                        <p className="body-copy mx-auto mt-3 max-w-md text-text-secondary">Clear the search or choose a different category. More regions and processes are being added carefully.</p>
                        <button type="button" onClick={() => { setQuery(""); setSearchParams({}); }} className="btn-secondary mt-7">Reset filters</button>
                    </div>
                )}
            </main>
        </div>
    );
}
