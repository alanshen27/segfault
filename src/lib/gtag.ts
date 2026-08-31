export const GOOGLE_ADS_ID = "AW-18375140054";
export const DISCORD_CONVERSION_SEND_TO =
  "AW-18375140054/bvGECOap5-ocENbF-blE";

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

/** Fire the Join Discord conversion. Never throws; never blocks navigation. */
export function trackDiscordConversion() {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  gtag("event", "conversion", { send_to: DISCORD_CONVERSION_SEND_TO });
}
