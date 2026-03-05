import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import { analyzeText } from "@/lib/detection";
import { getSettings } from "@/models/Settings";
import Keyword from "@/models/Keyword";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const severity = searchParams.get("severity");
        const platform = searchParams.get("platform");
        const flagged = searchParams.get("flagged");
        const reviewed = searchParams.get("reviewed");
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: Record<string, any> = {};
        if (severity && severity !== "all") filter.severity = severity;
        if (platform && platform !== "all") filter.platform = platform;
        if (flagged === "true") filter.flagged = true;
        if (reviewed === "true") filter.reviewed = true;
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) filter.createdAt.$lte = new Date(to);
        }

        const total = await Comment.countDocuments(filter);
        const comments = await Comment.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return NextResponse.json({ comments, total, page, limit });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { text, platform, username } = body;
        if (!text || typeof text !== "string") {
            return NextResponse.json({ error: "text is required" }, { status: 400 });
        }

        // Load settings + custom DB keywords in parallel
        const [settings, customKeywords] = await Promise.all([
            getSettings(),
            Keyword.find().lean(),
        ]);

        // Build extra words map from DB keywords
        const extraWords: Record<string, number> = {};
        for (const kw of customKeywords) {
            extraWords[kw.word] = kw.score;
        }

        const result = analyzeText(text, extraWords);
        const comment = await Comment.create({
            text,
            platform: platform || "Other",
            username: username || "Anonymous",
            score: result.score,
            severity: result.severity,
            matchedWords: result.matchedWords,
            highlightedText: result.highlightedText,
            flagged: settings.autoFlag && result.score >= settings.flagThreshold,
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

