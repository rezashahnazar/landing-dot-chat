import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import { IRANYekan } from "@/fonts/local-fonts";
import "./globals.css";

let title = "Landing.Chat - ساخت لندینگ با هوش مصنوعی";
let description = "ساخت لندینگ با هوش مصنوعی";
let url = "https://landing.chat/";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${IRANYekan.variable} dark antialiased`}
    >
      <head>
        <PlausibleProvider domain="landing.chat" />
      </head>
      <body
        className={`${IRANYekan.className} flex min-h-[100dvh] flex-col bg-background text-foreground dark antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
