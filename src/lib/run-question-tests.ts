import { runCode, exitCodeFromResult } from "@/lib/judge0";
import { outputsMatch } from "@/lib/output-compare";
import { SUBMISSION_STATUS } from "@/lib/types";

export interface QuestionTestInput {
  label: string;
  input: string;
  expected: string;
  isSample: boolean;
}

export interface TestCaseRunResult {
  index: number;
  label: string;
  passed: boolean;
  status: string;
  time?: string;
  memory?: number;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  expected?: string;
  actual?: string;
}

export interface RunQuestionTestsResult {
  results: TestCaseRunResult[];
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
}

function buildTestCases(question: {
  sampleInput: string | null;
  sampleOutput: string | null;
  testCases: { input: string; output: string }[];
}): QuestionTestInput[] {
  const tests: QuestionTestInput[] = [];

  if (question.sampleInput != null && question.sampleOutput != null) {
    tests.push({
      label: "Sample",
      input: question.sampleInput,
      expected: question.sampleOutput,
      isSample: true,
    });
  }

  question.testCases.forEach((tc, i) => {
    tests.push({
      label: `Test ${i + 1}`,
      input: tc.input,
      expected: tc.output,
      isSample: false,
    });
  });

  return tests;
}

function truncate(s: string, max = 500): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

function judgeStatusLabel(statusId: number, description: string): string {
  if (statusId === 3) return "Accepted";
  if (statusId === 4) return "Wrong Answer";
  if (statusId === 5) return "Time Limit Exceeded";
  if (statusId === 6) return "Compilation Error";
  if (statusId === 11) return "Runtime Error";
  return description;
}

export async function runQuestionTests(
  question: {
    sampleInput: string | null;
    sampleOutput: string | null;
    timeLimit: number;
    memoryLimit: number;
    testCases: { input: string; output: string }[];
  },
  code: string,
  language: string,
): Promise<RunQuestionTestsResult> {
  const tests = buildTestCases(question);
  if (tests.length === 0) {
    throw new Error("No test cases configured for this problem");
  }

  const cpuTimeLimit = Math.max(question.timeLimit / 1000, 1);
  const memoryLimit = question.memoryLimit * 1024;

  const results: TestCaseRunResult[] = [];

  for (let index = 0; index < tests.length; index++) {
    const test = tests[index];
    const execution = await runCode({
      sourceCode: code,
      language,
      stdin: test.input,
      cpuTimeLimit,
      memoryLimit,
    });

    const statusId = execution.status?.id ?? 0;
    const status = judgeStatusLabel(
      statusId,
      execution.status?.description ?? "Unknown",
    );
    const exitCode = exitCodeFromResult(execution);
    const stdout = execution.stdout ?? "";
    const stderr = execution.stderr ?? "";
    const compileOutput = execution.compile_output ?? "";

    let passed = false;
    if (statusId === 3 && exitCode === 0) {
      passed = outputsMatch(stdout, test.expected);
    }

    const result: TestCaseRunResult = {
      index,
      label: test.label,
      passed,
      status: passed ? "Accepted" : statusId === 3 ? "Wrong Answer" : status,
      time: execution.time,
      memory: execution.memory,
    };

    if (test.isSample || !passed) {
      if (stdout) result.stdout = truncate(stdout);
      if (stderr) result.stderr = truncate(stderr);
      if (compileOutput) result.compileOutput = truncate(compileOutput);
    }

    if (test.isSample && !passed) {
      result.expected = truncate(test.expected);
      result.actual = truncate(stdout);
    }

    results.push(result);
  }

  const passedCount = results.filter((r) => r.passed).length;

  return {
    results,
    passedCount,
    totalCount: results.length,
    allPassed: passedCount === results.length,
  };
}

export function submissionStatusFromRun(
  result: RunQuestionTestsResult,
): (typeof SUBMISSION_STATUS)[keyof typeof SUBMISSION_STATUS] {
  if (result.allPassed) return SUBMISSION_STATUS.ACCEPTED;
  const firstFail = result.results.find((r) => !r.passed);
  if (!firstFail) return SUBMISSION_STATUS.WRONG_ANSWER;
  const s = firstFail.status.toLowerCase();
  if (s.includes("time limit")) return SUBMISSION_STATUS.TIME_LIMIT;
  if (s.includes("runtime") || s.includes("compilation")) {
    return SUBMISSION_STATUS.RUNTIME_ERROR;
  }
  return SUBMISSION_STATUS.WRONG_ANSWER;
}

export { buildTestCases };
