"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Plus, Trash2, Pencil, Check, X, Loader2, Tags, Info } from "lucide-react";
import { SeverityBadge, ScoreBar } from "@/components/SeverityBadge";
import { Severity } from "@/lib/detection";

interface Keyword {
    _id: string;
    word: string;
    score: number;
    severity: Severity;
}

const SEVERITY_OPTS: { label: string; value: Severity; score: number }[] = [
    { label: "Low", value: "low", score: 25 },
    { label: "Medium", value: "medium", score: 55 },
    { label: "High", value: "high", score: 80 },
    { label: "Severe", value: "severe", score: 95 },
];

export default function KeywordManager() {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    // Add form state
    const [newWord, setNewWord] = useState("");
    const [newScore, setNewScore] = useState(55);
    const [addError, setAddError] = useState("");

    // Edit state
    const [editId, setEditId] = useState<string | null>(null);
    const [editWord, setEditWord] = useState("");
    const [editScore, setEditScore] = useState(55);
    const [editSaving, setEditSaving] = useState(false);

    // Delete confirm
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchKeywords = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/keywords");
            const data = await res.json();
            setKeywords(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchKeywords(); }, [fetchKeywords]);

    const scoreToSeverity = (s: number): Severity => {
        if (s === 0) return "safe";
        if (s < 30) return "low";
        if (s < 55) return "medium";
        if (s < 75) return "high";
        return "severe";
    };

    const handleAdd = async () => {
        if (!newWord.trim()) { setAddError("Enter a word or phrase"); return; }
        setAdding(true);
        setAddError("");
        try {
            const res = await fetch("/api/keywords", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ word: newWord.trim(), score: newScore }),
            });
            const data = await res.json();
            if (!res.ok) { setAddError(data.error || "Failed"); return; }
            setNewWord("");
            setNewScore(55);
            fetchKeywords();
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await fetch(`/api/keywords/${deleteId}`, { method: "DELETE" });
        setDeleteId(null);
        fetchKeywords();
    };

    const startEdit = (kw: Keyword) => {
        setEditId(kw._id);
        setEditWord(kw.word);
        setEditScore(kw.score);
    };

    const cancelEdit = () => { setEditId(null); };

    const saveEdit = async (id: string) => {
        if (!editWord.trim()) return;
        setEditSaving(true);
        await fetch(`/api/keywords/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: editWord.trim(), score: editScore }),
        });
        setEditId(null);
        setEditSaving(false);
        fetchKeywords();
    };

    // Derived severity for display
    const currentSeverity = scoreToSeverity(newScore);

    return (
        <div className="space-y-4">
            {/* ── Add keyword form ── */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5 text-violet-400" />
                        Add Custom Keyword
                    </p>
                    <SeverityBadge severity={currentSeverity} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-[11px] text-slate-500 uppercase tracking-wide">Word / Phrase</Label>
                        <Input
                            value={newWord}
                            onChange={(e) => { setNewWord(e.target.value); setAddError(""); }}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            placeholder='e.g. "trash", "you suck"'
                            className="bg-slate-900/80 border-slate-600/50 text-slate-200 placeholder-slate-600 h-9"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[11px] text-slate-500 uppercase tracking-wide">Severity Level</Label>
                        <Select
                            value={currentSeverity}
                            onValueChange={(v) => {
                                const opt = SEVERITY_OPTS.find(o => o.value === v);
                                if (opt) setNewScore(opt.score);
                            }}
                        >
                            <SelectTrigger className="bg-slate-900/80 border-slate-600/50 text-slate-200 h-9">
                                <SelectValue placeholder="Select Severity" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                {SEVERITY_OPTS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-slate-200 focus:bg-slate-700">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                opt.value === 'low' ? 'bg-yellow-400' :
                                                opt.value === 'medium' ? 'bg-orange-400' :
                                                opt.value === 'high' ? 'bg-red-400' : 'bg-rose-500'
                                            }`} />
                                            {opt.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Score slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-slate-500 uppercase tracking-wide">
                            Fine-tune Risk Score
                        </Label>
                        <span className="text-xs font-mono font-bold text-violet-400">{newScore}</span>
                    </div>

                    <div className="relative h-6 flex items-center">
                        <div className="absolute inset-0 h-1.5 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-rose-600 opacity-30" />
                        <input
                            type="range"
                            min={1}
                            max={100}
                            value={newScore}
                            onChange={(e) => setNewScore(Number(e.target.value))}
                            className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-violet-500 border-2 border-white rounded-full pointer-events-none shadow-lg shadow-violet-500/30 transition-all duration-75"
                            style={{ left: `calc(${((newScore - 1) / 99) * 100}% - 8px)` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                        <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
                    </div>
                </div>

                {addError && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5 bg-red-400/10 p-2 rounded border border-red-500/20">
                        <X className="w-3.5 h-3.5" /> {addError}
                    </p>
                )}

                <Button
                    onClick={handleAdd}
                    disabled={adding || !newWord.trim()}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white h-9 shadow-lg shadow-violet-600/20 transition-all active:scale-[0.98]"
                    size="sm"
                >
                    {adding
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />Adding…</>
                        : <><Plus className="w-3.5 h-3.5 mr-2" />Add Keyword</>}
                </Button>
            </div>

            {/* ── Keyword list ── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                        <Tags className="w-3.5 h-3.5" />
                        Custom Keywords ({keywords.length})
                    </p>
                    {loading && <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />}
                </div>

                {keywords.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-600 space-y-2 border border-dashed border-slate-700/40 rounded-xl bg-slate-800/20">
                        <Info className="w-5 h-5 opacity-20" />
                        <p className="text-sm">No custom keywords yet. Add one above.</p>
                    </div>
                )}

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {keywords.map((kw) => (
                        <div
                            key={kw._id}
                            className="group relative flex flex-col p-4 bg-slate-900/40 rounded-xl border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/40 transition-all"
                        >
                            {editId === kw._id ? (
                                /* ── inline edit mode ── */
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="flex gap-3">
                                        <Input
                                            value={editWord}
                                            onChange={(e) => setEditWord(e.target.value)}
                                            className="flex-1 bg-slate-900 border-slate-600 h-8 text-sm"
                                            autoFocus
                                        />
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                onClick={() => saveEdit(kw._id)}
                                                disabled={editSaving}
                                                className="h-8 bg-emerald-600 hover:bg-emerald-500 px-3"
                                            >
                                                {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={cancelEdit}
                                                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                            <span>Score: {editScore}</span>
                                            <SeverityBadge severity={scoreToSeverity(editScore)} />
                                        </div>
                                        <input
                                            type="range"
                                            min={1}
                                            max={100}
                                            value={editScore}
                                            onChange={(e) => setEditScore(Number(e.target.value))}
                                            className="w-full h-1.5 accent-violet-500 bg-slate-700 rounded-lg cursor-pointer"
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* ── list view mode ── */
                                <>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <code className="text-sm text-slate-100 font-mono font-bold bg-slate-800/80 px-2 py-0.5 rounded">
                                                    {kw.word}
                                                </code>
                                                <SeverityBadge severity={kw.severity} />
                                            </div>
                                            <ScoreBar score={kw.score} />
                                        </div>
                                        
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => startEdit(kw)}
                                                className="h-8 w-8 p-0 text-slate-500 hover:text-violet-400 hover:bg-violet-400/10"
                                                title="Edit"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setDeleteId(kw._id)}
                                                className="h-8 w-8 p-0 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Separator className="bg-slate-800" />
            <div className="flex items-start gap-2 p-3 bg-violet-600/5 rounded-lg border border-violet-500/10">
                <Info className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                    Custom keywords are merged with the built-in dictionary at scan time. 
                    If a custom word exists in both, <span className="text-violet-400 font-semibold">your score will override</span> the default.
                </p>
            </div>

            {/* Delete dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="bg-slate-900 border-slate-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-400">Remove Keyword?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This will remove <strong className="text-slate-200">&ldquo;{keywords.find(k => k._id === deleteId)?.word}&rdquo;</strong> from the detection dictionary. 
                            Future scans will no longer use this keyword.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white border-0">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
