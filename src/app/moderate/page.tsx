"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  type ApprovalDetail,
  type ApprovalStatus,
  type QuestionSummary,
  type BankSummary,
  DIFFICULTY_COLORS,
} from "@/lib/types";

type Tab = "approvals" | "problems" | "banks";

export default function ModeratePage() {
  const [tab, setTab] = useState<Tab>("approvals");
  const [approvals, setApprovals] = useState<ApprovalDetail[]>([]);
  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [banks, setBanks] = useState<BankSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const [showCreateBank, setShowCreateBank] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankDesc, setBankDesc] = useState("");
  const [creatingBank, setCreatingBank] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      fetch("/api/approvals").then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json() as Promise<ApprovalDetail[]>;
      }),
      fetch("/api/questions").then((r) => r.json() as Promise<QuestionSummary[]>),
      fetch("/api/banks").then((r) => r.json() as Promise<BankSummary[]>),
    ])
      .then(([approvalsData, questionsData, banksData]) => {
        if (active) {
          setApprovals(approvalsData);
          setQuestions(questionsData);
          setBanks(banksData);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, []);

  const handleApproval = async (approvalId: string, status: ApprovalStatus) => {
    const res = await fetch("/api/approvals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approvalId,
        status,
        feedback: feedback[approvalId] || undefined,
      }),
    });
    if (res.ok) {
      setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const res = await fetch(`/api/questions/${questionId}`, { method: "DELETE" });
    if (res.ok) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    }
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingBank(true);
    const res = await fetch("/api/banks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: bankName, description: bankDesc }),
    });
    if (res.ok) {
      setShowCreateBank(false);
      setBankName("");
      setBankDesc("");
      const updated: BankSummary[] = await fetch("/api/banks").then((r) => r.json());
      setBanks(updated);
    }
    setCreatingBank(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Moderator Dashboard</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-primary-200/70 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="text-red-600 font-medium mb-2">{error}</div>
        <p className="text-neutral-500">You need moderator or admin access to view this page.</p>
      </div>
    );
  }

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      tab === t
        ? "bg-primary text-white"
        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
    }`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Moderator Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Approve problems, manage banks, and keep the community tidy.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setTab("approvals")} className={tabClass("approvals")}>
          Pending Approvals
          {approvals.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
              {approvals.length}
            </span>
          )}
        </button>
        <button onClick={() => setTab("problems")} className={tabClass("problems")}>
          All Problems ({questions.length})
        </button>
        <button onClick={() => setTab("banks")} className={tabClass("banks")}>
          Banks ({banks.length})
        </button>
      </div>

      {tab === "approvals" && (
        <div>
          {approvals.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-neutral-500">No pending approvals. All caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => {
                const diffColor = DIFFICULTY_COLORS[approval.question.difficulty] ?? "bg-neutral-100 text-neutral-600";
                return (
                  <div key={approval.id} className="p-5 rounded-xl border border-primary-200/70 dark:border-neutral-800 bg-card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-lg">{approval.question.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1 flex-wrap">
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${diffColor}`}>
                            {approval.question.difficulty}
                          </span>
                          <span>{approval.question.topic}</span>
                          <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
                          <span>by {approval.submittedBy.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap border-l-2 border-primary/30 pl-3">
                      {approval.question.content.slice(0, 500)}
                      {approval.question.content.length > 500 && "..."}
                    </div>
                    <div className="mt-4 space-y-3">
                      <textarea
                        placeholder="Feedback (optional)"
                        value={feedback[approval.id] ?? ""}
                        onChange={(e) => setFeedback((prev) => ({ ...prev, [approval.id]: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproval(approval.id, "APPROVED")}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(approval.id, "REJECTED")}
                          className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "problems" && (
        <div>
          {questions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-500">No problems found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((q) => {
                const diffColor = DIFFICULTY_COLORS[q.difficulty] ?? "bg-neutral-100 text-neutral-600";
                return (
                  <div key={q.id} className="flex items-center justify-between p-4 rounded-xl border border-primary-200/70 dark:border-neutral-800 bg-card">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${diffColor}`}>
                        {q.difficulty}
                      </span>
                      <Link href={`/questions/${q.id}`} className="font-medium truncate hover:text-primary transition-colors">
                        {q.title}
                      </Link>
                      <span className="text-xs text-neutral-400 shrink-0">{q.topic}</span>
                      {q.bank && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shrink-0">
                          {q.bank.name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors shrink-0 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "banks" && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setShowCreateBank(true)}
              className="px-4 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary-hover transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Bank
            </button>
          </div>

          {showCreateBank && (
            <div className="mb-6 p-5 rounded-xl border border-primary/30 bg-primary-50 dark:bg-primary-900/10">
              <h3 className="text-lg font-semibold mb-3">New Question Bank</h3>
              <form onSubmit={handleCreateBank} className="space-y-3">
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  placeholder="Bank name"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
                <textarea
                  value={bankDesc}
                  onChange={(e) => setBankDesc(e.target.value)}
                  required
                  rows={2}
                  placeholder="Description"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={creatingBank} className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors">
                    {creatingBank ? "Creating..." : "Create"}
                  </button>
                  <button type="button" onClick={() => setShowCreateBank(false)} className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {banks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-500">No question banks yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {banks.map((bank) => (
                <div key={bank.id} className="p-5 rounded-xl border border-primary-200/70 dark:border-neutral-800 bg-card">
                  <h3 className="font-medium">{bank.name}</h3>
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{bank.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
                    <span>{bank._count.questions} problems</span>
                    <span className="text-neutral-300">&middot;</span>
                    <span>by {bank.createdBy.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
