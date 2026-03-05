"use client";

import {
    ResponsiveContainer,
    Tooltip,
    Cell,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Legend,
} from "recharts";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => (i < 12 ? `${i}am` : i === 12 ? "12pm" : `${i - 12}pm`));

function getHeatColor(count: number, max: number) {
    if (count === 0) return "#1e293b";
    const ratio = count / max;
    if (ratio < 0.2) return "#312e81";
    if (ratio < 0.4) return "#4c1d95";
    if (ratio < 0.6) return "#7c3aed";
    if (ratio < 0.8) return "#c026d3";
    return "#e11d48";
}

interface HeatmapEntry { _id: { hour: number; day: number }; count: number; avgScore: number }

export function ToxicityHeatmap({ data }: { data: HeatmapEntry[] }) {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    const max = data.reduce((m, d) => Math.max(m, d.count), 0) || 1;

    for (const d of data) {
        const day = d._id.day - 1;
        const hour = d._id.hour;
        if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
            grid[day][hour] = d.count;
        }
    }

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[600px]">
                <div className="flex gap-1 mb-1 ml-10">
                    {HOURS.map((h, i) => (
                        <div key={i} className="flex-1 text-center text-[9px] text-slate-500 min-w-[18px]">
                            {i % 4 === 0 ? h : ""}
                        </div>
                    ))}
                </div>
                {grid.map((row, day) => (
                    <div key={day} className="flex gap-1 mb-1 items-center">
                        <div className="w-8 text-right text-xs text-slate-500 mr-1 shrink-0">{DAYS[day]}</div>
                        {row.map((count, hour) => (
                            <div
                                key={hour}
                                className="flex-1 h-5 rounded-sm cursor-pointer transition-transform hover:scale-110 min-w-[18px]"
                                style={{ backgroundColor: getHeatColor(count, max) }}
                                title={`${DAYS[day]} ${HOURS[hour]}: ${count} comments`}
                            />
                        ))}
                    </div>
                ))}
                <div className="flex items-center gap-2 mt-3 ml-10">
                    <span className="text-xs text-slate-500">Low</span>
                    {["#1e293b", "#312e81", "#4c1d95", "#7c3aed", "#c026d3", "#e11d48"].map((c) => (
                        <div key={c} className="w-5 h-3 rounded-sm" style={{ backgroundColor: c }} />
                    ))}
                    <span className="text-xs text-slate-500">High</span>
                </div>
            </div>
        </div>
    );
}

interface DailyEntry {
    _id: string;
    safe: number;
    low: number;
    medium: number;
    high: number;
    severe: number;
    total: number;
}

export function DailyTrendChart({ data }: { data: DailyEntry[] }) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    {[
                        { id: "gSevere", color: "#e11d48" },
                        { id: "gHigh", color: "#ef4444" },
                        { id: "gMedium", color: "#f97316" },
                        { id: "gLow", color: "#eab308" },
                        { id: "gSafe", color: "#10b981" },
                    ].map(({ id, color }) => (
                        <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="_id" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} />
                <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#94a3b8" }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Area type="monotone" dataKey="severe" stackId="1" stroke="#e11d48" fill="url(#gSevere)" name="Severe" />
                <Area type="monotone" dataKey="high" stackId="1" stroke="#ef4444" fill="url(#gHigh)" name="High" />
                <Area type="monotone" dataKey="medium" stackId="1" stroke="#f97316" fill="url(#gMedium)" name="Medium" />
                <Area type="monotone" dataKey="low" stackId="1" stroke="#eab308" fill="url(#gLow)" name="Low" />
                <Area type="monotone" dataKey="safe" stackId="1" stroke="#10b981" fill="url(#gSafe)" name="Safe" />
            </AreaChart>
        </ResponsiveContainer>
    );
}

interface SeverityStat { _id: string; count: number }

const SEVERITY_COLORS: Record<string, string> = {
    safe: "#10b981", low: "#eab308", medium: "#f97316", high: "#ef4444", severe: "#e11d48",
};

export function SeverityPieChart({ data }: { data: SeverityStat[] }) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                >
                    {data.map((entry) => (
                        <Cell key={entry._id} fill={SEVERITY_COLORS[entry._id] || "#6366f1"} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number, name: string) => [v, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Legend
                    formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                    wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

interface TopWord { _id: string; count: number }

export function TopWordsChart({ data }: { data: TopWord[] }) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} />
                <YAxis type="category" dataKey="_id" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} width={90} />
                <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#94a3b8" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Occurrences">
                    {data.map((_, i) => (
                        <Cell key={i} fill={`hsl(${280 - i * 15}, 70%, 55%)`} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

interface PlatformStat { _id: string; count: number }

export function PlatformBarChart({ data }: { data: PlatformStat[] }) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="_id" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} />
                <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" name="Comments" radius={[4, 4, 0, 0]}>
                    {data.map((_, i) => (
                        <Cell key={i} fill={`hsl(${220 + i * 20}, 65%, 55%)`} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
