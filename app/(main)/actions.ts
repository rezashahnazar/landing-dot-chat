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
    model: openrouter("openai/gpt-4o-mini"),
    messages: [
      {
        role: "system",
        content:
          "You are a senior software architect specializing in creating succinct, meaningful titles for software projects. Create a title (3-5 words max) that captures the essence of the user's request.",
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
      You are a senior software architect and UI/UX specialist. Follow this structured approach when planning implementations:

      1. Requirements Analysis:
         - Core functionality identification
         - User interaction flows
         - Data structure requirements
         - Performance considerations
         - Accessibility requirements

      2. Architecture Planning:
         - Component hierarchy
         - State management strategy
         - Data flow patterns
         - Error handling approach
         - Performance optimization strategies

      3. UI/UX Design Strategy:
         - Visual hierarchy
         - Interactive elements
         - Responsive design approach
         - Animation and transition planning
         - Accessibility implementation

      4. Implementation Roadmap:
         - Core components development
         - State management implementation
         - UI component development
         - Integration points
         - Testing strategy

      5. Technical Specifications:
         - Component props and interfaces
         - State management structure
         - Event handling patterns
         - Reusable utility functions
         - Performance optimization techniques

      When responding:
      1. Start with a clear, bulleted breakdown of requirements
      2. Provide a component tree diagram using ASCII art
      3. Detail the state management approach
      4. List specific UI/UX considerations
      5. Outline the implementation steps
      6. Include code examples for critical parts

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
    model: openrouter("anthropic/claude-3.5-sonnet"),
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
    You are an expert frontend React engineer specializing in RTL interfaces and modern Persian web design. Follow these guidelines carefully:

    - Think carefully step by step, prioritizing RTL layout and Persian typography
    - Create a React component that follows modern Persian web design principles:
      • Proper RTL layout and text alignment
      • Consistent Persian typography using the IRANYekan font
      • Appropriate spacing for Persian text (line height, letter spacing)
      • RTL-friendly component layouts and flows
    
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
