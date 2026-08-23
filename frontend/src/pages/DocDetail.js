import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, Save } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/papertrail/Header";
import { ConfidenceBadge } from "@/components/papertrail/ConfidenceBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/context/AppContext";
import { apiGet, apiPost } from "@/lib/api";

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

export default function DocDetail() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [doc, setDoc] = useState(null);
    const [answer, setAnswer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { language, user } = useApp();
    const nav = useNavigate();

    useEffect(() => {
        setLoading(true);
        setError("");
        setDoc(null);
        apiGet(`/documents/${id}`)
            .then((document) => {
                setDoc(document);
                return apiPost("/search", { query: query || document.name, state: document.state, language });
            })
            .then((response) => setAnswer(response?.answer))
            .catch(() => setError("This guide could not be loaded. It may have moved or be temporarily unavailable."))
            .finally(() => setLoading(false));
    }, [id, query, language]);

    useEffect(() => {
        if (doc?.name) document.title = `${doc.name} — PaperTrail`;
    }, [doc]);

    const initialSteps = useMemo(() => (answer?.steps || []).map((text) => ({ text, done: false })), [answer]);
    const [steps, setSteps] = useState([]);
    useEffect(() => setSteps(initialSteps), [initialSteps]);

    function toggle(index) {
        setSteps((current) => current.map((step, stepIndex) => stepIndex === index ? { ...step, done: !step.done } : step));
    }

    const doneCount = steps.filter((step) => step.done).length;
    const progress = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;
    const sourceUrl = externalUrl(doc?.source_url);

    async function saveChecklist() {
        if (!user) {
            toast.error("Sign in when you are ready to save this checklist.");
            return;
        }
        try {
            await apiPost("/checklists", {
                doc_id: doc.id,
                doc_name: doc.name,
                state: doc.state,
                steps,
                query,
            });
            toast.success("Checklist saved");
            nav("/checklists");
        } catch {
            toast.error("The checklist could not be saved.");
        }
    }

    if (loading) return <GuideSkeleton />;

    if (error || !doc) {
        return (
            <div className="min-h-screen bg-bg-page text-text-primary">
                <Header />
                <main id="main-content" className="page-wrap-narrow grid min-h-[68vh] place-items-center py-20 text-center">
                    <div>
                        <p className="utility-label text-accent-copper">Guide unavailable</p>
                        <h1 className="editorial-title mt-4 text-5xl">We lost this part of the trail.</h1>
                        <p className="body-copy mx-auto mt-4 max-w-lg text-text-secondary">{error}</p>
                        <button type="button" onClick={() => nav(-1)} className="btn-secondary mt-7"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Go back</button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-page pb-20 text-text-primary">
            <Header />
            <main id="main-content" className="page-wrap-narrow py-10 md:py-14">
                <button type="button" data-testid="back-btn" onClick={() => nav(-1)} className="meta-copy inline-flex min-h-11 items-center gap-2 font-semibold text-text-secondary transition-colors hover:text-text-primary">
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to results
                </button>

                <header className="mt-7 border-b border-border-strong pb-8">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="utility-label text-accent-copper">{doc.state} / {doc.category}</span>
                        <ConfidenceBadge level={doc.confidence} />
                    </div>

                    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <h1 className="editorial-title text-5xl leading-[0.92] md:text-7xl" data-testid="doc-name">{doc.name}</h1>
                            {doc.department && <p className="body-copy mt-4 max-w-2xl text-text-secondary">Issued by {doc.department}</p>}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {sourceUrl && (
                                <a data-testid="doc-source-link" href={sourceUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                                    Official source <ExternalLink aria-hidden="true" className="h-4 w-4" />
                                </a>
                            )}
                            <button type="button" data-testid="save-checklist-btn" onClick={saveChecklist} className="btn-primary">
                                <Save aria-hidden="true" className="h-4 w-4" /> Save checklist
                            </button>
                        </div>
                    </div>

                    <div className="meta-copy mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-text-secondary">
                        <span className="inline-flex items-center gap-2"><CheckCircle2 aria-hidden="true" className="h-4 w-4 text-action" /> Last reviewed: {doc.last_verified || "Not listed"}</span>
                        <span>Always confirm final details at the official source.</span>
                    </div>
                </header>

                <section className="grid gap-px bg-border-color sm:grid-cols-2 lg:grid-cols-4" aria-label="Process facts">
                    <Fact label="Fee" value={doc.fee} />
                    <Fact label="Processing" value={doc.processing_time} />
                    <Fact label="Issuing office" value={doc.issuing_office} />
                    <Fact label="Portal" value={doc.portal} />
                </section>

                {answer?.summary && (
                    <section className="py-12 md:py-16" aria-labelledby="overview-title">
                        <p className="utility-label text-accent-copper">Overview</p>
                        <h2 id="overview-title" className="sr-only">Guide overview</h2>
                        <p className="mt-4 max-w-4xl text-xl font-semibold leading-relaxed text-text-primary md:text-2xl">{answer.summary}</p>
                    </section>
                )}

                <section aria-labelledby="checklist-title">
                    <div className="flex flex-col justify-between gap-5 border-b border-border-strong pb-6 sm:flex-row sm:items-end">
                        <div>
                            <p className="utility-label text-accent-copper">Interactive checklist</p>
                            <h2 id="checklist-title" className="editorial-title mt-3 text-4xl md:text-5xl">Your step-by-step plan</h2>
                        </div>
                        <div className="min-w-48">
                            <div className="meta-copy mb-2 flex justify-between gap-4 text-text-secondary">
                                <span>{doneCount} of {steps.length} complete</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-bg-muted" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress} aria-label="Checklist progress">
                                <div className="h-full rounded-full bg-action transition-[width] duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    </div>

                    <ol data-testid="checklist" className="divide-y divide-border-color border-b border-border-color">
                        {steps.map((step, index) => {
                            const checkboxId = `guide-${id}-step-${index}`;
                            return (
                                <li key={`${step.text}-${index}`}>
                                    <label htmlFor={checkboxId} className="group flex min-h-20 cursor-pointer items-start gap-4 px-1 py-5 transition-colors hover:bg-bg-card sm:px-4">
                                        <Checkbox
                                            id={checkboxId}
                                            data-testid={`checklist-item-${index}`}
                                            checked={step.done}
                                            onCheckedChange={() => toggle(index)}
                                            aria-label={`Mark step ${index + 1} as ${step.done ? "not complete" : "complete"}: ${step.text}`}
                                            className="mt-1 h-5 w-5 border-control-border data-[state=checked]:border-action data-[state=checked]:bg-action data-[state=checked]:text-action-contrast"
                                        />
                                        <span className="font-mono text-xs leading-4 text-accent-copper">{String(index + 1).padStart(2, "0")}</span>
                                        <span className={`body-copy flex-1 ${step.done ? "text-text-secondary line-through" : "text-text-primary"}`}>{step.text}</span>
                                    </label>
                                </li>
                            );
                        })}
                    </ol>
                </section>

                <section className="mt-14 grid gap-px border-y border-border-color bg-border-color md:grid-cols-2" aria-label="Submission methods">
                    <ProcessBlock label="Online process" value={doc.online_process} />
                    <ProcessBlock label="Offline process" value={doc.offline_process} />
                </section>

                <section className="mt-12" aria-labelledby="required-title">
                    <p className="utility-label text-accent-copper">Prepare before you begin</p>
                    <h2 id="required-title" className="editorial-title mt-3 text-4xl">Documents required</h2>
                    <p className="body-copy mt-5 max-w-4xl text-text-secondary">{doc.required_documents || "Document requirements are not listed for this guide yet."}</p>
                </section>
            </main>
        </div>
    );
}

function GuideSkeleton() {
    return (
        <div className="min-h-screen bg-bg-page text-text-primary">
            <Header />
            <main id="main-content" className="page-wrap-narrow space-y-8 py-12" aria-label="Loading process guide">
                <Skeleton className="h-5 w-24 bg-bg-muted" />
                <Skeleton className="h-16 w-4/5 bg-bg-muted" />
                <div className="grid gap-2 sm:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-24 bg-bg-muted" />)}
                </div>
                <Skeleton className="h-28 w-full bg-bg-muted" />
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-20 w-full bg-bg-muted" />)}
                </div>
            </main>
        </div>
    );
}

function Fact({ label, value }) {
    return (
        <div className="bg-bg-card p-5">
            <span className="utility-label">{label}</span>
            <span className="body-copy mt-2 block font-medium text-text-primary">{value || "Not listed"}</span>
        </div>
    );
}

function ProcessBlock({ label, value }) {
    return (
        <div className="bg-bg-page p-6 md:p-8">
            <span className="utility-label">{label}</span>
            <p className="body-copy mt-3 text-text-secondary">{value || "No process details are listed yet."}</p>
        </div>
    );
}
