"use client";

import { createMessage } from "@/app/(main)/actions";
import { splitByFirstCodeFence } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, use, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatBox from "./chat-box";
import ChatLog from "./chat-log";
import CodeViewer from "./code-viewer";
import CodeViewerLayout from "./code-viewer-layout";
import type { Chat } from "./page";
import { Context } from "../../providers";
import { cn } from "@/lib/utils";

export default function PageClient({ chat }: { chat: Chat }) {
  const context = use(Context);
  const [streamPromise, setStreamPromise] = useState<
    Promise<ReadableStream> | undefined
  >(context.streamPromise);
  const [streamText, setStreamText] = useState("");
  const [isShowingCodeViewer, setIsShowingCodeViewer] = useState(
    chat.messages.some((m) => m.role === "assistant")
  );
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const router = useRouter();
  const isHandlingStreamRef = useRef(false);
  const [activeMessage, setActiveMessage] = useState(
    chat.messages.filter((m) => m.role === "assistant").at(-1)
  );

  useEffect(() => {
    async function f() {
      if (!streamPromise || isHandlingStreamRef.current) return;

      isHandlingStreamRef.current = true;
      context.setStreamPromise(undefined);

      const stream = await streamPromise;
      let didPushToCode = false;
      let content = "";
      let reader: ReadableStreamDefaultReader<any> | undefined;

      try {
        reader = stream.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          content += value;
          setStreamText((text) => text + value);

          const parts = splitByFirstCodeFence(content);
          const hasGeneratingCode = parts.some(
            (part) => part.type === "first-code-fence-generating"
          );
          const hasCompletedCode = parts.some(
            (part) => part.type === "first-code-fence"
          );

          if (!didPushToCode && hasGeneratingCode) {
            didPushToCode = true;
            setIsShowingCodeViewer(true);
            setActiveTab("code");
          }

          if (didPushToCode && !hasGeneratingCode && hasCompletedCode) {
            setActiveTab("preview");
          }
        }

        startTransition(async () => {
          const message = await createMessage(chat.id, content, "assistant");

          startTransition(() => {
            isHandlingStreamRef.current = false;
            setStreamText("");
            setStreamPromise(undefined);
            setActiveMessage(message);
            router.refresh();
          });
        });
      } catch (error) {
        console.error("Error reading stream:", error);
        isHandlingStreamRef.current = false;
      } finally {
        reader?.releaseLock();
      }
    }

    f();
  }, [chat.id, router, streamPromise, context]);

  return (
    <div className="chat-layout">
      <div
        className={cn(
          "code-viewer-container",
          isShowingCodeViewer && "visible"
        )}
      >
        {isShowingCodeViewer && (
          <div className="code-viewer h-full">
            <CodeViewer
              streamText={streamText}
              chat={chat}
              message={activeMessage}
              onMessageChange={setActiveMessage}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onClose={() => {
                setActiveMessage(undefined);
                setIsShowingCodeViewer(false);
              }}
            />
          </div>
        )}
      </div>

      <div className={cn("chat-section", isShowingCodeViewer && "with-code")}>
        <div className="chat-header">
          <Link href="/" className="chat-header-back">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-medium text-foreground">{chat.title}</h1>
        </div>

        <div className="chat-messages">
          <div className="chat-messages-container">
            <ChatLog
              chat={chat}
              streamText={streamText}
              activeMessage={activeMessage}
              onMessageClick={(message) => {
                if (message !== activeMessage) {
                  setActiveMessage(message);
                  setIsShowingCodeViewer(true);
                } else {
                  setActiveMessage(undefined);
                  setIsShowingCodeViewer(false);
                }
              }}
            />
          </div>
        </div>

        <div className="chat-input-container">
          <ChatBox
            chat={chat}
            onNewStreamPromise={setStreamPromise}
            isStreaming={!!streamPromise}
          />
        </div>
      </div>
    </div>
  );
}
