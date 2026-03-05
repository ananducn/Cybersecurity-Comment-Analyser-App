"use client";

import { Severity } from "@/lib/detection";
import { cn } from "@/lib/utils";

const SEVERITY_CONFIG: Record<Severity, { label: string; bg: string; text: string; border: string }> = {
    safe: { label: "Safe", bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
    low: { label: "Low Risk", bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" },
    medium: { label: "Medium", bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
    high: { label: "High Risk", bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
    severe: { label: "Severe", bg: "bg-rose-600/20", text: "text-rose-400", border: "border-rose-500/40" },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
    const cfg = SEVERITY_CONFIG[severity];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                cfg.bg, cfg.text, cfg.border
            )}
        >
            <span
                className={cn("w-1.5 h-1.5 rounded-full animate-pulse", {
                    "bg-emerald-400": severity === "safe",
                    "bg-yellow-400": severity === "low",
                    "bg-orange-400": severity === "medium",
                    "bg-red-400": severity === "high",
                    "bg-rose-400": severity === "severe",
                })}
            />
            {cfg.label}
        </span>
    );
}

export function ScoreBar({ score }: { score: number }) {
    const getColor = () => {
        if (score < 30) return "from-emerald-500 to-emerald-400";
        if (score < 55) return "from-yellow-500 to-orange-400";
        if (score < 75) return "from-orange-500 to-red-500";
        return "from-red-500 to-rose-600";
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", getColor())}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className="text-xs font-mono text-slate-400 w-8 text-right">{score}</span>
        </div>
    );
}
