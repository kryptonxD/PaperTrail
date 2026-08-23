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

const ROADMAP = [
    {
        label: "Available now",
        title: "Karnataka and Maharashtra",
        text: "Guides grounded in official sources where available and strengthened by reviewed citizen corrections.",
    },
    {
        label: "Building next",
        title: "More states, stronger guidance",
        text: "Expand state by state, improve how everyday questions find the right guide, and make community corrections easier to submit and review.",
    },
    {
        label: "Planned",
        title: "From search to follow-through",
        text: "Build toward complete civic-process coverage in major cities, add WhatsApp access, and send useful reminders for deadlines and renewals.",
    },
    {
        label: "Planned",
        title: "Know who is responsible",
        text: "Name the office and public authority behind each step, so people can see where a process sits and who is responsible for it.",
    },
    {
        label: "Long-term",
        title: "Every state. Every district.",
        text: "Bring PaperTrail across India, add spoken guidance, and let people know when reviewed coverage reaches their area.",
    },
    {
        label: "Exploring",
        title: "Beyond civic services",
        text: "Once the civic foundation is dependable, explore other essential services with complex paperwork, including banking, insurance and finance.",
    },
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

                <section className="border-y border-border-color bg-bg-card" aria-labelledby="future-vision-title">
                    <div className="page-wrap py-20 md:py-28">
                        <div className="mb-14 grid gap-7 lg:grid-cols-[1fr_0.72fr] lg:items-end">
                            <div>
                                <p className="font-mono text-base font-medium uppercase leading-6 tracking-[0.12em] text-accent-copper">Future vision</p>
                                <h2 id="future-vision-title" className="editorial-title mt-4 max-w-3xl text-5xl leading-[0.94] md:text-7xl">
                                    Build trust first. Then widen the trail.
                                </h2>
                            </div>
                            <p className="body-copy max-w-xl text-text-secondary lg:justify-self-end">
                                PaperTrail’s ambition grows in stages: strengthen each guide, widen access, and expand only where the source trail can remain clear.
                            </p>
                        </div>

                        <ol className="border-t border-border-strong">
                            {ROADMAP.map(({ label, title, text }, index) => (
                                <li
                                    key={`${label}-${title}`}
                                    className="grid gap-5 border-b border-border-color py-8 md:grid-cols-[7.5rem_minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-8 md:py-10"
                                >
                                    <span className="font-mono text-base font-medium leading-6 tracking-[0.12em] text-accent-copper">{String(index + 1).padStart(2, "0")} / 06</span>
                                    <div>
                                        <p className="font-mono text-base font-medium uppercase leading-6 tracking-[0.1em] text-text-secondary">{label}</p>
                                        <h3 className="editorial-title mt-3 text-3xl leading-none md:text-4xl">{title}</h3>
                                    </div>
                                    <p className="body-copy max-w-2xl text-text-secondary">{text}</p>
                                </li>
                            ))}
                        </ol>

                        <p className="body-copy mt-7 max-w-3xl text-text-tertiary">
                            This is a direction, not a dated release schedule. Each expansion depends on reliable sources and local review.
                        </p>
                    </div>
                </section>

                <section className="bg-bg-elevated">
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
