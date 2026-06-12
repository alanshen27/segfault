"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { PageContainer } from "@/components/layout";
import { inputClass, selectClass } from "@/lib/styles";
import {
  PRIZE_TYPES,
  PRIZE_RARITIES,
  PRIZE_RARITY_COLORS,
  PRIZE_TYPE_COLORS,
  type PrizeSummary,
  type PrizeAwardSummary,
  type PrizeRarity,
  type PrizeType,
} from "@/lib/types";

type Tab = "prizes" | "awards";

interface UserOption {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export default function AdminPrizesPage() {
  const [tab, setTab] = useState<Tab>("prizes");
  const [prizes, setPrizes] = useState<PrizeSummary[]>([]);
  const [awards, setAwards] = useState<PrizeAwardSummary[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create prize form
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("CERTIFICATE");
  const [rarity, setRarity] = useState("COMMON");
  const [maxSupply, setMaxSupply] = useState("");
  const [creating, setCreating] = useState(false);

  // Award form
  const [showAward, setShowAward] = useState(false);
  const [awardPrizeId, setAwardPrizeId] = useState("");
  const [awardUserId, setAwardUserId] = useState("");
  const [awardReason, setAwardReason] = useState("");
  const [awarding, setAwarding] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/prizes").then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json() as Promise<PrizeSummary[]>;
      }),
      fetch("/api/prizes/awards").then((r) => r.json() as Promise<PrizeAwardSummary[]>),
      fetch("/api/builders").then((r) => r.json()),
    ])
      .then(([prizesData, awardsData, buildersData]) => {
        if (!active) return;
        setPrizes(prizesData);
        setAwards(awardsData);
        const builderUsers = (
          buildersData as Array<{ user: UserOption }>
        ).map((b) => b.user);
        setUsers(builderUsers);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleCreatePrize = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/prizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        type,
        rarity,
        maxSupply: maxSupply ? parseInt(maxSupply, 10) : null,
      }),
    });
    if (res.ok) {
      const newPrize: PrizeSummary = await res.json();
      setPrizes((prev) => [newPrize, ...prev]);
      setShowCreate(false);
      setName("");
      setDescription("");
      setType("CERTIFICATE");
      setRarity("COMMON");
      setMaxSupply("");
    }
    setCreating(false);
  };

  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault();
    setAwarding(true);
    const res = await fetch("/api/prizes/awards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prizeId: awardPrizeId,
        userId: awardUserId,
        reason: awardReason,
      }),
    });
    if (res.ok) {
      const newAward: PrizeAwardSummary = await res.json();
      setAwards((prev) => [newAward, ...prev]);
      setShowAward(false);
      setAwardPrizeId("");
      setAwardUserId("");
      setAwardReason("");
    }
    setAwarding(false);
  };

  const handleShip = async (awardId: string) => {
    const res = await fetch("/api/prizes/awards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: awardId, claimStatus: "SHIPPED" }),
    });
    if (res.ok) {
      setAwards((prev) =>
        prev.map((a) => (a.id === awardId ? { ...a, claimStatus: "SHIPPED" } : a)),
      );
    }
  };

  if (loading) {
    return (
      <PageContainer width="wide" className="py-8">
        <div className="h-8 w-48 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse"
            />
          ))}
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer width="wide" className="py-16 text-center">
        <p className="text-red-500 font-medium">{error}</p>
        <p className="text-neutral-500 mt-2 text-sm">
          Admin access required.
        </p>
      </PageContainer>
    );
  }

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      tab === t
        ? "bg-primary text-white"
        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
    }`;

  const activePrizes = prizes.filter((p) => p.active);

  return (
    <PageContainer width="wide" className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Prize Management</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Create prizes and award them to builders.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setTab("prizes")} className={tabClass("prizes")}>
          Prizes ({prizes.length})
        </button>
        <button onClick={() => setTab("awards")} className={tabClass("awards")}>
          Awards ({awards.length})
        </button>
      </div>

      {tab === "prizes" && (
        <div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors text-sm flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Prize
            </button>
            <button
              onClick={() => {
                setShowAward(true);
                if (activePrizes.length > 0 && !awardPrizeId) {
                  setAwardPrizeId(activePrizes[0].id);
                }
              }}
              className="px-4 py-2 rounded-lg border border-primary text-primary font-medium hover:bg-primary/10 transition-colors text-sm flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
              Award Prize
            </button>
          </div>

          {showCreate && (
            <div className="mb-6 p-5 rounded-xl border border-primary/30 bg-primary-50 dark:bg-primary-900/10">
              <h3 className="text-lg font-semibold mb-3">New Prize</h3>
              <form onSubmit={handleCreatePrize} className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Prize name"
                  className={inputClass}
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={2}
                  placeholder="Description"
                  className={inputClass}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className={selectClass}
                    >
                      {PRIZE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Rarity
                    </label>
                    <select
                      value={rarity}
                      onChange={(e) => setRarity(e.target.value)}
                      className={selectClass}
                    >
                      {PRIZE_RARITIES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Max supply (blank = unlimited)
                    </label>
                    <input
                      type="number"
                      value={maxSupply}
                      onChange={(e) => setMaxSupply(e.target.value)}
                      min={1}
                      placeholder="∞"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {showAward && (
            <div className="mb-6 p-5 rounded-xl border border-amber-300/50 bg-amber-50 dark:bg-amber-900/10">
              <h3 className="text-lg font-semibold mb-3">Award Prize</h3>
              <form onSubmit={handleAward} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Prize</label>
                    <select
                      value={awardPrizeId}
                      onChange={(e) => setAwardPrizeId(e.target.value)}
                      required
                      className={selectClass}
                    >
                      <option value="">Select a prize...</option>
                      {activePrizes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.rarity})
                          {p.maxSupply
                            ? ` — ${p._count.awards}/${p.maxSupply} awarded`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">User</label>
                    <select
                      value={awardUserId}
                      onChange={(e) => setAwardUserId(e.target.value)}
                      required
                      className={selectClass}
                    >
                      <option value="">Select a user...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  required
                  placeholder="Reason (e.g. Winner — June DP Challenge)"
                  className={inputClass}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={awarding}
                    className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
                  >
                    {awarding ? "Awarding..." : "Award"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAward(false)}
                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {prizes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-500">
                No prizes yet. Create one above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {prizes.map((prize) => {
                const rc =
                  PRIZE_RARITY_COLORS[prize.rarity as PrizeRarity] ??
                  PRIZE_RARITY_COLORS.COMMON;
                const tc =
                  PRIZE_TYPE_COLORS[prize.type as PrizeType] ??
                  PRIZE_TYPE_COLORS.CERTIFICATE;
                return (
                  <div
                    key={prize.id}
                    className={`p-5 rounded-xl border bg-white dark:bg-neutral-950 ${
                      prize.active
                        ? "border-neutral-200 dark:border-neutral-800"
                        : "border-neutral-200/50 dark:border-neutral-800/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold">{prize.name}</h3>
                      {!prize.active && (
                        <span className="text-xs text-neutral-400">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                      {prize.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rc}`}
                      >
                        {prize.rarity}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tc}`}
                      >
                        {prize.type}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {prize._count.awards} awarded
                        {prize.maxSupply ? ` / ${prize.maxSupply}` : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "awards" && (
        <div>
          {awards.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-500">No prizes awarded yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {awards.map((award) => {
                const rc =
                  PRIZE_RARITY_COLORS[award.prize.rarity as PrizeRarity] ??
                  PRIZE_RARITY_COLORS.COMMON;
                return (
                  <div
                    key={award.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={award.user.avatarUrl}
                        name={award.user.name}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">
                            {award.user.name}
                          </span>
                          <span className="text-neutral-400 text-xs">→</span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${rc}`}
                          >
                            {award.prize.name}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                          {award.reason}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Link
                        href={`/certified/${award.certificateNo}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </Link>
                      {award.claimStatus === "PENDING_CLAIM" && (
                        <button
                          onClick={() => handleShip(award.id)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          Mark shipped
                        </button>
                      )}
                      {award.claimStatus === "SHIPPED" && (
                        <span className="text-xs text-emerald-600 font-medium">
                          Shipped
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
