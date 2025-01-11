"use client";

import CodeRunner from "@/components/code-runner";
import { extractFirstCodeBlock } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { notFound } from "next/navigation";
export default function SharePageClient({
  message,
}: {
  message: {
    content: string;
  };
}) {
  const app = extractFirstCodeBlock(message.content);
  if (!app || !app.language) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full grow items-center justify-center">
      <CodeRunner
        language={app.language}
        code={app.code}
        onError={(error) => {
          toast({
            title: "خطا در اجرای کد",
            description: error,
            variant: "destructive",
          });
        }}
      />
    </div>
  );
}
