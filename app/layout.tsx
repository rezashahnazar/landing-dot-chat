import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import { IRANYekan } from "@/fonts/local-fonts";
import "./globals.css";

let title = "LeelE Coder - تولید صفحه وب با هوش مصنوعی";
let description = "تولید صفحه وب با هوش مصنوعی";
let url = "https://www.digikala.com/";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
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
        <PlausibleProvider domain="www.digikala.com" />
      </head>
      <body
        className={`${IRANYekan.className} flex min-h-[100dvh] flex-col bg-background text-foreground dark antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
