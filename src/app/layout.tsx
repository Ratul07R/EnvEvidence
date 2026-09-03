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
    "Evidence-backed environmental intelligence platform. Explore real environmental data from reliable sources with transparent provenance, confidence levels, and documented data gaps. Water quality, air quality, climate, and research intelligence.",
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
    "climate data",
    "sustainability data",
  ],
  authors: [{ name: "EnvEvidence" }],
  creator: "EnvEvidence",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "EnvEvidence — Environmental Evidence & Intelligence",
    description:
      "Evidence-backed environmental intelligence with transparent sources, confidence levels, and documented data gaps. Real data for water quality, air quality, climate, and environmental research.",
    type: "website",
    siteName: "EnvEvidence",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "EnvEvidence — Environmental Evidence & Intelligence",
    description:
      "Evidence-backed environmental intelligence with transparent sources, confidence levels, and documented data gaps.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.svg",
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
