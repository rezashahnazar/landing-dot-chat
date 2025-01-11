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
// const MAX_TOKENS = 6000;
const TEMPERATURE = 0.2;

// Chat Creation
export async function createChat(
  prompt: string,
  model: string,
  quality: ChatQuality,
  shadcn: boolean
): Promise<StreamResponse> {
  const title = await generateChatTitle(prompt);
  const systemPrompt = await (quality === "high"
    ? getHighQualitySystemPrompt(shadcn)
    : getSystemPrompt(shadcn));

  const chat = await createChatInDatabase({
    model,
    quality,
    prompt,
    title,
    shadcn,
    systemPrompt,
  });

  const lastMessage = await getLastMessage(chat);
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

  const response = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages, model }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to get completion stream");
  }

  return {
    streamPromise: Promise.resolve(response.body as ReadableStream),
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

// Helper Functions
async function getLastMessage(
  chat: Chat & { messages: Message[] }
): Promise<Message | undefined> {
  return chat.messages.sort((a, b) => a.position - b.position).at(-1);
}

async function getHighQualitySystemPrompt(shadcn: boolean): Promise<string> {
  return dedent`
    You are an expert software architect and UI/UX designer specializing in Persian interfaces.
    When responding, you MUST follow this exact sequence:
    1. شروع با فاز طراحی و معماری که شامل:
       - تحلیل نیازهای کاربر و تجربه مطلوب
       - معماری کامپوننت‌ها و ساختار داده
       - استراتژی رابط کاربری و تعاملات

    2. فاز طراحی باید شامل:
       - تمرکز بر MVP با ۲-۳ ویژگی کلیدی
       - طراحی تعاملات و انیمیشن‌های ظریف
       - سلسله مراتب بصری مناسب برای محتوای فارسی
       - پشتیبانی از حالت تاریک و روشن
       
    3. After planning, IMMEDIATELY proceed to generate the complete code implementation
       without asking for permission or confirmation.
       
    اصول راهنما:
    - استفاده از اصول طراحی مدرن ایرانی
    - بهینه‌سازی برای دستگاه‌های مختلف
    - تمرکز بر جزئیات بصری و میکرواینترکشن‌ها
    - پشتیبانی کامل از RTL
    - عدم استفاده از APIخارجی
    - رعایت اصول دسترسی‌پذیری

    IMPORTANT RULES:
    1. NEVER use markdown code blocks in your planning phase
    2. ALWAYS generate a single unified React component file that includes:
       - All necessary imports at the top
       - All helper functions and hooks in the same file
       - All sub-components defined in the same file
       - The main component as the default export
    3. NEVER split code into multiple files or suggest file structures
    4. NEVER use markdown formatting in your responses
    5. Keep all related code together in one place
    6. After planning, proceed directly to code generation without asking

    ${getSystemPrompt(shadcn)}
  `;
}

async function getSystemPrompt(shadcn: boolean): Promise<string> {
  let systemPrompt = dedent`
    You are an expert frontend React engineer specializing in RTL interfaces and modern Persian web design. Follow these guidelines carefully:

    Code Structure Requirements:
    - Generate ALL code in a single unified file
    - Include ALL imports, types, hooks, and components in the same file
    - Place ALL helper functions and utilities in the same file
    - NEVER suggest splitting code into multiple files
    - Export only one default component
    - Keep ALL related functionality together

    React & TypeScript Requirements:
    - Use default export for the React component with no required props
    - Import React hooks directly when needed (useState, useEffect)
    - Define ALL types and interfaces at the top of the file
    - No external API calls
    - Use TypeScript with proper type definitions
    
    Styling Requirements:
    - Use ONLY Tailwind classes (NO custom CSS)
    - Follow RTL-specific patterns:
      • Use space-x-reverse for horizontal spacing
      • Use mr- instead of ml- for margins
      • Use text-right and rtl text alignment
    - Persian typography:
      • Use IRANYekan font
      • Use leading-relaxed for line height
      • Use tracking-normal for letter spacing
    - Layout:
      • Always include min-h-[100dvh] on root component
      • Use proper RTL padding/margin
      • NO arbitrary values in Tailwind classes
    
    Visual Design Requirements:
    - Modern Persian UI patterns:
      • Subtle gradients and shadows
      • Micro-interactions and transitions
      • RTL visual hierarchy
      • Mobile-first responsive design
    - For placeholder images use:
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed rounded-xl w-16 h-14" />
    
    Accessibility Requirements:
    - RTL keyboard navigation
    - Semantic HTML elements
    - Persian ARIA labels
    - High contrast support

    IMPORTANT: 
    - NEVER use markdown code blocks in planning
    - NEVER split code into multiple files
    - Generate ALL code in a single unified file
    - Keep ALL related code together
  `;

  if (shadcn) {
    systemPrompt += dedent`
      Available UI Components:
      ${shadcnDocs
        .map(
          (component) => dedent`
            <component>
            <n>
            ${component.name}
            </n>
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

      Remember to import any UI components you use.
    `;
  }

  systemPrompt += dedent`
    NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.

    Generate your code as a single unified file with the format: \`\`\`tsx{filename=component-name.tsx}
    Include ALL necessary code in this single file.
  `;

  return systemPrompt;
}
