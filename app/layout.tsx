import type { Metadata } from "next";
import { Fraunces, Public_Sans, Fragment_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AppShell } from "./arena/app-shell";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const publicSans = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const fragmentMono = Fragment_Mono({
  variable: "--font-metric",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenArena",
  description:
    "Send one prompt, watch up to three AI models answer at once, and vote for the best one.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${publicSans.variable} ${fragmentMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <AppShell>{children}</AppShell>
        </ClerkProvider>
      </body>
    </html>
  );
}
