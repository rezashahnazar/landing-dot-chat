import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function extractFirstCodeBlock(input: string) {
  // 1) We use a more general pattern for the code fence:
  //    - ^```([^\n]*) captures everything after the triple backticks up to the newline.
  //    - ([\s\S]*?) captures the *body* of the code block (non-greedy).
  //    - Then we look for a closing backticks on its own line (\n```).
  // The 'm' (multiline) flag isn't strictly necessary here, but can help if input is multiline.
  // The '([\s\S]*?)' is a common trick to match across multiple lines non-greedily.
  const match = input.match(/```([^\n]*)\n([\s\S]*?)\n```/);

  if (match) {
    const fenceTag = match[1] || ""; // e.g. "tsx{filename=Calculator.tsx}"
    const code = match[2]; // The actual code block content
    const fullMatch = match[0]; // Entire matched string including backticks

    // We'll parse the fenceTag to extract optional language and filename
    let language: string | null = null;
    let filename: { name: string; extension: string } | null = null;

    // Attempt to parse out the language, which we assume is the leading alphanumeric part
    // Example: fenceTag = "tsx{filename=Calculator.tsx}"
    const langMatch = fenceTag.match(/^([A-Za-z0-9]+)/);
    if (langMatch) {
      language = langMatch[1];
    }

    // Attempt to parse out a filename from braces, e.g. {filename=Calculator.tsx}
    const fileMatch = fenceTag.match(/{\s*filename\s*=\s*([^}]+)\s*}/);
    if (fileMatch) {
      filename = parseFileName(fileMatch[1]);
    }

    return { code, language, filename, fullMatch };
  }
  return null; // No code block found
}

function parseFileName(fileName: string): { name: string; extension: string } {
  // Split the string at the last dot
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    // No dot found
    return { name: fileName, extension: "" };
  }
  return {
    name: fileName.slice(0, lastDotIndex),
    extension: fileName.slice(lastDotIndex + 1),
  };
}

export function splitByFirstCodeFence(markdown: string) {
  const result: {
    type: "text" | "first-code-fence" | "first-code-fence-generating";
    content: string;
    filename: { name: string; extension: string };
    language: string;
  }[] = [];

  // For completed messages, use the normal code block extraction first
  const codeBlocks = markdown.match(/```([^\n]*)\n([\s\S]*?)\n```/g) || [];

  if (codeBlocks.length > 0) {
    const firstBlock = codeBlocks[0];
    if (!firstBlock) return result;

    // Get the first code block's metadata
    const firstBlockMatch = firstBlock.match(/```([^\n]*)\n([\s\S]*?)\n```/);
    if (!firstBlockMatch) return result;

    const fenceTag = firstBlockMatch[1] || "";
    const fileMatch = fenceTag.match(/{\s*filename\s*=\s*([^}]+)\s*}/);
    const extractedFilename = fileMatch ? fileMatch[1] : null;
    const parsedFilename = extractedFilename
      ? parseFileName(extractedFilename)
      : { name: "code", extension: "tsx" };

    // Extract language from the portion of fenceTag before '{'
    const bracketIndex = fenceTag.indexOf("{");
    const language =
      bracketIndex > -1
        ? fenceTag.substring(0, bracketIndex).trim()
        : fenceTag.trim() || "tsx";

    // Split the markdown into parts
    const parts = markdown.split(/```[^\n]*\n[\s\S]*?\n```/);

    // Add text before first code block if exists
    if (parts[0].trim()) {
      result.push({
        type: "text",
        content: parts[0].trim(),
        filename: { name: "", extension: "" },
        language: "",
      });
    }

    // Add the code block
    const codeContent = codeBlocks
      .map((block) => {
        const match = block.match(/```[^\n]*\n([\s\S]*?)\n```/);
        return match ? match[1] : "";
      })
      .join("\n\n");

    result.push({
      type: "first-code-fence",
      content: codeContent,
      filename: parsedFilename,
      language,
    });

    // Add any remaining text if exists
    if (parts[parts.length - 1].trim()) {
      result.push({
        type: "text",
        content: parts[parts.length - 1].trim(),
        filename: { name: "", extension: "" },
        language: "",
      });
    }

    return result;
  }

  // Check if we're in the middle of generating code
  const isGenerating = markdown.includes("```") && !markdown.endsWith("```");

  // If we're generating, treat everything after the first ``` as a code block
  if (isGenerating) {
    const parts = markdown.split(/```([^\n]*)\n/);

    // The text before the first code fence
    if (parts[0].trim()) {
      result.push({
        type: "text",
        content: parts[0].trim(),
        filename: { name: "", extension: "" },
        language: "",
      });
    }

    // If we have a fence tag and content
    if (parts.length >= 3) {
      const fenceTag = parts[1] || "";
      const generatingCode = parts.slice(2).join("");

      // Parse the fence tag for language and filename
      const fileMatch = fenceTag.match(/{\s*filename\s*=\s*([^}]+)\s*}/);
      const extractedFilename = fileMatch ? fileMatch[1] : null;
      const parsedFilename = extractedFilename
        ? parseFileName(extractedFilename)
        : { name: "code", extension: "tsx" };

      // Extract language from the portion of fenceTag before '{'
      const bracketIndex = fenceTag.indexOf("{");
      const language =
        bracketIndex > -1
          ? fenceTag.substring(0, bracketIndex).trim()
          : fenceTag.trim() || "tsx";

      // Add the generating code block
      result.push({
        type: "first-code-fence-generating",
        content: generatingCode.trim(),
        filename: parsedFilename,
        language,
      });
    }

    return result;
  }

  // If no code blocks found, treat everything as text
  result.push({
    type: "text",
    content: markdown,
    filename: { name: "", extension: "" },
    language: "",
  });

  return result;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
