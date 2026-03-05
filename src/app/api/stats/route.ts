import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";

export async function GET() {
    try {
        await connectDB();

        const [severityStats, platformStats, dailyStats, topWords, totals] = await Promise.all([
            Comment.aggregate([
                { $group: { _id: "$severity", count: { $sum: 1 }, avgScore: { $avg: "$score" } } },
            ]),
            Comment.aggregate([
                { $group: { _id: "$platform", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            Comment.aggregate([
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                        },
                        safe: { $sum: { $cond: [{ $eq: ["$severity", "safe"] }, 1, 0] } },
                        low: { $sum: { $cond: [{ $eq: ["$severity", "low"] }, 1, 0] } },
                        medium: { $sum: { $cond: [{ $eq: ["$severity", "medium"] }, 1, 0] } },
                        high: { $sum: { $cond: [{ $eq: ["$severity", "high"] }, 1, 0] } },
                        severe: { $sum: { $cond: [{ $eq: ["$severity", "severe"] }, 1, 0] } },
                        total: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
                { $limit: 30 },
            ]),
            Comment.aggregate([
                { $unwind: "$matchedWords" },
                { $group: { _id: "$matchedWords", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),
            Comment.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        flagged: { $sum: { $cond: ["$flagged", 1, 0] } },
                        reviewed: { $sum: { $cond: ["$reviewed", 1, 0] } },
                        avgScore: { $avg: "$score" },
                    },
                },
            ]),
        ]);

        // Build heatmap data: hour x day-of-week
        const heatmapRaw = await Comment.aggregate([
            {
                $group: {
                    _id: {
                        hour: { $hour: "$createdAt" },
                        day: { $dayOfWeek: "$createdAt" },
                    },
                    count: { $sum: 1 },
                    avgScore: { $avg: "$score" },
                },
            },
        ]);

        return NextResponse.json({
            severity: severityStats,
            platform: platformStats,
            daily: dailyStats,
            topWords,
            totals: totals[0] || { total: 0, flagged: 0, reviewed: 0, avgScore: 0 },
            heatmap: heatmapRaw,
        });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
