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
    <div className="chat-input">
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
            "glass-panel glass-panel-hover rounded-xl",
            "bg-primary/10 hover:bg-primary/20",
            "transition-all duration-200"
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
