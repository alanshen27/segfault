"use client";

import { useEffect, useState, use } from "react";
import MonacoEditor from "@/components/MonacoEditor";

interface Question {
  id: string;
  title: string;
  content: string;
  difficulty: string;
  topic: string;
  constraints: string | null;
  sampleInput: string | null;
  sampleOutput: string | null;
  timeLimit: number;
  memoryLimit: number;
  author: { name: string };
  bank: { name: string } | null;
}

interface RunResult {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  language: string;
  version: string;
}

const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
];

const BOILERPLATES: Record<string, string> = {
  python: `def solve():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    solve()`,
  javascript: `function solve() {\n    // Your code here\n}\n\nsolve();`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
  java: `class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
  rust: `fn main() {\n    // Your code here\n}`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n    fmt.Println("Hello")\n}`,
};

const difficultyColors: Record<string, string> = {
  EASY: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  MEDIUM:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  HARD: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(BOILERPLATES.python);
  const [language, setLanguage] = useState("python");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/questions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestion(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(BOILERPLATES[lang] || "");
    setOutput(null);
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);

    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data: RunResult = await res.json();

      if (data.run) {
        const out = [
          data.run.stdout && `STDOUT:\n${data.run.stdout}`,
          data.run.stderr && `STDERR:\n${data.run.stderr}`,
          data.run.output && `OUTPUT:\n${data.run.output}`,
          data.run.signal && `Signal: ${data.run.signal}`,
          `Exit Code: ${data.run.code}`,
        ]
          .filter(Boolean)
          .join("\n\n");

        setOutput(out || "(no output)");
      } else {
        setOutput(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setOutput(`Error: ${String(err)}`);
    }

    setRunning(false);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-neutral-500">
        Loading...
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-neutral-500">
        Question not found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{question.title}</h1>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColors[question.difficulty]}`}
          >
            {question.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <span>{question.topic}</span>
          {question.bank && (
            <>
              <span>&middot;</span>
              <span>{question.bank.name}</span>
            </>
          )}
          <span>&middot;</span>
          <span>by {question.author.name}</span>
          <span>&middot;</span>
          <span>
            {question.timeLimit}ms / {question.memoryLimit}MB
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-auto max-h-[70vh]">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(question.content) }}
            />
            {question.constraints && (
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="font-medium text-sm mb-2">Constraints</h3>
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(question.constraints),
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleRun}
              disabled={running}
              className="px-4 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {running ? "Running..." : "Run Code"}
            </button>
          </div>

          <MonacoEditor
            code={code}
            language={language}
            onChange={(v) => setCode(v || "")}
          />

          {output !== null && (
            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <div className="text-xs font-medium text-neutral-500 mb-1">
                Output
              </div>
              <pre className="text-sm font-mono whitespace-pre-wrap text-neutral-900 dark:text-neutral-100">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/^### (.+)$/gm, "<h3 class='text-base font-semibold mt-4 mb-2'>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2 class='text-lg font-semibold mt-4 mb-2'>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1 class='text-xl font-bold mt-4 mb-2'>$1</h1>");

  html = html.replace(/\$\$([^$]+)\$\$/g, "<div class='text-center py-1 font-mono text-sm'>$1</div>");
  html = html.replace(/\$([^$]+)\$/g, "<code class='font-mono text-sm'>$1</code>");

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, "<pre class='bg-neutral-100 dark:bg-neutral-800 p-3 rounded text-sm overflow-x-auto'><code>$2</code></pre>");

  html = html.replace(/`([^`]+)`/g, "<code class='bg-neutral-100 dark:bg-neutral-800 px-1 rounded text-sm font-mono'>$1</code>");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  html = html.replace(/\n\n/g, "</p><p>");
  html = "<p>" + html + "</p>";

  html = html.replace(/<p><h/g, "<h");
  html = html.replace(/<\/h(\d)><\/p>/g, "</h$1>");
  html = html.replace(/<p><pre/g, "<pre");
  html = html.replace(/<\/pre><\/p>/g, "</pre>");

  return html;
}
