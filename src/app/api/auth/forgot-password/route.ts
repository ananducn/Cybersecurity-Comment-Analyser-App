import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email });

        if (!user) {
            // Return success even if user not found for security reasons
            return NextResponse.json({ message: "If account exists, recovery email sent" });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

        // Send email via Resend if configured
        if (resend) {
            try {
                await resend.emails.send({
                    from: "CyberGuard <onboarding@resend.dev>", // Replace with your verified domain in production
                    to: user.email,
                    subject: "Reset your CyberGuard password",
                    html: `
                        <div style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; border-radius: 12px;">
                            <h2 style="color: #8b5cf6;">CyberGuard Recovery</h2>
                            <p>You requested a password reset. Click the button below to set a new password:</p>
                            <a href="${resetUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Reset Password</a>
                            <p style="color: #94a3b8; font-size: 14px;">This link will expire in 1 hour.</p>
                            <hr style="border: none; border-top: 1px solid #1e293b; margin: 20px 0;" />
                            <p style="color: #475569; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
                        </div>
                    `,
                });
                console.log(`Email successfully sent to ${user.email} via Resend.`);
            } catch (emailErr) {
                console.error("Resend error:", emailErr);
            }
        }

        // Always log to console as fallback/debug
        console.log(`--- PASSWORD RESET REQUEST ---`);
        console.log(`User: ${user.email}`);
        console.log(`Link: ${resetUrl}`);
        console.log(`------------------------------`);

        return NextResponse.json({ message: "If account exists, recovery email sent" });

    } catch (err: any) {
        return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
    }
}
