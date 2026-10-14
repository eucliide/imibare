import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "Calendar-first budgeting for people who care about their money.",
  openGraph: {
    title: "Budget Tracker",
    description: "Calendar-first budgeting for people who care about their money.",
    type: "website",
  },
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Nav />
        <div className="flex-1 pt-16">{children}</div>
      </body>
    </html>
  );
}
