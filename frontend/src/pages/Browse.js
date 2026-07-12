import React, { useEffect, useState } from "react";
import Header from "@/components/papertrail/Header";
import { ConfidenceBadge } from "@/components/papertrail/ConfidenceBadge";
import { apiGet } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Browse() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { state } = useApp();
    const [sp, setSp] = useSearchParams();
    const category = sp.get("category") || "";
    const nav = useNavigate();

    useEffect(() => {
        setLoading(true);
        const qs = new URLSearchParams();
        qs.set("state", state);
        if (category) qs.set("category", category);
        apiGet(`/documents?${qs.toString()}`).then(setDocs).finally(() => setLoading(false));
    }, [state, category]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100">
            <Header />
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
                <div className="label-mono text-zinc-500 mb-3">Browse · {state}</div>
                <h1 className="font-extrabold text-3xl md:text-5xl text-white tracking-tight mb-8">
                    {category ? category : "All documents"}
                </h1>

                {category && (
                    <button 
                        data-testid="clear-category-btn" 
                        onClick={() => setSp({})} 
                        className="mb-8 text-xs font-mono text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1.5"
                    >
                        ← All categories
                    </button>
                )}

                {loading ? (
                    <div className="text-zinc-500">Loading directory…</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {docs.map((d, i) => (
                            <button
                                key={d.id}
                                data-testid={`browse-doc-${d.id}`}
                                onClick={() => nav(`/doc/${d.id}`)}
                                className="bg-[#161616] border border-zinc-800 hover:border-zinc-700 p-6 rounded-lg text-left transition-all group animate-fade-up"
                                style={{ animationDelay: `${i * 30}ms` }}
                            >
                                <div className="flex items-center justify-between mb-4 gap-2">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{d.category}</span>
                                    <ConfidenceBadge level={d.confidence} />
                                </div>
                                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-blue-500 transition-colors">{d.name}</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed mb-6 line-clamp-2">{d.department}</p>
                                
                                <div className="border-t border-zinc-900 pt-4 flex justify-between items-center text-xs">
                                    <span className="text-zinc-500 font-medium">{d.processing_time || "—"}</span>
                                    <span className="text-zinc-400 group-hover:text-blue-500 transition-colors font-medium">Open →</span>
                                </div>
                            </button>
                        ))}

                        {docs.length === 0 && <div className="text-zinc-600 col-span-full">No documents found.</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
