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
    <header className="sticky top-0 z-50 w-full border-b glass">
      <div className="flex h-14 px-4 items-center w-full justify-between">
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

        {isChatPage && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary/80"
              >
                <Share2 className="h-4 w-4" />
                <span className="sr-only">اشتراک‌گذاری</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>اشتراک‌گذاری لینک</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2 mt-4">
                <div
                  onClick={handleCopyLink}
                  className="flex-1 p-2 border rounded-md cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  {window.location.href}
                </div>
                <Button onClick={handleCopyLink} variant="secondary">
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
