import { NextRequest, NextResponse } from "next/server";

const PISTON_URL = "https://emkc.org/api/v2/piston";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language } = body;

    const languageMap: Record<string, string> = {
      python: "python3",
      python3: "python3",
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

    const pistonLang = languageMap[language?.toLowerCase()] || language;

    const res = await fetch(`${PISTON_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: pistonLang,
        version: "*",
        files: [{ content: code }],
        stdin: body.stdin || "",
        compileTimeout: 10000,
        runTimeout: 5000,
        compileMemoryLimit: -1,
        runMemoryLimit: -1,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Compilation failed",
        details: String(error),
      },
      { status: 500 },
    );
  }
}
