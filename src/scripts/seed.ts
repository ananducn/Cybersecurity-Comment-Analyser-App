import mongoose from "mongoose";
import { connectDB } from "../lib/mongodb";
import User from "../models/User";
import Keyword from "../models/Keyword";
import Comment from "../models/Comment";
import Settings from "../models/Settings";
import bcrypt from "bcryptjs";

const SAMPLE_KEYWORDS = [
    { word: "idiot", score: 45, severity: "low" },
    { word: "hate", score: 60, severity: "medium" },
    { word: "stupid", score: 40, severity: "low" },
    { word: "garbage", score: 35, severity: "low" },
    { word: "kill", score: 95, severity: "severe" },
    { word: "die", score: 90, severity: "severe" },
    { word: "ugly", score: 50, severity: "medium" },
    { word: "loser", score: 55, severity: "medium" },
    { word: "shut up", score: 30, severity: "low" },
    { word: "trash", score: 40, severity: "low" },
];

const SAMPLE_COMMENTS = [
    {
        text: "You are the most amazing person ever!",
        platform: "Instagram",
        username: "kind_soul",
        score: 0,
        severity: "safe",
        flagged: false,
        reviewed: true,
    },
    {
        text: "I really hate how you handled that, such an idiot.",
        platform: "Twitter",
        username: "angry_user99",
        score: 65,
        severity: "medium",
        matchedWords: ["hate", "idiot"],
        highlightedText: "I really <span class='bg-orange-500/30 text-orange-200 px-1 rounded'>hate</span> how you handled that, such an <span class='bg-yellow-500/30 text-yellow-200 px-1 rounded'>idiot</span>.",
        flagged: true,
        reviewed: false,
    },
    {
        text: "You should just die, nobody likes you.",
        platform: "TikTok",
        username: "troll_master",
        score: 92,
        severity: "severe",
        matchedWords: ["die"],
        highlightedText: "You should just <span class='bg-red-500/30 text-red-200 px-1 rounded'>die</span>, nobody likes you.",
        flagged: true,
        reviewed: false,
    },
    {
        text: "This video is trash and you are a loser.",
        platform: "YouTube",
        username: "critic44",
        score: 55,
        severity: "medium",
        matchedWords: ["trash", "loser"],
        highlightedText: "This video is <span class='bg-yellow-500/30 text-yellow-200 px-1 rounded'>trash</span> and you are a <span class='bg-orange-500/30 text-orange-200 px-1 rounded'>loser</span>.",
        flagged: true,
        reviewed: true,
    },
    {
        text: "Stop being so stupid, shut up already.",
        platform: "Reddit",
        username: "grumpy_guy",
        score: 42,
        severity: "low",
        matchedWords: ["stupid", "shut up"],
        highlightedText: "Stop being so <span class='bg-yellow-500/30 text-yellow-200 px-1 rounded'>stupid</span>, <span class='bg-yellow-500/30 text-yellow-200 px-1 rounded'>shut up</span> already.",
        flagged: false,
        reviewed: false,
    }
];

async function seed() {
    try {
        console.log("Connecting to database...");
        await connectDB();

        console.log("Clearing existing data...");
        await Promise.all([
            User.deleteMany({}),
            Keyword.deleteMany({}),
            Comment.deleteMany({}),
            Settings.deleteMany({}),
        ]);

        console.log("Seeding admin user...");
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await User.create({
            name: "System Admin",
            email: "admin@example.com",
            password: hashedPassword,
            role: "admin",
        });

        console.log("Seeding keywords...");
        await Keyword.insertMany(SAMPLE_KEYWORDS);

        console.log("Seeding settings...");
        await Settings.create({
            flagThreshold: 60,
            fuzzyEnabled: true,
            autoFlag: true,
        });

        console.log("Seeding comments...");
        // Add some random dates to comments for charts
        const now = new Date();
        const commentsWithDates = SAMPLE_COMMENTS.map((c, i) => ({
            ...c,
            createdAt: new Date(now.getTime() - (i * 24 * 60 * 60 * 1000 + Math.random() * 1000000)),
        }));
        await Comment.insertMany(commentsWithDates);

        console.log("Database seeded successfully! 🌱");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
