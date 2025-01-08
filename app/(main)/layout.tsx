import Providers from "@/app/(main)/providers";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/header";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <Header />
      <main className="flex-1">{children}</main>
      <Toaster />
    </Providers>
  );
}
