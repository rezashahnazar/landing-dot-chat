import client from "@/lib/prisma";
import ChatPage from "./chat-page";
import { notFound } from "next/navigation";
import { cache } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const chat = await getChatById(id);

  if (!chat) notFound();

  return <ChatPage chat={chat} />;
}

const getChatById = cache(async (id: string) => {
  return await client.chat.findFirst({
    where: { id },
    include: { messages: { orderBy: { position: "asc" } } },
  });
});

export type Chat = NonNullable<Awaited<ReturnType<typeof getChatById>>>;
export type Message = Chat["messages"][number];
