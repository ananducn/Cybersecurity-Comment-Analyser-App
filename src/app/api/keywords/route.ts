import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Keyword, { scoreToSeverity } from "@/models/Keyword";

export async function GET() {
    try {
        await connectDB();
        const keywords = await Keyword.find().sort({ score: -1 }).lean();
        return NextResponse.json(keywords);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { word, score } = await req.json();

        if (!word || typeof word !== "string" || !word.trim()) {
            return NextResponse.json({ error: "word is required" }, { status: 400 });
        }
        if (typeof score !== "number" || score < 0 || score > 100) {
            return NextResponse.json({ error: "score must be 0–100" }, { status: 400 });
        }

        const severity = scoreToSeverity(score);
        const keyword = await Keyword.create({
            word: word.trim().toLowerCase(),
            score,
            severity,
        });
        return NextResponse.json(keyword, { status: 201 });
    } catch (err: unknown) {
        const msg = String(err);
        if (msg.includes("duplicate key") || msg.includes("E11000")) {
            return NextResponse.json({ error: "This keyword already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
