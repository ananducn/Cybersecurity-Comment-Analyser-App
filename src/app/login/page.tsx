"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, AlertCircle } from "lucide-react";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("signup") === "success") {
            setSuccess("Account created successfully! Please sign in.");
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-300">
            <CardHeader className="space-y-2 text-center">
                <div className="mx-auto w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-violet-600/20">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white tracking-tight">Welcome Back</CardTitle>
                <CardDescription className="text-slate-400">
                    Secure access to CyberGuard Admin
                </CardDescription>
            </CardHeader>
            <CardContent>
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
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" title="Password" className="text-slate-300">Password</Label>
                            <Link
                                href="/forgot-password"
                                className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-slate-800/50 border-slate-700 text-slate-200 focus:ring-violet-500"
                            required
                        />
                    </div>

                    {success && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-in fade-in duration-300">
                            <Shield className="w-4 h-4 shrink-0" />
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in shake duration-300">
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
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...</>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center space-y-3">
                    <p className="text-sm text-slate-500">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                            Sign Up
                        </Link>
                    </p>
                    <p className="text-[10px] text-slate-600">
                        Protected by industry-standard encryption
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />
            <Suspense fallback={
                <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 animate-pulse">
                    <div className="h-[400px]" />
                </Card>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
