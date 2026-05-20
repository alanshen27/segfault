"use client";

import { useState } from "react";
import MonacoEditor from "@/components/MonacoEditor";
import { useRouter } from "next/navigation";

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

export default function SubmitPage() {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [content, setContent] = useState("");
  const [constraints, setConstraints] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        difficulty,
        topic,
        constraints: constraints || null,
        sampleInput: sampleInput || null,
        sampleOutput: sampleOutput || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to submit");
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/questions"), 2000);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-2xl font-bold text-green-600 mb-2">
          Submitted!
        </div>
        <p className="text-neutral-500">
          Your question has been submitted for review. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Submit a Problem</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            placeholder="e.g., Two Sum"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
              placeholder="e.g., Dynamic Programming"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Problem Statement (Markdown + LaTeX)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 font-mono text-sm"
            placeholder={`## Problem Statement\n\nWrite your problem here. Use:\n- **bold** for emphasis\n- $$formulas$$ for LaTeX\n- \`\`\` for code blocks`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Constraints (optional)
          </label>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 font-mono text-sm"
            placeholder="e.g., $$1 \\leq n \\leq 10^5$$"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Sample Input
            </label>
            <textarea
              value={sampleInput}
              onChange={(e) => setSampleInput(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 font-mono text-sm"
              placeholder="nums = [2,7,11,15], target = 9"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Sample Output
            </label>
            <textarea
              value={sampleOutput}
              onChange={(e) => setSampleOutput(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 font-mono text-sm"
              placeholder="[0,1]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Submitting for review..." : "Submit for Review"}
        </button>

        <p className="text-xs text-neutral-500 text-center">
          Your submission will be reviewed by an admin before it appears
          publicly.
        </p>
      </form>
    </div>
  );
}
