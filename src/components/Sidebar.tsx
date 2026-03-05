"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    Shield,
    LayoutDashboard,
    MessageSquare,
    Search,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User as UserIcon,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/scan", label: "Scan", icon: Search },
    { href: "/comments", label: "Comments", icon: MessageSquare },
    { href: "/admin", label: "Settings", icon: Settings },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
    const path = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { data: session } = useSession();

    return (
        <aside
            className={cn(
                "relative flex flex-col h-full bg-slate-900 border-r border-slate-800 shadow-[20px_0_50px_rgba(0,0,0,0.3)] transition-all duration-300 shrink-0 z-50",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo & Top Toggle */}
            <div className={cn("flex items-center justify-between px-4 py-6 border-b border-slate-800/60", collapsed && "justify-center px-2")}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl flex items-center justify-center shrink-0 shadow-xl shadow-violet-900/40">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <p className="text-sm font-bold text-white leading-none tracking-tight">CyberGuard</p>
                            <p className="text-[10px] text-violet-400 font-medium leading-none mt-1.5 uppercase tracking-widest">Platform</p>
                        </div>
                    )}
                </div>

                {/* Secondary inside toggle (Desktop) / Close button (Mobile) */}
                <div className="flex items-center gap-1">
                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-slate-200 transition-all md:block hidden border border-slate-700/50"
                            title="Collapse sidebar"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    )}

                    {/* Mobile close button - only shows in mobile drawer */}
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 md:hidden block border border-slate-700/50"
                        id="mobile-sidebar-close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Nav Section */}
            <div className="flex-1 px-3 py-6 overflow-y-auto overflow-x-hidden space-y-1.5 custom-scrollbar">
                {NAV.map(({ href, label, icon: Icon }) => {
                    const active = path === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all group relative overflow-hidden",
                                active
                                    ? "bg-violet-600/15 text-violet-400 ring-1 ring-violet-500/30"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40",
                                collapsed && "justify-center px-0 w-10 mx-auto"
                            )}
                            title={collapsed ? label : undefined}
                        >
                            <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110", active ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300")} />
                            {!collapsed && <span className="truncate">{label}</span>}
                            {active && !collapsed && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-violet-500 rounded-l-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Footer Section (User & Version) */}
            <div className="mt-auto border-t border-slate-800/60 p-4 space-y-4 bg-slate-900/50">
                {session?.user && (
                    <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "px-1")}>
                        <Avatar className="w-9 h-9 border-2 border-slate-800 shadow-lg shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-bold">
                                {session.user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                        {!collapsed && (
                            <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <p className="text-sm font-semibold text-slate-100 truncate">{session.user.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">{(session.user as any).role || "Admin"}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className={cn(
                            "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group",
                            collapsed && "justify-center px-0 w-10 mx-auto"
                        )}
                        title={collapsed ? "Logout" : undefined}
                    >
                        <LogOut className="w-4.5 h-4.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                        {!collapsed && <span>Logout</span>}
                    </button>

                    {!collapsed && (
                        <div className="text-center pt-2">
                            <p className="text-[9px] text-slate-600 font-medium tracking-tight uppercase opacity-50">v1.2.0 · Secure Environment</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main floating toggle (desktop only) */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                    "absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-slate-900 border border-slate-800 rounded-full hidden md:flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-violet-400 shadow-[10px_0_20px_rgba(0,0,0,0.2)] transition-all z-20 group/handle",
                )}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <div className="flex flex-col items-center gap-1">
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </div>
            </button>
        </aside>
    );
}
