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
      className={`min-h-[100dvh] ${IRANYekan.variable}`}
    >
      <head>
        <PlausibleProvider domain="digikala.com" />
      </head>
      {children}
    </html>
  );
}
