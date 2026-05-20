"use client";

import { useEffect, useState } from "react";
import QuestionCard from "@/components/QuestionCard";
import { type QuestionSummary, type Difficulty, DIFFICULTIES } from "@/lib/types";

type DifficultyFilter = Difficulty | "ALL";
const FILTER_OPTIONS: readonly DifficultyFilter[] = ["ALL", ...DIFFICULTIES];

async function fetchQuestionsData(
  difficulty: DifficultyFilter,
  search: string,
): Promise<QuestionSummary[]> {
  const params = new URLSearchParams();
  if (difficulty !== "ALL") params.set("difficulty", difficulty);
  if (search) params.set("search", search);
  const res = await fetch(`/api/questions?${params.toString()}`);
  return res.json() as Promise<QuestionSummary[]>;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchQuestionsData(difficulty, "").then((data) => {
      if (!cancelled) {
        setQuestions(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [difficulty]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchQuestionsData(difficulty, search).then((data) => {
      setQuestions(data);
      setLoading(false);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Problems</h1>
        <span className="text-sm text-neutral-500">
          {questions.length} problem{questions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                difficulty === d
                  ? "bg-primary text-white border-primary"
                  : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
            >
              {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="sm:ml-auto flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems..."
            className="px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary w-48"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 animate-pulse"
            />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">{"</>"}</div>
          <p className="text-neutral-500">No problems found.</p>
          <p className="text-sm text-neutral-400 mt-1">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <QuestionCard key={q.id} {...q} />
          ))}
        </div>
      )}
    </div>
  );
}
