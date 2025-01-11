"use client";

import type { Chat, Message } from "./page";
import { splitByFirstCodeFence } from "@/lib/utils";
import Markdown from "react-markdown";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const SCROLL_BUTTON_THRESHOLD = 200;

export default function ChatMessages({
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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Show planning text if we have any text content before code blocks
  const planningPart = parts.find((part) => part.type === "text");
  const codePart = parts.find(
    (part) =>
      part.type === "first-code-fence" ||
      part.type === "first-code-fence-generating"
  );
  const hasCodePart = !!codePart;
  const isGeneratingCode = codePart?.type === "first-code-fence-generating";

  // Get all text after the code block
  const afterCodeText = parts.reduce((acc, part, index) => {
    if (index > 0 && part.type === "text") {
      return acc + part.content;
    }
    return acc;
  }, "");

  // Auto-scroll when new messages are added
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Auto-scroll if user is already near the bottom (within 100px) or if this is a new message
    if (distanceFromBottom < 100 || chat.messages.length === 2) {
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: "smooth",
      });
      setShouldAutoScroll(true);
    }
  }, [chat.messages.length]);

  useEffect(() => {
    if (!streamText || !lastMessageRef.current || !scrollRef.current) return;

    const scrollElement = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Always scroll when stream starts (streamText was empty and now has content)
    // Or when already near bottom or after a new user message
    if (
      distanceFromBottom < 100 ||
      streamText.length === 1 ||
      shouldAutoScroll
    ) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamText, shouldAutoScroll]);

  // Reset shouldAutoScroll when streaming ends
  useEffect(() => {
    if (!streamText) {
      setShouldAutoScroll(false);
    }
  }, [streamText]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } = scrollElement;
          const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
          setShowScrollButton(distanceFromBottom > SCROLL_BUTTON_THRESHOLD);
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

  return (
    <div className="flex-1 overflow-hidden relative w-full h-full">
      <div
        ref={scrollRef}
        className="mx-auto flex w-full max-w-3xl flex-col pt-4 px-2 lg:px-0 overflow-y-auto overflow-x-hidden h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <UserMessage content={chat.prompt} />

        {chat.messages.slice(2).map((message) => (
          <div key={message.id} className="w-full">
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
          <div ref={lastMessageRef} className="w-full">
            {planningPart && (
              <div className="bg-gradient-to-[135deg] from-white/[0.02] to-white/[0.005] backdrop-blur-2xl border border-white/[0.03] shadow-[0_12px_36px_rgba(0,0,0,0.2),inset_0_0_1px_1px_rgba(255,255,255,0.03)] rounded-2xl p-3 lg:p-5 my-2 lg:my-4 animate-message-slide-in origin-center hover:-translate-y-0.5 hover:scale-[1.002] hover:shadow-[0_20px_48px_rgba(0,0,0,0.25),inset_0_0_1px_1px_rgba(255,255,255,0.07)]">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span>در حال برنامه‌ریزی...</span>
                </div>
                <Markdown
                  className="prose prose-neutral prose-p:text-[12px] prose-headings:text-[12px] prose-li:text-[12px] max-w-none text-right text-foreground/90 dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:leading-tight prose-li:leading-tight"
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mt-3 mb-2 text-[12px] font-bold first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mt-2 mb-1 text-[12px] font-semibold">
                        {children}
                      </h2>
                    ),
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-2 list-disc pr-5 last:mb-0">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-2 list-decimal pr-5 last:mb-0">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="mb-0.5 last:mb-0">{children}</li>
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
                isGenerating={isGeneratingCode}
              />
            )}
            {afterCodeText && (
              <div className="bg-gradient-to-[135deg] from-secondary/20 to-secondary/5 backdrop-blur-2xl border border-white/[0.03] shadow-[0_8px_16px_rgba(0,0,0,0.1)] rounded-2xl p-3 lg:p-4 my-2 animate-message-slide-in">
                <Markdown
                  className="prose prose-neutral prose-p:text-[12px] prose-headings:text-[12px] prose-li:text-[12px] max-w-none text-right text-foreground/80 dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:leading-tight prose-li:leading-tight"
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mt-3 mb-2 font-bold first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mt-2 mb-1 font-semibold">{children}</h2>
                    ),
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-2 list-disc pr-5 last:mb-0">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-2 list-decimal pr-5 last:mb-0">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="mb-0.5 last:mb-0">{children}</li>
                    ),
                  }}
                >
                  {afterCodeText}
                </Markdown>
              </div>
            )}
          </div>
        )}
      </div>

      {showScrollButton && (
        <Button
          onClick={() =>
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            })
          }
          variant="outline"
          size="lg"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 !z-[100] flex items-center justify-center shadow-lg bg-background/50 text-foreground/50 !size-10 m-0 p-0 rounded-full"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="bg-gradient-to-[135deg] from-primary/20 to-primary/5 backdrop-blur-2xl border border-white/[0.03] shadow-[0_8px_16px_rgba(0,0,0,0.1)] rounded-2xl p-3 lg:p-4 my-2 animate-message-slide-in">
      <Markdown
        className="prose prose-neutral prose-p:text-[12px] prose-headings:text-[12px] prose-li:text-[12px] max-w-none text-right text-foreground/90 dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:leading-tight prose-li:leading-tight"
        components={{
          h1: ({ children }) => (
            <h1 className="mt-3 mb-2 text-[12px] font-bold first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-2 mb-1 text-[12px] font-semibold">{children}</h2>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-2 list-disc pr-5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal pr-5 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="mb-0.5 last:mb-0">{children}</li>
          ),
        }}
      >
        {content}
      </Markdown>
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
  isGenerating = false,
}: {
  content: string;
  version: number;
  message?: Message;
  isActive?: boolean;
  skipInitialText?: boolean;
  onMessageClick?: (v: Message) => void;
  isGenerating?: boolean;
}) {
  const parts = splitByFirstCodeFence(content);
  const textPart = parts.find((part) => part.type === "text");
  const codePart = parts.find(
    (part) =>
      part.type === "first-code-fence" ||
      part.type === "first-code-fence-generating"
  );

  return (
    <div
      className={cn(
        "group relative my-2 lg:my-4 transition-all duration-300",
        isActive && "scale-[1.02]"
      )}
    >
      {!skipInitialText && textPart && (
        <div className="bg-gradient-to-[135deg] from-white/[0.02] to-white/[0.005] backdrop-blur-2xl border border-white/[0.03] shadow-[0_12px_36px_rgba(0,0,0,0.2),inset_0_0_1px_1px_rgba(255,255,255,0.03)] rounded-2xl p-3 lg:p-5 animate-message-slide-in">
          <Markdown
            className="prose prose-neutral prose-p:text-[12px] prose-headings:text-[12px] prose-li:text-[12px] max-w-none text-right text-foreground/90 dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:leading-tight prose-li:leading-tight"
            components={{
              h1: ({ children }) => (
                <h1 className="mt-3 mb-2 text-[12px] font-bold first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-2 mb-1 text-[12px] font-semibold">
                  {children}
                </h2>
              ),
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => (
                <ul className="mb-2 list-disc pr-5 last:mb-0">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-2 list-decimal pr-5 last:mb-0">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="mb-0.5 last:mb-0">{children}</li>
              ),
            }}
          >
            {textPart.content}
          </Markdown>
        </div>
      )}

      {codePart && (
        <div
          className={cn(
            "group relative mt-2 lg:mt-4 bg-gradient-to-[135deg] from-white/[0.02] to-white/[0.005] backdrop-blur-2xl border border-white/[0.03] shadow-[0_12px_36px_rgba(0,0,0,0.2),inset_0_0_1px_1px_rgba(255,255,255,0.03)] rounded-2xl p-3 lg:p-5 animate-message-slide-in",
            message &&
              "cursor-pointer hover:-translate-y-0.5 hover:scale-[1.002] hover:shadow-[0_20px_48px_rgba(0,0,0,0.25),inset_0_0_1px_1px_rgba(255,255,255,0.07)]"
          )}
          onClick={() => message && onMessageClick(message)}
        >
          <div className="mb-2 flex items-center justify-between gap-2 text-xs font-medium text-primary">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>
                {isGenerating ? "در حال نوشتن کد..." : `نسخه ${version}`}
              </span>
            </div>
            {message && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-foreground/60">
                  برای مشاهده کلیک کنید
                </span>
              </div>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/30 pointer-events-none" />
            <div className="max-h-[300px] overflow-hidden">
              <Markdown
                className="prose prose-neutral prose-p:text-[12px] prose-headings:text-[12px] prose-li:text-[12px] max-w-none text-right text-foreground/90 dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:leading-tight prose-li:leading-tight"
                components={{
                  pre: ({ children }) => (
                    <pre className="!mt-0 !mb-0 overflow-hidden rounded-xl">
                      {children}
                    </pre>
                  ),
                  code: ({ children }) => (
                    <code className="text-[12px]">{children}</code>
                  ),
                }}
              >
                {`\`\`\`${codePart.language}\n${codePart.content}\n\`\`\``}
              </Markdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
