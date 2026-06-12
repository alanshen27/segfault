import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RARITY_GRADIENT: Record<string, { from: string; to: string }> = {
  COMMON: { from: "#6b7280", to: "#9ca3af" },
  RARE: { from: "#3b82f6", to: "#60a5fa" },
  LEGENDARY: { from: "#f59e0b", to: "#fbbf24" },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ certificateNo: string }> },
) {
  const { certificateNo } = await params;

  const award = await prisma.prizeAward.findUnique({
    where: { certificateNo },
    include: {
      prize: true,
      user: { select: { name: true } },
    },
  });

  if (!award) {
    return new Response("Not found", { status: 404 });
  }

  const gradient =
    RARITY_GRADIENT[award.prize.rarity] ?? RARITY_GRADIENT.COMMON;

  const date = new Date(award.awardedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient accent */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${gradient.from}33, transparent)`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-50px",
            left: "-50px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: `radial-gradient(circle, #D3595933, transparent)`,
            display: "flex",
          }}
        />

        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "#D35959",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 800,
                fontSize: "20px",
              }}
            >
              S
            </div>
            <span
              style={{
                color: "#D35959",
                fontWeight: 700,
                fontSize: "22px",
                letterSpacing: "-0.02em",
              }}
            >
              segfault.zip
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "999px",
              border: `2px solid ${gradient.from}`,
              color: gradient.from,
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            {award.prize.rarity}
          </div>
        </div>

        {/* Center content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.15em",
              color: "#D35959",
            }}
          >
            SEGFAULT CERTIFIED
          </div>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            {award.prize.name}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#a3a3a3",
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            {award.reason}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #262626",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div
              style={{ color: "white", fontSize: "22px", fontWeight: 700 }}
            >
              {award.user.name}
            </div>
            <div style={{ color: "#737373", fontSize: "16px" }}>{date}</div>
          </div>
          <div
            style={{
              color: "#525252",
              fontSize: "14px",
              fontFamily: "monospace",
            }}
          >
            #{certificateNo}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
