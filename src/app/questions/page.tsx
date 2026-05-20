"use client";

import { useEffect, useState } from "react";
import QuestionCard from "@/components/QuestionCard";

interface Question {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
  author: { name: string };
  bank: { name: string } | null;
}

const DIFFICULTIES = ["ALL", "EASY", "MEDIUM", "HARD"];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, [difficulty]);

  const fetchQuestions = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (difficulty !== "ALL") params.set("difficulty", difficulty);
    if (search) params.set("search", search);

    const res = await fetch(`/api/questions?${params}`);
    const data = await res.json();
    setQuestions(data);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Problems</h1>
      </div>

      <div className="flex gap-3 mb-6">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              difficulty === d
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
          </button>
        ))}
        <form onSubmit={handleSearch} className="ml-auto flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 w-48"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center text-neutral-500 py-12">Loading...</div>
      ) : questions.length === 0 ? (
        <div className="text-center text-neutral-500 py-12">
          No problems found.
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
