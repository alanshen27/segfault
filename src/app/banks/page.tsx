"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type BankSummary } from "@/lib/types";

interface UserInfo {
  id: string;
  role: string;
}

export default function BanksPage() {
  const [banks, setBanks] = useState<BankSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/banks").then((r) => r.json()),
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)),
    ]).then(([banksData, userData]: [BankSummary[], UserInfo | null]) => {
      if (active) {
        setBanks(banksData);
        setUser(userData);
        setLoading(false);
      }
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

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

    const updated: BankSummary[] = await fetch("/api/banks").then((r) => r.json());
    setBanks(updated);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Question Banks</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Question Banks</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {banks.length} bank{banks.length !== 1 ? "s" : ""} available
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Bank
          </button>
        )}
      </div>

      {showCreate && (
        <div className="mb-6 p-5 rounded-xl border border-primary/30 bg-primary-50 dark:bg-primary-900/10">
          <h2 className="text-lg font-semibold mb-3">Create a New Question Bank</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            {createError && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-2 rounded-lg">
                {createError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
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
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors text-sm"
                placeholder="Describe what kinds of problems belong in this bank..."
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Bank"}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setCreateError(""); }}
                className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {banks.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">{"{ }"}</div>
          <p className="text-neutral-500">No question banks yet.</p>
          <p className="text-sm text-neutral-400 mt-1">
            {canCreate ? "Click \"Create Bank\" to get started." : "Banks will appear here once they are created."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {banks.map((bank) => (
            <Link
              key={bank.id}
              href={`/questions?bankId=${bank.id}`}
              className="group block p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary/40 dark:hover:border-primary/40 transition-all bg-white dark:bg-neutral-950 hover:shadow-sm"
            >
              <h3 className="font-medium text-neutral-900 dark:text-white group-hover:text-primary transition-colors">
                {bank.name}
              </h3>
              <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                {bank.description}
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {bank._count.questions} problem{bank._count.questions !== 1 ? "s" : ""}
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
                <span>by {bank.createdBy.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
