"use client";

import { useRouter } from "next/navigation";
import { startTransition, use, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import assert from "assert";
import * as Select from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, Sparkles } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import AnimatedLogo from "@/components/icons/animated-logo";

import { Context } from "./providers";
import { createChat, getNextCompletionStreamPromise } from "./actions";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MODELS = [
  {
    label: "Claude 3.5 Sonnet",
    value: "anthropic/claude-3.5-sonnet",
  },
];

const SUGGESTED_PROMPTS = [
  {
    title: "لندینگ محصول",
    description:
      "یه لندینگ پیج تعاملی برای محصول جدیدمون می‌خوام که ویژگی‌های محصول رو به شکل جذاب نشون بده و نرخ تبدیل رو بالا ببره 🎯",
  },
  {
    title: "گیمیفیکیشن خرید",
    description:
      "یه بازی سرگرم‌کننده برای صفحه محصول می‌خوام که کاربر با بازی کردن تخفیف بگیره و انگیزه خریدش بیشتر بشه 🎮",
  },
  {
    title: "کمپین فصلی",
    description:
      "یه صفحه فرود برای کمپین فصلی می‌خوام که با المان‌های تعاملی و شمارش معکوس، حس فوریت ایجاد کنه و فروش رو بالا ببره ⏰",
  },
  {
    title: "مسابقه خرید",
    description:
      "یه چالش خرید هفتگی می‌خوام که مشتری‌ها با هر خرید امتیاز بگیرن و برنده‌ها جوایز ویژه ببرن 🏆",
  },
  {
    title: "پیشنهاد شخصی",
    description:
      "یه تجربه شخصی‌سازی شده می‌خوام که بر اساس سلیقه کاربر، محصولات مناسبش رو با یه رابط کاربری جذاب پیشنهاد بده 🎁",
  },
  {
    title: "معرفی به دوستان",
    description:
      "یه مکانیزم ریفرال می‌خوام که با تخفیف‌های زنجیره‌ای و چالش دعوت از دوستان، فروش ویروسی ایجاد کنه 🌟",
  },
];

function PromptTextarea({
  value,
  onChange,
  inputRef,
  isTyping,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  isTyping?: boolean;
}) {
  const { pending } = useFormStatus();
  const isEmpty = !value.trim();

  return (
    <div className="relative isolate group">
      {/* Unified ambient glow */}
      <div
        className={cn(
          "absolute -inset-[2px] rounded-3xl transition-all duration-1000",
          isTyping
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 blur-2xl transition-all duration-700",
            isTyping ? "bg-primary/30 animate-pulse-fast" : "bg-primary/20"
          )}
        />
      </div>

      {/* Main container */}
      <div
        className="relative rounded-2xl bg-gradient-to-b from-background/80 via-background/50 to-background/80
        shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_32px_-8px_rgba(0,0,0,0.3)]
        backdrop-blur-xl overflow-hidden
        transition-all duration-700 group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_16px_48px_-12px_rgba(0,0,0,0.5)]"
      >
        {/* Content area */}
        <div className="relative flex flex-col min-h-[140px]">
          {/* Top gradient line */}
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent 
            opacity-0 group-hover:opacity-100 transition-all duration-700"
          />

          {/* Textarea section */}
          <div className="flex-1 relative">
            <TextareaAutosize
              ref={inputRef}
              placeholder="مثلاً: یه تجربه باحال برای معرفی محصول جدیدمون می‌خوام..."
              required
              name="prompt"
              rows={1}
              disabled={pending}
              autoCorrect="off"
              spellCheck="false"
              dir="rtl"
              className="block w-full resize-none border-0 bg-transparent 
                px-5 pt-4 pb-4 text-base leading-relaxed
                placeholder:text-muted-foreground/40
                focus-visible:outline-none disabled:cursor-not-allowed 
                disabled:opacity-50
                selection:bg-primary/20 selection:text-foreground"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  const target = event.target;
                  if (!(target instanceof HTMLTextAreaElement)) return;
                  target.closest("form")?.requestSubmit();
                }
              }}
            />

            {/* AI indicator */}
            {!isEmpty && (
              <div
                className="absolute left-5 top-5 flex items-center gap-1.5 text-sm text-primary/40 
                pointer-events-none transition-all duration-500 group-focus-within:text-primary/50"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary/40 animate-ping opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary/50" />
                </span>
                <span className="text-[10px] font-medium tracking-wide">
                  AI
                </span>
              </div>
            )}
          </div>

          {/* Footer section */}
          <div className="relative mt-auto">
            {/* Separator line */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/[0.03]" />

            {/* Footer content */}
            <div
              className="relative px-5 py-3 flex items-center justify-between gap-4
              bg-gradient-to-b from-white/[0.01] to-white/[0.02]"
            >
              {/* Help text */}
              <div className="text-[10px] tracking-wide text-muted-foreground/30">
                Enter ↵ برای ارسال • Shift + Enter برای خط جدید
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={pending}
                className="relative h-8 px-3.5 rounded-lg
                  bg-primary/10 hover:bg-primary/15 active:bg-primary/20
                  transition-all duration-300 group/btn
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <div className="relative flex items-center gap-2 text-sm">
                  {pending ? (
                    <>
                      <div className="relative h-2.5 w-2.5">
                        <div
                          className="absolute inset-0 rounded-full border-1.5 border-primary-foreground/20 
                          border-t-primary-foreground/90 animate-spin"
                        />
                      </div>
                      <span className="text-primary-foreground/90 font-medium text-xs">
                        در حال ساخت...
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 text-primary-foreground/90">
                      <span className="font-medium text-xs group-hover/btn:translate-x-0.5 transition-transform duration-300">
                        شروع ساخت
                      </span>
                      <span className="text-sm transition-transform duration-300 group-hover/btn:translate-x-0.5">
                        ←
                      </span>
                    </div>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { setStreamPromise } = use(Context);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [prompt, setPrompt] = useState("");
  const [model] = useState(MODELS[0].value);
  const [isTyping, setIsTyping] = useState(false);

  const handleSuggestionClick = (suggestion: string) => {
    let currentText = "";
    const typingSpeed = 20; // milliseconds per character
    const characters = suggestion.split("");

    // Reset the prompt first and start typing animation
    setPrompt("");
    setIsTyping(true);

    // Animate each character
    characters.forEach((char, index) => {
      setTimeout(() => {
        currentText += char;
        setPrompt(currentText);

        // Focus the textarea after the animation starts
        if (index === 0) {
          textareaRef.current?.focus();
        }

        // Stop typing animation when done
        if (index === characters.length - 1) {
          setTimeout(() => setIsTyping(false), 100);
        }
      }, index * typingSpeed);
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-t from-background/90 to-background/95 relative overflow-hidden">
      {/* Ambient background effect - refined for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(var(--primary-rgb),0.07),transparent_50%)] animate-pulse-slow opacity-70 md:opacity-100 backdrop-blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(var(--primary-rgb),0.05),transparent_50%)] animate-pulse-slower opacity-70 md:opacity-100" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,rgba(var(--primary-rgb),0.03),transparent_40%)] animate-pulse-slow opacity-0 md:opacity-100" />

      <div className="container relative mx-auto max-w-5xl px-3 py-6 md:px-4 md:py-16 lg:py-24">
        <div className="flex flex-col items-center justify-center space-y-10 md:space-y-16">
          <div className="flex flex-col items-center space-y-6 md:space-y-10 text-center">
            <div className="scale-in group">
              <div className="flex sm:flex-row flex-col-reverse items-center gap-4 md:gap-6 ">
                <span
                  dir="ltr"
                  className="translate-y-1 tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/60 hover:from-white/90 hover:via-white/70 hover:to-white/50 transition-all duration-700 transform"
                >
                  <span className="inline-flex items-center">
                    <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white/80 italic hover:text-white transition-colors duration-700">
                      Landing
                    </span>
                    <span className="h-2 w-2 md:h-2.5 md:w-2.5 bg-white/80 rounded-full mx-3 animate-[pulse_1.4s_ease-in-out_infinite]"></span>
                    <span className="text-2xl md:text-3xl lg:text-4xl font-light text-white/80 animate-[pulse_1.4s_ease-in-out_infinite]">
                      Chat
                    </span>
                  </span>
                </span>
                <AnimatedLogo className="size-12 md:size-14 lg:size-16 transform transition-all duration-700" />
              </div>
            </div>

            <p
              className="max-w-xl text-sm md:text-base text-muted-foreground/80 
            bg-background/30 backdrop-blur-sm rounded-xl px-4 py-1"
            >
              ایده‌هاتو بنویس و با هوش مصنوعی لندینگ بساز!
            </p>
          </div>

          <form
            className="w-full max-w-3xl scale-in relative group"
            action={async (formData) => {
              const { prompt } = Object.fromEntries(formData);
              assert.ok(typeof prompt === "string");

              const { chatId, lastMessageId } = await createChat(
                prompt,
                model,
                "high",
                true
              );
              const { streamPromise } = await getNextCompletionStreamPromise(
                lastMessageId,
                model
              );
              startTransition(() => {
                setStreamPromise(streamPromise);
                router.push(`/chats/${chatId}`);
              });
            }}
          >
            <PromptTextarea
              value={prompt}
              onChange={setPrompt}
              inputRef={textareaRef}
              isTyping={isTyping}
            />
          </form>

          <div className="w-full max-w-3xl grid gap-3 md:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative">
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] 
              via-transparent to-primary/[0.03] rounded-xl animate-pulse-slow"
            />
            <div
              className="absolute inset-0 bg-gradient-to-tr from-background/95 
              via-transparent to-background/95 backdrop-blur-md rounded-xl"
            />

            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt.title}
                type="button"
                className="group relative overflow-hidden rounded-xl border border-border/40 
                  bg-gradient-to-br from-[#151515] via-[#171717] to-[#151515] p-4 md:p-5 text-right 
                  backdrop-blur-md transition-all duration-500 hover:scale-[1.02] active:scale-95
                  hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 touch-action-pan-y
                  hover:border-primary/20 active:translate-y-0"
                onClick={() => handleSuggestionClick(prompt.description)}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] 
                  to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_50%)]" />
                <div
                  className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/[0.03] 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                />
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100" />

                <div className="relative z-10">
                  <h3
                    className="text-sm font-semibold text-foreground/90 mb-2 
                    group-hover:text-primary/90 transition-colors duration-500"
                  >
                    {prompt.title}
                  </h3>
                  <p className="text-xs text-muted-foreground/80 line-clamp-2 transition-colors duration-500 group-hover:text-muted-foreground/90">
                    {prompt.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
