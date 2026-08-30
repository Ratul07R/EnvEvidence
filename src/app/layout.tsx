import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://envevidence.com";

export const metadata: Metadata = {
  title: {
    default: "EnvEvidence — Environmental Evidence & Intelligence",
    template: "%s | EnvEvidence",
  },
  description:
    "Explore the environmental evidence behind every place. Evidence-backed environmental intelligence with transparent sources, confidence levels, provenance, and data gaps.",
  keywords: [
    "environmental intelligence",
    "environmental evidence",
    "water quality",
    "air quality",
    "PM2.5",
    "microplastics",
    "environmental data",
    "evidence-backed",
    "data provenance",
    "environmental monitoring",
    "pollution data",
    "data gaps",
    "environmental research",
  ],
  authors: [{ name: "EnvEvidence" }],
  creator: "EnvEvidence",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "EnvEvidence — Environmental Evidence & Intelligence",
    description:
      "Explore the environmental evidence behind every place. Evidence-backed intelligence with full provenance.",
    type: "website",
    siteName: "EnvEvidence",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "EnvEvidence — Environmental Evidence & Intelligence",
    description:
      "Explore the environmental evidence behind every place with evidence-backed data.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-primary focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
