"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  type QuestionSummary,
  type Difficulty,
  type BankSummary,
  type PaginatedResponse,
  DIFFICULTIES,
  DIFFICULTY_COLORS,
} from "@/lib/types";

type DifficultyFilter = Difficulty | "ALL";
type SortOption = "newest" | "oldest" | "title";

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPage = parseInt(searchParams.get("page") ?? "1", 10);
  const initialDiff = (searchParams.get("difficulty") ?? "ALL") as DifficultyFilter;
  const initialBank = searchParams.get("bankId") ?? "";
  const initialTopic = searchParams.get("topic") ?? "";
  const initialSort = (searchParams.get("sort") ?? "newest") as SortOption;
  const initialSearch = searchParams.get("search") ?? "";

  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(initialPage);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>(initialDiff);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [search, setSearch] = useState(initialSearch);
  const [bankId, setBankId] = useState(initialBank);
  const [topic, setTopic] = useState(initialTopic);
  const [banks, setBanks] = useState<BankSummary[]>([]);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/banks")
      .then((r) => r.json())
      .then((data: BankSummary[]) => { if (active) setBanks(data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (difficulty !== "ALL") params.set("difficulty", difficulty);
    if (search) params.set("search", search);
    if (bankId) params.set("bankId", bankId);
    if (topic) params.set("topic", topic);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("pageSize", "20");

    fetch(`/api/questions?${params.toString()}`)
      .then((r) => r.json())
      .then((res: PaginatedResponse<QuestionSummary>) => {
        if (!active) return;
        setQuestions(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setLoading(false);

        const uniqueTopics = [...new Set(res.data.map((q) => q.topic))].sort();
        setTopics((prev) => {
          const merged = [...new Set([...prev, ...uniqueTopics])].sort();
          return merged;
        });
      })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [difficulty, search, bankId, topic, sort, page]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (difficulty !== "ALL") params.set("difficulty", difficulty);
    if (bankId) params.set("bankId", bankId);
    if (topic) params.set("topic", topic);
    if (sort !== "newest") params.set("sort", sort);
    if (search) params.set("search", search);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "/questions", { scroll: false });
  }, [page, difficulty, bankId, topic, sort, search, router]);

  const resetFilters = () => {
    setDifficulty("ALL");
    setBankId("");
    setTopic("");
    setSort("newest");
    setSearch("");
    setPage(1);
  };

  const hasFilters = difficulty !== "ALL" || bankId || topic || sort !== "newest" || search;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Problems</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {total} problem{total !== 1 ? "s" : ""} available
          </p>
        </div>
        <Link
          href="/submit"
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          Submit Problem
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 mb-5 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider mr-1">Difficulty</span>
          {(["ALL", ...DIFFICULTIES] as DifficultyFilter[]).map((d) => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); setPage(1); }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                difficulty === d
                  ? "bg-primary text-white"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={bankId}
            onChange={(e) => { setBankId(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            <option value="">All Banks</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {topics.length > 0 && (
            <select
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              <option value="">All Topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Alphabetical</option>
          </select>

          <form onSubmit={handleSearch} className="ml-auto flex items-center gap-1.5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-primary/40 w-40"
            />
          </form>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3 opacity-40">{"</>"}</div>
          <p className="text-neutral-500 font-medium">No problems found</p>
          <p className="text-sm text-neutral-400 mt-1">
            {hasFilters ? "Try adjusting your filters." : "Check back later for new problems."}
          </p>
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-[1fr_100px_140px_120px] gap-2 px-4 py-2 text-xs font-medium text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
            <span>Title</span>
            <span>Difficulty</span>
            <span>Topic</span>
            <span>Bank</span>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
            {questions.map((q, idx) => {
              const diffColor = DIFFICULTY_COLORS[q.difficulty] ?? "bg-neutral-100 text-neutral-600";
              return (
                <Link
                  key={q.id}
                  href={`/questions/${q.id}`}
                  className="group grid grid-cols-1 sm:grid-cols-[1fr_100px_140px_120px] gap-1 sm:gap-2 items-center px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs text-neutral-300 dark:text-neutral-700 font-mono w-6 shrink-0 text-right">
                      {(page - 1) * 20 + idx + 1}
                    </span>
                    <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {q.title}
                    </span>
                  </div>
                  <div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diffColor}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 truncate">{q.topic}</span>
                  <span className="text-xs text-neutral-400 truncate">
                    {q.bank?.name ?? "—"}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-500">
                Page {page} of {totalPages} &middot; {total} total
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  First
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let p: number;
                  if (totalPages <= 5) {
                    p = i + 1;
                  } else if (page <= 3) {
                    p = i + 1;
                  } else if (page >= totalPages - 2) {
                    p = totalPages - 4 + i;
                  } else {
                    p = page - 2 + i;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                        p === page
                          ? "bg-primary text-white border-primary"
                          : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Next
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
