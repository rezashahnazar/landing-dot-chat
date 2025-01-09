/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import client from "@/lib/prisma";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { messageId: string };
}) {
  let messageId = params.messageId;
  let message = await client.message.findUnique({
    where: {
      id: messageId,
    },
    include: {
      chat: true,
    },
  });

  const backgroundData = await readFile(
    join(process.cwd(), "./public/dynamic-opengraph.png")
  );
  const backgroundSrc = `data:image/png;base64,${Buffer.from(backgroundData).toString("base64")}`;

  let title = message?.chat?.title || "ساخته شده با هوش مصنوعی | Landing.Chat";

  return new ImageResponse(
    (
      <div tw="flex justify-center items-center w-full h-full">
        <img
          src={backgroundSrc}
          height="100%"
          alt="OpenGraph Image Background"
        />
        <div tw="absolute text-[50px] text-white px-[200px] py-[50px]">
          {title}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
