/**
 * Judge0 CE client for code execution.
 * @see https://ce.judge0.com/docs
 */

export const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  python3: 71,
  javascript: 63,
  js: 63,
  typescript: 74,
  ts: 74,
  cpp: 54,
  "c++": 54,
  c: 50,
  java: 62,
  rust: 73,
  go: 60,
};

export interface Judge0Status {
  id: number;
  description: string;
}

export interface Judge0SubmissionResult {
  token?: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: Judge0Status;
  time?: string;
  memory?: number;
  exit_code?: number | null;
}

export interface RunCodeOptions {
  sourceCode: string;
  language: string;
  stdin?: string;
  /** CPU time limit in seconds */
  cpuTimeLimit?: number;
  /** Memory limit in kilobytes */
  memoryLimit?: number;
}

const PROCESSING_STATUS_IDS = new Set([1, 2]);

function getBaseUrl(): string {
  return (process.env.JUDGE0_URL ?? "https://ce.judge0.com").replace(/\/$/, "");
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const apiKey = process.env.JUDGE0_API_KEY;
  if (!apiKey) return headers;

  const baseUrl = getBaseUrl();
  let host = process.env.JUDGE0_RAPIDAPI_HOST;
  if (!host) {
    try {
      host = new URL(baseUrl).host;
    } catch {
      host = "judge0-ce.p.rapidapi.com";
    }
  }

  headers["X-RapidAPI-Key"] = apiKey;
  headers["X-RapidAPI-Host"] = host;

  return headers;
}

function resolveLanguageId(language: string): number {
  const id = JUDGE0_LANGUAGE_IDS[language?.toLowerCase()];
  if (id == null) {
    throw new Error(`Unsupported language: ${language}`);
  }
  return id;
}

function buildSubmissionBody(options: RunCodeOptions): Record<string, unknown> {
  const body: Record<string, unknown> = {
    source_code: options.sourceCode,
    language_id: resolveLanguageId(options.language),
    stdin: options.stdin ?? "",
  };

  if (options.cpuTimeLimit != null) {
    body.cpu_time_limit = options.cpuTimeLimit;
  }
  if (options.memoryLimit != null) {
    body.memory_limit = options.memoryLimit;
  }

  return body;
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export async function createSubmission(
  options: RunCodeOptions,
  wait = false,
): Promise<Judge0SubmissionResult & { error?: string }> {
  const url = `${getBaseUrl()}/submissions?base64_encoded=false&wait=${wait}`;
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(buildSubmissionBody(options)),
  });

  const data = (await parseJsonResponse(res)) as Judge0SubmissionResult & {
    error?: string;
  };

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? String(data.error)
        : `Judge0 request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export async function getSubmission(
  token: string,
): Promise<Judge0SubmissionResult> {
  const url = `${getBaseUrl()}/submissions/${token}?base64_encoded=false`;
  const res = await fetch(url, { headers: getHeaders() });
  const data = (await parseJsonResponse(res)) as Judge0SubmissionResult & {
    error?: string;
  };

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? String(data.error)
        : `Failed to fetch submission (${res.status})`;
    throw new Error(message);
  }

  return data;
}

async function waitForSubmission(
  token: string,
  maxAttempts = 30,
  intervalMs = 500,
): Promise<Judge0SubmissionResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getSubmission(token);
    if (!PROCESSING_STATUS_IDS.has(result.status?.id ?? 0)) {
      return result;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("Execution timed out waiting for Judge0");
}

/** Run code synchronously (wait=true when supported, otherwise poll by token). */
export async function runCode(
  options: RunCodeOptions,
): Promise<Judge0SubmissionResult> {
  try {
    const result = await createSubmission(options, true);
    if (result.token && PROCESSING_STATUS_IDS.has(result.status?.id ?? 0)) {
      return waitForSubmission(result.token);
    }
    if (result.status?.id != null) {
      return result;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.toLowerCase().includes("wait")) {
      throw err;
    }
  }

  const created = await createSubmission(options, false);
  if (!created.token) {
    throw new Error("Judge0 did not return a submission token");
  }
  return waitForSubmission(created.token);
}

export function exitCodeFromResult(result: Judge0SubmissionResult): number {
  if (result.exit_code != null) return result.exit_code;
  const statusId = result.status?.id ?? 0;
  if (statusId === 3) return 0;
  if (statusId === 6) return 1;
  return statusId;
}
