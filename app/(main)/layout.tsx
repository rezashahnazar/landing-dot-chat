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
      <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background/95 to-background relative">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none" />
        <Header />
        <main className="flex-1 relative">
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.05),rgba(255,255,255,0))] pointer-events-none" />
          {children}
        </main>
        <Toaster />
      </div>
    </Providers>
  );
}
