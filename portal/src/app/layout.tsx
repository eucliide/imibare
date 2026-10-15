import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "eCunga — Your money, in one hub",
  description: "Two apps. One hub. Track your trades and manage your budget.",
  openGraph: {
    title: "eCunga — Your money, in one hub",
    description: "Two apps. One hub. Track your trades and manage your budget.",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "eCunga — Two apps. One hub.",
      },
    ],
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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
