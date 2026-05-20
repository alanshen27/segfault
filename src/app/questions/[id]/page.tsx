"use client";

import { useEffect, useState, use } from "react";
import MonacoEditor from "@/components/MonacoEditor";
import {
  type QuestionDetail,
  type PistonRunResult,
  LANGUAGES,
  BOILERPLATES,
  DIFFICULTY_COLORS,
} from "@/lib/types";

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(BOILERPLATES.python);
  const [language, setLanguage] = useState("python");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/questions/${id}`)
      .then((r) => r.json())
      .then((data: QuestionDetail) => {
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
      const data: PistonRunResult = await res.json();

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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">404</div>
        <p className="text-neutral-500">Question not found.</p>
      </div>
    );
  }

  const difficultyColor =
    DIFFICULTY_COLORS[question.difficulty] ?? "bg-neutral-100 text-neutral-600";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{question.title}</h1>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${difficultyColor}`}
          >
            {question.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {question.topic}
          </span>
          {question.bank && (
            <>
              <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
              <span>{question.bank.name}</span>
            </>
          )}
          <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
          <span>by {question.author.name}</span>
          <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            {question.timeLimit}ms / {question.memoryLimit}MB
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-auto max-h-[70vh]">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(question.content) }}
            />
            {question.constraints && (
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="font-medium text-sm mb-2 text-primary">Constraints</h3>
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(question.constraints),
                  }}
                />
              </div>
            )}
          </div>

          {(question.sampleInput || question.sampleOutput) && (
            <div className="grid grid-cols-2 gap-3">
              {question.sampleInput && (
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                  <div className="text-xs font-medium text-neutral-500 mb-1.5">Sample Input</div>
                  <pre className="text-sm font-mono whitespace-pre-wrap">{question.sampleInput}</pre>
                </div>
              )}
              {question.sampleOutput && (
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                  <div className="text-xs font-medium text-neutral-500 mb-1.5">Expected Output</div>
                  <pre className="text-sm font-mono whitespace-pre-wrap">{question.sampleOutput}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
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
              className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {running ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Run Code
                </>
              )}
            </button>
          </div>

          <MonacoEditor
            code={code}
            language={language}
            onChange={(v) => setCode(v || "")}
          />

          {output !== null && (
            <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <div className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
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

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, "<pre class='bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg text-sm overflow-x-auto'><code>$2</code></pre>");

  html = html.replace(/`([^`]+)`/g, "<code class='bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono'>$1</code>");

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
