import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Geist } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const display = Manrope({
  subsets: ["latin"],
  variable: "--font-display"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "Graphify Atlas",
  description: "A cinematic knowledge workspace for Graphify-powered documents, images, tables, and evidence."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" className={cn(display.variable, mono.variable, "font-sans", geist.variable)}>
      <body className="min-h-screen font-[var(--font-display)]">{children}</body>
    </html>
  );
}
