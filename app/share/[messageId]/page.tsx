import { Metadata } from "next";
import { notFound } from "next/navigation";
import client from "@/lib/prisma";
import { cache } from "react";
import SharePageClient from "./share-page-client";

export async function generateMetadata({
  params,
}: {
  params: { messageId: string };
}): Promise<Metadata> {
  const { messageId } = params;
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

export default async function SharePage({
  params,
}: {
  params: { messageId: string };
}) {
  const { messageId } = params;

  const message = await client.message.findUnique({ where: { id: messageId } });
  if (!message) {
    notFound();
  }

  return <SharePageClient message={message} />;
}
