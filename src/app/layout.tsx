import type { Metadata } from "next";
import "./globals.css";
import { LanguageThemeProvider } from "@/components/shared/language-theme-provider";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { SupportButton } from "@/components/public/support-button";
import { NoticeBar } from "@/components/public/notice-bar";
import { getActiveNotices, getSiteSettings } from "@/lib/db";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Elevated Library",
    template: "%s | Elevated Library",
  },
  description:
    "Elevated Library is a premium Bangla-English PDF library for mindset, confidence, communication, relationship, discipline and self-growth resources.",
  keywords: [
    "Elevated Library",
    "Bangla PDF",
    "Self improvement PDF",
    "Mindset PDF",
    "Confidence PDF",
    "Communication PDF",
    "Relationship PDF",
    "Discipline PDF",
    "Bangladesh PDF store",
  ],
  authors: [{ name: "Elevated Library" }],
  creator: "Elevated Library",
  publisher: "Elevated Library",
  openGraph: {
    title: "Elevated Library",
    description:
      "Premium Bangla-English PDFs for self-growth, mindset, confidence, communication and discipline.",
    url: "/",
    siteName: "Elevated Library",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevated Library",
    description:
      "Premium Bangla-English PDFs for self-growth and personal development.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const notices = await getActiveNotices("top_bar");
  return (
    <html lang="bn" suppressHydrationWarning>
      <body>
        <LanguageThemeProvider>
          <NoticeBar notice={notices?.[0]} />
          <Header siteName={settings?.site_name || "Elevated Library"} />
          {children}
          <Footer settings={settings as any} />
          <SupportButton settings={settings as any} />
        </LanguageThemeProvider>
      </body>
    </html>
  );
}
