"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/reset-password";

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950">
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar with responsive classes */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 h-screen transform transition-transform duration-300 md:relative md:translate-x-0 md:z-0",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <Sidebar onClose={() => setIsMobileOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-md md:hidden shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-white tracking-tight">CyberGuard</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="text-slate-400 hover:text-white"
                    >
                        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

// Re-using the Shield icon and cn utility
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
