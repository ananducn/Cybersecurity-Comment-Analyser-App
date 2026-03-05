"use client";

import { useState } from "react";
import CommentsTable from "@/components/CommentsTable";
import { MessageSquare } from "lucide-react";

export default function CommentsPage() {
    const [refreshKey] = useState(0);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-600/20 border border-violet-500/30 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Comments</h1>
                    <p className="text-xs text-slate-500">Browse, filter, and manage all scanned comments</p>
                </div>
            </div>
            <CommentsTable refreshKey={refreshKey} />
        </div>
    );
}
