"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import {
    Settings,
    Database,
    Play,
    Trash2,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    Shield,
    Zap,
    BookOpen,
    Save,
    Loader2,
    Tags,
} from "lucide-react";
import { HARMFUL_WORDS } from "@/lib/detection";
import KeywordManager from "@/components/KeywordManager";

interface AppSettings {
    flagThreshold: number;
    fuzzyEnabled: boolean;
    autoFlag: boolean;
}

export default function AdminPage() {
    // ── DB Settings ──────────────────────────────────────────────
    const [settings, setSettings] = useState<AppSettings>({
        flagThreshold: 50,
        fuzzyEnabled: true,
        autoFlag: true,
    });
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveOk, setSaveOk] = useState(false);

    const loadSettings = useCallback(async () => {
        setSettingsLoading(true);
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    flagThreshold: data.flagThreshold,
                    fuzzyEnabled: data.fuzzyEnabled,
                    autoFlag: data.autoFlag,
                });
            }
        } finally {
            setSettingsLoading(false);
        }
    }, []);

    useEffect(() => { loadSettings(); }, [loadSettings]);

    const saveSettings = async () => {
        setSaving(true);
        setSaveOk(false);
        try {
            const res = await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                setSaveOk(true);
                setTimeout(() => setSaveOk(false), 2500);
            }
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings((s) => ({ ...s, [key]: value }));
    };

    // ── Seed / Clear ─────────────────────────────────────────────
    const [seeding, setSeeding] = useState(false);
    const [seedResult, setSeedResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null);
    const [confirmClear, setConfirmClear] = useState(false);
    const [clearing, setClearing] = useState(false);

    const handleSeed = async () => {
        setSeeding(true);
        setSeedResult(null);
        try {
            const res = await fetch("/api/seed", { method: "POST" });
            const data = await res.json();
            setSeedResult(data);
        } catch (e) {
            setSeedResult({ error: String(e) });
        } finally {
            setSeeding(false);
        }
    };

    const handleClear = async () => {
        setClearing(true);
        try {
            const res = await fetch("/api/comments?limit=1000");
            const data = await res.json();
            await Promise.all(
                (data.comments || []).map((c: { _id: string }) =>
                    fetch(`/api/comments/${c._id}`, { method: "DELETE" })
                )
            );
        } finally {
            setClearing(false);
            setConfirmClear(false);
        }
    };

    // ── Word list ─────────────────────────────────────────────────
    const wordsByCategory = {
        severe: Object.entries(HARMFUL_WORDS).filter(([, v]) => v >= 90),
        high: Object.entries(HARMFUL_WORDS).filter(([, v]) => v >= 70 && v < 90),
        medium: Object.entries(HARMFUL_WORDS).filter(([, v]) => v >= 40 && v < 70),
        low: Object.entries(HARMFUL_WORDS).filter(([, v]) => v < 40),
    };

    const CATEGORY_STYLE = {
        severe: "bg-rose-500/15 text-rose-400 border-rose-500/25",
        high: "bg-red-500/15 text-red-400 border-red-500/25",
        medium: "bg-orange-500/15 text-orange-400 border-orange-500/25",
        low: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
    } as const;

    const CATEGORY_LABEL = {
        severe: "Severe (90–100)",
        high: "High (70–89)",
        medium: "Medium (40–69)",
        low: "Low (< 40)",
    } as const;

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-600/20 border border-violet-500/30 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Settings</h1>
                    <p className="text-xs text-slate-500">Detection settings, word dictionary, and database controls</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Database Controls ── */}
                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                            <Database className="w-4 h-4 text-blue-400" />
                            Database Controls
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Seed */}
                        <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30 space-y-2">
                            <p className="text-xs text-slate-400 font-medium">Seed Sample Data</p>
                            <p className="text-[11px] text-slate-500">
                                Populate the database with 20 sample comments across platforms and severity levels.
                                Existing data will be cleared first.
                            </p>
                            <Button
                                onClick={handleSeed}
                                disabled={seeding}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-2"
                                size="sm"
                            >
                                {seeding
                                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />Seeding...</>
                                    : <><Play className="w-3.5 h-3.5 mr-2" />Seed Database</>}
                            </Button>
                            {seedResult && (
                                <div className={`flex items-center gap-2 text-xs mt-2 ${seedResult.success ? "text-emerald-400" : "text-red-400"}`}>
                                    {seedResult.success
                                        ? <><CheckCircle className="w-3.5 h-3.5" />{seedResult.count} comments seeded successfully!</>
                                        : <><AlertTriangle className="w-3.5 h-3.5" />{seedResult.error}</>}
                                </div>
                            )}
                        </div>

                        {/* Clear */}
                        <div className="p-4 bg-slate-800/40 rounded-lg border border-red-500/10 space-y-2">
                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                Clear All Data
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Permanently delete all comments. This cannot be undone.
                            </p>
                            <Button
                                onClick={() => setConfirmClear(true)}
                                variant="outline"
                                size="sm"
                                disabled={clearing}
                                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 mt-2"
                            >
                                {clearing
                                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />Clearing...</>
                                    : <><Trash2 className="w-3.5 h-3.5 mr-2" />Clear All Comments</>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Detection Settings ── */}
                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                Detection Settings
                            </CardTitle>
                            {settingsLoading && <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Fuzzy Matching */}
                        <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                            <div>
                                <Label className="text-sm text-slate-200 cursor-pointer" htmlFor="fuzzy-toggle">
                                    Fuzzy Matching
                                </Label>
                                <p className="text-[11px] text-slate-500 mt-0.5">Enable Fuse.js approximate text matching</p>
                            </div>
                            <Switch
                                id="fuzzy-toggle"
                                checked={settings.fuzzyEnabled}
                                onCheckedChange={(v) => updateSetting("fuzzyEnabled", v)}
                                disabled={settingsLoading}
                            />
                        </div>

                        {/* Auto-Flag */}
                        <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                            <div>
                                <Label className="text-sm text-slate-200 cursor-pointer" htmlFor="autoflag-toggle">
                                    Auto-Flag High Risk
                                </Label>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Automatically flag new comments that exceed the threshold
                                </p>
                            </div>
                            <Switch
                                id="autoflag-toggle"
                                checked={settings.autoFlag}
                                onCheckedChange={(v) => updateSetting("autoFlag", v)}
                                disabled={settingsLoading}
                            />
                        </div>

                        {/* Flag Threshold slider */}
                        <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm text-slate-200">Flag Threshold</Label>
                                <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded px-2 py-0.5">
                                    {settings.flagThreshold} / 100
                                </span>
                            </div>

                            {/* Colour gradient track */}
                            <div className="relative">
                                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 via-orange-500 to-rose-600 opacity-40" />
                                <input
                                    type="range"
                                    min={10}
                                    max={90}
                                    step={5}
                                    value={settings.flagThreshold}
                                    onChange={(e) => updateSetting("flagThreshold", Number(e.target.value))}
                                    disabled={settingsLoading}
                                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
                                />
                                {/* Thumb indicator */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-violet-500 border-2 border-white rounded-full shadow-lg shadow-violet-500/40 pointer-events-none transition-all"
                                    style={{ left: `calc(${((settings.flagThreshold - 10) / 80) * 100}% - 8px)` }}
                                />
                            </div>

                            <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                                <span>10 — Lenient</span>
                                <span>50 — Balanced</span>
                                <span>90 — Strict</span>
                            </div>

                            <p className="text-[11px] text-slate-500">
                                Comments scoring ≥ <span className="text-violet-400 font-semibold">{settings.flagThreshold}</span> will be auto-flagged for review.
                                {settings.flagThreshold < 30 && (
                                    <span className="text-yellow-400 ml-1">⚠ Very low — many safe comments may be flagged.</span>
                                )}
                                {settings.flagThreshold > 70 && (
                                    <span className="text-orange-400 ml-1">⚠ High — only severe comments will be flagged.</span>
                                )}
                            </p>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "Fuzzy Threshold", value: "0.30", color: "text-blue-400" },
                                { label: "Min Word Length", value: "3 chars", color: "text-emerald-400" },
                                { label: "Keyword Dictionary", value: `${Object.keys(HARMFUL_WORDS).length} words`, color: "text-violet-400" },
                                { label: "Severity Levels", value: "5 tiers", color: "text-orange-400" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/20">
                                    <p className="text-[10px] text-slate-500">{label}</p>
                                    <p className={`text-sm font-semibold ${color}`}>{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Save button */}
                        <Button
                            onClick={saveSettings}
                            disabled={saving || settingsLoading}
                            className="w-full bg-violet-600 hover:bg-violet-500 text-white"
                            size="sm"
                        >
                            {saving
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />Saving…</>
                                : saveOk
                                    ? <><CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-400" />Saved!</>
                                    : <><Save className="w-3.5 h-3.5 mr-2" />Save Settings</>}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* ── Custom Keywords ── */}
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <Tags className="w-4 h-4 text-violet-400" />
                        Custom Keyword Dictionary
                        <span className="ml-auto text-[10px] font-normal text-slate-500">Merged with built-in words at scan time</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <KeywordManager />
                </CardContent>
            </Card>

            {/* ── Built-in Word Dictionary ── */}
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        Harmful Word Dictionary
                        <Badge className="ml-auto bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                            {Object.keys(HARMFUL_WORDS).length} terms
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(["severe", "high", "medium", "low"] as const).map((cat) => (
                        <div key={cat}>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-3 h-3 text-slate-500" />
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                    {CATEGORY_LABEL[cat]}
                                </span>
                                <Separator className="flex-1 bg-slate-800" />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {wordsByCategory[cat].map(([word, score]) => (
                                    <div
                                        key={word}
                                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono ${CATEGORY_STYLE[cat]}`}
                                    >
                                        <span>{word}</span>
                                        <span className="opacity-40 text-[9px]">·{score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Confirm Clear Dialog */}
            <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
                <AlertDialogContent className="bg-slate-900 border-slate-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-200">Clear All Comments?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This will permanently delete all comments from the database. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleClear} className="bg-red-600 hover:bg-red-500 text-white">
                            Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
