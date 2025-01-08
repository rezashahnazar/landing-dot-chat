import CodeRunnerReact from "./code-runner-react";

export default function CodeRunner({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  return language === "tsx" ? (
    <CodeRunnerReact code={code} />
  ) : (
    <div>متاسفانه زبان {language} در حال حاضر پشتیبانی نمی شود</div>
  );
}
