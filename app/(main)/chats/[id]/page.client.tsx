"use client";

import { createMessage } from "@/app/(main)/actions";
import { splitByFirstCodeFence } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, use, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ChatBox from "./chat-box";
import ChatLog from "./chat-log";
import CodeViewer from "./code-viewer";
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
    <div className="fixed inset-0 flex overflow-hidden bg-[radial-gradient(circle_at_70%_30%,hsl(220_20%_12%/0.9)_0%,hsl(var(--background))_100%)] backdrop-blur-2xl before:content-[''] before:fixed before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_1px,transparent_1px)] before:bg-[length:clamp(20px,2vw,32px)_clamp(20px,2vw,32px)] before:animate-float-fur before:pointer-events-none before:opacity-80 before:mask-[radial-gradient(circle_at_50%_50%,black,transparent_80%)]">
      {/* Code & Preview Section */}
      <div
        className={cn(
          "fixed top-14 bottom-0 left-0 w-1/2 transition-all duration-700 ease-out -translate-x-full",
          isShowingCodeViewer && "translate-x-0 animate-slide-from-left"
        )}
      >
        {isShowingCodeViewer && (
          <div className="h-full rounded-2xl bg-gradient-to-[165deg] from-white/[0.02] to-white/[0.01] backdrop-blur-2xl border border-white/[0.03] shadow-[0_8px_24px_rgba(0,0,0,0.2),inset_0_0_1px_1px_rgba(255,255,255,0.04)] animate-scale-in">
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

      {/* Chat Section */}
      <div
        className={cn(
          "flex flex-col pt-14 transition-all duration-700 w-full ml-auto origin-center",
          isShowingCodeViewer && "lg:w-1/2 animate-slide-to-right"
        )}
      >
        {/* Chat Header */}
        <div className="flex h-14 shrink-0 items-center border-b px-6 z-10 bg-gradient-to-r from-white/[0.02] to-white/[0.01] backdrop-blur-2xl border-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.2),inset_0_0_1px_1px_rgba(255,255,255,0.03)] animate-slide-down">
          <Link
            href="/"
            className="mr-3 p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 hover:-translate-x-0.5 active:translate-x-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-medium text-foreground">{chat.title}</h1>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_2rem,black_calc(100%_-_2rem),transparent)]">
          <div className="h-full overflow-y-auto px-6 pb-6 scroll-smooth">
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

        {/* Chat Input */}
        <div className="px-6 pb-6 animate-slide-up">
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
