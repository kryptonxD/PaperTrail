import React from "react";
import { CheckCircle2, ListChecks, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/papertrail/Header";

const METHOD = [
    {
        number: "01",
        title: "Start with the outcome",
        text: "Ask in ordinary language. PaperTrail finds the closest public process without making you guess the department or form name first.",
        Icon: ListChecks,
    },
    {
        number: "02",
        title: "Make the route local",
        text: "The guide is shaped around your selected state so the office, portal, documents and process reflect the right jurisdiction.",
        Icon: MapPin,
    },
    {
        number: "03",
        title: "Keep evidence beside advice",
        text: "Official links, confidence labels and review dates remain visible. Citizen tips are useful context, but never presented as official fact.",
        Icon: ShieldCheck,
    },
];

const CONFIDENCE = [
    ["Verified", "The guide has been checked against an official source."],
    ["Partially verified", "Some details are sourced; the remaining points should be confirmed before submission."],
    ["Unverified", "The information is a starting point and has not yet passed the source review."],
];

export default function Vision() {
    return (
        <div className="min-h-screen bg-bg-page text-text-primary">
            <Header />
            <main id="main-content">
                <section className="page-wrap grid gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-28">
                    <div>
                        <p className="utility-label text-accent-copper">How PaperTrail works</p>
                        <h1 className="editorial-title mt-5 max-w-4xl text-6xl leading-[0.88] md:text-8xl">
                            Public information, arranged around the person who needs it.
                        </h1>
                    </div>
                    <p className="max-w-lg text-base leading-relaxed text-text-secondary lg:pb-2">
                        Government instructions are often scattered across portals, circulars and office counters. PaperTrail turns that trail into one readable route—without hiding where the information came from.
                    </p>
                </section>

                <section className="border-y border-border-color bg-bg-card" aria-labelledby="method-title">
                    <div className="page-wrap py-20 md:py-24">
                        <div className="mb-12 max-w-2xl">
                            <p className="utility-label text-accent-copper">The method</p>
                            <h2 id="method-title" className="editorial-title mt-3 text-5xl leading-none md:text-6xl">A useful guide in three moves.</h2>
                        </div>

                        <ol className="grid gap-px border border-border-color bg-border-color lg:grid-cols-3">
                            {METHOD.map(({ number, title, text, Icon }) => (
                                <li key={number} className="bg-bg-card p-7 md:p-9">
                                    <div className="flex items-center justify-between">
                                        <span className="utility-label text-accent-copper">{number} / 03</span>
                                        <Icon aria-hidden="true" className="h-5 w-5 text-accent-copper" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="mt-10 text-xl font-semibold text-text-primary">{title}</h3>
                                    <p className="body-copy mt-3 text-text-secondary">{text}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="page-wrap grid gap-14 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:py-28" aria-labelledby="confidence-title">
                    <div>
                        <p className="utility-label text-accent-copper">Confidence, explained</p>
                        <h2 id="confidence-title" className="editorial-title mt-4 text-5xl leading-[0.95] md:text-6xl">A label is only useful if you know what it means.</h2>
                        <p className="body-copy mt-5 max-w-md text-text-secondary">
                            Confidence describes the source review—not whether an application will be approved. Your eligibility and the accepting office always make the final decision.
                        </p>
                    </div>

                    <dl className="border-t border-border-strong">
                        {CONFIDENCE.map(([term, detail], index) => (
                            <div key={term} className="grid gap-4 border-b border-border-color py-7 sm:grid-cols-[3rem_0.55fr_1fr] sm:items-start">
                                <span className="utility-label text-accent-copper">0{index + 1}</span>
                                <dt className="font-semibold text-text-primary">{term}</dt>
                                <dd className="body-copy text-text-secondary">{detail}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <section className="border-t border-border-color bg-bg-elevated">
                    <div className="page-wrap grid gap-10 py-16 md:grid-cols-[1fr_auto] md:items-center md:py-20">
                        <div className="max-w-2xl">
                            <p className="utility-label text-accent-copper">What PaperTrail is—and is not</p>
                            <h2 className="editorial-title mt-3 text-4xl leading-none md:text-5xl">A clearer reading layer, not a government portal.</h2>
                            <p className="body-copy mt-4 text-text-secondary">
                                PaperTrail helps you prepare and navigate. It does not issue documents, decide eligibility or replace the official source. Every guide should lead you back to the relevant government portal or office for submission.
                            </p>
                        </div>
                        <div className="flex flex-col items-start gap-3 md:items-end">
                            <span className="meta-copy inline-flex items-center gap-2 text-text-secondary">
                                <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-action" /> Karnataka and Maharashtra coverage
                            </span>
                            <Link to="/browse" className="btn-primary">Browse current guides</Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
