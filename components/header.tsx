"use client";
import Link from "next/link";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { GithubIcon, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/chats/");

  return (
    <header className="sticky top-0 z-50 w-full border-b glass">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="scale-in">
              {isChatPage ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-secondary/80"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">بازگشت به صفحه اصلی</span>
                </Button>
              ) : (
                <span className="text-lg font-semibold tracking-tight text-primary hover:text-primary/90 transition-all duration-300">
                  LeelE Coder
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
