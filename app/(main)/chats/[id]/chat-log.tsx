"use client";

import type { Chat, Message } from "./page";
import { splitByFirstCodeFence } from "@/lib/utils";
import Markdown from "react-markdown";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";

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

  // Show planning text if we have any text content before code blocks
  const planningPart = parts.find((part) => part.type === "text");
  const hasCodePart = parts.some(
    (part) =>
      part.type === "first-code-fence" ||
      part.type === "first-code-fence-generating"
  );

  // Auto-scroll when new content is added
  useEffect(() => {
    if (streamText && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamText, planningPart?.content, hasCodePart]);

  return (
    <div className="flex-1 overflow-hidden bg-background/90">
      <div ref={scrollRef} className="h-full overflow-y-auto px-4 pb-6 ">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
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
            <>
              {planningPart && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span>در حال برنامه‌ریزی...</span>
                  </div>
                  <Markdown
                    className="prose prose-neutral max-w-none text-right text-sm text-muted-foreground dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-3 text-right">
      <div className="mt-1 size-2 rotate-45 rounded-sm bg-primary" />
      <div className="text-muted-foreground">{content}</div>
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
    <div>
      {parts.map((part, i) => (
        <div key={i}>
          {part.type === "text" &&
            !part.content.includes("```") &&
            (!skipInitialText || i > 0) && (
              <Markdown
                className="prose prose-neutral max-w-none text-right text-muted-foreground dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
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
            <div className="my-4 ">
              <button
                disabled={part.type === "first-code-fence-generating"}
                className={cn(
                  "inline-flex w-full items-center gap-3 rounded-lg border p-3 transition-colors",
                  part.type === "first-code-fence-generating"
                    ? "bg-muted"
                    : isActive
                      ? "border-primary bg-primary/5"
                      : "bg-background hover:bg-muted/50"
                )}
                onClick={() => message && onMessageClick(message)}
              >
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md font-medium",
                    part.type === "first-code-fence-generating"
                      ? "bg-muted-foreground/10 text-muted-foreground"
                      : isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {version}
                </div>
                <div className="flex flex-col gap-1 text-right  ">
                  {part.type === "first-code-fence-generating" ? (
                    <div className="text-sm font-medium">در حال ساخت...</div>
                  ) : (
                    <>
                      <div className="text-sm font-medium">
                        {toTitleCase(part.filename.name)}{" "}
                        {version !== 1 && `نسخه ${version}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {part.filename.name}
                        {version !== 1 && `-v${version}`}
                        {"."}
                        {part.filename.extension}
                      </div>
                    </>
                  )}
                </div>
                {part.type === "first-code-fence-generating" ? (
                  <Loader2 className="mr-auto h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <ArrowLeft className="mr-auto h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function toTitleCase(rawName: string): string {
  // For Persian text, we don't need to capitalize or transform case
  // Just split on hyphens or underscores and join with spaces
  return rawName.split(/[-_]+/).join(" ");
}
