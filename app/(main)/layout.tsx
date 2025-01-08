import Providers from "@/app/(main)/providers";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/header";
import { IRANYekan } from "@/fonts/local-fonts";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <body
        className={`${IRANYekan.className} flex min-h-full flex-col bg-secondary/30 text-foreground font-iranyekan antialiased`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Toaster />
      </body>
    </Providers>
  );
}
