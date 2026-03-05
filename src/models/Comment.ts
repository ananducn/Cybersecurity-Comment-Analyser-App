import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  text: string;
  platform: string;
  username: string;
  score: number;
  severity: "safe" | "low" | "medium" | "high" | "severe";
  matchedWords: string[];
  highlightedText: string;
  flagged: boolean;
  reviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    text: { type: String, required: true },
    platform: {
      type: String,
      enum: [
        "Twitter",
        "Instagram",
        "YouTube",
        "TikTok",
        "Reddit",
        "Facebook",
        "Other",
      ],
      default: "Other",
    },
    username: { type: String, default: "Anonymous" },
    score: { type: Number, default: 0, min: 0, max: 100 },
    severity: {
      type: String,
      enum: ["safe", "low", "medium", "high", "severe"],
      default: "safe",
    },
    matchedWords: [{ type: String }],
    highlightedText: { type: String, default: "" },
    flagged: { type: Boolean, default: false },
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
