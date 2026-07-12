import React from "react";

export function ConfidenceBadge({ level, className = "" }) {
    const cfg = {
        VERIFIED: {
            bg: "bg-emerald-950/40",
            border: "border-emerald-500/30",
            text: "text-emerald-400",
            dot: "bg-emerald-500",
            label: "Verified",
        },
        "PARTIALLY VERIFIED": {
            bg: "bg-amber-950/40",
            border: "border-amber-500/30",
            text: "text-amber-400",
            dot: "bg-amber-500",
            label: "Partially Verified",
        },
        UNVERIFIED: {
            bg: "bg-red-950/40",
            border: "border-red-500/30",
            text: "text-red-400",
            dot: "bg-red-500",
            label: "Unverified",
        },
    };
    const c = cfg[level] || cfg.UNVERIFIED;
    return (
        <span
            data-testid={`confidence-${(c.label || "").toLowerCase().replace(" ", "-")}`}
            className={`inline-flex items-center gap-2 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded border ${c.border} ${c.bg} ${c.text} ${className}`}
            style={{ boxShadow: "0 0 15px rgba(0, 112, 243, 0.04)" }}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
            {c.label}
        </span>
    );
}
