"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Bank {
  id: string;
  name: string;
  description: string;
  _count: { questions: number };
  createdBy: { name: string };
}

export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/banks")
      .then((r) => r.json())
      .then((data) => {
        setBanks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-neutral-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Question Banks</h1>

      {banks.length === 0 ? (
        <div className="text-center text-neutral-500 py-12">
          No question banks yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {banks.map((bank) => (
            <Link
              key={bank.id}
              href={`/questions?bankId=${bank.id}`}
              className="block p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors bg-white dark:bg-neutral-950"
            >
              <h3 className="font-medium text-neutral-900 dark:text-white">
                {bank.name}
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                {bank.description}
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
                <span>{bank._count.questions} problems</span>
                <span>&middot;</span>
                <span>by {bank.createdBy.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
