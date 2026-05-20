import { NextRequest, NextResponse } from "next/server";
import { PISTON_LANGUAGE_MAP } from "@/lib/types";

const PISTON_URL = "https://emkc.org/api/v2/piston";

interface CompileRequestBody {
  code: string;
  language: string;
  stdin?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CompileRequestBody = await request.json();
    const { code, language } = body;

    const pistonLang = PISTON_LANGUAGE_MAP[language?.toLowerCase()] || language;

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

    const data: unknown = await res.json();
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
