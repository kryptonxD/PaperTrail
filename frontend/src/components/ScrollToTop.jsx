import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        const title = pathname === "/"
            ? "PaperTrail — A Clear Path Through Public Paperwork"
            : pathname === "/browse"
                ? "Browse Public Process Guides — PaperTrail"
                : pathname === "/vision"
                    ? "How PaperTrail Works"
                    : pathname === "/checklists"
                        ? "My Checklists — PaperTrail"
                        : pathname.startsWith("/doc/")
                            ? "Process Guide — PaperTrail"
                            : pathname === "/search"
                                ? "Search Results — PaperTrail"
                                : "Page Not Found — PaperTrail";
        document.title = title;
    }, [pathname]);

    return null;
}
