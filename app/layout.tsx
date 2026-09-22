import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, IBM_Plex_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import Script from "next/script";

import { SearchDialog } from "@/components/search-dialog";
import { SearchProvider } from "@/components/search-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSearchDocuments } from "@/lib/content";
import { THEME_KEY } from "@/lib/keys";

import "./globals.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Study Desk",
    template: "%s · Study Desk",
  },
  description:
    "Personal concept notes for the Burp Suite Certified Practitioner track and CompTIA Security+ (SY0-701 style). Lab drills stay with the coach.",
  authors: [{ name: "Jon Marien" }],
};

const themeBoot = `(()=>{try{var k=${JSON.stringify(THEME_KEY)};var t=localStorage.getItem(k);if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  const documents = getSearchDocuments();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Script id="theme-boot" strategy="beforeInteractive">
          {themeBoot}
        </Script>
        <SearchProvider documents={documents}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-card focus:px-3 focus:py-2"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            {children}
          </main>
          <SiteFooter />
          <SearchDialog />
        </SearchProvider>
      </body>
    </html>
  );
}
