"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [bankId, setBankId] = useState(initialBank);
  const [topic, setTopic] = useState(initialTopic);
  const [banks, setBanks] = useState<BankSummary[]>([]);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/banks").then((r) => r.json()),
      fetch("/api/questions/topics").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([banksData, topicsData]: [BankSummary[], string[]]) => {
        if (active) {
          setBanks(banksData);
          setTopics(topicsData);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      setSearch((prev) => {
        if (next !== prev) setPage(1);
        return next;
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
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

  const activeBank = useMemo(
    () => banks.find((b) => b.id === bankId),
    [banks, bankId],
  );

  const resetFilters = () => {
    setDifficulty("ALL");
    setBankId("");
    setTopic("");
    setSort("newest");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const hasFilters = difficulty !== "ALL" || bankId || topic || sort !== "newest" || search;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Practice</p>
          <h1 className="text-3xl font-bold tracking-tight">
            {activeBank ? activeBank.name : "Problems"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {total} problem{total !== 1 ? "s" : ""}
            {activeBank ? ` in ${activeBank.name}` : " available"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/banks"
            className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            Banks
          </Link>
          <Link
            href="/submit"
            className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            Submit Problem
          </Link>
        </div>
      </div>

      <div className="mb-5 space-y-3">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, topic, or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", ...DIFFICULTIES] as DifficultyFilter[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => { setDifficulty(d); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                difficulty === d
                  ? "bg-primary text-white"
                  : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              }`}
            >
              {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}

          <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block" />

          <select
            value={bankId}
            onChange={(e) => { setBankId(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">All banks</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {topics.length > 0 && (
            <select
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setPage(1); }}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">All topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">A–Z</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-primary font-medium hover:underline ml-auto"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3 opacity-40">{"</>"}</div>
          <p className="text-neutral-500 font-medium">No problems found</p>
          <p className="text-sm text-neutral-400 mt-1">
            {hasFilters ? "Try adjusting your filters or search." : "Check back later for new problems."}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 text-sm text-primary font-medium hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="hidden sm:grid grid-cols-[1fr_100px_140px_120px] gap-2 px-4 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
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
                  className="group grid grid-cols-1 sm:grid-cols-[1fr_100px_140px_120px] gap-1 sm:gap-2 items-center px-4 py-3.5 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-neutral-400 font-mono w-6 shrink-0 text-right tabular-nums">
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4">
              <span className="text-xs text-neutral-500 tabular-nums">
                Page {page} of {totalPages} · {total} total
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
