"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDraftCode, loadDrafts, saveDraft } from "@/lib/code-draft";
import { BOILERPLATES } from "@/lib/types";

export function useCodeDraft(questionId: string, defaultLanguage = "python") {
  const [language, setLanguageState] = useState(defaultLanguage);
  const [code, setCodeState] = useState(BOILERPLATES[defaultLanguage] ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const hydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    hydrated.current = false;
    const drafts = loadDrafts(questionId);
    const lang = drafts?.language ?? defaultLanguage;
    const restored =
      getDraftCode(questionId, lang) ?? BOILERPLATES[lang] ?? "";
    setLanguageState(lang);
    setCodeState(restored);
    hydrated.current = true;
  }, [questionId, defaultLanguage]);

  const persist = useCallback(
    (lang: string, nextCode: string) => {
      if (!hydrated.current) return;
      setSaveState("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveDraft(questionId, lang, nextCode);
        setSaveState("saved");
        saveTimer.current = setTimeout(() => setSaveState("idle"), 2000);
      }, 400);
    },
    [questionId],
  );

  const setCode = useCallback(
    (next: string) => {
      setCodeState(next);
      persist(language, next);
    },
    [language, persist],
  );

  const setLanguage = useCallback(
    (lang: string) => {
      persist(language, code);
      const nextCode =
        getDraftCode(questionId, lang) ?? BOILERPLATES[lang] ?? "";
      setLanguageState(lang);
      setCodeState(nextCode);
    },
    [questionId, language, code, persist],
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return { code, setCode, language, setLanguage, saveState };
}
