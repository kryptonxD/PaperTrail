import React, { useEffect, useId, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ initial = "", size = "hero" }) {
    const [q, setQ] = useState(initial);
    const [emptyMessage, setEmptyMessage] = useState("");
    const inputId = useId();
    const nav = useNavigate();
    const hero = size === "hero";

    useEffect(() => setQ(initial), [initial]);

    function submit(event) {
        event.preventDefault();
        const query = q.trim();
        if (!query) {
            setEmptyMessage("Tell us what you need to get done.");
            return;
        }
        setEmptyMessage("");
        nav(`/search?q=${encodeURIComponent(query)}`);
    }

    return (
        <form onSubmit={submit} className="w-full" data-testid="search-form" noValidate>
            <label htmlFor={inputId} className={hero ? "utility-label search-label" : "sr-only"}>
                {hero ? "What do you need to get done?" : "Search public process guides"}
            </label>
            <div className={`search-shell ${hero ? "" : "search-shell-compact"}`}>
                <span className="search-prefix">{hero ? "I need to" : <Search aria-hidden="true" className="h-4 w-4" />}</span>
                <input
                    id={inputId}
                    data-testid="search-input"
                    value={q}
                    onChange={(event) => {
                        setQ(event.target.value);
                        if (emptyMessage) setEmptyMessage("");
                    }}
                    placeholder={hero ? "Try “apply for a caste certificate”" : "Search another process…"}
                    className="search-input"
                    aria-invalid={Boolean(emptyMessage)}
                    aria-describedby={emptyMessage ? `${inputId}-error` : undefined}
                    autoComplete="off"
                />
                <button type="submit" data-testid="search-submit-btn" className="search-submit" aria-label={hero ? "Show me the steps" : "Search"}>
                    <span className="hidden sm:inline">{hero ? "Show me the steps" : "Search"}</span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
            </div>
            <p id={`${inputId}-error`} role="status" className="meta-copy mt-2 min-h-5 text-accent-copper">
                {emptyMessage}
            </p>
        </form>
    );
}
