import { Suspense, type ReactNode } from "react";

export default function QuestionsLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
