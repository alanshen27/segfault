import type { ReactNode } from "react";

const WIDTH_CLASS = {
  narrow: "max-w-2xl",
  content: "max-w-3xl",
  community: "max-w-4xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
} as const;

export type PageWidth = keyof typeof WIDTH_CLASS;

interface PageContainerProps {
  width?: PageWidth;
  className?: string;
  children: ReactNode;
}

export default function PageContainer({
  width = "default",
  className = "",
  children,
}: PageContainerProps) {
  const base = `${WIDTH_CLASS[width]} mx-auto px-4`;
  return (
    <div className={className ? `${base} ${className}` : base}>
      {children}
    </div>
  );
}
