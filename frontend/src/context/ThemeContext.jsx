import React, { createContext, useContext, useLayoutEffect, useState } from "react";

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("papertrail-theme");
        if (saved === "light" || saved === "dark") return saved;
        return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });

    useLayoutEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("papertrail-theme", theme);

        const themeMeta = document.querySelector('meta[name="theme-color"]');
        themeMeta?.setAttribute("content", theme === "dark" ? "#0c1411" : "#f4f0e7");
    }, [theme]);

    function toggleTheme() {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }

    return (
        <ThemeCtx.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeCtx.Provider>
    );
}

export const useTheme = () => useContext(ThemeCtx);
