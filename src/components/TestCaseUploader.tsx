"use client";

import { useId, useState } from "react";
import {
  type TestCaseDraft,
  loadTestCasesFromFiles,
} from "@/lib/question-test-cases";

interface TestCaseUploaderProps {
  testCases: TestCaseDraft[];
  onChange: (cases: TestCaseDraft[]) => void;
  disabled?: boolean;
}

export default function TestCaseUploader({
  testCases,
  onChange,
  disabled = false,
}: TestCaseUploaderProps) {
  const inputId = useId();
  const outputId = useId();
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (
    inputFiles: FileList | null,
    outputFiles: FileList | null,
  ) => {
    setLoading(true);
    setErrors([]);
    try {
      const result = await loadTestCasesFromFiles(inputFiles, outputFiles);
      if (result.errors.length > 0) {
        setErrors(result.errors);
      }
      if (result.cases.length > 0) {
        onChange(result.cases);
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Failed to read files"]);
    } finally {
      setLoading(false);
    }
  };

  const removeCase = (id: string) => {
    onChange(testCases.filter((tc) => tc.id !== id));
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">
          Hidden test cases
          <span className="font-normal text-neutral-400 ml-1">(.txt files, optional)</span>
        </label>
        <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
          Upload matching pairs like <code className="text-neutral-600 dark:text-neutral-400">1.in.txt</code> /{" "}
          <code className="text-neutral-600 dark:text-neutral-400">1.out.txt</code>.
          Cases are stored sorted by input length (shortest first).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block" htmlFor={inputId}>
          <span className="text-xs font-medium text-neutral-500 mb-1.5 block">Input files</span>
          <input
            id={inputId}
            type="file"
            accept=".txt,text/plain"
            multiple
            disabled={disabled || loading}
            onChange={(e) => {
              const outputs = (document.getElementById(outputId) as HTMLInputElement | null)?.files ?? null;
              void handleFiles(e.target.files, outputs);
              e.target.value = "";
            }}
            className="block w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-neutral-700 dark:file:text-neutral-300 hover:file:bg-neutral-200 dark:hover:file:bg-neutral-700"
          />
        </label>
        <label className="block" htmlFor={outputId}>
          <span className="text-xs font-medium text-neutral-500 mb-1.5 block">Output files</span>
          <input
            id={outputId}
            type="file"
            accept=".txt,text/plain"
            multiple
            disabled={disabled || loading}
            onChange={(e) => {
              const inputs = (document.getElementById(inputId) as HTMLInputElement | null)?.files ?? null;
              void handleFiles(inputs, e.target.files);
              e.target.value = "";
            }}
            className="block w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-neutral-700 dark:file:text-neutral-300 hover:file:bg-neutral-200 dark:hover:file:bg-neutral-700"
          />
        </label>
      </div>

      {loading && (
        <p className="text-xs text-neutral-500">Reading files...</p>
      )}

      {errors.length > 0 && (
        <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      {testCases.length > 0 && (
        <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900/50 overflow-hidden">
          <div className="px-3 py-2 border-b border-primary-200/70 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              {testCases.length} test case{testCases.length !== 1 ? "s" : ""} · sorted by input length
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange([])}
              className="text-xs text-red-500 hover:underline disabled:opacity-50"
            >
              Clear all
            </button>
          </div>
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 max-h-48 overflow-y-auto">
            {testCases.map((tc, index) => (
              <li key={tc.id} className="px-3 py-2 flex items-center gap-3 text-xs">
                <span className="font-mono text-neutral-400 w-5 shrink-0">{index + 1}</span>
                <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
                  <span className="truncate text-neutral-600 dark:text-neutral-400">
                    in: {tc.input.length.toLocaleString()} chars
                  </span>
                  <span className="truncate text-neutral-600 dark:text-neutral-400">
                    out: {tc.output.length.toLocaleString()} chars
                  </span>
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeCase(tc.id)}
                  className="text-neutral-400 hover:text-red-500 shrink-0"
                  aria-label="Remove test case"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
