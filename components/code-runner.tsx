import CodeRunnerReact from "./code-runner-react";

export default function CodeRunner({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  return language === "tsx" ? (
    <div className="w-full h-full">
      {/* Container for maintaining RTL context */}
      <div dir="rtl" className="w-full h-full flex flex-col">
        <div dir="rtl" className="preview-content">
          <CodeRunnerReact code={code} />
        </div>
      </div>
    </div>
  ) : (
    <div dir="rtl">متاسفانه زبان {language} در حال حاضر پشتیبانی نمی شود</div>
  );
}
