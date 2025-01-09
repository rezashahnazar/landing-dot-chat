import CodeRunner from "@/components/code-runner";
import client from "@/lib/prisma";
import { extractFirstCodeBlock } from "@/lib/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ messageId: string }>;
}): Promise<Metadata> {
  let { messageId } = await params;
  const message = await getMessage(messageId);
  if (!message) {
    notFound();
  }

  let title = message.chat.title;
  let searchParams = new URLSearchParams();
  searchParams.set("prompt", title);

  return {
    title,
    description: `${title} | ساخته شده با landing.chat`,
    openGraph: {
      images: [`/api/og?${searchParams}`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/og?${searchParams}`],
      title,
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = await params;

  const message = await client.message.findUnique({ where: { id: messageId } });
  if (!message) {
    notFound();
  }

  const app = extractFirstCodeBlock(message.content);
  if (!app || !app.language) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full grow items-center justify-center">
      <CodeRunner language={app.language} code={app.code} />
    </div>
  );
}

const getMessage = cache(async (messageId: string) => {
  return client.message.findUnique({
    where: {
      id: messageId,
    },
    include: {
      chat: true,
    },
  });
});
