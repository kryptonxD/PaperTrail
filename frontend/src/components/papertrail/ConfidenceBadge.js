import React from "react";

export function ConfidenceBadge({ level, className = "" }) {
    const cfg = {
        VERIFIED: {
            bg: "bg-emerald-50/80 dark:bg-emerald-950/30",
            border: "border-emerald-700/25 dark:border-emerald-300/25",
            text: "text-emerald-800 dark:text-emerald-200",
            dot: "bg-emerald-700 dark:bg-emerald-300",
            label: "Verified",
            description: "Checked against an official source.",
        },
        "PARTIALLY VERIFIED": {
            bg: "bg-amber-50/80 dark:bg-amber-950/30",
            border: "border-amber-700/25 dark:border-amber-300/25",
            text: "text-amber-800 dark:text-amber-200",
            dot: "bg-amber-700 dark:bg-amber-300",
            label: "Partially Verified",
            description: "Some details are checked; confirm the rest at the linked source.",
        },
        UNVERIFIED: {
            bg: "bg-rose-50/80 dark:bg-rose-950/25",
            border: "border-rose-700/25 dark:border-rose-300/25",
            text: "text-rose-800 dark:text-rose-200",
            dot: "bg-rose-700 dark:bg-rose-300",
            label: "Unverified",
            description: "Not yet checked against an official source.",
        },
    };
    const c = cfg[level] || cfg.UNVERIFIED;
    return (
        <span
            data-testid={`confidence-${(c.label || "").toLowerCase().replace(/\s+/g, "-")}`}
            className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-3 py-1 text-xs leading-4 font-mono uppercase tracking-wider ${c.border} ${c.bg} ${c.text} ${className}`}
            title={c.description}
            aria-label={`${c.label}. ${c.description}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
            {c.label}
        </span>
    );
}
