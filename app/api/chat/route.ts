import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "edge";

const TEMPERATURE = 0.2;

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    })
  ),
  model: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model } = requestSchema.parse(body);

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseUrl: "https://openrouter.ai/api/v1",
    });

    const response = await streamText({
      model: openrouter(model),
      messages,
      temperature: TEMPERATURE,
    });

    return new Response(response.textStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
