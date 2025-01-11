import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export const runtime = "edge";

const TEMPERATURE = 0.2;

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseUrl: "https://openrouter.ai/api/v1",
    });

    const response = await streamText({
      model: openrouter(model),
      messages,
      temperature: TEMPERATURE,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response.textStream) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Streaming error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
