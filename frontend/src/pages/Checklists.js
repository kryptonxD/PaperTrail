import React, { useEffect, useState } from "react";
import { ArrowRight, ClipboardCheck, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/papertrail/Header";
import { Checkbox } from "@/components/ui/checkbox";
import { useApp } from "@/context/AppContext";
import { apiDelete, apiGet, apiPatch } from "@/lib/api";

export default function Checklists() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user, ready } = useApp();
    const nav = useNavigate();

    useEffect(() => {
        if (!ready) return;
        if (!user) {
            nav("/");
            return;
        }

        setError("");
        apiGet("/checklists")
            .then(setItems)
            .catch(() => setError("Your saved checklists could not be loaded."))
            .finally(() => setLoading(false));
    }, [user, ready, nav]);

    async function toggle(checklist, index) {
        const updated = {
            ...checklist,
            steps: checklist.steps.map((step, stepIndex) => stepIndex === index ? { ...step, done: !step.done } : step),
        };
        setItems((current) => current.map((item) => item.id === checklist.id ? updated : item));
        try {
            await apiPatch(`/checklists/${checklist.id}`, { steps: updated.steps });
        } catch {
            setItems((current) => current.map((item) => item.id === checklist.id ? checklist : item));
            toast.error("The change could not be synced.");
        }
    }

    async function remove(checklist) {
        const confirmed = window.confirm(`Remove “${checklist.doc_name}” from your saved checklists?`);
        if (!confirmed) return;
        try {
            await apiDelete(`/checklists/${checklist.id}`);
            setItems((current) => current.filter((item) => item.id !== checklist.id));
            toast.success("Checklist removed");
        } catch {
            toast.error("The checklist could not be removed.");
        }
    }

    return (
        <div className="min-h-screen bg-bg-page pb-20 text-text-primary">
            <Header />
            <main id="main-content" className="page-wrap-narrow py-14 md:py-20">
                <div className="grid gap-8 border-b border-border-strong pb-9 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                        <p className="utility-label text-accent-copper">Your saved progress</p>
                        <h1 className="editorial-title mt-4 text-5xl leading-[0.92] md:text-7xl">Checklists in progress</h1>
                        <p className="body-copy mt-4 max-w-xl text-text-secondary">Keep every process in one place and continue from the next unfinished step.</p>
                    </div>
                    <Link to="/browse" className="btn-secondary">Find another guide <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
                </div>

                {loading && <div className="body-copy py-12 text-text-secondary">Loading your checklists…</div>}
                {error && <div role="alert" className="surface-panel body-copy mt-8 p-6 text-text-secondary">{error}</div>}

                {!loading && !error && items.length === 0 && (
                    <section className="grid min-h-[44vh] place-items-center py-16 text-center" data-testid="no-checklists">
                        <div>
                            <ClipboardCheck aria-hidden="true" className="mx-auto h-9 w-9 text-accent-copper" strokeWidth={1.5} />
                            <p className="utility-label mt-6 text-accent-copper">Nothing saved yet</p>
                            <h2 className="editorial-title mt-3 text-5xl">Your first trail starts with a search.</h2>
                            <p className="body-copy mx-auto mt-4 max-w-md text-text-secondary">Open any full process guide and choose “Save checklist” when you want to keep its steps here.</p>
                            <Link to="/" className="btn-primary mt-7">Search for a process</Link>
                        </div>
                    </section>
                )}

                <div className="mt-10 space-y-10">
                    {items.map((checklist, checklistIndex) => {
                        const done = checklist.steps.filter((step) => step.done).length;
                        const progress = checklist.steps.length ? Math.round((done / checklist.steps.length) * 100) : 0;

                        return (
                            <article key={checklist.id} className="surface-panel overflow-hidden" data-testid={`checklist-${checklist.id}`}>
                                <div className="flex items-start justify-between gap-5 border-b border-border-color px-6 py-6 md:px-8">
                                    <div>
                                        <p className="utility-label text-accent-copper">{String(checklistIndex + 1).padStart(2, "0")} / {checklist.state}</p>
                                        <h2 className="mt-3 text-xl font-semibold text-text-primary">{checklist.doc_name}</h2>
                                        {checklist.query && <p className="meta-copy mt-2 text-text-secondary">Started from “{checklist.query}”</p>}
                                    </div>
                                    <button
                                        type="button"
                                        data-testid={`delete-checklist-${checklist.id}`}
                                        onClick={() => remove(checklist)}
                                        className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-control-border text-text-tertiary transition-colors hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-300"
                                        aria-label={`Remove ${checklist.doc_name} checklist`}
                                    >
                                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="border-b border-border-color bg-bg-elevated px-6 py-4 md:px-8">
                                    <div className="meta-copy mb-2 flex items-center justify-between text-text-secondary">
                                        <span>{done} of {checklist.steps.length} complete</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-bg-muted" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress} aria-label={`${checklist.doc_name} progress`}>
                                        <div className="h-full rounded-full bg-action transition-[width] duration-300" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>

                                <ol className="divide-y divide-border-color">
                                    {checklist.steps.map((step, stepIndex) => {
                                        const checkboxId = `saved-${checklist.id}-${stepIndex}`;
                                        return (
                                            <li key={`${step.text}-${stepIndex}`}>
                                                <label htmlFor={checkboxId} className="flex min-h-16 cursor-pointer items-start gap-4 px-6 py-4 transition-colors hover:bg-bg-elevated md:px-8">
                                                    <Checkbox
                                                        id={checkboxId}
                                                        data-testid={`saved-item-${checklist.id}-${stepIndex}`}
                                                        checked={step.done}
                                                        onCheckedChange={() => toggle(checklist, stepIndex)}
                                                        aria-label={`Mark step ${stepIndex + 1} as ${step.done ? "not complete" : "complete"}: ${step.text}`}
                                                        className="mt-0.5 h-5 w-5 border-control-border data-[state=checked]:border-action data-[state=checked]:bg-action data-[state=checked]:text-action-contrast"
                                                    />
                                                    <span className="font-mono text-xs leading-4 text-accent-copper">{String(stepIndex + 1).padStart(2, "0")}</span>
                                                    <span className={`body-copy flex-1 ${step.done ? "text-text-secondary line-through" : "text-text-primary"}`}>{step.text}</span>
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </article>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
