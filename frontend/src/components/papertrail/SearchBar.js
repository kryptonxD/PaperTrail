import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function SearchBar({ initial = "", size = "hero" }) {
    const [q, setQ] = useState(initial);
    const nav = useNavigate();
    const hero = size === "hero";

    function submit(e) {
        e.preventDefault();
        if (!q.trim()) return;
        nav(`/search?q=${encodeURIComponent(q.trim())}`);
    }

    return (
        <form onSubmit={submit} className="w-full" data-testid="search-form">
            <div
                className={`bg-bg-card/90 border border-border-color flex items-center gap-4 px-5 md:px-7 ${hero ? "h-16 md:h-18" : "h-13"} rounded-lg group focus-within:border-blue-600 transition-all duration-200`}
            >
                <Search className={`text-text-secondary group-focus-within:text-blue-500 ${hero ? "w-5 h-5" : "w-4 h-4"} shrink-0 transition-colors`} />
                <input
                    data-testid="search-input"
                    autoFocus={hero}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={hero ? "How do I update Aadhaar, register property, get caste certificate..." : "Search document process..."}
                    className={`flex-1 bg-transparent outline-none text-white placeholder-zinc-500 text-sm md:text-base`}
                />
                <button
                    type="submit"
                    data-testid="search-submit-btn"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded transition-colors hidden md:inline-block"
                >
                    Search
                </button>
            </div>
        </form>
    );
}
