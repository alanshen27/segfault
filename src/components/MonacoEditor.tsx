"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { useRef, useState } from "react";
import { LANGUAGE_MAP } from "@/lib/types";

interface MonacoEditorProps {
  code: string;
  language: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  height?: string;
  className?: string;
}

export default function MonacoEditor({
  code,
  language,
  onChange,
  readOnly = false,
  height = "400px",
  className = "",
}: MonacoEditorProps) {
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    setMounted(true);
  };

  const mappedLang = LANGUAGE_MAP[language?.toLowerCase()] || "plaintext";

  return (
    <div className={`rounded-xl overflow-hidden bg-[#1e1e1e] ${className}`}>
      {!mounted && (
        <div className="h-12 bg-[#252526] flex items-center px-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading editor...
          </div>
        </div>
      )}
      <Editor
        height={height}
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
          renderLineHighlight: "gutter",
          cursorBlinking: "smooth",
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
