import React from "react";

export default function DocumentTrail() {
    const chips = [
        { label: "Submitted", color: "#555555" },
        { label: "Verified", color: "#555555" },
        { label: "Approved", color: "#3B82F6" },
        { label: "Submitted", color: "#555555" },
        { label: "Verified", color: "#555555" },
        { label: "Approved", color: "#3B82F6" },
    ];

    // Double the list to make the loop seamless
    const doubledChips = [...chips, ...chips];

    return (
        <div
            aria-hidden="true"
            className="hidden md:block select-none pointer-events-none shrink-0"
            style={{
                width: "110px",
                height: "220px",
                overflow: "hidden",
                borderRadius: "6px",
                position: "relative",
            }}
        >
            <style>{`
                @keyframes scrollUp {
                    0% {
                        transform: translateY(0);
                    }
                    100% {
                        transform: translateY(-50%);
                    }
                }
                .trail-scroll-container {
                    display: flex;
                    flex-direction: column;
                    animation: scrollUp 20s linear infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .trail-scroll-container {
                        animation: none;
                    }
                }
            `}</style>
            <div className="trail-scroll-container">
                {doubledChips.map((chip, idx) => (
                    <div
                        key={idx}
                        style={{
                            background: "#111111",
                            border: "1px solid #222222",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            height: "30px",
                            marginBottom: "8px",
                            boxSizing: "border-box",
                        }}
                    >
                        <span
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: chip.color,
                                flexShrink: 0,
                            }}
                        />
                        <span
                            style={{
                                color: "#AAAAAA",
                                fontSize: "11px",
                                fontFamily: "'Outfit', sans-serif",
                                fontWeight: 500,
                                lineHeight: 1,
                            }}
                        >
                            {chip.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
