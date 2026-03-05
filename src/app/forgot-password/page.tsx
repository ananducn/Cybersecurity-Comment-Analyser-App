"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, AlertCircle, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setSuccess("If that email exists, a reset link has been sent!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />

            <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-300">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-violet-600/10">
                        <Mail className="w-6 h-6 text-violet-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white tracking-tight">Forgot Password?</CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your email to receive a recovery link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus:ring-violet-500"
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
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>

                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-white transition-colors pt-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </form>
                    ) : (
                        <div className="space-y-6 text-center py-4">
                            <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                <Shield className="w-5 h-5" />
                                <p className="font-medium">{success}</p>
                            </div>
                            <Link href="/login">
                                <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-300">
                                    Return to Login
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
