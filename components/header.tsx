"use client";
import Link from "next/link";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { GithubIcon, ArrowRight, Share2 } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function Header() {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/chats/");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-[12px] backdrop-saturate-[1.8] supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 px-4 items-center w-full justify-between max-w-screen-2xl mx-auto">
        <Link href="/" className="scale-in group">
          {isChatPage ? (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary/80 transition-all duration-300 ease-out"
            >
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-x-0.5" />
              <span className="sr-only">بازگشت به صفحه اصلی</span>
            </Button>
          ) : (
            <span className="text-lg font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/90 hover:to-primary/70 transition-all duration-500">
              LeelE Coder
            </span>
          )}
        </Link>

        {isChatPage && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary/80 transition-all duration-300 ease-out group"
              >
                <Share2 className="h-4 w-4 transition-transform duration-300 ease-out group-hover:scale-110" />
                <span className="sr-only">اشتراک‌گذاری</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md backdrop-blur-xl bg-background/95">
              <DialogHeader>
                <DialogTitle className="text-xl">اشتراک‌گذاری لینک</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2 mt-4">
                <div
                  onClick={handleCopyLink}
                  className="flex-1 p-2 border rounded-md cursor-pointer hover:bg-secondary/80 transition-all duration-300 ease-out overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {window.location.href}
                </div>
                <Button
                  onClick={handleCopyLink}
                  variant="secondary"
                  className="min-w-[80px] transition-all duration-300 ease-out"
                >
                  {copied ? "کپی شد!" : "کپی"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </header>
  );
}
