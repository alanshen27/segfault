"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useRef, useState } from "react";

interface MonacoEditorProps {
  code: string;
  language: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
}

const languageMap: Record<string, string> = {
  python: "python",
  python3: "python",
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  cpp: "cpp",
  c: "c",
  java: "java",
  rust: "rust",
  go: "go",
};

export default function MonacoEditor({
  code,
  language,
  onChange,
  readOnly = false,
}: MonacoEditorProps) {
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    setMounted(true);
  };

  const mappedLang = languageMap[language?.toLowerCase()] || "plaintext";

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      {!mounted && (
        <div className="h-16 bg-neutral-50 dark:bg-neutral-900 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-700">
          <span className="text-xs text-neutral-500">Loading editor...</span>
        </div>
      )}
      <Editor
        height="400px"
        language={mappedLang}
        value={code}
        onChange={onChange}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          readOnly,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 12 },
        }}
      />
    </div>
  );
}
