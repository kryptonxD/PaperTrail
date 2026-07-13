import React, { useEffect, useState } from "react";
import Header from "@/components/papertrail/Header";
import SearchBar from "@/components/papertrail/SearchBar";
import { ConfidenceBadge } from "@/components/papertrail/ConfidenceBadge";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { apiPost } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

export default function Results() {
    const loc = useLocation();
    const params = new URLSearchParams(loc.search);
    const q = params.get("q") || "";
    const { state, language } = useApp();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [err, setErr] = useState(null);
    const nav = useNavigate();

    useEffect(() => {
        if (!q) return;
        setLoading(true);
        setErr(null);
        apiPost("/search", { query: q, state, language })
            .then((d) => setData(d))
            .catch((e) => setErr(e.message || "Something went wrong."))
            .finally(() => setLoading(false));
    }, [q, state, language]);

    const a = data?.answer;

    return (
        <div className="min-h-screen bg-bg-page text-text-primary pb-20">
            <Header />
            <div className="max-w-5xl mx-auto px-6 md:px-10 py-12">

                <div className="mb-10">
                    <SearchBar initial={q} size="compact" />
                </div>

                <div className="mb-12 flex flex-col gap-2">
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">Query</span>
                    <h1 className="font-extrabold text-3xl md:text-5xl text-text-primary tracking-tight" data-testid="result-query">
                        {q}
                    </h1>
                </div>

                {loading && (
                    <div className="space-y-12 animate-fade-up" data-testid="results-loading">
                        {/* Header details skeleton */}
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800" />
                            <Skeleton className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800" />
                        </div>

                        {/* Summary box skeleton */}
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-24 bg-blue-500/10" />
                            <Skeleton className="h-6 w-full bg-zinc-200 dark:bg-zinc-800" />
                            <Skeleton className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800" />
                        </div>

                        {/* Grid: steps + side facts skeleton */}
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="md:col-span-2 space-y-6">
                                <Skeleton className="h-4 w-28 bg-blue-500/10" />
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            <Skeleton className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                                            <div className="space-y-2 w-full">
                                                <Skeleton className="h-4 w-full bg-zinc-200 dark:bg-zinc-800" />
                                                <Skeleton className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="space-y-2 border-b border-border-color pb-4">
                                        <Skeleton className="h-3 w-16 bg-blue-500/10" />
                                        <Skeleton className="h-5 w-full bg-zinc-200 dark:bg-zinc-800" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {err && <div className="text-red-400 p-5 rounded border border-red-950 bg-red-950/20 text-sm">{err}</div>}

                {a && (
                    <div data-testid="result-answer" className="space-y-12 animate-fade-up">
                        <div className="flex items-center gap-3">
                            <ConfidenceBadge level={data.confidence} />
                            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">Result for {state}</span>
                        </div>

                        {/* Summary section (Borderless, separated by white space and clean typography size) */}
                        <div className="py-2">
                            <span className="text-[10px] font-mono text-blue-500 uppercase tracking-widest mb-3 block">Summary</span>
                            <p className="font-semibold text-xl md:text-2xl text-text-primary leading-relaxed" data-testid="result-summary">
                                {a.summary}
                            </p>
                        </div>

                        {/* Location Result (Sleek distinct accent-bordered highlight block) */}
                        {data.location_result && data.location_result.needed && (
                            <div className="bg-bg-card border border-border-color border-l-4 border-blue-600 rounded-r-lg p-8" data-testid="result-location">
                                <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">

                                    <span className="text-xs font-mono text-text-primary uppercase tracking-wider">Physical Submission Location</span>
                                    <ConfidenceBadge level={data.location_result.confidence} />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block mb-1">Nearest Office / Address</span>
                                        <p className="text-sm text-text-primary leading-relaxed">{data.location_result.address}</p>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        {data.location_result.phone && (
                                            <div>
                                                <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block mb-1">Contact Info</span>
                                                <p className="text-sm text-text-primary">{data.location_result.phone}</p>
                                            </div>
                                        )}
                                        {data.location_result.portal_link && (
                                            <div>
                                                <a 
                                                    href={data.location_result.portal_link} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="text-xs text-blue-500 hover:text-blue-400 font-mono inline-flex items-center gap-1.5"
                                                >
                                                    Official Portal Link <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grid: steps + side facts (Borderless layout) */}
                        <div className="grid md:grid-cols-3 gap-12 pt-4">
                            <div className="md:col-span-2" data-testid="result-steps">
                                <span className="text-[10px] font-mono text-blue-500 uppercase tracking-widest mb-6 block">Step-by-step guidance</span>
                                <ol className="space-y-6">
                                    {(a.steps || []).map((s, i) => (
                                        <li key={i} className="flex gap-5 items-start">
                                            <span className="font-mono text-blue-500 text-sm font-semibold pt-1 w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                            <span className="text-text-primary text-sm md:text-base leading-relaxed">{s}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Vercel-style Metadata Sidebar */}
                            <div className="space-y-1">
                                <FactCard label="Fees" value={a.fees} testid="result-fees" />
                                <FactCard label="Processing time" value={a.processing_time} testid="result-time" />
                                <FactCard label="Office / Portal" value={a.office_or_portal} testid="result-portal" />
                            </div>
                        </div>

                        {/* Required documents (No borders, simple bullet list) */}
                        {a.required_documents?.length > 0 && (
                            <div className="pt-6 border-t border-border-color" data-testid="result-required-docs">
                                <span className="text-[10px] font-mono text-blue-500 uppercase tracking-widest mb-6 block">Required documents</span>
                                <ul className="grid md:grid-cols-2 gap-4">
                                    {a.required_documents.map((d, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-text-primary text-sm">
                                            <span className="text-blue-500 font-semibold">•</span>
                                            <span>{d}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {a.tips?.length > 0 && (
                            <div className="pt-6 border-t border-border-color" data-testid="result-tips">
                                <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest mb-4 block">Important Tips</span>
                                <ul className="space-y-4">
                                    {a.tips.map((t, i) => (
                                        <li key={i} className="text-sm md:text-base text-text-secondary italic leading-relaxed">"{t}"</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Related matches */}
                        {data.matches?.length > 0 && (
                            <div className="pt-6 border-t border-border-color/60">
                                <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest mb-6 block">Related Processes</span>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {data.matches.slice(0, 4).map((m) => (
                                        <button
                                            key={m.id}
                                            data-testid={`related-doc-${m.id}`}
                                            onClick={() => nav(`/doc/${m.id}?q=${encodeURIComponent(q)}`)}
                                            className="bg-bg-card border border-border-color hover:border-accent-blue p-5 rounded text-left transition-all group flex flex-col justify-between"
                                        >
                                            <div className="flex items-center justify-between gap-4 mb-3 w-full">

                                                <h4 className="font-bold text-text-primary group-hover:text-blue-500 transition-colors text-sm">{m.name}</h4>
                                                <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-blue-500 transition-colors shrink-0" />
                                            </div>
                                            <div className="flex justify-between items-center w-full mt-2">
                                                <span className="text-[10px] font-mono text-text-secondary uppercase">{m.state} · {m.category}</span>
                                                <ConfidenceBadge level={m.confidence} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.primary_doc_id && (
                            <div className="pt-8">
                                <Link 
                                    to={`/doc/${data.primary_doc_id}?q=${encodeURIComponent(q)}`} 
                                    data-testid="open-full-process-btn" 
                                    className="inline-flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded transition-all shadow-lg hover:shadow-blue-500/10"
                                >
                                    Open full process · Save as checklist
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function FactCard({ label, value, testid }) {
    return (
        <div className="py-4 border-b border-border-color" data-testid={testid}>
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block mb-1">{label}</span>
            <span className="text-text-primary text-sm font-medium leading-relaxed">{value || "—"}</span>
        </div>
    );
}
