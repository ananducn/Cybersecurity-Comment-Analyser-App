import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import SidebarLayout from "../components/SidebarLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CyberGuard — Cyberbullying Detection Platform",
  description: "Real-time social media comment scanning for cyberbullying using AI-powered keyword and fuzzy matching detection.",
  keywords: ["cyberbullying", "detection", "social media", "toxicity", "admin panel"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-slate-950 text-slate-200 min-h-screen`}>
        <Providers>
          <SidebarLayout>
            {children}
          </SidebarLayout>
        </Providers>
      </body>
    </html>
  );
}
