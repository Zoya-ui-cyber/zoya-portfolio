import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const bodyFont = Geist({
  subsets: ["latin"],
  variable: "--font-body-loaded",
});

const metaFont = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-meta-loaded",
});

export const metadata: Metadata = {
  title: "Zina Yin — Portfolio",
  description:
    "Architecture, Spatial Design, Digital Practice and Visual Work by Zina Yin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${bodyFont.variable} ${metaFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}