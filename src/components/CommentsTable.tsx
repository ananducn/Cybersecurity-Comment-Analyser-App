"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge, ScoreBar } from "@/components/SeverityBadge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Trash2, CheckCircle, Flag, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Comment {
    _id: string;
    text: string;
    platform: string;
    username: string;
    score: number;
    severity: "safe" | "low" | "medium" | "high" | "severe";
    matchedWords: string[];
    highlightedText: string;
    flagged: boolean;
    reviewed: boolean;
    createdAt: string;
}

const PLATFORMS = ["all", "Twitter", "Instagram", "YouTube", "TikTok", "Reddit", "Facebook", "Other"];
const SEVERITIES = ["all", "safe", "low", "medium", "high", "severe"];

export default function CommentsTable({ refreshKey }: { refreshKey: number }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [severity, setSeverity] = useState("all");
    const [platform, setPlatform] = useState("all");
    const [flaggedOnly, setFlaggedOnly] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const limit = 10;

    const fetchComments = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (severity !== "all") params.set("severity", severity);
        if (platform !== "all") params.set("platform", platform);
        if (flaggedOnly) params.set("flagged", "true");
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        try {
            const res = await fetch(`/api/comments?${params}`);
            const data = await res.json();
            setComments(data.comments || []);
            setTotal(data.total || 0);
        } finally {
            setLoading(false);
        }
    }, [page, severity, platform, flaggedOnly, from, to]);

    useEffect(() => { fetchComments(); }, [fetchComments, refreshKey]);

    const handleReview = async (id: string, reviewed: boolean) => {
        await fetch(`/api/comments/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reviewed }),
        });
        fetchComments();
    };

    const handleToggleFlag = async (id: string, flagged: boolean) => {
        await fetch(`/api/comments/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flagged }),
        });
        fetchComments();
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await fetch(`/api/comments/${deleteId}`, { method: "DELETE" });
        setDeleteId(null);
        fetchComments();
    };

    const totalPages = Math.ceil(total / limit);

    const filteredComments = search
        ? comments.filter(
            (c) =>
                c.text.toLowerCase().includes(search.toLowerCase()) ||
                c.username.toLowerCase().includes(search.toLowerCase())
        )
        : comments;

    return (
        <div className="space-y-4">
            {/* Filters */}
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search comments..."
                                className="pl-9 bg-slate-800/80 border-slate-600/50 text-slate-200 placeholder-slate-500 h-9"
                            />
                        </div>
                        <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(1); }}>
                            <SelectTrigger className="bg-slate-800/80 border-slate-600/50 text-slate-200 h-9 w-36">
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                {SEVERITIES.map((s) => (
                                    <SelectItem key={s} value={s} className="text-slate-200 focus:bg-slate-700 capitalize">{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={platform} onValueChange={(v) => { setPlatform(v); setPage(1); }}>
                            <SelectTrigger className="bg-slate-800/80 border-slate-600/50 text-slate-200 h-9 w-36">
                                <SelectValue placeholder="Platform" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                {PLATFORMS.map((p) => (
                                    <SelectItem key={p} value={p} className="text-slate-200 focus:bg-slate-700">{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant={flaggedOnly ? "default" : "outline"}
                            size="sm"
                            onClick={() => { setFlaggedOnly(!flaggedOnly); setPage(1); }}
                            className={flaggedOnly
                                ? "bg-red-600 hover:bg-red-500 text-white border-0 h-9"
                                : "border-slate-600/50 text-slate-400 hover:text-slate-200 h-9 bg-slate-800/80"}
                        >
                            <Flag className="w-3.5 h-3.5 mr-1.5" /> Flagged Only
                        </Button>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <Input
                                type="date"
                                value={from}
                                onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                                className="bg-slate-800/80 border-slate-600/50 text-slate-200 h-9 w-36"
                            />
                            <span className="text-slate-500 text-sm">→</span>
                            <Input
                                type="date"
                                value={to}
                                onChange={(e) => { setTo(e.target.value); setPage(1); }}
                                className="bg-slate-800/80 border-slate-600/50 text-slate-200 h-9 w-36"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-200">
                            {total} Comment{total !== 1 ? "s" : ""} Found
                        </CardTitle>
                        {loading && <span className="text-xs text-slate-500 animate-pulse">Loading...</span>}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-800/50">
                        {filteredComments.length === 0 && !loading && (
                            <div className="text-center py-12 text-slate-500 text-sm">No comments found</div>
                        )}
                        {filteredComments.map((comment) => (
                            <div key={comment._id} className="p-4 hover:bg-slate-800/30 transition-colors">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <span className="text-xs font-medium text-slate-300">@{comment.username}</span>
                                            <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 px-1.5 py-0">
                                                {comment.platform}
                                            </Badge>
                                            <SeverityBadge severity={comment.severity} />
                                            {comment.flagged && (
                                                <span className="text-[10px] text-red-400 flex items-center gap-0.5">
                                                    <Flag className="w-2.5 h-2.5" /> Flagged
                                                </span>
                                            )}
                                            {comment.reviewed && (
                                                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                                                    <CheckCircle className="w-2.5 h-2.5" /> Reviewed
                                                </span>
                                            )}
                                        </div>
                                        <p
                                            className="text-sm text-slate-300 cursor-pointer line-clamp-2"
                                            onClick={() => setExpandedId(expandedId === comment._id ? null : comment._id)}
                                        >
                                            {comment.text}
                                        </p>
                                        {expandedId === comment._id && comment.matchedWords.length > 0 && (
                                            <div className="mt-2 space-y-2 animate-in fade-in duration-200">
                                                <div
                                                    className="bg-slate-800/60 rounded p-2 text-xs text-slate-300 leading-relaxed highlighted-comment"
                                                    dangerouslySetInnerHTML={{ __html: comment.highlightedText || comment.text }}
                                                />
                                                <div className="flex flex-wrap gap-1">
                                                    {comment.matchedWords.map((w) => (
                                                        <span key={w} className="px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px] font-mono">
                                                            {w}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-2 max-w-xs">
                                            <ScoreBar score={comment.score} />
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1">
                                            {format(new Date(comment.createdAt), "MMM d, yyyy HH:mm")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleToggleFlag(comment._id, !comment.flagged)}
                                            className={`h-7 px-2 ${comment.flagged ? "text-red-400 hover:text-red-300" : "text-slate-500 hover:text-red-400"}`}
                                            title={comment.flagged ? "Unflag" : "Flag"}
                                        >
                                            <Flag className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleReview(comment._id, !comment.reviewed)}
                                            className={`h-7 px-2 ${comment.reviewed ? "text-emerald-400 hover:text-emerald-300" : "text-slate-500 hover:text-emerald-400"}`}
                                            title={comment.reviewed ? "Mark Unreviewed" : "Mark Reviewed"}
                                        >
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setDeleteId(comment._id)}
                                            className="h-7 px-2 text-slate-500 hover:text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        Page {page} of {totalPages} · {total} total
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="border-slate-700 text-slate-400 hover:text-slate-200 bg-slate-800/50 h-8"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="border-slate-700 text-slate-400 hover:text-slate-200 bg-slate-800/50 h-8"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="bg-slate-900 border-slate-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-200">Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This will permanently delete this comment from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
