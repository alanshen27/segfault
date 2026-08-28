"use client";

import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LANGUAGE_MAP } from "@/lib/types";
import {
  getSegfaultTheme,
  registerMonacoThemes,
  SEGFAULT_DARK_THEME,
} from "@/lib/monaco-theme";

interface MonacoEditorProps {
  code: string;
  language: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  height?: string;
  className?: string;
}

function subscribeToColorScheme(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getColorSchemeSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getColorSchemeServerSnapshot() {
  return true;
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
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const isDark = useSyncExternalStore(
    subscribeToColorScheme,
    getColorSchemeSnapshot,
    getColorSchemeServerSnapshot,
  );
  const theme = getSegfaultTheme(isDark);

  const handleBeforeMount: BeforeMount = (monaco) => {
    registerMonacoThemes(monaco);
  };

  const handleMount: OnMount = (_editor, monaco) => {
    monacoRef.current = monaco;
    monaco.editor.setTheme(theme);
    setMounted(true);
  };

  useEffect(() => {
    monacoRef.current?.editor.setTheme(theme);
  }, [theme]);

  const mappedLang = LANGUAGE_MAP[language?.toLowerCase()] || "plaintext";

  return (
    <div
      className={`rounded-xl overflow-hidden border border-primary-200/70 dark:border-neutral-800 ${
        isDark ? "bg-neutral-950" : "bg-white"
      } ${className}`}
    >
      {!mounted && (
        <div
          className={`h-12 flex items-center px-4 border-b ${
            isDark
              ? "bg-neutral-900 border-neutral-800"
              : "bg-neutral-50 border-neutral-200"
          }`}
        >
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
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        theme={mounted ? theme : SEGFAULT_DARK_THEME}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
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
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
}
