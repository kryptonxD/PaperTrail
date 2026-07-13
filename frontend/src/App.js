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
import { Toaster } from "sonner";

export default function App() {
    return (
        <ThemeProvider>
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
                    </Routes>
                    <Toaster
                        theme="dark"
                        position="bottom-right"
                        toastOptions={{
                            style: {
                                background: "#161616",
                                border: "1px solid #222222",
                                color: "#ededed",
                                fontFamily: "Inter, sans-serif",
                            },
                        }}
                    />
                </BrowserRouter>
            </AppProvider>
        </ThemeProvider>
    );
}

