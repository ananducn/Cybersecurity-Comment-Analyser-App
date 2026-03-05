import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Keyword, { scoreToSeverity } from "@/models/Keyword";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const { word, score } = await req.json();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const update: Record<string, any> = {};
        if (word !== undefined) update.word = word.trim().toLowerCase();
        if (score !== undefined) {
            update.score = score;
            update.severity = scoreToSeverity(score);
        }

        const updated = await Keyword.findByIdAndUpdate(id, update, { new: true });
        if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(updated);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        await Keyword.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
