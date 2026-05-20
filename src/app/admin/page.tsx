"use client";

import { useEffect, useState } from "react";
import { type ApprovalDetail, type ApprovalStatus, DIFFICULTY_COLORS } from "@/lib/types";

export default function AdminPage() {
  const [approvals, setApprovals] = useState<ApprovalDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/approvals")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data: ApprovalDetail[]) => {
        setApprovals(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleAction = async (approvalId: string, status: ApprovalStatus) => {
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin: Pending Approvals</h1>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-40 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="text-red-600 font-medium mb-2">{error}</div>
        <p className="text-neutral-500">You need admin access to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <span className="text-sm text-neutral-500">
          {approvals.length} pending
        </span>
      </div>

      {approvals.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-neutral-500">No pending approvals.</p>
          <p className="text-sm text-neutral-400 mt-1">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => {
            const diffColor = DIFFICULTY_COLORS[approval.question.difficulty] ?? "bg-neutral-100 text-neutral-600";
            return (
              <div
                key={approval.id}
                className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-lg">
                      {approval.question.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1 flex-wrap">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${diffColor}`}>
                        {approval.question.difficulty}
                      </span>
                      <span>{approval.question.topic}</span>
                      <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
                      <span>by {approval.submittedBy.name}</span>
                      <span className="text-neutral-400">
                        ({approval.submittedBy.email})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap border-l-2 border-primary/30 pl-3 rounded-sm">
                  {approval.question.content.slice(0, 500)}
                  {approval.question.content.length > 500 && "..."}
                </div>

                <div className="mt-4 flex items-end gap-2">
                  <textarea
                    placeholder="Feedback (optional)..."
                    value={feedback[approval.id] || ""}
                    onChange={(e) =>
                      setFeedback((prev) => ({
                        ...prev,
                        [approval.id]: e.target.value,
                      }))
                    }
                    rows={2}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none transition-colors"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(approval.id, "REJECTED")}
                      className="px-4 py-1.5 text-sm rounded-lg border border-red-300 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(approval.id, "APPROVED")}
                      className="px-4 py-1.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
