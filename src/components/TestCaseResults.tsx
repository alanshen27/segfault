import { type TestCaseRunResult } from "@/lib/types";

interface TestCaseResultsProps {
  results: TestCaseRunResult[];
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
}

export default function TestCaseResults({
  results,
  passedCount,
  totalCount,
  allPassed,
}: TestCaseResultsProps) {
  return (
    <div className="shrink-0 mx-4 mb-4 mt-3 space-y-3 max-h-64 overflow-y-auto">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Test results
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            allPassed
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          {passedCount}/{totalCount} passed
        </span>
      </div>

      <div className="space-y-2">
        {results.map((r) => (
          <div
            key={r.index}
            className={`rounded-lg border px-3 py-2 text-sm ${
              r.passed
                ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{r.label}</span>
              <span
                className={`text-xs font-semibold ${
                  r.passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {r.passed ? "Pass" : r.status}
              </span>
            </div>
            {(r.time != null || r.memory != null) && (
              <div className="text-xs text-neutral-500 mt-1">
                {r.time != null && `${r.time}s`}
                {r.time != null && r.memory != null && " · "}
                {r.memory != null && `${r.memory} KB`}
              </div>
            )}
            {r.expected != null && (
              <pre className="mt-2 text-xs font-mono whitespace-pre-wrap text-neutral-600 dark:text-neutral-400">
                Expected: {r.expected}
                {r.actual != null && `\nGot: ${r.actual}`}
              </pre>
            )}
            {r.stderr && (
              <pre className="mt-1 text-xs font-mono whitespace-pre-wrap text-red-600 dark:text-red-400">
                {r.stderr}
              </pre>
            )}
            {r.compileOutput && (
              <pre className="mt-1 text-xs font-mono whitespace-pre-wrap text-amber-700 dark:text-amber-400">
                {r.compileOutput}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
