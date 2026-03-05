"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Youtube,
    Search,
    Loader2,
    AlertTriangle,
    CheckCircle,
    Flag,
    Info,
    ExternalLink,
    BarChart3,
    MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface ScanResult {
    success: boolean;
    videoTitle: string;
    videoId: string;
    scanned: number;
    flagged: number;
    severity: {
        safe: number;
        low: number;
        medium: number;
        high: number;
        severe: number;
    };
    error?: string;
}

const SEVERITY_CONFIG = {
    safe: { label: "Safe", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25" },
    low: { label: "Low", color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/25" },
    medium: { label: "Medium", color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/25" },
    high: { label: "High", color: "text-red-400", bg: "bg-red-500/15 border-red-500/25" },
    severe: { label: "Severe", color: "text-rose-400", bg: "bg-rose-500/15 border-rose-500/25" },
} as const;

const PRESET_COUNTS = [25, 50, 100, 200];

export default function YoutubePage() {
    const [url, setUrl] = useState("");
    const [maxComments, setMaxComments] = useState(50);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState("");

    const handleScan = async () => {
        if (!url.trim()) return;
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const res = await fetch("/api/youtube", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoUrl: url.trim(), maxComments }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to fetch comments");
            } else {
                setResult(data);
            }
        } catch (e) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    };

    const flagRate = result ? Math.round((result.flagged / result.scanned) * 100) : 0;
    const safeRate = result ? Math.round((result.severity.safe / result.scanned) * 100) : 0;

    return (
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600/20 border border-red-500/30 rounded-lg flex items-center justify-center">
                    <Youtube className="w-4 h-4 text-red-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">YouTube Comment Scanner</h1>
                    <p className="text-xs text-slate-500">Fetch and analyze comments from any YouTube video</p>
                </div>
            </div>

            {/* API Key Notice */}
            <div className="flex items-start gap-3 p-4 bg-amber-500/8 border border-amber-500/20 rounded-xl">
                <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-300/80 space-y-1">
                    <p className="font-semibold text-amber-300">YouTube API Key Required</p>
                    <p>
                        Add your key to <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-200">.env.local</code> as{" "}
                        <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-200">YOUTUBE_API_KEY=...</code> then restart the dev server.
                        Get a free key at{" "}
                        <a
                            href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 underline hover:text-amber-300"
                        >
                            Google Cloud Console
                        </a>
                        .
                    </p>
                </div>
            </div>

            {/* Scanner Form */}
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-400" />
                        Scan YouTube Video
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-400 text-xs uppercase tracking-wide">YouTube Video URL or ID</Label>
                        <div className="flex gap-2">
                            <Input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                className="flex-1 bg-slate-800/80 border-slate-600/50 text-slate-200 placeholder-slate-500 h-10"
                            />
                        </div>
                        <p className="text-[11px] text-slate-500">
                            Accepts: full YouTube URL, youtu.be short link, Shorts URL, or raw video ID
                        </p>
                    </div>

                    {/* Comment count presets */}
                    <div className="space-y-2">
                        <Label className="text-slate-400 text-xs uppercase tracking-wide">
                            Comments to Fetch
                            <span className="ml-2 text-violet-400 font-semibold">{maxComments}</span>
                        </Label>
                        <div className="flex gap-2 flex-wrap">
                            {PRESET_COUNTS.map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setMaxComments(n)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${maxComments === n
                                        ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                                        : "bg-slate-800/60 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                            <input
                                type="number"
                                min={1}
                                max={500}
                                value={maxComments}
                                onChange={(e) => setMaxComments(Math.min(500, Math.max(1, Number(e.target.value))))}
                                className="w-20 px-2 py-1.5 rounded-lg text-xs bg-slate-800/80 border border-slate-600/50 text-slate-200 text-center"
                                placeholder="Custom"
                            />
                        </div>
                        <p className="text-[11px] text-slate-500">Higher counts use more YouTube API quota (10,000 units/day free).</p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-300">{error}</p>
                        </div>
                    )}

                    <Button
                        onClick={handleScan}
                        disabled={loading || !url.trim()}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold h-10"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Fetching & Analyzing Comments…</>
                        ) : (
                            <><Search className="w-4 h-4 mr-2" />Scan Comments</>
                        )}
                    </Button>

                    {loading && (
                        <div className="space-y-2">
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-red-500 to-violet-500 rounded-full animate-pulse w-3/4" />
                            </div>
                            <p className="text-[11px] text-slate-500 text-center">Fetching up to {maxComments} comments and running detection…</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Video title */}
                    <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-red-600/20 border border-red-500/25 rounded-lg flex items-center justify-center shrink-0">
                                    <Youtube className="w-5 h-5 text-red-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{result.videoTitle}</p>
                                    <a
                                        href={`https://www.youtube.com/watch?v=${result.videoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] text-slate-500 hover:text-violet-400 transition-colors flex items-center gap-1 mt-0.5"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        youtube.com/watch?v={result.videoId}
                                    </a>
                                </div>
                                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Scan Complete
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* KPI row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            {
                                label: "Comments Scanned",
                                value: result.scanned,
                                icon: MessageSquare,
                                color: "text-violet-400",
                                bg: "from-violet-500/10",
                                border: "border-violet-500/20",
                            },
                            {
                                label: "Flagged",
                                value: result.flagged,
                                icon: Flag,
                                color: "text-red-400",
                                bg: "from-red-500/10",
                                border: "border-red-500/20",
                                sub: `${flagRate}% of total`,
                            },
                            {
                                label: "Safe Comments",
                                value: result.severity.safe,
                                icon: CheckCircle,
                                color: "text-emerald-400",
                                bg: "from-emerald-500/10",
                                border: "border-emerald-500/20",
                                sub: `${safeRate}% of total`,
                            },
                            {
                                label: "Severe",
                                value: result.severity.severe,
                                icon: AlertTriangle,
                                color: "text-rose-400",
                                bg: "from-rose-500/10",
                                border: "border-rose-500/20",
                            },
                        ].map(({ label, value, icon: Icon, color, bg, border, sub }) => (
                            <Card key={label} className={`bg-slate-900/60 border backdrop-blur-sm bg-gradient-to-br ${bg} to-transparent ${border}`}>
                                <CardContent className="pt-4 pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                                            {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
                                        </div>
                                        <Icon className={`w-4 h-4 ${color} opacity-60`} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Severity breakdown */}
                    <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-violet-400" />
                                Severity Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(["severe", "high", "medium", "low", "safe"] as const).map((sev) => {
                                const count = result.severity[sev];
                                const pct = result.scanned > 0 ? (count / result.scanned) * 100 : 0;
                                const cfg = SEVERITY_CONFIG[sev];
                                return (
                                    <div key={sev} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                                            <span className="text-slate-400 font-mono">
                                                {count} <span className="text-slate-600">({pct.toFixed(1)}%)</span>
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${sev === "severe" ? "bg-rose-500" :
                                                    sev === "high" ? "bg-red-500" :
                                                        sev === "medium" ? "bg-orange-500" :
                                                            sev === "low" ? "bg-yellow-500" :
                                                                "bg-emerald-500"
                                                    }`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Link href="/comments" className="flex-1">
                            <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                View All Comments
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            className="border-slate-700 text-slate-400 hover:text-slate-200 bg-slate-800/50"
                            onClick={() => { setResult(null); setUrl(""); }}
                        >
                            Scan Another
                        </Button>
                    </div>
                </div>
            )}

            {/* How-to guide */}
            {!result && !loading && (
                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-3.5 h-3.5 text-slate-400" />
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Setup Guide</p>
                        </div>
                        <div className="space-y-3">
                            {[
                                {
                                    step: "1",
                                    title: "Get a YouTube Data API v3 Key",
                                    desc: "Go to Google Cloud Console → APIs & Services → Enable YouTube Data API v3 → Create an API key.",
                                    link: { href: "https://console.cloud.google.com/apis/library/youtube.googleapis.com", label: "Open Console →" },
                                },
                                {
                                    step: "2",
                                    title: "Add it to .env.local",
                                    desc: "Open .env.local in the project root and set YOUTUBE_API_KEY=your_key_here, then restart npm run dev.",
                                },
                                {
                                    step: "3",
                                    title: "Paste any YouTube URL",
                                    desc: "Works with full watch URLs, youtu.be short links, Shorts links, or just the 11-character video ID.",
                                },
                                {
                                    step: "4",
                                    title: "Results saved to MongoDB",
                                    desc: "All scanned comments are stored with toxicity scores and can be reviewed in the Comments tab.",
                                },
                            ].map(({ step, title, desc, link }) => (
                                <div key={step} className="flex gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                                    <div className="w-6 h-6 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-red-400">{step}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-300">{title}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                                        {link && (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] text-red-400 hover:text-red-300 mt-1 inline-flex items-center gap-1"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                {link.label}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
