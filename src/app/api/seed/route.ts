import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import { analyzeText } from "@/lib/detection";

const sampleComments = [
    { text: "You are such an idiot, nobody likes you!", platform: "Twitter", username: "user123" },
    { text: "Great post! Really helpful content here.", platform: "Instagram", username: "user456" },
    { text: "This is so dumb, shut up already", platform: "YouTube", username: "gamer99" },
    { text: "Kill yourself loser, you are worthless", platform: "Twitter", username: "troll42" },
    { text: "Loved your video, keep it up!", platform: "YouTube", username: "fan2024" },
    { text: "You are so ugly and disgusting omg", platform: "TikTok", username: "anon1" },
    { text: "What a pathetic attempt at humor lmao", platform: "Reddit", username: "reddit_user" },
    { text: "Nice work on this project!", platform: "Other", username: "dev_one" },
    { text: "You stupid moron, go die!", platform: "Facebook", username: "angry_guy" },
    { text: "Such a boring and lame video", platform: "YouTube", username: "subscriber1" },
    { text: "Interesting perspective on the topic.", platform: "Reddit", username: "thinker1" },
    { text: "You are a worthless nobody and a freak", platform: "Instagram", username: "bully99" },
    { text: "Amazing work, this is really cool!", platform: "Twitter", username: "fan_art" },
    { text: "This cringe content needs to stop", platform: "TikTok", username: "critical1" },
    { text: "Everyone hates you, just give up already", platform: "Facebook", username: "mean_user" },
    { text: "I hate you so much, you are the worst", platform: "Twitter", username: "hater1" },
    { text: "Kys you absolute moron", platform: "YouTube", username: "troll_acc" },
    { text: "Thanks for sharing this information", platform: "Reddit", username: "curious1" },
    { text: "Such a weirdo, nobody wants you around", platform: "Instagram", username: "exclude1" },
    { text: "Great content as always, subscribed!", platform: "YouTube", username: "loyal_fan" },
];

export async function POST() {
    try {
        await connectDB();
        await Comment.deleteMany({});

        const now = new Date();
        const docs = sampleComments.map((c, i) => {
            const result = analyzeText(c.text);
            const date = new Date(now.getTime() - i * 3600 * 1000 * Math.random() * 48);
            return {
                ...c,
                score: result.score,
                severity: result.severity,
                matchedWords: result.matchedWords,
                highlightedText: result.highlightedText,
                flagged: result.score >= 50,
                reviewed: i % 4 === 0,
                createdAt: date,
                updatedAt: date,
            };
        });

        await Comment.insertMany(docs);
        return NextResponse.json({ success: true, count: docs.length });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
