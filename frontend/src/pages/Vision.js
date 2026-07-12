import React from "react";
import Header from "@/components/papertrail/Header";

const ROADMAP_ITEMS = [
    {
        tag: "Now — V1/V2",
        status: "Live",
        statusColor: "text-emerald-400 bg-emerald-950/40 border-emerald-500/20",
        title: "Karnataka & Maharashtra Coverage",
        desc: "RAG-powered search decoded directly from verified government guidelines, with active citizen feedback through GitHub-based community notes.",
    },
    {
        tag: "Next — V2",
        status: "In Progress",
        statusColor: "text-blue-400 bg-blue-950/40 border-blue-500/20",
        title: "Expanding Coverage",
        desc: "Adding more Indian states, building smarter and more accurate retrieval models, and releasing tools to manage and review community submissions at scale.",
    },
    {
        tag: "Future — V3",
        status: "Planned",
        statusColor: "text-zinc-500 bg-zinc-900/30 border-zinc-800/40",
        title: "Every Process, Every City",
        desc: "Full coverage across all civic process categories in major metropolitan cities. Introducing WhatsApp search capability, automated reminders, and proactive renewal notifications.",
    },
    {
        tag: "Future — V4",
        status: "Planned",
        statusColor: "text-zinc-500 bg-zinc-900/30 border-zinc-800/40",
        title: "Real Accountability",
        desc: "Moving beyond basic processes by identifying the exact government offices and specific authorities responsible, making public processes feel traceable rather than anonymous.",
    },
    {
        tag: "Future — V5",
        status: "Planned",
        statusColor: "text-zinc-500 bg-zinc-900/30 border-zinc-800/40",
        title: "Every State, Every District",
        desc: "Achieving national coverage across all Indian states and districts, integrating AI voice support, and sending notifications as new regions go live.",
    },
    {
        tag: "Beyond",
        status: "Exploring",
        statusColor: "text-zinc-500 bg-zinc-900/30 border-zinc-800/40",
        title: "Expanding the Scope",
        desc: "Exploring adjacent regulated domains like banking, insurance, and complex financial paperwork once the core civic-tech database is solid.",
    },
];

export default function Vision() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 pb-24">
            <Header />
            <div className="max-w-4xl mx-auto px-6 md:px-10 py-16">
                {/* Intro Section */}
                <div className="mb-20 max-w-2xl">
                    <span className="text-xs text-blue-500 font-semibold uppercase tracking-widest mb-3 block">Product Vision</span>
                    <h1 className="font-extrabold text-4xl md:text-6xl text-white tracking-tight leading-tight mb-6">
                        Roadmap
                    </h1>
                    <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                        PaperTrail today is the first step. Here's where it's headed.
                    </p>
                </div>

                {/* Vertical Timeline */}
                <div className="relative pl-6 md:pl-8 border-l border-zinc-900/80 ml-2 space-y-16">
                    {ROADMAP_ITEMS.map((item, i) => (
                        <div key={i} className="relative group animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                            {/* Dot indicator */}
                            <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-black border-2 border-blue-500 group-hover:bg-blue-500 transition-colors" />

                            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{item.tag}</span>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                            
                            <h2 className="font-bold text-xl md:text-2xl text-white mb-3 tracking-tight group-hover:text-blue-500 transition-colors">
                                {item.title}
                            </h2>
                            <p className="text-sm md:text-base text-zinc-500 leading-relaxed max-w-2xl">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
