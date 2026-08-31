"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { DISCORD_URL } from "@/lib/site";
import { trackDiscordConversion } from "@/lib/gtag";

type DiscordInviteLinkProps = ComponentPropsWithoutRef<"a">;

export default function DiscordInviteLink({
  href = DISCORD_URL,
  onClick,
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: DiscordInviteLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackDiscordConversion();
    onClick?.(event);
  };

  return (
    <a
      {...props}
      href={href}
      target={target}
      rel={rel}
      onClick={handleClick}
    />
  );
}
