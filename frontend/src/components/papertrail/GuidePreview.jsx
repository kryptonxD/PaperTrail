import React from "react";

export default function GuidePreview() {
    return (
        <aside
            className="folder-showcase animate-fade-up"
            style={{ animationDelay: "180ms" }}
            aria-label="PaperTrail keeps the steps, documents, fees and official sources together in one guide"
        >
            <div className="folder-object" aria-hidden="true">
                <span className="folder-spine-label">PaperTrail / Official source</span>
                <span className="folder-paperclip" />

                <span className="folder-stamp">
                    <span>PaperTrail</span>
                    <strong>Source</strong>
                    <span>Linked</span>
                </span>

                <span className="folder-fastener">
                    <span className="folder-fastener-stud" />
                    <span className="folder-fastener-cord" />
                </span>
            </div>

            <div className="folder-caption">
                <span className="utility-label text-accent-copper">A guide you can follow</span>
                <p>Steps, documents, fees and official sources—kept together in one clear route.</p>
            </div>
        </aside>
    );
}
