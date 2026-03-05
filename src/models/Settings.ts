import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
    flagThreshold: number;
    fuzzyEnabled: boolean;
    autoFlag: boolean;
}

const SettingsSchema = new Schema<ISettings>(
    {
        flagThreshold: { type: Number, default: 50, min: 10, max: 90 },
        fuzzyEnabled: { type: Boolean, default: true },
        autoFlag: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Settings: Model<ISettings> =
    mongoose.models.Settings ||
    mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;

/** Always returns the single settings document, creating it if absent. */
export async function getSettings(): Promise<ISettings> {
    let doc = await Settings.findOne();
    if (!doc) doc = await Settings.create({});
    return doc;
}
