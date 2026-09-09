"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const KEY = "tekteknoloji.visitor";

function visitorId(): string {
  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing) return existing;

    const generated = Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem(KEY, generated);
    return generated;
  } catch {
    return "anon";
  }
}

/** Feeds the admin analytics dashboard with page views and unique visitors. */
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();

    const body = JSON.stringify({ path: pathname, visitor: visitorId() });
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      return () => controller.abort();
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: controller.signal,
      keepalive: true,
    }).catch(() => undefined);

    return () => controller.abort();
  }, [pathname]);

  return null;
}
