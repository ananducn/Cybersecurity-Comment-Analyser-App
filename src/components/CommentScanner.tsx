"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge, ScoreBar } from "@/components/SeverityBadge";
import { Send, Loader2, Shield, AlertTriangle } from "lucide-react";

interface AnalysisResult {
    _id: string;
    text: string;
    platform: string;
    username: string;
    score: number;
    severity: "safe" | "low" | "medium" | "high" | "severe";
    matchedWords: string[];
    highlightedText: string;
}

const PLATFORMS = ["Twitter", "Instagram", "YouTube", "TikTok", "Reddit", "Facebook", "Other"];

export default function CommentScanner({ onSubmit }: { onSubmit?: () => void }) {
    const [text, setText] = useState("");
    const [platform, setPlatform] = useState("Other");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, platform, username: username || "Anonymous" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");
            setResult(data);
            onSubmit?.();
        } catch (e) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-200 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-violet-400" />
                        Scan Comment
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-400 text-xs uppercase tracking-wide">Comment Text</Label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Paste a comment to analyze for cyberbullying..."
                            className="w-full h-28 bg-slate-800/80 border border-slate-600/50 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs uppercase tracking-wide">Platform</Label>
                            <Select value={platform} onValueChange={setPlatform}>
                                <SelectTrigger className="bg-slate-800/80 border-slate-600/50 text-slate-200 h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    {PLATFORMS.map((p) => (
                                        <SelectItem key={p} value={p} className="text-slate-200 focus:bg-slate-700">
                                            {p}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs uppercase tracking-wide">Username</Label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="@username"
                                className="bg-slate-800/80 border-slate-600/50 text-slate-200 placeholder-slate-500 h-9"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {error}
                        </p>
                    )}

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !text.trim()}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Send className="w-4 h-4 mr-2" />
                        )}
                        {loading ? "Analyzing..." : "Analyze Comment"}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-slate-200">Analysis Result</CardTitle>
                            <SeverityBadge severity={result.severity} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Toxicity Score</p>
                            <ScoreBar score={result.score} />
                        </div>

                        {result.matchedWords.length > 0 && (
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Harmful Words Detected</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {result.matchedWords.map((w) => (
                                        <span
                                            key={w}
                                            className="px-2 py-0.5 bg-red-500/15 text-red-400 border border-red-500/25 rounded text-xs font-mono"
                                        >
                                            {w}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Highlighted Text</p>
                            <div
                                className="bg-slate-800/80 rounded-lg p-3 text-sm text-slate-300 leading-relaxed highlighted-comment"
                                dangerouslySetInnerHTML={{ __html: result.highlightedText || result.text }}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
