"use client";

import CodeRunnerReact from "./code-runner-react";
import { CodeRunnerErrorBoundary } from "./code-runner-error-boundary";

export default function CodeRunner({
  language,
  code,
  onError,
}: {
  language: string;
  code: string;
  onError?: (error: string) => void;
}) {
  return language === "tsx" || language === "jsx" ? (
    <div className="w-full h-full">
      {/* Container for maintaining RTL context */}
      <div dir="rtl" className="w-full h-full flex flex-col">
        <div dir="rtl" className="preview-content min-h-[100dvh]">
          <CodeRunnerErrorBoundary onError={onError}>
            <CodeRunnerReact code={code} />
          </CodeRunnerErrorBoundary>
        </div>
      </div>
    </div>
  ) : (
    <div dir="rtl">متاسفانه زبان {language} در حال حاضر پشتیبانی نمی شود</div>
  );
}
