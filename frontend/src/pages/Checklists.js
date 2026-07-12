import React, { useEffect, useState } from "react";
import Header from "@/components/papertrail/Header";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function Checklists() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, ready } = useApp();
    const nav = useNavigate();

    useEffect(() => {
        if (!ready) return;
        if (!user) {
            nav("/");
            return;
        }
        apiGet("/checklists").then(setItems).finally(() => setLoading(false));
    }, [user, ready, nav]);

    async function toggle(cl, i) {
        const updated = { ...cl, steps: cl.steps.map((s, j) => (i === j ? { ...s, done: !s.done } : s)) };
        setItems((xs) => xs.map((x) => (x.id === cl.id ? updated : x)));
        try {
            await apiPatch(`/checklists/${cl.id}`, { steps: updated.steps });
        } catch {
            toast.error("Sync failed");
        }
    }
    async function remove(id) {
        try {
            await apiDelete(`/checklists/${id}`);
            setItems((xs) => xs.filter((x) => x.id !== id));
            toast.success("Removed");
        } catch {
            toast.error("Delete failed");
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 pb-20">
            <Header />
            <div className="max-w-5xl mx-auto px-6 md:px-10 py-12">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 block">Your saved</span>
                <h1 className="font-extrabold text-3xl md:text-5xl text-white tracking-tight mb-10">Checklists in progress</h1>

                {loading && <div className="text-zinc-500">Loading your checklists…</div>}
                {!loading && items.length === 0 && (
                    <div className="bg-[#161616] border border-zinc-900 p-8 rounded text-zinc-400 text-sm" data-testid="no-checklists">
                        No checklists saved yet. Search for a document, open it, and click "Save checklist".
                    </div>
                )}

                <div className="space-y-8">
                    {items.map((cl) => {
                        const done = cl.steps.filter((s) => s.done).length;
                        const pct = cl.steps.length ? Math.round((done / cl.steps.length) * 100) : 0;
                        return (
                            <div key={cl.id} className="bg-[#161616] border border-zinc-900 p-8 rounded-lg" data-testid={`checklist-${cl.id}`}>
                                <div className="flex items-start justify-between mb-4 gap-4">
                                    <div>
                                        <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">{cl.state}</div>
                                        <h3 className="font-bold text-xl text-white tracking-tight">{cl.doc_name}</h3>
                                        {cl.query && <div className="text-xs text-zinc-500 mt-2 italic">"{cl.query}"</div>}
                                    </div>
                                    <button
                                        data-testid={`delete-checklist-${cl.id}`}
                                        onClick={() => remove(cl.id)}
                                        className="text-zinc-500 hover:text-red-400 transition-colors p-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden relative">
                                        <div className="absolute inset-y-0 left-0 bg-blue-600 rounded-full" style={{ width: `${pct}%`, transition: "width 300ms" }} />
                                    </div>
                                    <div className="text-xs font-mono text-zinc-400 shrink-0">{done}/{cl.steps.length}</div>
                                </div>
                                <ul className="divide-y divide-zinc-900 border border-zinc-900 rounded bg-[#161616]/40">
                                    {cl.steps.map((s, i) => (
                                        <li key={i} className="flex items-start gap-3.5 p-4 hover:bg-[#161616]/70 transition-all">
                                            <Checkbox
                                                data-testid={`saved-item-${cl.id}-${i}`}
                                                checked={s.done}
                                                onCheckedChange={() => toggle(cl, i)}
                                                className="mt-0.5 border-zinc-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                                            />
                                            <span className={`text-sm text-zinc-200 ${s.done ? "line-through text-zinc-500" : ""}`}>{s.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
