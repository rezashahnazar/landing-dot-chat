"use server";

import { Message, Chat } from "@prisma/client";
import prisma from "@/lib/prisma";
import shadcnDocs from "@/lib/shadcn-docs";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import dedent from "dedent";
import { notFound } from "next/navigation";
import { z } from "zod";

// Types
type ChatQuality = "high" | "low";
type MessageRole = "system" | "user" | "assistant";
type StreamResponse = { chatId: string; lastMessageId: string };

interface ChatMessage {
  role: MessageRole;
  content: string;
}

// Constants
const CHAT_TITLE_MODEL = "anthropic/claude-3.5-sonnet";
const MAX_TOKENS = 6000;
const TEMPERATURE = 0.2;

// Chat Creation
export async function createChat(
  prompt: string,
  model: string,
  quality: ChatQuality,
  shadcn: boolean
): Promise<StreamResponse> {
  const title = await generateChatTitle(prompt);
  const systemPrompt =
    quality === "high"
      ? getHighQualitySystemPrompt(shadcn)
      : getSystemPrompt(shadcn);

  const chat = await createChatInDatabase({
    model,
    quality,
    prompt,
    title,
    shadcn,
    systemPrompt,
  });

  const lastMessage = getLastMessage(chat);
  if (!lastMessage) throw new Error("No new message");

  return { chatId: chat.id, lastMessageId: lastMessage.id };
}

async function generateChatTitle(prompt: string): Promise<string> {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  const response = await streamText({
    model: openrouter(CHAT_TITLE_MODEL),
    messages: [
      {
        role: "system",
        content:
          "You are a chatbot helping users create apps and scripts. Your current task is to create a short Persian title (3-5 words) for the chat based on their initial prompt. The title must be in Persian/Farsi language. Please return only the Persian title.",
      },
      { role: "user", content: prompt },
    ],
  });

  let title = "";
  for await (const chunk of response.textStream) {
    title += chunk;
  }

  return title || prompt;
}

async function createChatInDatabase({
  model,
  quality,
  prompt,
  title,
  shadcn,
  systemPrompt,
}: {
  model: string;
  quality: ChatQuality;
  prompt: string;
  title: string;
  shadcn: boolean;
  systemPrompt: string;
}): Promise<Chat & { messages: Message[] }> {
  return prisma.chat.create({
    data: {
      model,
      quality,
      prompt,
      title,
      shadcn,
      messages: {
        createMany: {
          data: [
            { role: "system", content: systemPrompt, position: 0 },
            { role: "user", content: prompt, position: 1 },
          ],
        },
      },
    },
    include: { messages: true },
  });
}

// Message Creation
export async function createMessage(
  chatId: string,
  text: string,
  role: MessageRole
): Promise<Message> {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });
  if (!chat) notFound();

  const maxPosition = Math.max(...chat.messages.map((m) => m.position));

  return prisma.message.create({
    data: {
      role,
      content: text,
      position: maxPosition + 1,
      chatId,
    },
  });
}

// Stream Generation
export async function getNextCompletionStreamPromise(
  messageId: string,
  model: string
) {
  const messages = await getMessagesForCompletion(messageId);
  const stream = await createCompletionStream(model, messages);

  return {
    streamPromise: Promise.resolve(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream.textStream) {
              controller.enqueue(chunk);
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      })
    ),
  };
}

async function getMessagesForCompletion(
  messageId: string
): Promise<ChatMessage[]> {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) notFound();

  const messagesRes = await prisma.message.findMany({
    where: { chatId: message.chatId, position: { lte: message.position } },
    orderBy: { position: "asc" },
  });

  return z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
      })
    )
    .parse(messagesRes);
}

async function createCompletionStream(model: string, messages: ChatMessage[]) {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  return streamText({
    model: openrouter(model),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: TEMPERATURE,
    maxTokens: MAX_TOKENS,
  });
}

// Helper Functions
function getLastMessage(
  chat: Chat & { messages: Message[] }
): Message | undefined {
  return chat.messages.sort((a, b) => a.position - b.position).at(-1);
}

function getHighQualitySystemPrompt(shadcn: boolean): string {
  return dedent`
    You are an expert software architect and UI/UX designer specializing in Persian interfaces.
    When responding, you MUST:
    1. شروع با فاز طراحی و معماری که شامل:
       - تحلیل نیازهای کاربر و تجربه مطلوب
       - معماری کامپوننت‌ها و ساختار داده
       - استراتژی رابط کاربری و تعاملات

    2. فاز طراحی باید شامل:
       - تمرکز بر MVP با ۲-۳ ویژگی کلیدی
       - طراحی تعاملات و انیمیشن‌های ظریف
       - سلسله مراتب بصری مناسب برای محتوای فارسی
       - پشتیبانی از حالت تاریک و روشن
       
    اصول راهنما:
    - استفاده از اصول طراحی مدرن ایرانی
    - بهینه‌سازی برای دستگاه‌های مختلف
    - تمرکز بر جزئیات بصری و میکرواینترکشن‌ها
    - پشتیبانی کامل از RTL
    - عدم استفاده از APIخارجی
    - رعایت اصول دسترسی‌پذیری

    ${getSystemPrompt(shadcn)}
  `;
}

function getSystemPrompt(shadcn: boolean): string {
  let systemPrompt = dedent`
    You are an expert frontend React engineer specializing in RTL interfaces and modern Persian web design. Follow these guidelines carefully:

    - Think carefully step by step, prioritizing RTL layout and Persian typography
    - Create a React component that follows modern Persian web design principles:
      • Proper RTL layout and text alignment
      • Consistent Persian typography using the IRANYekan font
      • Appropriate spacing for Persian text (line height, letter spacing)
      • RTL-friendly component layouts and flows
      • Minimum height of 100dvh for the wrapping/root component
    
    Technical Requirements:
    - Use default export for the React component with no required props
    - Import React hooks directly when needed (useState, useEffect)
    - No external API calls
    - Use TypeScript with proper type definitions
    - Use Tailwind classes with these enhancements:
      • RTL-specific classes (space-x-reverse, mr- instead of ml-)
      • Persian-friendly text classes (leading-relaxed, tracking-normal)
      • Consistent color palette using CSS variables
      • NO arbitrary values
      • Always include min-h-[100dvh] on the root/wrapper component
    - Use proper margin/padding for Persian text spacing
    
    Visual Design Principles:
    - Modern Persian UI patterns:
      • Subtle gradients and shadows
      • Micro-interactions and transitions
      • Proper visual hierarchy for Persian content
      • Mobile-first RTL responsive design
    - For placeholder images use:
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
    
    Accessibility:
    - Ensure proper RTL keyboard navigation
    - Use semantic HTML elements
    - Include proper ARIA labels in Persian
    - Support high contrast modes
  `;

  if (shadcn) {
    systemPrompt += dedent`
      There are some prestyled UI components available for use. Please use your best judgement to use any of these components if the app calls for one.

      Here are the UI components that are available, along with how to import them, and how to use them:

      ${shadcnDocs
        .map(
          (component) => dedent`
            <component>
            <name>
            ${component.name}
            </name>
            <import-instructions>
            ${component.importDocs}
            </import-instructions>
            <usage-instructions>
            ${component.usageDocs}
            </usage-instructions>
            </component>
          `
        )
        .join("\n")}

      Remember, if you use a UI component, make sure to import it.
    `;
  }

  systemPrompt += dedent`
    NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.

    Explain your work. The first codefence should be the main React component. It should also use "tsx" as the language, and be followed by a sensible filename for the code. Use this format: \`\`\`tsx{filename=calculator.tsx}.
  `;

  return systemPrompt;
}
