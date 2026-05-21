import { Suspense, type ReactNode } from "react";

export default function ForumLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
