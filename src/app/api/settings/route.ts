import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Settings, { getSettings } from "@/models/Settings";

export async function GET() {
    await connectDB();
    const settings = await getSettings();
    return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
    await connectDB();
    const body = await req.json();

    // Only allow known fields
    const allowed = ["flagThreshold", "fuzzyEnabled", "autoFlag"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = {};
    for (const key of allowed) {
        if (key in body) update[key] = body[key];
    }

    const doc = await Settings.findOneAndUpdate({}, update, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
    });
    return NextResponse.json(doc);
}
