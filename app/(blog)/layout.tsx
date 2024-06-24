import "../globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import {
  VisualEditing,
  toPlainText,
  type PortableTextBlock,
} from "next-sanity";
import { Inter } from "next/font/google";
import { draftMode } from "next/headers";
import { Suspense } from "react";

import AlertBanner from "./alert-banner";
import PortableText from "./portable-text";

import type { SettingsQueryResult } from "@/sanity.types";
import * as demo from "@/sanity/lib/demo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { settingsQuery } from "@/sanity/lib/queries";
import { resolveOpenGraphImage } from "@/sanity/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch<SettingsQueryResult>({
    query: settingsQuery,
    // Metadata should never contain stega
    stega: false,
  });
  const title = settings?.title || demo.title;
  const description = settings?.description || demo.description;

  const ogImage = resolveOpenGraphImage(settings?.ogImage);
  let metadataBase: URL | undefined = undefined;
  try {
    metadataBase = settings?.ogImage?.metadataBase
      ? new URL(settings.ogImage.metadataBase)
      : undefined;
  } catch {
    // ignore
  }
  return {
    metadataBase,
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: toPlainText(description),
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

async function Footer() {
  const data = await sanityFetch<SettingsQueryResult>({
    query: settingsQuery,
  });
  const footer = data?.footer || [];

  return (
    <footer className="bg-accent border-secondary mx-auto">
      {footer.length > 0 ? (
        <PortableText
          className="prose-sm text-secondary bottom-0 w-full max-w-none bg-background py-12 text-center"
          value={footer as PortableTextBlock[]}
        />
      ) : (
        <div className="flex flex-col items-center py-28 lg:flex-row">
          <h3 className="mb-10 text-center text-4xl font-bold leading-tight tracking-tighter lg:mb-0 lg:w-1/2 lg:pr-4 lg:text-left lg:text-5xl">
            Built with Next.js.
          </h3>
          <div className="flex flex-col items-center justify-center lg:w-1/2 lg:flex-row lg:pl-4">
            <a
              href="https://nextjs.org/docs"
              className="mx-3 mb-6 border border-primary bg-primary py-3 px-12 font-bold text-background transition-colors duration-200 hover:bg-background hover:text-primary lg:mb-0 lg:px-8"
            >
              Read Documentation
            </a>
            <a
              href="https://github.com/vercel/next.js/tree/canary/examples/cms-sanity"
              className="mx-3 font-bold hover:underline"
            >
              View on GitHub
            </a>
          </div>
        </div>
      )}
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} bg-background text-text`}>
      <body>
        <section className="min-h-screen">
          {draftMode().isEnabled && <AlertBanner />}
          <main>{children}</main>
          <Suspense>
            <Footer />
          </Suspense>
        </section>
        {draftMode().isEnabled && <VisualEditing />}
        <SpeedInsights />
      </body>
    </html>
  );
}
