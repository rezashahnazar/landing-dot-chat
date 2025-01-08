"use client";

import assert from "assert";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createMessage, getNextCompletionStreamPromise } from "../../actions";
import { type Chat } from "./page";

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
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 py-4">
        <form
          className="mx-auto flex max-w-3xl gap-2"
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
              name="prompt"
              rows={1}
              minRows={1}
              maxRows={5}
              className="w-full resize-none rounded-lg border bg-background px-3 py-3 text-right placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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

          <Button type="submit" size="icon" disabled={disabled}>
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowLeft className="h-4 w-4" />
            )}
            <span className="sr-only">ارسال پیام</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
