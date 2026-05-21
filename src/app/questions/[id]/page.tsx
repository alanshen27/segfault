"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import MonacoEditor from "@/components/MonacoEditor";
import {
  type QuestionDetail,
  type PistonRunResult,
  LANGUAGES,
  BOILERPLATES,
  DIFFICULTY_COLORS,
} from "@/lib/types";

type Panel = "problem" | "code";

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
  const [panel, setPanel] = useState<Panel>("problem");

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

  const runCode = async (stdin?: string) => {
    setRunning(true);
    setOutput(null);
    setPanel("code");

    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, stdin }),
      });
      const data: PistonRunResult = await res.json();

      if (data.run) {
        const out = [
          data.run.stdout && `STDOUT:\n${data.run.stdout}`,
          data.run.stderr && `STDERR:\n${data.run.stderr}`,
          data.run.output && `OUTPUT:\n${data.run.output}`,
          data.run.signal && `Signal: ${data.run.signal}`,
          `Exit code: ${data.run.code}`,
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
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-sm text-neutral-500">Loading problem...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500">Question not found.</p>
        <Link href="/questions" className="text-primary text-sm mt-2 inline-block hover:underline">
          Back to problems
        </Link>
      </div>
    );
  }

  const difficultyColor =
    DIFFICULTY_COLORS[question.difficulty] ?? "bg-neutral-100 text-neutral-600";

  const problemPanel = (
    <div className="h-full overflow-y-auto px-5 py-6 sm:px-6">
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(question.content) }}
      />
      {question.constraints && (
        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold text-sm mb-2 text-primary">Constraints</h3>
          <div
            className="text-sm text-neutral-600 dark:text-neutral-400"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(question.constraints) }}
          />
        </div>
      )}
      {(question.sampleInput || question.sampleOutput) && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.sampleInput && (
            <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900">
              <div className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">Sample Input</div>
              <pre className="text-sm font-mono whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">{question.sampleInput}</pre>
            </div>
          )}
          {question.sampleOutput && (
            <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900">
              <div className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">Expected Output</div>
              <pre className="text-sm font-mono whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">{question.sampleOutput}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const codePanel = (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 flex flex-wrap items-center gap-2 px-4 py-3 bg-neutral-100 dark:bg-neutral-900/80">
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => runCode()}
          disabled={running}
          className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {running ? "Running..." : "Run"}
        </button>
        {question.sampleInput && (
          <button
            type="button"
            onClick={() => runCode(question.sampleInput ?? undefined)}
            disabled={running}
            className="px-4 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-sm font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-50"
          >
            Run with sample
          </button>
        )}
        <button
          type="button"
          onClick={() => { setCode(BOILERPLATES[language] || ""); setOutput(null); }}
          className="px-3 py-1.5 rounded-lg text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          Reset
        </button>
      </div>

      <div className="flex-1 min-h-[320px] p-4 pb-0">
        <MonacoEditor
          code={code}
          language={language}
          onChange={(v) => setCode(v || "")}
          height="calc(100vh - 280px)"
          className="h-full min-h-[320px]"
        />
      </div>

      {output !== null && (
        <div className="shrink-0 mx-4 mb-4 mt-3 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 max-h-48 overflow-y-auto">
          <div className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">Output</div>
          <pre className="text-sm font-mono whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">{output}</pre>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col min-h-0">
      <header className="shrink-0 px-4 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href="/questions"
              className="text-xs text-neutral-500 hover:text-primary transition-colors"
            >
              ← Back to problems
            </Link>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{question.title}</h1>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${difficultyColor}`}>
                {question.difficulty}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 mt-1">
              <span>{question.topic}</span>
              {question.bank && (
                <>
                  <span>·</span>
                  <Link href={`/questions?bankId=${question.bank.id}`} className="hover:text-primary">{question.bank.name}</Link>
                </>
              )}
              <span>·</span>
              <span>{question.timeLimit}ms / {question.memoryLimit}MB</span>
              {question.testCaseCount != null && question.testCaseCount > 0 && (
                <>
                  <span>·</span>
                  <span>{question.testCaseCount} hidden test{question.testCaseCount !== 1 ? "s" : ""}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex lg:hidden mt-3 gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-900">
          {(["problem", "code"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPanel(p)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                panel === p
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500"
              }`}
            >
              {p === "problem" ? "Problem" : "Code"}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2">
        <div className={`min-h-0 border-r border-neutral-200 dark:border-neutral-800 ${panel === "problem" ? "block" : "hidden lg:block"}`}>
          {problemPanel}
        </div>
        <div className={`min-h-0 ${panel === "code" ? "block" : "hidden lg:block"}`}>
          {codePanel}
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
