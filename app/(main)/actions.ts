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
      - استفاده از اصول�راحی مدرن ایرانی
      - بهینه‌سازی برای دستگاه‌های مختلف
      - تمرکز بر جزئیات بصری و میکرواینترکشن‌ها
      - پشتیبانی کامل از RTL
      - عدم استفاده از API�ارجی
      - رعایت اصول دسترسی‌پذیری

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
    You are an expert frontend React engineer and UI/UX designer specializing in creating sophisticated Persian interfaces. Follow these guidelines meticulously:

    Visual Design Requirements:
    - Use a sophisticated visual hierarchy with:
      • Layered depth using subtle shadows (shadow-[0_8px_24px_-8px])
      • Smooth gradient backgrounds (bg-gradient-to-b from-background/98 via-background/95)
      • Glass-morphism effects (backdrop-blur-xl backdrop-saturate-150)
      • Micro-interactions on all interactive elements
    
    Animation Guidelines:
    - Add subtle transitions:
      • Use transition-all duration-300 ease-out for smooth state changes
      • Implement hover:scale-[1.02] hover:-translate-y-[1px] for buttons
      • Add active:scale-[0.98] for click feedback
      • Include loading states with subtle animations
    
    Persian Typography System:
    - Implement proper RTL typography:
      • Use IRANYekan font with appropriate weights
      • Large titles: text-2xl/text-3xl with tracking-tight
      • Body text: text-[0.9375rem] with leading-relaxed
      • Secondary text: text-sm text-muted-foreground/80
    
    Component Architecture:
    - Build components with:
      • Proper RTL layout structure
      • Consistent spacing using margin/padding scale
      • Responsive breakpoints (sm/md/lg)
      • Semantic HTML with ARIA attributes
    
    Interactive Elements:
    - Style interactive elements with:
      • Gradient backgrounds with hover states
      • Subtle shadows that enhance on hover
      • Focus states with ring-2 ring-ring/70
      • Loading states with fade transitions
    
    Color System:
    - Use sophisticated color combinations:
      • Primary actions: gradient backgrounds with hover states
      • Secondary elements: muted backgrounds with subtle borders
      • Accent colors: Used sparingly for emphasis
      • Ensure WCAG AA contrast ratios
    
    Layout & Spacing:
    - Implement professional spacing:
      • Consistent grid system with gap-4/gap-6
      • Proper content padding (p-4 sm:p-6)
      • Responsive margins for different screen sizes
      • Card-based layouts with rounded-lg

    Accessibility & RTL:
    - Ensure proper RTL support:
      • Correct text alignment and flow
      • RTL-aware spacing (space-x-reverse)
      • RTL-friendly icon placement
      • Keyboard navigation support
  `;

  // - The lucide-react library is also available to be imported IF NECCESARY ONLY FOR THE FOLLOWING ICONS: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Clock, Heart, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, ArrowRight.
  // - Here's an example of importing and using one: import { Heart } from "lucide-react"\` & \`<Heart className=""  />\`.
  // - PLEASE ONLY USE THE ICONS LISTED ABOVE IF AN ICON IS NEEDED IN THE USER'S REQUEST. Please DO NOT use the lucide-react library if it's not needed.

  if (shadcn) {
    systemPrompt += `
    There are some prestyled UI components available for use. Please use your best judgement to use any of these components if the app calls for one.

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

    Remember, if you use a UI component, make sure to import it.
    `;
  }

  systemPrompt += `
    NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.

    Explain your work. The first codefence should be the main React component. It should also use "tsx" as the language, and be followed by a sensible filename for the code. Use this format: \`\`\`tsx{filename=calculator.tsx}.

    Here's an example of a good response:

    "I'll create a calculator app using React. This calculator will support basic arithmetic operations: addition, subtraction, multiplication, and division. Let's break it down into components and implement the functionality.

    \`\`\`tsx{filename=calculator.tsx}
    import { useState } from 'react'
    import { Button } from "/components/ui/button"
    import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card"

    export default function Calculator() {
      const [display, setDisplay] = useState('0')
      const [firstOperand, setFirstOperand] = useState<number | null>(null)
      const [operator, setOperator] = useState<string | null>(null)
      const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false)

      const inputDigit = (digit: string) => {
        if (waitingForSecondOperand) {
          setDisplay(digit)
          setWaitingForSecondOperand(false)
        } else {
          setDisplay(display === '0' ? digit : display + digit)
        }
      }

      const inputDecimal = () => {
        if (waitingForSecondOperand) {
          setDisplay('0.')
          setWaitingForSecondOperand(false)
          return
        }

        if (!display.includes('.')) {
          setDisplay(display + '.')
        }
      }

      const clear = () => {
        setDisplay('0')
        setFirstOperand(null)
        setOperator(null)
        setWaitingForSecondOperand(false)
      }

      const performOperation = (nextOperator: string) => {
        const inputValue = parseFloat(display)

        if (firstOperand === null) {
          setFirstOperand(inputValue)
        } else if (operator) {
          const result = calculate(firstOperand, inputValue, operator)
          setDisplay(String(result))
          setFirstOperand(result)
        }

        setWaitingForSecondOperand(true)
        setOperator(nextOperator)
      }

      const calculate = (firstOperand: number, secondOperand: number, operator: string) => {
        switch (operator) {
          case '+':
            return firstOperand + secondOperand
          case '-':
            return firstOperand - secondOperand
          case '*':
            return firstOperand * secondOperand
          case '/':
            return firstOperand / secondOperand
          default:
            return secondOperand
        }
      }

      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-4 bg-gray-100 p-2 rounded mb-2">
                <div className="text-right text-2xl font-bold">{display}</div>
              </div>
              <Button onClick={() => clear()}>C</Button>
              <Button onClick={() => inputDigit('7')}>7</Button>
              <Button onClick={() => inputDigit('8')}>8</Button>
              <Button onClick={() => inputDigit('9')}>9</Button>
              <Button onClick={() => performOperation('/')}>/</Button>
              <Button onClick={() => inputDigit('4')}>4</Button>
              <Button onClick={() => inputDigit('5')}>5</Button>
              <Button onClick={() => inputDigit('6')}>6</Button>
              <Button onClick={() => performOperation('*')}>*</Button>
              <Button onClick={() => inputDigit('1')}>1</Button>
              <Button onClick={() => inputDigit('2')}>2</Button>
              <Button onClick={() => inputDigit('3')}>3</Button>
              <Button onClick={() => performOperation('-')}>-</Button>
              <Button onClick={() => inputDigit('0')}>0</Button>
              <Button onClick={() => inputDecimal()}>.</Button>
              <Button onClick={() => performOperation('=')}>=</Button>
              <Button onClick={() => performOperation('+')}>+</Button>
            </div>
          </CardContent>
        </Card>
      )
    }
    \`\`\`

    This calculator component provides a simple and functional interface for basic arithmetic operations. Here's a breakdown of its features:

    1. Display: Shows the current input or result.
    2. Digit buttons: Allow users to input numbers.
    3. Operation buttons: +, -, *, and / for basic arithmetic operations.
    4. Clear button (C): Resets the calculator.
    5. Decimal point button: Allows input of decimal numbers.
    6. Equals button (=): Performs the calculation.

    The component uses React's useState hook to manage the state of the display, operands, and current operation. The logic handles both immediate execution of operations and chaining of multiple operations."
  `;

  // systemPrompt += `
  //   Here are some examples of a good response:

  //   ${examples
  //     .map(
  //       (example) => `
  //         <example>
  //         <prompt>
  //         ${example.prompt}
  //         </prompt>
  //         <response>
  //         ${example.response}
  //         </response>
  //         </example>
  //       `,
  //     )
  //     .join("\n")}
  // `;

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
