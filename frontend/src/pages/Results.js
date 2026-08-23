import React, { useEffect, useState } from "react";
import { ArrowRight, ExternalLink, FileSearch, MapPin } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/papertrail/Header";
import SearchBar from "@/components/papertrail/SearchBar";
import { ConfidenceBadge } from "@/components/papertrail/ConfidenceBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/context/AppContext";
import { apiPost } from "@/lib/api";

function externalUrl(value) {
    if (!value || value === "N/A") return null;
    try {
        const candidate = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;
        const url = new URL(candidate);
        return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
    } catch {
        return null;
    }
}

export default function Results() {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get("q") || "";
    const { state, language } = useApp();
    const [loading, setLoading] = useState(Boolean(query));
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const nav = useNavigate();

    useEffect(() => {
        if (!query) {
            setLoading(false);
            setData(null);
            setError("");
            return;
        }

        setLoading(true);
        setError("");
        apiPost("/search", { query, state, language })
            .then(setData)
            .catch(() => setError("We could not build this guide right now. Please try again."))
            .finally(() => setLoading(false));
    }, [query, state, language]);

    useEffect(() => {
        document.title = query ? `${query} — PaperTrail` : "Search Public Process Guides — PaperTrail";
    }, [query]);

    const answer = data?.answer;
    const portalUrl = externalUrl(data?.location_result?.portal_link);
    const primaryUrl = data?.primary_doc_id ? `/doc/${data.primary_doc_id}?q=${encodeURIComponent(query)}` : null;

    return (
        <div className="min-h-screen bg-bg-page pb-24 text-text-primary md:pb-20">
            <Header />
            <main id="main-content" className="page-wrap-narrow py-10 md:py-14">
                <div className="mb-12">
                    <SearchBar initial={query} size="compact" />
                </div>

                {!query && <EmptySearch />}

                {query && (
                    <header className="mb-10 border-b border-border-strong pb-7">
                        <p className="utility-label text-accent-copper">Your search</p>
                        <h1 className="editorial-title mt-3 text-4xl leading-[0.96] md:text-6xl" data-testid="result-query">{query}</h1>
                        <p className="body-copy mt-3 text-text-secondary">Looking across {state} guides in the selected language.</p>
                    </header>
                )}

                {loading && <ResultsSkeleton />}

                {error && (
                    <div role="alert" className="surface-panel body-copy p-6 text-text-secondary">
                        <p className="font-semibold text-text-primary">The trail could not be prepared.</p>
                        <p className="mt-2">{error}</p>
                    </div>
                )}

                {answer && (
                    <div data-testid="result-answer" className="space-y-12 animate-fade-up">
                        <section className="surface-panel overflow-hidden" aria-labelledby="answer-summary-title">
                            <div className="border-b border-border-color px-6 py-6 md:px-8">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <ConfidenceBadge level={data.confidence} />
                                        <span className="utility-label">Result for {state}</span>
                                    </div>
                                    <Link to="/vision" className="meta-copy min-h-11 py-3 font-semibold text-accent-copper hover:text-accent-copper-hover">What does this label mean?</Link>
                                </div>

                                <p className="utility-label mt-8 text-accent-copper">Clear answer</p>
                                <h2 id="answer-summary-title" className="sr-only">Search result summary</h2>
                                <p className="mt-3 text-xl font-semibold leading-relaxed text-text-primary md:text-2xl" data-testid="result-summary">
                                    {answer.summary}
                                </p>
                            </div>

                            <div className="grid gap-px bg-border-color sm:grid-cols-3">
                                <FactCard label="Fees" value={answer.fees} testid="result-fees" />
                                <FactCard label="Processing time" value={answer.processing_time} testid="result-time" />
                                <FactCard label="Office / portal" value={answer.office_or_portal} testid="result-portal" />
                            </div>

                            {primaryUrl && (
                                <div className="flex flex-col justify-between gap-4 border-t border-border-color bg-bg-elevated px-6 py-5 sm:flex-row sm:items-center md:px-8">
                                    <p className="body-copy text-text-secondary">Open the full guide to check each step and save your progress.</p>
                                    <Link to={primaryUrl} data-testid="open-full-process-btn" className="btn-primary shrink-0">
                                        Open full guide <ArrowRight aria-hidden="true" className="h-4 w-4" />
                                    </Link>
                                </div>
                            )}
                        </section>

                        {data.location_result?.needed && (
                            <section className="border-l-2 border-accent-copper bg-bg-card px-6 py-7 md:px-8" data-testid="result-location" aria-labelledby="location-title">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="utility-label text-accent-copper">Where to go</p>
                                        <h2 id="location-title" className="mt-2 flex items-center gap-2 text-lg font-semibold text-text-primary">
                                            <MapPin aria-hidden="true" className="h-5 w-5 text-accent-copper" /> Physical submission location
                                        </h2>
                                    </div>
                                    <ConfidenceBadge level={data.location_result.confidence} />
                                </div>

                                <div className="mt-7 grid gap-7 sm:grid-cols-2">
                                    <div>
                                        <span className="utility-label">Nearest office / address</span>
                                        <p className="body-copy mt-2 text-text-primary">{data.location_result.address}</p>
                                    </div>
                                    <div className="space-y-5">
                                        {data.location_result.phone && (
                                            <div>
                                                <span className="utility-label">Contact</span>
                                                <p className="body-copy mt-2 text-text-primary">{data.location_result.phone}</p>
                                            </div>
                                        )}
                                        {portalUrl && (
                                            <a href={portalUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-accent-copper hover:text-accent-copper-hover">
                                                Open official portal <ExternalLink aria-hidden="true" className="h-4 w-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        <div className="grid gap-12 lg:grid-cols-[1.35fr_0.65fr]">
                            <section data-testid="result-steps" aria-labelledby="steps-title">
                                <p className="utility-label text-accent-copper">The route</p>
                                <h2 id="steps-title" className="editorial-title mt-3 text-4xl">Step by step</h2>
                                <ol className="relative mt-8 border-l border-border-strong pl-7">
                                    {(answer.steps || []).map((step, index) => (
                                        <li key={`${step}-${index}`} className="relative pb-8 last:pb-0">
                                            <span className="absolute -left-[2.3rem] top-0 grid h-5 w-5 place-items-center rounded-full border border-accent-copper bg-bg-page font-mono text-[11px] leading-none text-accent-copper">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                            <p className="body-copy text-text-primary">{step}</p>
                                        </li>
                                    ))}
                                </ol>
                            </section>

                            <aside className="border-t border-border-strong pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0" aria-label="Guide context">
                                <p className="utility-label text-accent-copper">Before you begin</p>
                                <p className="body-copy mt-4 text-text-secondary">
                                    Requirements can change. Check the linked official source before payment or submission, especially when a confidence label is partial or unverified.
                                </p>
                            </aside>
                        </div>

                        {answer.required_documents?.length > 0 && (
                            <section className="border-t border-border-strong pt-9" data-testid="result-required-docs" aria-labelledby="documents-title">
                                <p className="utility-label text-accent-copper">Prepare before you go</p>
                                <h2 id="documents-title" className="editorial-title mt-3 text-4xl">Required documents</h2>
                                <ul className="mt-7 grid gap-px bg-border-color sm:grid-cols-2">
                                    {answer.required_documents.map((document, index) => (
                                        <li key={`${document}-${index}`} className="flex min-h-16 items-start gap-3 bg-bg-page p-4 text-base leading-6 text-text-primary">
                                            <span className="font-mono text-xs leading-4 text-accent-copper">{String(index + 1).padStart(2, "0")}</span>
                                            <span>{document}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {answer.tips?.length > 0 && (
                            <section className="border-t border-border-color pt-9" data-testid="result-tips" aria-labelledby="tips-title">
                                <p className="utility-label">Practical context</p>
                                <h2 id="tips-title" className="mt-3 text-xl font-semibold text-text-primary">Before you go</h2>
                                <ul className="mt-5 space-y-3">
                                    {answer.tips.map((tip, index) => (
                                        <li key={`${tip}-${index}`} className="body-copy border-l border-border-strong pl-4 text-text-secondary">{tip}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {data.matches?.length > 0 && (
                            <section className="border-t border-border-strong pt-9" aria-labelledby="related-title">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="utility-label text-accent-copper">Other possible matches</p>
                                        <h2 id="related-title" className="editorial-title mt-3 text-4xl">Related guides</h2>
                                    </div>
                                </div>
                                <div className="mt-7 grid gap-px bg-border-color md:grid-cols-2">
                                    {data.matches.slice(0, 4).map((match) => (
                                        <button
                                            key={match.id}
                                            type="button"
                                            data-testid={`related-doc-${match.id}`}
                                            onClick={() => nav(`/doc/${match.id}?q=${encodeURIComponent(query)}`)}
                                            className="group bg-bg-page p-5 text-left transition-colors hover:bg-bg-card"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <h3 className="font-semibold text-text-primary transition-colors group-hover:text-accent-copper">{match.name}</h3>
                                                <ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-1" />
                                            </div>
                                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                                <span className="utility-label">{match.state} · {match.category}</span>
                                                <ConfidenceBadge level={match.confidence} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>

            {primaryUrl && answer && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-color bg-bg-card/95 p-3 backdrop-blur-lg md:hidden">
                    <Link to={primaryUrl} className="btn-primary w-full">Open full guide <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
                </div>
            )}
        </div>
    );
}

function EmptySearch() {
    return (
        <section className="grid min-h-[52vh] place-items-center py-14 text-center">
            <div>
                <FileSearch aria-hidden="true" className="mx-auto h-8 w-8 text-accent-copper" strokeWidth={1.5} />
                <p className="utility-label mt-6 text-accent-copper">Start with an outcome</p>
                <h1 className="editorial-title mt-3 text-5xl leading-none">What do you need to get done?</h1>
                <p className="body-copy mx-auto mt-4 max-w-md text-text-secondary">You can describe the task in everyday words. You do not need to know the department or form name.</p>
            </div>
        </section>
    );
}

function ResultsSkeleton() {
    return (
        <div className="space-y-8" data-testid="results-loading" aria-label="Preparing your guide">
            <div className="surface-panel space-y-5 p-7">
                <Skeleton className="h-6 w-32 bg-bg-muted" />
                <Skeleton className="h-6 w-full bg-bg-muted" />
                <Skeleton className="h-6 w-4/5 bg-bg-muted" />
                <div className="grid gap-3 pt-4 sm:grid-cols-3">
                    {[1, 2, 3].map((item) => <Skeleton key={item} className="h-20 bg-bg-muted" />)}
                </div>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
                {[1, 2].map((item) => <Skeleton key={item} className="h-60 bg-bg-muted" />)}
            </div>
        </div>
    );
}

function FactCard({ label, value, testid }) {
    return (
        <div className="bg-bg-card px-6 py-5 md:px-8" data-testid={testid}>
            <span className="utility-label">{label}</span>
            <span className="body-copy mt-2 block font-medium text-text-primary">{value || "Not listed"}</span>
        </div>
    );
}
