import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "@/pages/Home";
import Results from "@/pages/Results";
import DocDetail from "@/pages/DocDetail";
import Checklists from "@/pages/Checklists";
import AuthCallback from "@/pages/AuthCallback";
import Browse from "@/pages/Browse";
import Vision from "@/pages/Vision";
import NotFound from "@/pages/NotFound";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { useTheme } from "@/context/ThemeContext";

function AppExperience() {
    const { theme } = useTheme();

    return (
        <AppProvider>
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Results />} />
                    <Route path="/doc/:id" element={<DocDetail />} />
                    <Route path="/browse" element={<Browse />} />
                    <Route path="/vision" element={<Vision />} />
                    <Route path="/checklists" element={<Checklists />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster
                    theme={theme}
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: "var(--bg-card)",
                            border: "1px solid var(--border-color)",
                            color: "var(--text-primary)",
                            fontFamily: "Outfit, sans-serif",
                        },
                    }}
                />
                <Analytics />
            </BrowserRouter>
        </AppProvider>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AppExperience />
        </ThemeProvider>
    );
}

