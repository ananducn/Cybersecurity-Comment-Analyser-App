import mongoose, { Schema, Document, Model } from "mongoose";

export interface IKeyword extends Document {
    word: string;
    score: number;
    severity: "safe" | "low" | "medium" | "high" | "severe";
    createdAt: Date;
    updatedAt: Date;
}

const KeywordSchema = new Schema<IKeyword>(
    {
        word: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        score: { type: Number, required: true, min: 0, max: 100 },
        severity: {
            type: String,
            enum: ["safe", "low", "medium", "high", "severe"],
            required: true,
        },
    },
    { timestamps: true }
);

const Keyword: Model<IKeyword> =
    mongoose.models.Keyword ||
    mongoose.model<IKeyword>("Keyword", KeywordSchema);

export default Keyword;

/** Severity → default representative score */
export const SEVERITY_DEFAULT_SCORE: Record<string, number> = {
    safe: 0,
    low: 25,
    medium: 55,
    high: 80,
    severe: 95,
};

/** Score → severity bucket */
export function scoreToSeverity(score: number): IKeyword["severity"] {
    if (score === 0) return "safe";
    if (score < 30) return "low";
    if (score < 55) return "medium";
    if (score < 75) return "high";
    return "severe";
}
