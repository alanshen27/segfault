const STORAGE_PREFIX = "segfault:draft:";

export interface QuestionDrafts {
  language: string;
  byLanguage: Record<string, { code: string; updatedAt: number }>;
}

export function draftStorageKey(questionId: string): string {
  return `${STORAGE_PREFIX}${questionId}`;
}

export function loadDrafts(questionId: string): QuestionDrafts | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(draftStorageKey(questionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuestionDrafts;
    if (!parsed?.byLanguage || typeof parsed.language !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(
  questionId: string,
  language: string,
  code: string,
): void {
  if (typeof window === "undefined") return;
  const existing = loadDrafts(questionId);
  const byLanguage = { ...existing?.byLanguage };
  byLanguage[language] = { code, updatedAt: Date.now() };
  const next: QuestionDrafts = {
    language,
    byLanguage,
  };
  try {
    localStorage.setItem(draftStorageKey(questionId), JSON.stringify(next));
  } catch {
    // quota exceeded — ignore
  }
}

export function getDraftCode(
  questionId: string,
  language: string,
): string | null {
  const drafts = loadDrafts(questionId);
  return drafts?.byLanguage[language]?.code ?? null;
}
