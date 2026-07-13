import React from "react";

export function ConfidenceBadge({ level, className = "" }) {
    const cfg = {
        VERIFIED: {
            bg: "bg-emerald-50 dark:bg-emerald-950/40",
            border: "border-emerald-200 dark:border-emerald-500/30",
            text: "text-emerald-700 dark:text-emerald-400",
            dot: "bg-emerald-600 dark:bg-emerald-500",
            label: "Verified",
        },
        "PARTIALLY VERIFIED": {
            bg: "bg-amber-50 dark:bg-amber-950/40",
            border: "border-amber-200 dark:border-amber-500/30",
            text: "text-amber-700 dark:text-amber-400",
            dot: "bg-amber-600 dark:bg-amber-500",
            label: "Partially Verified",
        },
        UNVERIFIED: {
            bg: "bg-red-50 dark:bg-red-950/40",
            border: "border-red-200 dark:border-red-500/30",
            text: "text-red-700 dark:text-red-400",
            dot: "bg-red-600 dark:bg-red-500",
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
