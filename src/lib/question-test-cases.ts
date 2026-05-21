export interface TestCaseDraft {
  id: string;
  input: string;
  output: string;
}

export function stemFromFilename(filename: string): string {
  const base = filename.replace(/^.*[/\\]/, "").replace(/\.txt$/i, "");
  return base.replace(/\.(in|out|input|output)$/i, "");
}

export function sortTestCasesByInputLength<T extends { input: string }>(cases: T[]): T[] {
  return [...cases].sort((a, b) => a.input.length - b.input.length);
}

export async function readTxtFiles(files: FileList | File[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const file of Array.from(files)) {
    if (!file.name.toLowerCase().endsWith(".txt")) {
      throw new Error(`"${file.name}" is not a .txt file`);
    }
    if (file.size > 1024 * 1024) {
      throw new Error(`"${file.name}" exceeds 1 MB`);
    }
    const text = await file.text();
    const stem = stemFromFilename(file.name);
    map.set(stem, text);
  }
  return map;
}

export function pairTestCaseMaps(
  inputs: Map<string, string>,
  outputs: Map<string, string>,
): { cases: TestCaseDraft[]; errors: string[] } {
  const errors: string[] = [];
  const cases: TestCaseDraft[] = [];

  for (const [stem, input] of inputs) {
    const output = outputs.get(stem);
    if (output === undefined) {
      errors.push(`Missing output file for "${stem}" (e.g. ${stem}.out.txt)`);
      continue;
    }
    cases.push({ id: crypto.randomUUID(), input, output });
  }

  for (const stem of outputs.keys()) {
    if (!inputs.has(stem)) {
      errors.push(`Missing input file for "${stem}" (e.g. ${stem}.in.txt)`);
    }
  }

  return { cases: sortTestCasesByInputLength(cases), errors };
}

export async function loadTestCasesFromFiles(
  inputFiles: FileList | null,
  outputFiles: FileList | null,
): Promise<{ cases: TestCaseDraft[]; errors: string[] }> {
  if (!inputFiles?.length && !outputFiles?.length) {
    return { cases: [], errors: [] };
  }
  if (!inputFiles?.length || !outputFiles?.length) {
    return { cases: [], errors: ["Upload both input and output .txt files"] };
  }

  try {
    const [inputs, outputs] = await Promise.all([
      readTxtFiles(inputFiles),
      readTxtFiles(outputFiles),
    ]);
    return pairTestCaseMaps(inputs, outputs);
  } catch (err) {
    return {
      cases: [],
      errors: [err instanceof Error ? err.message : "Failed to read files"],
    };
  }
}
