"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { type BankSummary } from "@/lib/types";

interface UserInfo {
  id: string;
  role: string;
}

type SortMode = "newest" | "oldest" | "name" | "problems";

export default function BanksPage() {
  const [banks, setBanks] = useState<BankSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const [minProblems, setMinProblems] = useState(0);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: UserInfo | null) => setUser(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("sort", sort);

    fetch(`/api/banks?${params.toString()}`)
      .then((r) => r.json())
      .then((data: BankSummary[]) => {
        if (active) {
          setBanks(data);
          setLoading(false);
        }
      })
      .catch(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [search, sort]);

  const filtered = useMemo(
    () => banks.filter((b) => b._count.questions >= minProblems),
    [banks, minProblems],
  );

  const canCreate = user?.role === "ADMIN" || user?.role === "MODERATOR";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    const res = await fetch("/api/banks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    if (!res.ok) {
      const data: { error?: string } = await res.json();
      setCreateError(data.error ?? "Failed to create bank");
      setCreating(false);
      return;
    }

    setShowCreate(false);
    setName("");
    setDescription("");
    setCreating(false);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("sort", sort);
    const updated: BankSummary[] = await fetch(`/api/banks?${params.toString()}`).then((r) => r.json());
    setBanks(updated);
  };

  const totalProblems = useMemo(
    () => filtered.reduce((sum, b) => sum + b._count.questions, 0),
    [filtered],
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Collections</p>
          <h1 className="text-3xl font-bold tracking-tight">Question Banks</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {filtered.length} bank{filtered.length !== 1 ? "s" : ""} · {totalProblems} problems
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowCreate((s) => !s)}
            className="px-5 py-2 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition-colors text-sm shrink-0"
          >
            {showCreate ? "Cancel" : "Create Bank"}
          </button>
        )}
      </div>

      <div className="mb-6 space-y-3">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search banks by name or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {([
            ["newest", "Newest"],
            ["oldest", "Oldest"],
            ["name", "A–Z"],
            ["problems", "Most problems"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSort(value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                sort === value
                  ? "bg-primary text-white"
                  : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              }`}
            >
              {label}
            </button>
          ))}

          <select
            value={minProblems}
            onChange={(e) => setMinProblems(Number(e.target.value))}
            className="ml-auto px-3 py-1.5 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value={0}>Any size</option>
            <option value={1}>1+ problems</option>
            <option value={5}>5+ problems</option>
            <option value={10}>10+ problems</option>
          </select>
        </div>
      </div>

      {showCreate && (
        <div className="mb-6 p-5 rounded-xl bg-neutral-100 dark:bg-neutral-900/50">
          <h2 className="text-lg font-semibold mb-3">Create a new bank</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            {createError && (
              <div className="text-sm text-red-600 dark:text-red-400">{createError}</div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="e.g., Dynamic Programming Classics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                placeholder="What kinds of problems belong here?"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Bank"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3 opacity-40">{"{ }"}</div>
          <p className="text-neutral-500 font-medium">No banks found</p>
          <p className="text-sm text-neutral-400 mt-1">
            {search || minProblems > 0 ? "Try a different search or filter." : "Banks will appear here once created."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((bank) => (
            <Link
              key={bank.id}
              href={`/questions?bankId=${bank.id}`}
              className="group block p-5 rounded-xl bg-neutral-100/80 dark:bg-neutral-900/50 hover:bg-neutral-200/80 dark:hover:bg-neutral-900 transition-colors"
            >
              <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                {bank.name}
              </h3>
              <p className="text-sm text-neutral-500 mt-1.5 line-clamp-2 leading-relaxed">
                {bank.description}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">
                  {bank._count.questions} problem{bank._count.questions !== 1 ? "s" : ""}
                </span>
                <span>by {bank.createdBy.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
