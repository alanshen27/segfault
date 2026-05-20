"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type BankSummary } from "@/lib/types";

export default function BanksPage() {
  const [banks, setBanks] = useState<BankSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/banks")
      .then((r) => r.json())
      .then((data: BankSummary[]) => {
        setBanks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-bold">Question Banks</h1>
        <span className="text-sm text-neutral-500">
          {banks.length} bank{banks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {banks.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">{"{ }"}</div>
          <p className="text-neutral-500">No question banks yet.</p>
          <p className="text-sm text-neutral-400 mt-1">
            Banks will appear here once they are created.
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
