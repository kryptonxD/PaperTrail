import React from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/papertrail/Header";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-bg-page text-text-primary">
            <Header />
            <main id="main-content" className="page-wrap-narrow grid min-h-[70vh] place-items-center py-20 text-center">
                <div>
                    <p className="utility-label text-accent-copper">404 / Route not found</p>
                    <h1 className="editorial-title mt-5 text-6xl leading-none md:text-7xl">This trail ends here.</h1>
                    <p className="body-copy mx-auto mt-5 max-w-md text-text-secondary">
                        The guide may have moved, or the address may be incomplete. Start again from the directory or search for the outcome you need.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link to="/" className="btn-primary"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Return home</Link>
                        <Link to="/browse" className="btn-secondary"><Search aria-hidden="true" className="h-4 w-4" /> Browse guides</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
