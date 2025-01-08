"use client";

import { useRouter } from "next/navigation";
import { startTransition, use, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import assert from "assert";
import * as Select from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, Sparkles } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

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
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}) {
  const { pending } = useFormStatus();

  return (
    <TextareaAutosize
      ref={inputRef}
      placeholder="مثلاً: یه تجربه باحال برای معرفی محصول جدیدمون می‌خوام..."
      required
      name="prompt"
      rows={1}
      disabled={pending}
      autoCorrect="off"
      spellCheck="false"
      className="min-h-[72px] w-full resize-none rounded-md border-0 bg-transparent p-3.5 text-[0.9375rem] leading-relaxed placeholder:text-muted-foreground/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
  );
}

export default function Home() {
  const { setStreamPromise } = use(Context);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(MODELS[0].value);
  const [quality, setQuality] = useState("high");

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    // Focus the textarea after setting the prompt
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const selectedModel = MODELS.find((m) => m.value === model);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-t from-background/90 to-background/95">
      <div className="container mx-auto max-w-5xl px-4 py-10 md:py-16 lg:py-24">
        <div className="flex flex-col items-center justify-center space-y-12">
          <div className="flex flex-col items-center space-y-10 text-center">
            <div className="glass inline-flex items-center rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary/90 shadow-sm transition-all duration-500 hover:bg-primary/10 hover:shadow-md">
              <Sparkles className="me-2 h-4 w-4" />
              جادوی هوش مصنوعی ✨
            </div>

            <h1 className="text-balance bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl lg:text-6xl">
              بیا{" "}
              <span className="relative">
                <span className="absolute -inset-1 block rounded-lg bg-primary/10 blur-xl"></span>
                <span className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                  خلاق
                </span>
              </span>{" "}
              باشیم!
            </h1>

            <p className="max-w-[42rem] text-base text-muted-foreground/90 sm:text-mg sm:leading-8">
              فقط کافیه ایده‌ت رو بگی! ما با هوش مصنوعی اون رو به یه تجربه
              تعاملی باحال تبدیل می‌کنیم که مخاطب‌هات عاشقش بشن 💫
            </p>
          </div>

          <form
            className="w-full max-w-3xl scale-in"
            action={async (formData) => {
              const { prompt, model, quality, shadcn } =
                Object.fromEntries(formData);

              assert.ok(typeof prompt === "string");
              assert.ok(typeof model === "string");
              assert.ok(quality === "high" || quality === "low");

              const { chatId, lastMessageId } = await createChat(
                prompt,
                model,
                quality,
                !!shadcn
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
            <div className="flex flex-col space-y-8">
              <div className="group relative overflow-hidden rounded-2xl border bg-background/80 shadow-sm backdrop-blur-sm transition-all duration-500 hover:shadow-md focus-within:shadow-md">
                <PromptTextarea
                  value={prompt}
                  onChange={setPrompt}
                  inputRef={textareaRef}
                />

                <div className="flex items-center justify-between border-t bg-muted/20 p-3">
                  <div className="flex flex-1 items-center space-x-3 space-x-reverse">
                    <input type="hidden" name="model" value={MODELS[0].value} />

                    <div className="flex items-center space-x-2 space-x-reverse">
                      <label className="text-sm font-medium text-muted-foreground/90">
                        shadcn/ui
                      </label>
                      <Switch name="shadcn" defaultChecked />
                    </div>

                    <div className="h-4 w-px bg-border/50" />

                    <Select.Root
                      name="quality"
                      value={quality}
                      onValueChange={setQuality}
                    >
                      <Select.Trigger className="inline-flex h-9 items-center justify-center rounded-lg bg-background/80 px-3 text-sm font-medium ring-offset-background transition-all duration-300 hover:bg-accent/50 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                        <Select.Value>
                          {quality === "low"
                            ? "کیفیت پایین [سریع‌تر]"
                            : "کیفیت بالا [کندتر]"}
                        </Select.Value>
                        <Select.Icon>
                          <ChevronDownIcon className="mr-2 h-4 w-4 opacity-60" />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
                          <Select.Viewport className="p-1">
                            {[
                              { value: "low", label: "کیفیت پایین [سریع‌تر]" },
                              { value: "high", label: "کیفیت بالا [کندتر]" },
                            ].map((q) => (
                              <Select.Item
                                key={q.value}
                                value={q.value}
                                className={cn(
                                  "relative flex cursor-default select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-all duration-300",
                                  "focus:bg-accent/50 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                )}
                              >
                                <Select.ItemText>{q.label}</Select.ItemText>
                                <Select.ItemIndicator className="absolute right-2 inline-flex items-center">
                                  <CheckIcon className="h-4 w-4" />
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>

                  <SubmitButton />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.title}
                    type="button"
                    className="group relative overflow-hidden rounded-xl border bg-background/50 p-4 text-right backdrop-blur-sm transition-all duration-500 hover:bg-muted/30 hover:shadow-md hover:scale-[1.02] active:translate-y-[0.5px]"
                    onClick={() => handleSuggestionClick(prompt.description)}
                  >
                    <div className="mb-2 text-base font-semibold text-foreground/90 group-hover:text-foreground">
                      {prompt.title}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground/80 group-hover:text-muted-foreground">
                      {prompt.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="relative h-9 overflow-hidden rounded-lg px-4 text-sm font-medium shadow-sm transition-all duration-500 hover:shadow-md hover:scale-[1.02]"
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
          <span>در حال ساخت...</span>
        </div>
      ) : (
        "شروع ساخت"
      )}
    </Button>
  );
}
