"use client";

import type { Chat, Message } from "./page";
import { splitByFirstCodeFence } from "@/lib/utils";
import Markdown from "react-markdown";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const SCROLL_BUTTON_THRESHOLD = 200;

export default function ChatLog({
  chat,
  activeMessage,
  streamText,
  onMessageClick,
}: {
  chat: Chat;
  activeMessage?: Message;
  streamText: string;
  onMessageClick: (v: Message) => void;
}) {
  const assistantMessages = chat.messages.filter((m) => m.role === "assistant");
  const parts = splitByFirstCodeFence(streamText);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Show planning text if we have any text content before code blocks
  const planningPart = parts.find((part) => part.type === "text");
  const hasCodePart = parts.some(
    (part) =>
      part.type === "first-code-fence" ||
      part.type === "first-code-fence-generating"
  );

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    let ticking = false;

    const handleScroll = () => {
      console.log("Scroll event fired");
      if (!ticking) {
        requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } = scrollElement;
          const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
          setShowScrollButton(distanceFromBottom > SCROLL_BUTTON_THRESHOLD);
          console.log("Distance from bottom:", distanceFromBottom);
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (!streamText || !lastMessageRef.current) return;
    lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
  }, [streamText]);

  return (
    <div className="flex-1 overflow-hidden relative w-full h-full">
      <div
        ref={scrollRef}
        className="mx-auto flex w-full max-w-3xl flex-col pt-4 overflow-y-auto overflow-x-hidden h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <UserMessage content={chat.prompt} />

        {chat.messages.slice(2).map((message) => (
          <div key={message.id}>
            {message.role === "user" ? (
              <UserMessage content={message.content} />
            ) : (
              <AssistantMessage
                content={message.content}
                version={
                  assistantMessages.map((m) => m.id).indexOf(message.id) + 1
                }
                message={message}
                isActive={!streamText && activeMessage?.id === message.id}
                onMessageClick={onMessageClick}
              />
            )}
          </div>
        ))}

        {streamText && (
          <div ref={lastMessageRef}>
            {planningPart && (
              <div className="bg-gradient-to-[135deg] from-white/[0.02] to-white/[0.005] backdrop-blur-2xl border border-white/[0.03] shadow-[0_12px_36px_rgba(0,0,0,0.2),inset_0_0_1px_1px_rgba(255,255,255,0.03)] rounded-2xl p-5 my-4 animate-message-slide-in origin-center hover:-translate-y-0.5 hover:scale-[1.002] hover:shadow-[0_20px_48px_rgba(0,0,0,0.25),inset_0_0_1px_1px_rgba(255,255,255,0.07)]">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span>در حال برنامه‌ریزی...</span>
                </div>
                <Markdown
                  className="prose prose-neutral max-w-none text-right text-sm text-foreground/90 dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mt-6 mb-4 text-lg font-bold first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mt-4 mb-2 text-base font-semibold">
                        {children}
                      </h2>
                    ),
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-3 list-disc pr-6 last:mb-0">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-3 list-decimal pr-6 last:mb-0">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="mb-1 last:mb-0">{children}</li>
                    ),
                  }}
                >
                  {planningPart.content}
                </Markdown>
              </div>
            )}
            {hasCodePart && (
              <AssistantMessage
                content={streamText}
                version={assistantMessages.length + 1}
                isActive={true}
                skipInitialText={true}
              />
            )}
          </div>
        )}
      </div>

      {showScrollButton && (
        <Button
          onClick={() =>
            lastMessageRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          variant="outline"
          size="lg"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 !z-[100] flex items-center justify-center shadow-lg bg-background/50 text-foreground/50 !size-10 m-0 p-0 rounded-full animate-bounce"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="bg-gradient-to-[135deg] from-primary/20 to-primary/5 backdrop-blur-2xl border border-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.1),0_0_0_1px_hsl(var(--primary)/0.2)] rounded-2xl p-5 my-4 animate-message-slide-in origin-center hover:-translate-y-0.5 hover:scale-[1.002] hover:shadow-[0_12px_36px_rgba(0,0,0,0.2),inset_0_0_0_1px_rgba(255,255,255,0.12),0_0_0_1px_rgba(255,255,255,0.08)] flex items-start gap-3 text-right">
      <div className="mt-1 size-2 rotate-45 rounded-sm bg-primary/80" />
      <div className="text-foreground/90">{content}</div>
    </div>
  );
}

function AssistantMessage({
  content,
  version,
  message,
  isActive,
  skipInitialText = false,
  onMessageClick = () => {},
}: {
  content: string;
  version: number;
  message?: Message;
  isActive?: boolean;
  skipInitialText?: boolean;
  onMessageClick?: (v: Message) => void;
}) {
  const parts = splitByFirstCodeFence(content);

  return (
    <div className="bg-gradient-to-[135deg] from-secondary/25 to-secondary/8 backdrop-blur-2xl border border-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.1),0_0_0_1px_hsl(var(--secondary)/0.2)] rounded-2xl p-5 my-4 animate-message-slide-in origin-center hover:-translate-y-0.5 hover:scale-[1.002] hover:shadow-[0_12px_36px_rgba(0,0,0,0.2),inset_0_0_0_1px_rgba(255,255,255,0.12),0_0_0_1px_rgba(255,255,255,0.08)]">
      {!skipInitialText &&
        parts.map((part, i) => (
          <div key={i}>
            {part.type === "text" && (
              <Markdown
                className="prose prose-neutral max-w-none text-right text-sm text-foreground/90 dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  h1: ({ children }) => (
                    <h1 className="mt-6 mb-4 text-lg font-bold first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mt-4 mb-2 text-base font-semibold">
                      {children}
                    </h2>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-3 list-disc pr-6 last:mb-0">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-3 list-decimal pr-6 last:mb-0">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="mb-1 last:mb-0">{children}</li>
                  ),
                }}
              >
                {part.content}
              </Markdown>
            )}
            {(part.type === "first-code-fence" ||
              part.type === "first-code-fence-generating") && (
              <div className="my-4">
                <button
                  disabled={part.type === "first-code-fence-generating"}
                  className={cn(
                    "bg-gradient-to-b from-white/[0.02] to-white/[0.01] backdrop-blur-2xl border border-white/[0.03] shadow-[0_8px_24px_rgba(0,0,0,0.2),inset_0_0_1px_1px_rgba(255,255,255,0.04)] inline-flex w-full items-center gap-3 rounded-xl p-3 transition-all duration-300",
                    part.type === "first-code-fence-generating"
                      ? "opacity-80"
                      : isActive
                        ? "bg-primary/10 border-primary/20"
                        : "",
                    "hover:shadow-[0_20px_48px_rgba(0,0,0,0.3),inset_0_0_1px_1px_rgba(255,255,255,0.07)] hover:-translate-y-0.5 active:translate-y-0 active:duration-200"
                  )}
                  onClick={() => message && onMessageClick(message)}
                >
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg font-medium backdrop-blur-sm",
                      part.type === "first-code-fence-generating"
                        ? "bg-muted-foreground/10 text-muted-foreground"
                        : isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-white/5 text-foreground/80"
                    )}
                  >
                    {version}
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    {part.type === "first-code-fence-generating" ? (
                      <div className="text-sm font-medium">در حال ساخت...</div>
                    ) : (
                      <>
                        <div className="text-sm font-medium">
                          {part.filename.name}{" "}
                          {version !== 1 && `نسخه ${version}`}
                        </div>
                      </>
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
