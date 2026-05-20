import type { Metadata } from "next";
import "./globals.css";
import { LanguageThemeProvider } from "@/components/shared/language-theme-provider";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { SupportButton } from "@/components/public/support-button";
import { NoticeBar } from "@/components/public/notice-bar";
import { getActiveNotices, getSiteSettings } from "@/lib/db";

export const metadata = {
  title: "Elevated Library",
  description: "Premium PDF library for Bangladeshi learners",
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
