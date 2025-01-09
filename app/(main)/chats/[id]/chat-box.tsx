"use client";

import assert from "assert";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createMessage, getNextCompletionStreamPromise } from "../../actions";
import { type Chat } from "./page";
import { cn } from "@/lib/utils";

export default function ChatBox({
  chat,
  onNewStreamPromise,
  isStreaming,
}: {
  chat: Chat;
  onNewStreamPromise: (v: Promise<ReadableStream>) => void;
  isStreaming: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const disabled = isPending || isStreaming;
  const didFocusOnce = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    if (!disabled && !didFocusOnce.current) {
      textareaRef.current.focus();
      didFocusOnce.current = true;
    } else {
      didFocusOnce.current = false;
    }
  }, [disabled]);

  return (
    <div className="bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-2xl border border-white/[0.03] shadow-[0_12px_36px_rgba(0,0,0,0.2),inset_0_0_1px_1px_rgba(255,255,255,0.04)] rounded-2xl p-4 hover:shadow-[0_20px_48px_rgba(0,0,0,0.25),inset_0_0_1px_1px_rgba(255,255,255,0.07)] focus-within:bg-gradient-to-b focus-within:from-white/[0.04] focus-within:to-white/[0.02] focus-within:shadow-[0_20px_48px_rgba(0,0,0,0.25),inset_0_0_1px_1px_rgba(255,255,255,0.07)] transition-all duration-500">
      <form
        className="mx-auto flex max-w-3xl gap-3"
        action={async (formData) => {
          startTransition(async () => {
            const prompt = formData.get("prompt");
            assert.ok(typeof prompt === "string");

            const message = await createMessage(chat.id, prompt, "user");
            const { streamPromise } = await getNextCompletionStreamPromise(
              message.id,
              chat.model
            );
            onNewStreamPromise(streamPromise);

            router.refresh();
          });
        }}
      >
        <div className="relative flex-1">
          <TextareaAutosize
            ref={textareaRef}
            placeholder="سوال بعدی خود را بپرسید..."
            autoFocus={!disabled}
            required
            autoCorrect="off"
            spellCheck="false"
            name="prompt"
            rows={1}
            minRows={1}
            maxRows={5}
            className={cn(
              "w-full resize-none rounded-xl bg-white/5 px-4 py-3 text-right",
              "placeholder:text-foreground/40",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              "backdrop-blur-sm"
            )}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                const target = event.target;
                if (!(target instanceof HTMLTextAreaElement)) return;
                target.closest("form")?.requestSubmit();
              }
            }}
            disabled={disabled}
          />
        </div>

        <Button
          type="submit"
          size="icon"
          disabled={disabled}
          className={cn(
            "bg-gradient-to-b from-white/[0.02] to-white/[0.01] backdrop-blur-2xl border border-white/[0.03] shadow-[0_8px_24px_rgba(0,0,0,0.2),inset_0_0_1px_1px_rgba(255,255,255,0.04)] rounded-xl",
            "hover:bg-gradient-to-b hover:from-white/[0.03] hover:to-white/[0.02] hover:shadow-[0_20px_48px_rgba(0,0,0,0.3),inset_0_0_1px_1px_rgba(255,255,255,0.07)] hover:-translate-y-0.5",
            "active:translate-y-0 active:duration-200",
            "transition-all duration-500"
          )}
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )}
          <span className="sr-only">ارسال پیام</span>
        </Button>
      </form>
    </div>
  );
}
