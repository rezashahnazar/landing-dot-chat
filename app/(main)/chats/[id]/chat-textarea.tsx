"use client";

import assert from "assert";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createMessage, getNextCompletionStreamPromise } from "../../actions";
import { type Chat } from "./page";
import { cn } from "@/lib/utils";

export default function ChatTextArea({
  chat,
  onNewStreamPromise,
  isStreaming,
  onStopStream,
}: {
  chat: Chat;
  onNewStreamPromise: (v: Promise<ReadableStream<any>>) => void;
  isStreaming: boolean;
  onStopStream: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isCollapsed = isPending || isStreaming;

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  // Reset textarea after loading/streaming
  useEffect(() => {
    if (!isCollapsed && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "64px";
    }
  }, [isCollapsed]);

  // Focus management
  useEffect(() => {
    if (isStreaming || isPending) {
      buttonRef.current?.focus();
    } else {
      textareaRef.current?.focus();
    }
  }, [isStreaming, isPending]);

  // Handle space key for stopping stream
  useEffect(() => {
    if (!isStreaming) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        onStopStream();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStreaming, onStopStream]);

  return (
    <div className="sticky bottom-0 w-full bg-gradient-to-t from-background via-background to-transparent px-3 pb-4">
      <div className="relative mx-auto w-full max-w-3xl px-1">
        <form
          className={cn(
            "flex min-h-[64px] items-center rounded-xl bg-white/[0.02]",
            "ring-1 ring-white/[0.03] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]",
            "transition-all duration-500 ease-out",
            "hover:ring-white/[0.05] hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)]",
            "focus-within:ring-white/[0.08] focus-within:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)]",
            isCollapsed ? "w-[105px] mx-auto" : "w-full gap-3"
          )}
          action={async (formData) => {
            startTransition(async () => {
              try {
                const prompt = formData.get("prompt");
                assert.ok(typeof prompt === "string");
                const message = await createMessage(chat.id, prompt, "user");
                const { streamPromise } = await getNextCompletionStreamPromise(
                  message.id,
                  chat.model
                );
                onNewStreamPromise(streamPromise);
                router.refresh();
              } catch (error) {
                console.error("Error in chat submission:", error);
                // You might want to show an error toast here
              }
            });
          }}
        >
          <div
            className={cn(
              "relative flex-1 overflow-hidden transition-all duration-500 ",
              isCollapsed ? "w-0 opacity-0 px-0" : "w-full opacity-100 px-4"
            )}
          >
            <textarea
              ref={textareaRef}
              placeholder="سوال بعدی خود را بپرسید..."
              required
              name="prompt"
              rows={1}
              dir="rtl"
              disabled={isPending}
              className="w-full resize-none border-0 bg-transparent text-sm leading-6
                placeholder:text-white/20 focus:outline-none disabled:opacity-50
                py-4 min-h-[64px]"
              onInput={adjustTextareaHeight}
              onChange={adjustTextareaHeight}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  const target = event.target;
                  if (!(target instanceof HTMLTextAreaElement)) return;
                  target.closest("form")?.requestSubmit();
                }
              }}
            />
            <div
              className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 
              flex items-center gap-1.5 text-primary/40 transition-opacity duration-300
              group-focus-within:text-primary/50"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full rounded-full 
                  bg-primary/40 opacity-75 animate-ping"
                />
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full 
                  bg-primary/50"
                />
              </span>
              <span className="text-[10px] font-medium tracking-wide">AI</span>
            </div>
          </div>

          <div className="flex items-center justify-center px-4">
            <Button
              ref={buttonRef}
              type={isStreaming ? "button" : "submit"}
              disabled={isPending}
              onClick={isStreaming ? onStopStream : undefined}
              className={cn(
                "h-8 w-[72px] shrink-0 rounded-lg bg-primary/10 px-3",
                "hover:bg-primary/15 active:bg-primary/20",
                "disabled:opacity-100 disabled:cursor-not-allowed",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                "transition-all duration-300"
              )}
            >
              <div className="relative flex items-center justify-center">
                {isPending && !isStreaming && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isStreaming && (
                  <div className="size-4 rounded-[3px] bg-current opacity-90" />
                )}
                {!isPending && !isStreaming && (
                  <ArrowLeft
                    className="h-4 w-4 transition-transform duration-300 
                  group-hover:-translate-x-0.5"
                  />
                )}
              </div>
              <span className="sr-only">
                {isStreaming ? "توقف" : "ارسال پیام"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
