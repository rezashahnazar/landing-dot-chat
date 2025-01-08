"use client";

import CodeRunner from "@/components/code-runner";
import SyntaxHighlighter from "@/components/syntax-highlighter";
import { extractFirstCodeBlock, splitByFirstCodeFence } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { StickToBottom } from "use-stick-to-bottom";
import { X, ChevronLeft, ChevronRight, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Chat, Message } from "./page";

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

  // Auto-scroll when code is being generated
  useEffect(() => {
    if (streamAppIsGenerating && codeScrollRef.current) {
      codeScrollRef.current.scrollTop = codeScrollRef.current.scrollHeight;
    }
  }, [streamAppIsGenerating, code]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">بستن</span>
          </Button>
          <h2 className="text-sm font-medium">
            {title} نسخه {currentVersion + 1}
          </h2>
        </div>
        {layout === "tabbed" && (
          <div className="flex rounded-lg border p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange("code")}
              className={cn(
                "h-7 w-16 rounded-sm text-xs",
                activeTab === "code" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              کد
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange("preview")}
              className={cn(
                "h-7 w-16 rounded-sm text-xs",
                activeTab === "preview" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              پیش‌نمایش
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {layout === "tabbed" ? (
          <div ref={codeScrollRef} className="h-full overflow-y-auto">
            {activeTab === "code" ? (
              <div className="relative h-full">
                <SyntaxHighlighter code={code} language={language} />
              </div>
            ) : (
              <>
                {language && (
                  <div className="flex h-full items-center justify-center">
                    <CodeRunner language={language} code={code} key={refresh} />
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div ref={codeScrollRef} className="h-1/2 overflow-y-auto">
              <SyntaxHighlighter code={code} language={language} />
            </div>
            <div className="flex h-1/2 flex-col">
              <div className="border-t px-4 py-3 text-sm font-medium">
                خروجی
              </div>
              <div className="flex grow items-center justify-center border-t">
                {!streamAppIsGenerating && (
                  <CodeRunner language={language} code={code} key={refresh} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-14 shrink-0 items-center justify-between border-t px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setRefresh((r) => r + 1)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>بازنشانی</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            disabled={!message || !!streamApp}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>اشتراک‌گذاری</span>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!previousMessage}
            onClick={() => previousMessage && onMessageChange(previousMessage)}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">نسخه قبلی</span>
          </Button>

          <p className="text-sm">
            نسخه <span className="tabular-nums">{currentVersion + 1}</span>{" "}
            <span className="text-muted-foreground">از</span>{" "}
            <span className="tabular-nums">
              {Math.max(currentVersion + 1, assistantMessages.length)}
            </span>
          </p>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!nextMessage}
            onClick={() => nextMessage && onMessageChange(nextMessage)}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">نسخه بعدی</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
