import BackLink from "@/components/layout/BackLink";
import PageContainer, { type PageWidth } from "@/components/layout/PageContainer";

interface PageNotFoundProps {
  message: string;
  backHref: string;
  backLabel: string;
  width?: PageWidth;
}

export default function PageNotFound({
  message,
  backHref,
  backLabel,
  width = "default",
}: PageNotFoundProps) {
  return (
    <PageContainer width={width} className="py-16 text-center">
      <p className="text-neutral-500">{message}</p>
      <BackLink href={backHref} className="mt-3 justify-center">
        {backLabel}
      </BackLink>
    </PageContainer>
  );
}
