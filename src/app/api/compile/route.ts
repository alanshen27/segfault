import { NextRequest, NextResponse } from "next/server";
import {
  exitCodeFromResult,
  runCode,
} from "@/lib/judge0";

interface CompileRequestBody {
  code: string;
  language: string;
  stdin?: string;
  /** Time limit in milliseconds (from question settings) */
  timeLimitMs?: number;
  /** Memory limit in megabytes (from question settings) */
  memoryLimitMb?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CompileRequestBody = await request.json();
    const { code, language, stdin, timeLimitMs, memoryLimitMb } = body;

    if (!code?.trim()) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }
    if (!language) {
      return NextResponse.json(
        { error: "Language is required" },
        { status: 400 },
      );
    }

    const cpuTimeLimit =
      timeLimitMs != null ? Math.max(timeLimitMs / 1000, 1) : 5;
    const memoryLimit =
      memoryLimitMb != null ? memoryLimitMb * 1024 : 256 * 1024;

    const result = await runCode({
      sourceCode: code,
      language,
      stdin,
      cpuTimeLimit,
      memoryLimit,
    });

    const exitCode = exitCodeFromResult(result);

    return NextResponse.json({
      run: {
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? "",
        output: result.compile_output ?? result.message ?? "",
        code: exitCode,
        signal: null,
      },
      status: result.status,
      time: result.time,
      memory: result.memory,
      token: result.token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes("Unsupported language") ? 400 : 500;
    return NextResponse.json(
      {
        error: "Execution failed",
        details: message,
      },
      { status },
    );
  }
}
