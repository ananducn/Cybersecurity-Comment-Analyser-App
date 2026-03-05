"use client";

import { useState } from "react";
import CommentScanner from "@/components/CommentScanner";
import { Search, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const HOW_IT_WORKS = [
    { step: "1", title: "Keyword Matching", desc: "Exact phrase detection against a curated dictionary of harmful words with pre-assigned severity scores." },
    { step: "2", title: "Fuzzy Matching", desc: "Fuse.js fuzzy search detects misspellings and variations of harmful words within a 0.3 threshold." },
    { step: "3", title: "Risk Scoring", desc: "A 0–100 risk score is computed from matched word severities. Score ≥50 auto-flags the comment." },
    { step: "4", title: "Highlighting", desc: "Harmful words are wrapped in colored HTML marks with severity-specific colors for visual review." },
];

export default function ScanPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="p-6 space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-600/20 border border-violet-500/30 rounded-lg flex items-center justify-center">
                    <Search className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Comment Scanner</h1>
                    <p className="text-xs text-slate-500">Analyze text for cyberbullying using keyword + fuzzy detection</p>
                </div>
            </div>

            <CommentScanner onSubmit={() => setRefreshKey((k) => k + 1)} />

            {/* How it works */}
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">How Detection Works</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {HOW_IT_WORKS.map(({ step, title, desc }) => (
                            <div key={step} className="flex gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                                <div className="w-6 h-6 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-bold text-violet-400">{step}</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-300">{title}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
