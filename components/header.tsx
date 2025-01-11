"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AnimatedLogo from "@/components/icons/animated-logo";

export default function Header() {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/chats/");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || window?.location?.origin}${pathname}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95">
      <div className="flex h-14 px-4 items-center w-full justify-between mx-auto">
        <div className="flex items-center gap-2"></div>

        <Link dir="ltr" href="/" className="scale-in group">
          <div className="flex items-center gap-2 relative group perspective-[1000px]">
            <AnimatedLogo
              className="h-8 w-8 transform transition-all duration-700 
              group-hover:rotate-12 group-hover:scale-110 
              relative after:absolute after:inset-0 after:bg-black/10 after:blur-lg after:opacity-0 
              group-hover:after:opacity-100 after:transition-opacity after:duration-700
              [&_rect]:group-hover:opacity-100"
            />
            <span
              className="tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60 hover:from-primary/90 hover:via-primary/70 hover:to-primary/50 transition-all duration-700 transform hover:scale-105 hover:rotate-1 
              after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-primary/80 after:to-primary/40 after:transition-all after:duration-700 hover:after:w-full
              before:absolute before:-z-10 before:left-0 before:top-0 before:h-full before:w-full before:opacity-0 before:blur-xl before:bg-gradient-to-r before:from-primary/20 before:to-primary/10 hover:before:opacity-100 before:transition-all before:duration-700"
            >
              <span className="inline-flex items-center translate-y-1">
                <span className="text-lg font-bold text-primary/80 italic hover:text-primary transition-colors duration-700">
                  Landing
                </span>
                <span className="h-1.5 w-1.5 bg-primary/80 rounded-full ml-3 mr-1 animate-[pulse_1.4s_ease-in-out_infinite]"></span>
                <span className="inline-flex items-center">
                  <span className="text-base font-light text-primary/80 animate-[pulse_1.4s_ease-in-out_infinite]">
                    Chat
                  </span>
                </span>
              </span>
            </span>
            <div className="absolute -z-10 inset-0 bg-gradient-radial from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
          </div>
        </Link>
      </div>
    </header>
  );
}
