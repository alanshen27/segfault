"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Approval {
  id: string;
  status: string;
  feedback: string | null;
  createdAt: string;
  question: {
    id: string;
    title: string;
    content: string;
    difficulty: string;
    topic: string;
    author: { name: string; email: string };
  };
  submittedBy: { name: string; email: string };
}

export default function AdminPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    fetch("/api/approvals")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => {
        setApprovals(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleAction = async (approvalId: string, status: string) => {
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
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-neutral-500">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-neutral-500">
        <div className="text-red-600 mb-4">{error}</div>
        <p>You need admin access to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin: Pending Approvals</h1>

      {approvals.length === 0 ? (
        <div className="text-center text-neutral-500 py-12">
          No pending approvals.
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-lg">
                    {approval.question.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                      {approval.question.difficulty}
                    </span>
                    <span>{approval.question.topic}</span>
                    <span>&middot;</span>
                    <span>by {approval.submittedBy.name}</span>
                    <span className="text-neutral-400">
                      ({approval.submittedBy.email})
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap border-l-2 border-neutral-200 dark:border-neutral-700 pl-3">
                {approval.question.content.slice(0, 500)}
                {approval.question.content.length > 500 && "..."}
              </div>

              <div className="mt-3 flex items-end gap-2">
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
                  className="flex-1 px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-none"
                />
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(approval.id, "REJECTED")}
                    className="px-3 py-1.5 text-sm rounded-md border border-red-300 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(approval.id, "APPROVED")}
                    className="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
