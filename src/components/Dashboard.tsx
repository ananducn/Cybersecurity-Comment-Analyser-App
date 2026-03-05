"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToxicityHeatmap, DailyTrendChart, SeverityPieChart, TopWordsChart, PlatformBarChart } from "@/components/Charts";
import { Shield, AlertTriangle, Eye, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Stats {
    severity: Array<{ _id: string; count: number; avgScore: number }>;
    platform: Array<{ _id: string; count: number }>;
    daily: Array<{ _id: string; safe: number; low: number; medium: number; high: number; severe: number; total: number }>;
    topWords: Array<{ _id: string; count: number }>;
    totals: { total: number; flagged: number; reviewed: number; avgScore: number };
    heatmap: Array<{ _id: { hour: number; day: number }; count: number; avgScore: number }>;
}

const STAT_CARDS = [
    {
        key: "total" as const,
        label: "Total Comments",
        icon: Activity,
        color: "text-violet-400",
        bg: "from-violet-500/10 to-transparent",
        border: "border-violet-500/20",
    },
    {
        key: "flagged" as const,
        label: "Flagged",
        icon: AlertTriangle,
        color: "text-red-400",
        bg: "from-red-500/10 to-transparent",
        border: "border-red-500/20",
    },
    {
        key: "reviewed" as const,
        label: "Reviewed",
        icon: Eye,
        color: "text-emerald-400",
        bg: "from-emerald-500/10 to-transparent",
        border: "border-emerald-500/20",
    },
    {
        key: "avgScore" as const,
        label: "Avg Risk Score",
        icon: TrendingUp,
        color: "text-orange-400",
        bg: "from-orange-500/10 to-transparent",
        border: "border-orange-500/20",
        format: (v: number) => v.toFixed(1),
    },
];

export default function Dashboard({ refreshKey }: { refreshKey: number }) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/stats");
            const data = await res.json();
            setStats(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, [refreshKey]);

    if (loading) {
        return (
            <div className="grid grid-cols-4 gap-4 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 bg-slate-800/40 rounded-xl border border-slate-700/30" />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_CARDS.map(({ key, label, icon: Icon, color, bg, border, format: fmt }) => (
                    <Card key={key} className={`bg-slate-900/60 border backdrop-blur-sm bg-gradient-to-br ${bg} ${border}`}>
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                                    <p className={`text-3xl font-bold ${color}`}>
                                        {fmt ? fmt(stats.totals[key] as number) : stats.totals[key]}
                                    </p>
                                </div>
                                <div className={`p-2 rounded-lg bg-slate-800/50`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Heatmap */}
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-violet-400" />
                            Activity Heatmap — Comments by Hour & Day
                        </CardTitle>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={fetchStats}
                            className="h-7 px-2 text-slate-500 hover:text-slate-200"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ToxicityHeatmap data={stats.heatmap} />
                </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-200">Daily Comment Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DailyTrendChart data={stats.daily} />
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-200">Severity Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SeverityPieChart data={stats.severity} />
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-200">Top Harmful Words</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TopWordsChart data={stats.topWords} />
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-200">Comments by Platform</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PlatformBarChart data={stats.platform} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
