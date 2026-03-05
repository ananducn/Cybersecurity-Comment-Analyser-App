"use client";

import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import { LayoutDashboard } from "lucide-react";

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-violet-600/20 border border-violet-500/30 rounded-lg flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-xs text-slate-500">Toxicity analytics and heatmap visualization</p>
        </div>
      </div>
      <Dashboard refreshKey={refreshKey} />
    </div>
  );
}
