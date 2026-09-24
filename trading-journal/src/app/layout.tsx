import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading Journal",
  description: "A premium journal for funded traders.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-xl">
          <div className="flex items-center gap-6 text-sm">
            <a
              href="/dashboard"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              Dashboard
            </a>
            <a
              href="/log-trade"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              Log Trade
            </a>
            <a
              href="/journal"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              Journal
            </a>
            <a
              href="/playbook"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              Playbook
            </a>
          </div>
        </nav>

        {/* Padding-top so content doesn't hide behind the fixed nav */}
        <div className="flex-1 pt-16">{children}</div>
      </body>
    </html>
  );
}