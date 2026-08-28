import type { ReactNode } from "react";

export default function ForumPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper dark:bg-neutral-950">
      {children}
    </div>
  );
}
