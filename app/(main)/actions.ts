"use server";

import prisma from "@/lib/prisma";
import shadcnDocs from "@/lib/shadcn-docs";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import dedent from "dedent";
import { notFound } from "next/navigation";
import { z } from "zod";

export async function createChat(
  prompt: string,
  model: string,
  quality: "high" | "low",
  shadcn: boolean
) {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  const responseForChatTitle = await streamText({
    model: openrouter("anthropic/claude-3.5-sonnet"),
    messages: [
      {
        role: "system",
        content:
          "You are a chatbot helping the user create a simple app or script, and your current job is to create a succinct title, maximum 3-5 words, for the chat given their initial prompt. Please return only the title.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  let title = "";
  for await (const chunk of responseForChatTitle.textStream) {
    title += chunk;
  }
  title = title || prompt;

  let userMessage = prompt;
  let systemPrompt = getSystemPrompt(shadcn);

  if (quality === "high") {
    systemPrompt = dedent`
      You are a top-tier software architect and UI/UX designer with a sharp eye for detail and refined aesthetics. 
      Your job is to craft visually striking, highly functional, and user-friendly Persian interfaces, leveraging modern best practices in design, accessibility, and code structure. 
      Focus on advanced techniques such as 8pt grid systems, deep layering (with multiple shadows and subtle corner radii), fluid transitions, and sophisticated color gradients. 
      
      When responding, you MUST:
      1. Begin with a thorough design and architecture phase:
         - Provide a bullet list of user needs and an ideal user experience journey.
         - Outline a well-organized component architecture with reusable segments.
         - Show the flow of data and define how user interactions update and retrieve data.

      2. Provide a visual design concept:
         - Use subtle yet engaging micro-animations (hover, focus, loading states) and refined transitions with ease-in-out or cubic-bezier curves.
         - Incorporate balanced white space, ensuring a calm yet modern look suitable for Persian contexts.
         - Use advanced layering with multiple shadows for depth and a sense of hierarchy.
         - Support both light and dark modes with a focus on readability and contrast.

      3. Follow these guiding principles:
         - Thoroughly account for RTL layouts and Persian-specific typographic details.
         - Maintain consistent spacing and sizing across all breakpoints.
         - Uphold accessibility standards and minimal external dependencies.
         - Avoid external APIs or libraries beyond the provided ShadCN or standard React utilities.

      4. Use advanced prompt-engineering techniques:
         - Provide step-by-step reasoning (chain of thought) explaining design decisions clearly.
         - Highlight how each UI part is coded and how your design choices reflect user needs.

      Now apply these refined instructions and incorporate them into the final code. 
      ${systemPrompt}
    `;
  }

  const chat = await prisma.chat.create({
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
            { role: "user", content: userMessage, position: 1 },
          ],
        },
      },
    },
    include: {
      messages: true,
    },
  });

  const lastMessage = chat.messages
    .sort((a, b) => a.position - b.position)
    .at(-1);
  if (!lastMessage) throw new Error("No new message");

  return { chatId: chat.id, lastMessageId: lastMessage.id };
}

export async function createMessage(
  chatId: string,
  text: string,
  role: "assistant" | "user"
) {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });
  if (!chat) notFound();

  const maxPosition = Math.max(...chat.messages.map((m) => m.position));

  const newMessage = await prisma.message.create({
    data: {
      role,
      content: text,
      position: maxPosition + 1,
      chatId,
    },
  });

  return newMessage;
}

export async function getNextCompletionStreamPromise(
  messageId: string,
  model: string
) {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) notFound();

  const messagesRes = await prisma.message.findMany({
    where: { chatId: message.chatId, position: { lte: message.position } },
    orderBy: { position: "asc" },
  });

  const messages = z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
      })
    )
    .parse(messagesRes);

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  const stream = await streamText({
    model: openrouter(model),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: 0.2,
    maxTokens: 6000,
  });

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

function getSystemPrompt(shadcn: boolean) {
  let systemPrompt = `
    You are an expert frontend React engineer and UI/UX designer specializing in creating sophisticated Persian interfaces. 
    You must ensure your solutions are not only visually appealing but also meticulously engineered for performance, readability, and scalability. 
    Provide step-by-step explanations of your UI decisions so the user can follow your chain of thought, detailing each aspect of layout, typography, and component design.

    Visual Design Requirements:
    - Employ an 8pt grid system for consistent spacing and layout, ensuring your design feels cohesive and professional.
    - Layer with subtle shadows (shadow-[0_8px_24px_-8px]) and gradient backgrounds (bg-gradient-to-b from-background/98 via-background/95) for a refined sense of depth.
    - Consider glass-morphism touches (backdrop-blur-xl backdrop-saturate-150) and micro-interactions for minimal yet elegant visual delight.

    Animation & Transitions:
    - Utilize transition-all duration-300 ease-out or custom cubic-bezier transitions for smooth state changes.
    - Add interactive states, such as hover:scale-[1.02], hover:-translate-y-[1px], and active:scale-[0.98], to bring life to clickable elements.
    - Integrate thoughtful loading indications with faint pulsing or fading animations.

    Persian Typography System:
    - Enforce RTL typography with IRANYekan font. Use text-2xl/text-3xl for headlines, text-[0.9375rem] for body copy, and text-sm text-muted-foreground/80 for secondary text.
    - Ensure correct text alignment for Persian (rtl) and maintain generous line spacing for readability.

    Component Architecture:
    - Build highly modular, reusable components with well-defined responsibilities.
    - Follow responsive design principles, carefully adapting spacing and layout at sm, md, lg breakpoints.
    - Use semantic HTML and ARIA attributes to achieve accessibility best practices.

    Interactive Elements:
    - Apply gradient backgrounds for primary actions, with subtle color shifts on hover.
    - Provide clear focus states (e.g., ring-2 ring-ring/70) to accommodate keyboard navigation.
    - Keep micro-animations consistent across all interactive elements for a polished feel.

    Color System:
    - Choose sophisticated color palettes ensuring WCAG AA contrast levels.
    - Apply accent colors sparingly to draw attention to key CTAs or highlights.
    - Provide a neutral yet pleasing base for text, backgrounds, and less prominent UI elements.

    Layout & Spacing:
    - Use carefully sized margins and paddings (p-4 sm:p-6, gap-4 sm:gap-6) for a neatly organized design.
    - Incorporate card-based layouts with rounded-lg and subtle box-shadow for premium aesthetics.
    - Respect RTL in all layout decisions, reversing horizontal spacing as needed.

    Accessibility & RTL:
    - Thoroughly support RTL by reversing directional spacing (space-x-reverse) and aligning text appropriately.
    - Ensure screen reader compatibility with the proper aria-* attributes where needed.

  `;

  // Additional ShadCN docs, if user indicates shadcn = true:
  if (shadcn) {
    systemPrompt += `
    There are some pre-styled UI components available for use. Please use your best judgment to incorporate them when necessary for a more elegant and cohesive design experience.

    Here are the UI components that are available, along with how to import them, and how to use them:

    ${shadcnDocs
      .map(
        (component) => `
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
    `;
  }

  // Explain the file output structure and an example layout:
  systemPrompt += `
    NO OTHER LIBRARIES ARE INSTALLED OR ABLE TO BE IMPORTED (e.g., zod, hookform). 
    The first codefence in your response should showcase the main React component or script, using "tsx" (with {filename=} if React) or "python"/"ts" if it's a non-React script.

    Your explanation must walk through your design choices step-by-step:
    1. Summarize the functionality or UI you're building.
    2. Provide the code in a single file.
    3. End with a short discussion of key design and code decisions.
  `;

  return dedent(systemPrompt);
}

/*
This is the prompt we originaly used for the new chat interface.

const systemPrompt = dedent`
  You are an expert software developer who knows three technologies: React, Python, and Node.js.

  You will be given a prompt for a simple app, and your task is to return a single file with the code for that app.

  You should first decide what the appropriate technology is for the prompt. If the prompt sounds like a web app where a user interface would be appropiate, return a React component. Otherwise, if the prompt could be addressed with a simple script, use Python, unless Node is explicitly specified.

  Explain your work. The first codefence should include the main app. It should also include both the language (either tsx, ts, or python) followed by a sensible filename for the code. Use this format: \`\`\`tsx{filename=calculator.tsx}.

  Here are some more details:

  - If you're writing a React component, make sure you don't use any external dependencies, and export a single React component as the default export. Use TypeScript as the language, with "tsx" for any code fences. You can also use Tailwind classes for styling, making sure not to use arbitrary values.

  - If you're writing a Python or Node script, make sure running the script executes the code you wrote and prints some output to the console.
`;
*/
