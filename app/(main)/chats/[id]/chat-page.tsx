"use client";

import { createMessage } from "@/app/(main)/actions";
import { splitByFirstCodeFence } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, use, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import ChatBox from "./chat-textarea";
import CodeViewer from "./code-viewer";
import type { Chat } from "./page";
import { Context } from "../../providers";
import { cn } from "@/lib/utils";
import { Drawer } from "vaul";
import { Message } from "@prisma/client";
import ChatMessages from "./chat-messages";

export default function ChatPage({ chat }: { chat: Chat }) {
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
  const readerRef = useRef<ReadableStreamDefaultReader<any>>();
  const [activeMessage, setActiveMessage] = useState(
    chat.messages.filter((m) => m.role === "assistant").at(-1)
  );
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const stopStream = () => {
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = undefined;
      isHandlingStreamRef.current = false;
      setStreamPromise(undefined);
      router.refresh();
    }
  };

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
        readerRef.current = reader;

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
    <div className="fixed inset-0 flex overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.4)_0%,hsl(var(--background))_100%)] bg-background/90 before:content-[''] before:fixed before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_1px,transparent_1px)] before:bg-[length:clamp(20px,2vw,32px)_clamp(20px,2vw,32px)] before:animate-float-fur before:pointer-events-none before:opacity-80 before:mask-[radial-gradient(circle_at_50%_50%,black,transparent_80%)]">
      {/* Code & Preview Section - Desktop */}
      <div className="hidden lg:block">
        <div
          className={cn(
            "fixed top-14 bottom-0 left-0 w-1/2 transition-all duration-700 ease-out -translate-x-full",
            isShowingCodeViewer && "translate-x-0 animate-slide-from-left"
          )}
        >
          {isShowingCodeViewer && (
            <div className="h-full rounded-2xl bg-gradient-to-[165deg] from-white/[0.02] to-white/[0.01] bg-background/5 border border-white/[0.03] shadow-[0_8px_24px_rgba(0,0,0,0.2),inset_0_0_1px_1px_rgba(255,255,255,0.04)] animate-scale-in">
              <CodeViewer
                streamText={streamText}
                chat={chat}
                message={activeMessage}
                onMessageChange={setActiveMessage}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onClose={() => {
                  setIsShowingCodeViewer(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Code & Preview Section - Mobile */}
      <div className="lg:hidden">
        <Drawer.Root
          open={isShowingCodeViewer && isMobile}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setIsShowingCodeViewer(false);
            }
          }}
        >
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40" />
            <Drawer.Content className="fixed inset-x-0 bottom-0 mt-24 max-h-[80dvh] rounded-t-2xl bg-gradient-to-[165deg] from-white/[0.02] to-white/[0.01] backdrop-blur-2xl border border-white/[0.03] shadow-[0_8px_24px_rgba(0,0,0,0.2),inset_0_0_1px_1px_rgba(255,255,255,0.04)] flex flex-col z-[100]">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700 my-3" />
              <Drawer.Title className="sr-only">مشاهده کد</Drawer.Title>
              <div className="flex-1 overflow-hidden">
                <CodeViewer
                  streamText={streamText}
                  chat={chat}
                  message={activeMessage}
                  onMessageChange={setActiveMessage}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onClose={() => {
                    setIsShowingCodeViewer(false);
                  }}
                />
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>

      {/* Chat Section */}
      <div
        className={cn(
          "flex flex-col pt-14 transition-all duration-700 w-full ml-auto origin-center relative z-0",
          isShowingCodeViewer && "lg:w-1/2 lg:animate-slide-to-right"
        )}
      >
        {/* Chat Header */}
        <div className="flex h-14 shrink-0 items-center border-b px-0 z-10 bg-gradient-to-r from-white/[0.02] to-white/[0.01] bg-background/5 border-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.2),inset_0_0_1px_1px_rgba(255,255,255,0.03)] animate-slide-down gap-2">
          <Link
            href="/"
            className="mr-3 p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 hover:-translate-x-0.5 active:translate-x-0"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="text-md font-medium text-foreground">{chat.title}</h1>
        </div>

        {/* Chat Messages */}
        <ChatMessages
          chat={chat}
          activeMessage={activeMessage}
          streamText={streamText}
          onMessageClick={(message: Message) => {
            const parts = splitByFirstCodeFence(streamText);
            const hasCodePart = parts.some(
              (p) =>
                p.type === "first-code-fence" ||
                p.type === "first-code-fence-generating"
            );

            if (streamText && hasCodePart) {
              // If we're streaming and there's code, just show the viewer
              setIsShowingCodeViewer(true);
            } else {
              // Otherwise handle normal message click
              setActiveMessage(message);
              setIsShowingCodeViewer(true);
            }
          }}
        />

        {/* Chat Input */}
        <div className="animate-slide-up">
          <ChatBox
            chat={chat}
            onNewStreamPromise={setStreamPromise}
            isStreaming={!!streamPromise}
            onStopStream={stopStream}
          />
        </div>
      </div>
    </div>
  );
}
