"use client";

import CodeRunner from "@/components/code-runner";
import SyntaxHighlighter from "@/components/syntax-highlighter";
import { extractFirstCodeBlock, splitByFirstCodeFence } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Chat, Message } from "./page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import PreviewSkeleton from "@/components/preview-skeleton";
import { usePathname } from "next/navigation";

export default function CodeViewer({
  chat,
  streamText,
  message,
  onMessageChange,
  activeTab,
  onTabChange,
  onClose,
}: {
  chat: Chat;
  streamText: string;
  message?: Message;
  onMessageChange: (v: Message) => void;
  activeTab: string;
  onTabChange: (v: "code" | "preview") => void;
  onClose: () => void;
}) {
  const app = message ? extractFirstCodeBlock(message.content) : undefined;
  const streamAppParts = splitByFirstCodeFence(streamText);
  const streamApp = streamAppParts.find(
    (p) =>
      p.type === "first-code-fence-generating" || p.type === "first-code-fence"
  );
  const streamAppIsGenerating = streamAppParts.some(
    (p) => p.type === "first-code-fence-generating"
  );
  const codeScrollRef = useRef<HTMLDivElement>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const code = streamApp ? streamApp.content : app?.code || "";
  const language = streamApp ? streamApp.language : app?.language || "";
  const title = streamApp ? streamApp.filename.name : app?.filename?.name || "";
  const layout = ["python", "ts", "js", "javascript", "typescript"].includes(
    language
  )
    ? "two-up"
    : "tabbed";

  const assistantMessages = chat.messages.filter((m) => m.role === "assistant");
  const currentVersion = streamApp
    ? assistantMessages.length
    : message
      ? assistantMessages.map((m) => m.id).indexOf(message.id)
      : 1;
  const previousMessage =
    currentVersion !== 0 ? assistantMessages.at(currentVersion - 1) : undefined;
  const nextMessage =
    currentVersion < assistantMessages.length
      ? assistantMessages.at(currentVersion + 1)
      : undefined;

  const [refresh, setRefresh] = useState(0);

  const pathname = usePathname();

  const handleShare = async () => {
    if (!message) return;
    setShowShareDialog(true);
  };

  const handleCopyLink = async () => {
    if (!message) return;

    const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL || window?.location?.origin}${pathname}`;
    const shareUrl = new URL(`/share/${message.id}`, baseUrl);

    await navigator.clipboard.writeText(shareUrl.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    toast({
      title: "لینک کپی شد!",
      description: "لینک اشتراک‌گذاری در کلیپ‌بورد کپی شد.",
    });
  };

  // Auto-scroll when code is being generated or content changes
  useEffect(() => {
    const scrollElement = codeScrollRef.current;
    if (!scrollElement) return;

    const scrollToBottom = () => {
      if (scrollElement) {
        scrollElement.style.scrollBehavior = "smooth";
        const scrollHeight = scrollElement.scrollHeight;
        const clientHeight = scrollElement.clientHeight;
        const currentScroll = scrollElement.scrollTop;

        // Only auto-scroll if we're already near the bottom or if code is being generated
        const isNearBottom =
          scrollHeight - (currentScroll + clientHeight) < 100;
        if (streamAppIsGenerating || isNearBottom) {
          scrollElement.scrollTop = scrollHeight;
        }
      }
    };

    scrollElement.style.scrollBehavior = "smooth";
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => {
      clearTimeout(timeoutId);
      if (scrollElement) {
        scrollElement.style.scrollBehavior = "auto";
      }
    };
  }, [streamAppIsGenerating, code]); // Trigger on both streaming state and code changes

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between glass-panel border-b px-4 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:flex hidden text-foreground/60 hover:text-foreground/90 rounded-xl"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">بستن</span>
          </Button>
          <h2 className="text-sm font-medium">
            {title} نسخه {currentVersion + 1}
          </h2>
        </div>
        {layout === "tabbed" && (
          <div className="flex glass-panel rounded-xl p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange("code")}
              className={cn(
                "h-7 px-5 rounded-lg text-xs transition-all duration-300",
                "hover:bg-white/5",
                activeTab === "code" &&
                  "bg-primary/20 text-primary hover:bg-primary/30"
              )}
            >
              کد
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange("preview")}
              className={cn(
                "h-7 px-5 rounded-lg text-xs transition-all duration-300",
                "hover:bg-white/5",
                activeTab === "preview" &&
                  "bg-primary/20 text-primary hover:bg-primary/30"
              )}
            >
              پیش‌نمایش
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden bg-background/30 backdrop-blur-md">
        {layout === "tabbed" ? (
          <div className="h-full">
            {activeTab === "code" ? (
              <div
                ref={codeScrollRef}
                className="h-full overflow-auto bg-neutral-950/70"
              >
                <SyntaxHighlighter code={code} language={language} />
              </div>
            ) : (
              <>
                {language && (
                  <div className="h-full p-4">
                    {streamAppIsGenerating ? (
                      <PreviewSkeleton />
                    ) : (
                      <div className="h-full glass-panel rounded-xl overflow-hidden">
                        <CodeRunner
                          language={language}
                          code={code}
                          key={refresh}
                          onError={(error) => {
                            const textArea = document.querySelector("textarea");
                            if (textArea) {
                              textArea.value = `این کد با خطای زیر مواجه شد. لطفاً آن را اصلاح کنید:\n\n${error}`;
                              textArea.focus();
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col lg:flex-row">
            <div className="h-1/2 lg:h-full lg:w-1/2">
              <div
                ref={codeScrollRef}
                className="h-full overflow-auto p-4 rounded-xl bg-neutral-950/70"
              >
                <SyntaxHighlighter code={code} language={language} />
              </div>
            </div>
            <div className="flex h-1/2 lg:h-full lg:w-1/2 flex-col">
              <div className="glass-panel border-t lg:border-t-0 lg:border-l px-4 py-3 text-sm font-medium">
                خروجی
              </div>
              <div className="flex-1 overflow-auto glass-panel">
                {streamAppIsGenerating ? (
                  <PreviewSkeleton />
                ) : (
                  <CodeRunner
                    language={language}
                    code={code}
                    key={refresh}
                    onError={(error) => {
                      const textArea = document.querySelector("textarea");
                      if (textArea) {
                        textArea.value = `این کد با خطای زیر مواجه شد. لطفاً آن را اصلاح کنید:\n\n${error}`;
                        textArea.focus();
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-14 shrink-0 items-center justify-between glass-panel border-t px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRefresh((r) => r + 1)}
            className="rounded-xl hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">بازنشانی</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="rounded-xl hover:bg-white/5"
          >
            <Share2 className="h-4 w-4" />
            <span className="sr-only">اشتراک‌گذاری</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => previousMessage && onMessageChange(previousMessage)}
            disabled={!previousMessage}
            className="rounded-xl hover:bg-white/5 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">نسخه قبلی</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => nextMessage && onMessageChange(nextMessage)}
            disabled={!nextMessage}
            className="rounded-xl hover:bg-white/5 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">نسخه بعدی</span>
          </Button>
        </div>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent
          aria-describedby={undefined}
          className="glass-panel sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>اشتراک‌گذاری کد</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Button
              className={cn(
                "glass-panel-hover flex-1 text-sm",
                copied && "bg-primary/20 text-primary"
              )}
              onClick={handleCopyLink}
            >
              {copied ? "کپی شد!" : "کپی لینک"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
