import React, { useEffect, useState, useMemo } from "react";
import Header from "@/components/papertrail/Header";
import { ConfidenceBadge } from "@/components/papertrail/ConfidenceBadge";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, ArrowLeft, ExternalLink } from "lucide-react";

export default function DocDetail() {
    const { id } = useParams();
    const [sp] = useSearchParams();
    const q = sp.get("q") || "";
    const [doc, setDoc] = useState(null);
    const [ans, setAns] = useState(null);
    const [loading, setLoading] = useState(true);
    const { state, language, user } = useApp();
    const nav = useNavigate();

    useEffect(() => {
        setLoading(true);
        apiGet(`/documents/${id}`)
            .then((d) => {
                setDoc(d);
                return apiPost("/search", { query: q || d.name, state: d.state, language });
            })
            .then((r) => setAns(r?.answer))
            .catch(() => toast.error("Failed to load"))
            .finally(() => setLoading(false));
    }, [id, q, language]);

    const initialSteps = useMemo(() => (ans?.steps || []).map((t) => ({ text: t, done: false })), [ans]);
    const [steps, setSteps] = useState([]);
    useEffect(() => setSteps(initialSteps), [initialSteps]);

    function toggle(i) {
        setSteps((s) => s.map((x, j) => (i === j ? { ...x, done: !x.done } : x)));
    }
    const doneCount = steps.filter((s) => s.done).length;
    const progress = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

    async function saveChecklist() {
        if (!user) {
            toast.error("Please sign in to save");
            return;
        }
        try {
            await apiPost("/checklists", {
                doc_id: doc.id,
                doc_name: doc.name,
                state: doc.state,
                steps,
                query: q,
            });
            toast.success("Checklist saved");
            nav("/checklists");
        } catch {
            toast.error("Save failed");
        }
    }

    if (loading || !doc) {
        return (
            <div className="min-h-screen bg-bg-page text-text-primary">
                <Header />
                <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 space-y-8 animate-fade-up">
                    {/* Back btn skeleton */}
                    <Skeleton className="h-4 w-16 bg-zinc-900" />
                    
                    {/* Header info skeleton */}
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-32 bg-blue-500/10" />
                        <Skeleton className="h-10 w-2/3 bg-zinc-900" />
                        <Skeleton className="h-6 w-24 bg-zinc-900" />
                    </div>

                    {/* Fact grid skeleton */}
                    <div className="grid md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-bg-card border border-border-color p-5 space-y-2 rounded">
                                <Skeleton className="h-3 w-12 bg-blue-500/10" />
                                <Skeleton className="h-5 w-2/3 bg-zinc-900" />
                            </div>
                        ))}
                    </div>

                    {/* Overview skeleton */}
                    <div className="bg-bg-card p-8 space-y-3 rounded border border-border-color">
                        <Skeleton className="h-4 w-20 bg-blue-500/10" />
                        <Skeleton className="h-5 w-full bg-zinc-900" />
                        <Skeleton className="h-5 w-5/6 bg-zinc-900" />
                    </div>

                    {/* Steps list skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-48 bg-zinc-900" />
                        <div className="border border-border-color divide-y divide-zinc-900 rounded">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4 p-5">
                                    <Skeleton className="h-4 w-4 bg-zinc-900" />
                                    <Skeleton className="h-4 w-5/6 bg-zinc-900" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-page text-text-primary pb-20">
            <Header />
            <div className="max-w-5xl mx-auto px-6 md:px-10 py-12">
                <button 
                    data-testid="back-btn" 
                    onClick={() => nav(-1)} 
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-xs font-mono mb-6 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> BACK TO PREVIOUS
                </button>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 pb-6 border-b border-border-color">
                    <div>
                        <div className="text-[10px] font-mono text-text-secondary uppercase tracking-widest mb-2">{doc.state} · {doc.category}</div>
                        <h1 className="font-extrabold text-3xl md:text-5xl text-text-primary tracking-tight" data-testid="doc-name">{doc.name}</h1>
                        <div className="mt-4"><ConfidenceBadge level={doc.confidence} /></div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {doc.source_url && doc.source_url !== "N/A" && (
                            <a 
                                data-testid="doc-source-link" 
                                href={doc.source_url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="border border-border-color bg-bg-card hover:bg-[#1c1c1c] text-text-secondary text-xs px-4 py-2.5 rounded transition-all inline-flex items-center gap-2"
                            >
                                <ExternalLink className="w-3.5 h-3.5" /> Official portal
                            </a>
                        )}
                        <button 
                            data-testid="save-checklist-btn" 
                            onClick={saveChecklist} 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded transition-all inline-flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" /> Save checklist
                        </button>
                    </div>
                </div>

                {/* Fact list (Vercel-style metadata block instead of borders) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <Fact label="Fee" value={doc.fee} />
                    <Fact label="Processing" value={doc.processing_time} />
                    <Fact label="Issuing Office" value={doc.issuing_office} />
                    <Fact label="Portal" value={doc.portal} />
                </div>

                {ans?.summary && (
                    <div className="py-2 mb-12">
                        <span className="text-[10px] font-mono text-blue-500 uppercase tracking-widest mb-3 block">Overview</span>
                        <p className="font-semibold text-lg md:text-xl text-text-primary leading-relaxed">{ans.summary}</p>
                    </div>
                )}

                {/* Checklist Section */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <span className="text-[10px] font-mono text-blue-500 uppercase tracking-widest mb-1 block">Interactive checklist</span>
                        <h3 className="font-extrabold text-xl md:text-2xl text-text-primary tracking-tight">Your step-by-step plan</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-text-secondary">{doneCount}/{steps.length} completed</span>
                        <div className="w-40 h-1.5 bg-zinc-900 rounded-full overflow-hidden relative">
                            <div className="absolute inset-y-0 left-0 bg-blue-600 rounded-full" style={{ width: `${progress}%`, transition: "width 300ms ease-out" }} />
                        </div>
                    </div>
                </div>

                <ul data-testid="checklist" className="mb-12 border border-border-color divide-y divide-zinc-900 rounded bg-bg-card/30">
                    {steps.map((s, i) => (
                        <li key={i} className="flex items-start gap-4 p-4 md:p-5 hover:bg-bg-card/70 transition-all">
                            <Checkbox
                                data-testid={`checklist-item-${i}`}
                                checked={s.done}
                                onCheckedChange={() => toggle(i)}
                                className="mt-1.5 border-zinc-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                            />
                            <div className="flex gap-4 items-baseline flex-1">
                                <span className="font-mono text-text-secondary text-xs font-semibold">{String(i + 1).padStart(2, "0")}</span>
                                <span className={`text-text-primary text-sm md:text-base leading-relaxed ${s.done ? "line-through text-text-secondary" : ""}`}>{s.text}</span>
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Text blocks: Online / Offline process */}
                <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-border-color/60">
                    <div className="space-y-3">
                        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block">Online process</span>
                        <p className="text-text-secondary leading-relaxed text-sm">{doc.online_process}</p>
                    </div>
                    <div className="space-y-3">
                        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block">Offline process</span>
                        <p className="text-text-secondary leading-relaxed text-sm">{doc.offline_process}</p>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border-color/60 space-y-3">
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block">Documents required</span>
                    <p className="text-text-secondary leading-relaxed text-sm">{doc.required_documents}</p>
                </div>

                <div className="mt-16 text-[10px] font-mono text-zinc-600 text-center uppercase tracking-widest">Last verified · {doc.last_verified}</div>
            </div>
        </div>
    );
}

function Fact({ label, value }) {
    return (
        <div className="py-4 border-b border-border-color">
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block mb-1.5">{label}</span>
            <span className="text-text-primary text-sm font-medium leading-relaxed">{value || "—"}</span>
        </div>
    );
}
