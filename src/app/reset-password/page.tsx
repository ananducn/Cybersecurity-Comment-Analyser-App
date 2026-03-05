"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, AlertCircle, KeyRound, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to reset password");
            }

            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <Card className="w-full max-w-md bg-slate-900 border-slate-800">
                <CardHeader className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <CardTitle className="text-white">Invalid Request</CardTitle>
                    <CardDescription>Missing or invalid reset token.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/login" className="w-full">
                        <Button className="w-full">Back to Login</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-300">
            <CardHeader className="space-y-2 text-center">
                <div className="mx-auto w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-violet-600/10">
                    <KeyRound className="w-6 h-6 text-violet-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-white tracking-tight">Set New Password</CardTitle>
                <CardDescription className="text-slate-400">
                    Create a strong, new password for your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" title="New Password" className="text-slate-300">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Min. 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-slate-200 focus:ring-violet-500"
                                required
                                minLength={8}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" title="Confirm Password" className="text-slate-300">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repeat new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-slate-200 focus:ring-violet-500"
                                required
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold h-11 transition-all active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center py-6 space-y-4">
                        <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Password Updated!</h3>
                        <p className="text-slate-400 text-sm">
                            Your password has been successfully reset. Redirecting you to login...
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />
            <Suspense fallback={
                <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 animate-pulse">
                    <div className="h-[400px]" />
                </Card>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
